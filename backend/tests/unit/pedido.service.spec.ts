import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PedidoService } from '../../src/pedido/services/pedido.service';
import { PedidoRepository } from '../../src/pedido/repositories/pedido.repository';
import { EstadoService } from '../../src/estado/services/estado.service';
import { DetallePedidoService } from '../../src/detalle-pedido/services/detalle-pedido.service';
import { ProductoService } from '../../src/producto/services/producto.service';
import { SaborService } from '../../src/sabor/services/sabor.service';
import { DataSource } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';

describe('PedidoService - Unit Tests', () => {
  let service: PedidoService;
  let repository: any;
  let estadoService: any;

  const mockPedido = {
    id: 1,
    fecha_pedido: new Date(),
    total: 50.00,
    estado_id: { id: 1, nombre: 'Pendiente' },
    detalles: [],
    esta_activo: true,
  };

  const mockEstado = {
    id: 1,
    nombre: 'Pendiente',
    esta_activo: true,
  };

  beforeEach(async () => {
    // Mock para el repositorio principal
    const mockRepository = {
      create: jest.fn(),
      findOne: jest.fn(),
      findActiveById: jest.fn(),
      save: jest.fn(),
    };

    // Mock para EstadoService
    const mockEstadoService = {
      findOne: jest.fn(),
      findEstadoPendiente: jest.fn(),
    };

    // Mock más completo para DataSource
    const mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ total: 50.00 }),
    };

    const mockDetallePedidoRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    };

    const mockDataSource = {
      manager: {
        transaction: jest.fn().mockImplementation((cb) => cb({
          save: jest.fn(),
          find: jest.fn(),
          findOne: jest.fn(),
        })),
      },
      getRepository: jest.fn().mockImplementation((entity) => {
        if (entity.name === 'DetallePedido') {
          return mockDetallePedidoRepo;
        }
        return {
          createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
        };
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PedidoService,
        {
          provide: PedidoRepository,
          useValue: mockRepository,
        },
        {
          provide: EstadoService,
          useValue: mockEstadoService,
        },
        {
          provide: DetallePedidoService,
          useValue: { create: jest.fn() },
        },
        {
          provide: ProductoService,
          useValue: { findOne: jest.fn() },
        },
        {
          provide: SaborService,
          useValue: { findOne: jest.fn() },
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<PedidoService>(PedidoService);
    repository = module.get(PedidoRepository);
    estadoService = module.get(EstadoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('should return a pedido when found', async () => {
      // Arrange
      const id = 1;
      repository.findActiveById.mockResolvedValue(mockPedido);

      // Act
      const result = await service.findOne(id);

      // Assert
      expect(repository.findActiveById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockPedido);
      expect(result.total).toBe(50.00);
    });

    it('should throw NotFoundException when pedido not found', async () => {
      // Arrange
      const id = 999;
      repository.findActiveById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(id)).rejects.toThrow(`Pedido con ID ${id} no encontrado`);
    });

    it('should validate positive ID for findOne', async () => {
      // Arrange
      const invalidId = -1;

      // Act & Assert
      await expect(service.findOne(invalidId)).rejects.toThrow(BadRequestException);
      await expect(service.findOne(invalidId)).rejects.toThrow('El ID del pedido debe ser un número positivo');
    });
  });

  describe('validation tests', () => {
    it('should validate pedido requires detalles', async () => {
      // Arrange
      const createDto = {
        total: 50.00,
        estado_id: 1,
        detalles: [], // Empty detalles
      };

      estadoService.findOne.mockResolvedValue(mockEstado);

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
      await expect(service.create(createDto)).rejects.toThrow('El pedido debe tener al menos un detalle');
    });

    it('should validate estado exists', async () => {
      // Arrange
      const createDto = {
        total: 50.00,
        estado_id: 999, // Non-existent estado
        detalles: [{ producto_id: 1, cantidad: 2 }],
      };

      estadoService.findOne.mockRejectedValue(new NotFoundException('Estado no encontrado'));

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
    });
  });
});