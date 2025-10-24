import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProductoService } from '../../src/producto/services/producto.service';
import { ProductoRepository } from '../../src/producto/repositories/producto.repository';
import { CategoriaService } from '../../src/categoria/services/categoria.service';

describe('ProductoService - Unit Tests', () => {
  let service: ProductoService;
  let repository: any;
  let categoriaService: any;

  const mockProducto = {
    id: 1,
    nombre: 'Helado de Vainilla',
    precio_base: 15.50,
    categoria_id: { id: 1, nombre: 'Helados' },
    esta_activo: true,
  };

  const mockCategoria = {
    id: 1,
    nombre: 'Helados',
    esta_activo: true,
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findOne: jest.fn(),
      findActiveById: jest.fn(),
      save: jest.fn(),
    };

    const mockCategoriaService = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductoService,
        {
          provide: ProductoRepository,
          useValue: mockRepository,
        },
        {
          provide: CategoriaService,
          useValue: mockCategoriaService,
        },
      ],
    }).compile();

    service = module.get<ProductoService>(ProductoService);
    repository = module.get(ProductoRepository);
    categoriaService = module.get(CategoriaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('should return a producto when found', async () => {
      // Arrange
      const id = 1;
      repository.findActiveById.mockResolvedValue(mockProducto);

      // Act
      const result = await service.findOne(id);

      // Assert
      expect(repository.findActiveById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockProducto);
      expect(result.nombre).toBe('Helado de Vainilla');
    });

    it('should throw NotFoundException when producto not found', async () => {
      // Arrange
      const id = 999;
      repository.findActiveById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(id)).rejects.toThrow(`Producto con ID ${id} no encontrado`);
    });
  });

  describe('validation tests', () => {
    it('should validate empty nombre', async () => {
      // Arrange
      const createDto = {
        nombre: '   ', // Empty after trim
        precio_base: 20.50,
        categoria_id: 1,
      };

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
      await expect(service.create(createDto)).rejects.toThrow('El nombre del producto no puede estar vacío');
    });

    it('should validate categoria exists', async () => {
      // Arrange
      const createDto = {
        nombre: 'Nuevo Producto',
        precio_base: 20.50,
        categoria_id: 999,
      };

      categoriaService.findOne.mockRejectedValue(new NotFoundException('Categoría no encontrada'));

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
    });
  });
});