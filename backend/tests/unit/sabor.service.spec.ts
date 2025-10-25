import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { SaborService } from '../../src/sabor/services/sabor.service';
import { SaborRepository } from '../../src/sabor/repositories/sabor.repository';
import { createMockSaborRepository, mockSabor } from '../fixtures/test-helpers';

describe('SaborService - Unit Tests', () => {
  let service: SaborService;
  let saborRepository: jest.Mocked<SaborRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SaborService,
        {
          provide: SaborRepository,
          useValue: createMockSaborRepository(),
        },
      ],
    }).compile();

    service = module.get<SaborService>(SaborService);
    saborRepository = module.get(SaborRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new sabor successfully', async () => {
      // Arrange
      const createDto = {
        nombre: 'Chocolate',
        descripcion: 'Sabor de chocolate premium',
      };

      const expectedSabor = {
        ...mockSabor,
        ...createDto,
      };

      saborRepository.findOne.mockResolvedValue(null);
      saborRepository.save.mockResolvedValue(expectedSabor);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(result).toEqual(expectedSabor);
      expect(saborRepository.findOne).toHaveBeenCalledWith({
        where: { nombre: createDto.nombre }
      });
      expect(saborRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException when nombre is empty', async () => {
      // Arrange
      const createDto = {
        nombre: '   ',
        descripcion: 'Descripción válida',
      };

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
      await expect(service.create(createDto)).rejects.toThrow('El nombre del sabor no puede estar vacío');
    });

    it('should throw ConflictException when sabor already exists and is active', async () => {
      // Arrange
      const createDto = {
        nombre: 'Fresa',
        descripcion: 'Sabor existente',
      };

      const existingSabor = {
        ...mockSabor,
        nombre: createDto.nombre,
        esta_activo: true,
      };

      saborRepository.findOne.mockResolvedValue(existingSabor);

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      await expect(service.create(createDto)).rejects.toThrow(`Ya existe un sabor con el nombre "${createDto.nombre}"`);
    });

    it('should reactivate inactive sabor when creating with same name', async () => {
      // Arrange
      const createDto = {
        nombre: 'Menta',
        descripcion: 'Sabor a reactivar',
      };

      const inactiveSabor = {
        ...mockSabor,
        nombre: createDto.nombre,
        esta_activo: false,
      };

      const reactivatedSabor = {
        ...inactiveSabor,
        esta_activo: true,
      };

      saborRepository.findOne.mockResolvedValue(inactiveSabor);
      saborRepository.save.mockResolvedValue(reactivatedSabor);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(result).toEqual(reactivatedSabor);
      expect(result.esta_activo).toBe(true);
      expect(saborRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        esta_activo: true
      }));
    });
  });

  describe('findAll', () => {
    it('should return all active sabores', async () => {
      // Arrange
      const expectedSabores = [
        { ...mockSabor, id: 1, nombre: 'Vainilla' },
        { ...mockSabor, id: 2, nombre: 'Chocolate' },
      ];

      saborRepository.findActiveStates.mockResolvedValue(expectedSabores);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual(expectedSabores);
      expect(saborRepository.findActiveStates).toHaveBeenCalled();
    });

    it('should return empty array when no active sabores exist', async () => {
      // Arrange
      saborRepository.findActiveStates.mockResolvedValue([]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual([]);
      expect(saborRepository.findActiveStates).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return sabor when found and active', async () => {
      // Arrange
      const saborId = 1;
      const expectedSabor = { ...mockSabor, id: saborId };

      saborRepository.findActiveById.mockResolvedValue(expectedSabor);

      // Act
      const result = await service.findOne(saborId);

      // Assert
      expect(result).toEqual(expectedSabor);
      expect(saborRepository.findActiveById).toHaveBeenCalledWith(saborId);
    });

    it('should throw NotFoundException when sabor not found', async () => {
      // Arrange
      const saborId = 999;
      saborRepository.findActiveById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(saborId)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(saborId)).rejects.toThrow(`Sabor con ID ${saborId} no encontrado`);
    });
  });

  describe('update', () => {
    it('should update sabor successfully', async () => {
      // Arrange
      const saborId = 1;
      const updateDto = {
        nombre: 'Sabor Actualizado',
        descripcion: 'Descripción actualizada',
      };

      const existingSabor = { ...mockSabor, id: saborId };
      const updatedSabor = { ...existingSabor, ...updateDto };

      saborRepository.findActiveById.mockResolvedValue(existingSabor);
      saborRepository.findByNombre.mockResolvedValue(null);
      saborRepository.save.mockResolvedValue(updatedSabor);

      // Act
      const result = await service.update(saborId, updateDto);

      // Assert
      expect(result).toEqual(updatedSabor);
      expect(saborRepository.findActiveById).toHaveBeenCalledWith(saborId);
      expect(saborRepository.save).toHaveBeenCalledWith(expect.objectContaining(updateDto));
    });

    it('should throw NotFoundException when updating non-existent sabor', async () => {
      // Arrange
      const saborId = 999;
      const updateDto = { nombre: 'Nuevo Nombre' };

      saborRepository.findActiveById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(saborId, updateDto)).rejects.toThrow(NotFoundException);
      await expect(service.update(saborId, updateDto)).rejects.toThrow('Sabor con ID 999 no encontrado');
    });
  });

  describe('remove', () => {
    it('should soft delete sabor successfully', async () => {
      // Arrange
      const saborId = 1;
      const existingSabor = { ...mockSabor, id: saborId, esta_activo: true };

      saborRepository.findActiveById.mockResolvedValue(existingSabor);
      saborRepository.softDeleteById.mockResolvedValue(undefined);

      // Act
      await service.remove(saborId);

      // Assert
      expect(saborRepository.findActiveById).toHaveBeenCalledWith(saborId);
      expect(saborRepository.softDeleteById).toHaveBeenCalledWith(saborId);
    });

    it('should throw NotFoundException when deleting non-existent sabor', async () => {
      // Arrange
      const saborId = 999;
      saborRepository.findActiveById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(saborId)).rejects.toThrow(NotFoundException);
      await expect(service.remove(saborId)).rejects.toThrow('Sabor con ID 999 no encontrado');
    });
  });
});