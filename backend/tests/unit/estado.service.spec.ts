import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EstadoService } from '../../src/estado/services/estado.service';
import { EstadoRepository } from '../../src/estado/repositories/estado.repository';
import { CreateEstadoDto } from '../../src/estado/dto/create-estado.dto';
import { UpdateEstadoDto } from '../../src/estado/dto/update-estado.dto';
import { createMockRepository, mockEstado } from '../fixtures/test-helpers';

describe('EstadoService - Unit Tests', () => {
  let service: EstadoService;
  let repository: jest.Mocked<EstadoRepository>;

  beforeEach(async () => {
    const mockRepository = {
      ...createMockRepository(),
      findActiveStates: jest.fn(),
      findActiveById: jest.fn(),
      findByNombre: jest.fn(),
      softDeleteById: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EstadoService,
        {
          provide: EstadoRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<EstadoService>(EstadoService);
    repository = module.get(EstadoRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new estado successfully', async () => {
      // Arrange
      const createDto: CreateEstadoDto = {
        nombre: 'Nuevo Estado',
      };

      const createdEstado = { ...mockEstado, ...createDto };

      repository.create.mockReturnValue(createdEstado as any);
      repository.save.mockResolvedValue(createdEstado as any);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith(createdEstado);
      expect(result.nombre).toBe(createDto.nombre);
    });
  });

  describe('findAll', () => {
    it('should return all active estados', async () => {
      // Arrange
      const estados = [
        { ...mockEstado, id: 1, nombre: 'Pendiente' },
        { ...mockEstado, id: 2, nombre: 'En Proceso' },
        { ...mockEstado, id: 3, nombre: 'Completado' },
      ];

      repository.findActiveStates.mockResolvedValue(estados as any);

      // Act
      const result = await service.findAll();

      // Assert
      expect(repository.findActiveStates).toHaveBeenCalled();
      expect(result).toEqual(estados);
      expect(result).toHaveLength(3);
    });

    it('should return empty array when no active estados exist', async () => {
      // Arrange
      repository.findActiveStates.mockResolvedValue([]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(repository.findActiveStates).toHaveBeenCalled();
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return an estado when found', async () => {
      // Arrange
      const id = 1;
      repository.findActiveById.mockResolvedValue(mockEstado as any);

      // Act
      const result = await service.findOne(id);

      // Assert
      expect(repository.findActiveById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockEstado);
    });

    it('should throw NotFoundException when estado not found', async () => {
      // Arrange
      const id = 999;
      repository.findActiveById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(id)).rejects.toThrow(`Estado con ID ${id} no encontrado`);
    });
  });

  describe('update', () => {
    it('should update estado successfully', async () => {
      // Arrange
      const id = 1;
      const updateDto: UpdateEstadoDto = {
        nombre: 'Estado Actualizado',
      };

      const existingEstado = { ...mockEstado };
      const updatedEstado = { ...existingEstado, ...updateDto };

      repository.findActiveById.mockResolvedValue(existingEstado as any);
      repository.save.mockResolvedValue(updatedEstado as any);

      // Act
      const result = await service.update(id, updateDto);

      // Assert
      expect(repository.findActiveById).toHaveBeenCalledWith(id);
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ...existingEstado,
          ...updateDto,
        })
      );
      expect(result.nombre).toBe(updateDto.nombre);
    });

    it('should throw NotFoundException when updating non-existent estado', async () => {
      // Arrange
      const id = 999;
      const updateDto: UpdateEstadoDto = { nombre: 'Nuevo Nombre' };

      repository.findActiveById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(id, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete estado successfully', async () => {
      // Arrange
      const id = 1;
      repository.findActiveById.mockResolvedValue(mockEstado as any);
      repository.softDeleteById.mockResolvedValue(undefined);

      // Act
      await service.remove(id);

      // Assert
      expect(repository.findActiveById).toHaveBeenCalledWith(id);
      expect(repository.softDeleteById).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException when trying to delete non-existent estado', async () => {
      // Arrange
      const id = 999;
      repository.findActiveById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(id)).rejects.toThrow(NotFoundException);
      expect(repository.softDeleteById).not.toHaveBeenCalled();
    });
  });

  describe('findByNombre', () => {
    it('should return estado when found by nombre', async () => {
      // Arrange
      const nombre = 'Pendiente';
      const estado = { ...mockEstado, nombre };

      repository.findByNombre.mockResolvedValue(estado as any);

      // Act
      const result = await service.findByNombre(nombre);

      // Assert
      expect(repository.findByNombre).toHaveBeenCalledWith(nombre);
      expect(result).toEqual(estado);
      expect(result?.nombre).toBe(nombre);
    });

    it('should return null when estado not found by nombre', async () => {
      // Arrange
      const nombre = 'EstadoInexistente';
      repository.findByNombre.mockResolvedValue(null);

      // Act
      const result = await service.findByNombre(nombre);

      // Assert
      expect(repository.findByNombre).toHaveBeenCalledWith(nombre);
      expect(result).toBeNull();
    });
  });
});