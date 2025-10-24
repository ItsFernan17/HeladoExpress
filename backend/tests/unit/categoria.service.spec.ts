import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { CategoriaService } from '../../src/categoria/services/categoria.service';
import { CategoriaRepository } from '../../src/categoria/repositories/categoria.repository';
import { createMockCategoriaRepository, mockCategoria } from '../fixtures/test-helpers';

describe('CategoriaService - Unit Tests', () => {
  let service: CategoriaService;
  let categoriaRepository: jest.Mocked<CategoriaRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriaService,
        {
          provide: CategoriaRepository,
          useValue: createMockCategoriaRepository(),
        },
      ],
    }).compile();

    service = module.get<CategoriaService>(CategoriaService);
    categoriaRepository = module.get(CategoriaRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new categoria successfully', async () => {
      // Arrange
      const createDto = {
        nombre: 'Helados Premium',
        descripcion: 'Categoría de helados premium',
      };

      const expectedCategoria = {
        ...mockCategoria,
        ...createDto,
      };

      categoriaRepository.findOne.mockResolvedValue(null);
      categoriaRepository.save.mockResolvedValue(expectedCategoria);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(result).toEqual(expectedCategoria);
      expect(categoriaRepository.findOne).toHaveBeenCalledWith({
        where: { nombre: createDto.nombre }
      });
      expect(categoriaRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException when nombre is empty', async () => {
      // Arrange
      const createDto = {
        nombre: '   ',
        descripcion: 'Descripción válida',
      };

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
      await expect(service.create(createDto)).rejects.toThrow('El nombre de la categoría no puede estar vacío');
    });

    it('should throw ConflictException when categoria already exists and is active', async () => {
      // Arrange
      const createDto = {
        nombre: 'Helados Artesanales',
        descripcion: 'Categoría existente',
      };

      const existingCategoria = {
        ...mockCategoria,
        nombre: createDto.nombre,
        esta_activo: true,
      };

      categoriaRepository.findOne.mockResolvedValue(existingCategoria);

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      await expect(service.create(createDto)).rejects.toThrow(`Ya existe una categoría con el nombre "${createDto.nombre}"`);
    });

    it('should reactivate inactive categoria when creating with same name', async () => {
      // Arrange
      const createDto = {
        nombre: 'Helados Clásicos',
        descripcion: 'Categoría a reactivar',
      };

      const inactiveCategoria = {
        ...mockCategoria,
        nombre: createDto.nombre,
        esta_activo: false,
      };

      const reactivatedCategoria = {
        ...inactiveCategoria,
        esta_activo: true,
      };

      categoriaRepository.findOne.mockResolvedValue(inactiveCategoria);
      categoriaRepository.save.mockResolvedValue(reactivatedCategoria);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(result).toEqual(reactivatedCategoria);
      expect(result.esta_activo).toBe(true);
      expect(categoriaRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        esta_activo: true
      }));
    });
  });

  describe('findAll', () => {
    it('should return all active categorias', async () => {
      // Arrange
      const expectedCategorias = [
        { ...mockCategoria, id: 1, nombre: 'Categoría 1' },
        { ...mockCategoria, id: 2, nombre: 'Categoría 2' },
      ];

      categoriaRepository.findActiveStates.mockResolvedValue(expectedCategorias);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual(expectedCategorias);
      expect(categoriaRepository.findActiveStates).toHaveBeenCalled();
    });

    it('should return empty array when no active categorias exist', async () => {
      // Arrange
      categoriaRepository.findActiveStates.mockResolvedValue([]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual([]);
      expect(categoriaRepository.findActiveStates).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return categoria when found and active', async () => {
      // Arrange
      const categoriaId = 1;
      const expectedCategoria = { ...mockCategoria, id: categoriaId };

      categoriaRepository.findActiveById.mockResolvedValue(expectedCategoria);

      // Act
      const result = await service.findOne(categoriaId);

      // Assert
      expect(result).toEqual(expectedCategoria);
      expect(categoriaRepository.findActiveById).toHaveBeenCalledWith(categoriaId);
    });

    it('should throw NotFoundException when categoria not found', async () => {
      // Arrange
      const categoriaId = 999;
      categoriaRepository.findActiveById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(categoriaId)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(categoriaId)).rejects.toThrow(`No se encontró la categoría con ID ${categoriaId} o está inactiva`);
    });
  });

  describe('update', () => {
    it('should update categoria successfully', async () => {
      // Arrange
      const categoriaId = 1;
      const updateDto = {
        nombre: 'Categoría Actualizada',
        descripcion: 'Descripción actualizada',
      };

      const existingCategoria = { ...mockCategoria, id: categoriaId };
      const updatedCategoria = { ...existingCategoria, ...updateDto };

      categoriaRepository.findActiveById.mockResolvedValue(existingCategoria);
      categoriaRepository.findByNombre.mockResolvedValue(null);
      categoriaRepository.save.mockResolvedValue(updatedCategoria);

      // Act
      const result = await service.update(categoriaId, updateDto);

      // Assert
      expect(result).toEqual(updatedCategoria);
      expect(categoriaRepository.findActiveById).toHaveBeenCalledWith(categoriaId);
      expect(categoriaRepository.save).toHaveBeenCalledWith(expect.objectContaining(updateDto));
    });

    it('should throw NotFoundException when updating non-existent categoria', async () => {
      // Arrange
      const categoriaId = 999;
      const updateDto = { nombre: 'Nuevo Nombre' };

      categoriaRepository.findActiveById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(categoriaId, updateDto)).rejects.toThrow(NotFoundException);
      await expect(service.update(categoriaId, updateDto)).rejects.toThrow(`No se encontró la categoría con ID ${categoriaId} o está inactiva`);
    });
  });

  describe('remove', () => {
    it('should soft delete categoria successfully', async () => {
      // Arrange
      const categoriaId = 1;
      const existingCategoria = { ...mockCategoria, id: categoriaId, esta_activo: true };

      categoriaRepository.findActiveById.mockResolvedValue(existingCategoria);
      categoriaRepository.hasActiveProducts.mockResolvedValue(false);
      categoriaRepository.softDeleteById.mockResolvedValue(undefined);

      // Act
      await service.remove(categoriaId);

      // Assert
      expect(categoriaRepository.findActiveById).toHaveBeenCalledWith(categoriaId);
      expect(categoriaRepository.hasActiveProducts).toHaveBeenCalledWith(categoriaId);
      expect(categoriaRepository.softDeleteById).toHaveBeenCalledWith(categoriaId);
    });

    it('should throw NotFoundException when deleting non-existent categoria', async () => {
      // Arrange
      const categoriaId = 999;
      categoriaRepository.findActiveById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(categoriaId)).rejects.toThrow(NotFoundException);
      await expect(service.remove(categoriaId)).rejects.toThrow(`No se encontró la categoría con ID ${categoriaId} o está inactiva`);
    });
  });
});