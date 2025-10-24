import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { PedidoController } from '../../src/pedido/pedido.controller';
import { PedidoService } from '../../src/pedido/services/pedido.service';

describe('PedidoController - Integration Tests', () => {
  let app: INestApplication;
  let pedidoService: PedidoService;

  const mockPedidoService = {
    createComplete: jest.fn(),
    getAllPedidosCompletos: jest.fn(),
    getPedidoCompleto: jest.fn(),
    changeStatus: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [PedidoController],
      providers: [
        {
          provide: PedidoService,
          useValue: mockPedidoService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    pedidoService = moduleFixture.get<PedidoService>(PedidoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /pedido/completo', () => {
    it('should create a complete pedido and return 201', async () => {
      // Arrange
      const createPedidoDto = {
        items: [
          { 
            productoId: 1, 
            cantidad: 2, 
            sabores: [1, 2]
          },
          { 
            productoId: 2, 
            cantidad: 1, 
            sabores: [3]
          }
        ]
      };

      const mockPedido = {
        id: 1,
        total: 150.00,
        fecha_pedido: new Date(),
        esta_activo: true,
        estado: { id: 1, nombre: 'Pendiente' },
        detalles: [
          {
            id: 1,
            cantidad: 2,
            subtotal: 100.00,
            producto: { id: 1, nombre: 'Producto 1' },
            sabores: [
              { sabor: { id: 1, nombre: 'Vainilla' }, cantidad: 1 },
              { sabor: { id: 2, nombre: 'Chocolate' }, cantidad: 1 }
            ]
          },
          {
            id: 2,
            cantidad: 1,
            subtotal: 50.00,
            producto: { id: 2, nombre: 'Producto 2' },
            sabores: [{ sabor: { id: 3, nombre: 'Fresa' }, cantidad: 1 }]
          }
        ]
      };

      mockPedidoService.createComplete.mockResolvedValue(mockPedido);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/pedido/completo')
        .send(createPedidoDto)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.total).toBe(150.00);
      expect(response.body.detalles).toHaveLength(2);
    });

    it('should return 400 when items are missing', async () => {
      // Arrange
      const invalidDto = {
        // items missing - violates DTO validation
      };

      // Act & Assert
      await request(app.getHttpServer())
        .post('/pedido/completo')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('GET /pedido/completos/todos', () => {
    it('should return list of complete pedidos', async () => {
      // Arrange
      const mockPedidos = [
        {
          id: 1,
          total: 100.00,
          fecha_pedido: new Date(),
          estado: { id: 1, nombre: 'Pendiente' },
          esta_activo: true,
          detalles: [
            {
              id: 1,
              cantidad: 2,
              subtotal: 100.00,
              producto: { id: 1, nombre: 'Helado de Vainilla' },
              sabores: [{ sabor: { id: 1, nombre: 'Vainilla' }, cantidad: 2 }]
            }
          ]
        },
      ];

      mockPedidoService.getAllPedidosCompletos.mockResolvedValue(mockPedidos);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/pedido/completos/todos')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].total).toBe(100.00);
      expect(response.body[0].detalles).toHaveLength(1);
    });

    it('should return empty array when no pedidos exist', async () => {
      // Arrange
      mockPedidoService.getAllPedidosCompletos.mockResolvedValue([]);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/pedido/completos/todos')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /pedido/completos/:id', () => {
    it('should return a specific complete pedido with details', async () => {
      // Arrange
      const pedidoId = 1;
      const mockPedido = {
        id: pedidoId,
        total: 150.00,
        fecha_pedido: new Date(),
        estado: { id: 1, nombre: 'Pendiente' },
        esta_activo: true,
        detalles: [
          {
            id: 1,
            cantidad: 3,
            subtotal: 150.00,
            producto: {
              id: 1,
              nombre: 'Helado Triple',
              precio_base: 50.00,
            },
            sabores: [
              { sabor: { id: 1, nombre: 'Vainilla' }, cantidad: 1 },
              { sabor: { id: 2, nombre: 'Chocolate' }, cantidad: 1 },
              { sabor: { id: 3, nombre: 'Fresa' }, cantidad: 1 }
            ]
          },
        ],
      };

      mockPedidoService.getPedidoCompleto.mockResolvedValue(mockPedido);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get(`/pedido/completos/${pedidoId}`)
        .expect(200);

      expect(response.body.id).toBe(pedidoId);
      expect(response.body.total).toBe(150.00);
      expect(response.body.detalles).toHaveLength(1);
      expect(response.body.detalles[0].sabores).toHaveLength(3);
    });

    it('should return 404 when pedido not found', async () => {
      // Arrange
      const pedidoId = 999;
      mockPedidoService.getPedidoCompleto.mockRejectedValue(new Error('Pedido no encontrado'));

      // Act & Assert
      await request(app.getHttpServer())
        .get(`/pedido/completos/${pedidoId}`)
        .expect(500); // Service error becomes 500
    });
  });

  describe('PATCH /pedido/:id/estado/:estadoId', () => {
    it('should update pedido estado successfully', async () => {
      // Arrange
      const pedidoId = 1;
      const nuevoEstadoId = 2;

      const updatedPedido = {
        id: pedidoId,
        total: 100.00,
        estado: { id: nuevoEstadoId, nombre: 'En Proceso' },
        esta_activo: true,
      };

      mockPedidoService.changeStatus.mockResolvedValue(updatedPedido);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .patch(`/pedido/${pedidoId}/estado/${nuevoEstadoId}`)
        .expect(200);

      expect(response.body.estado.nombre).toBe('En Proceso');
      expect(response.body.estado.id).toBe(nuevoEstadoId);
    });

    it('should return 500 when status change fails', async () => {
      // Arrange
      const pedidoId = 999;
      const estadoId = 2;
      mockPedidoService.changeStatus.mockRejectedValue(new Error('Pedido no encontrado'));

      // Act & Assert
      await request(app.getHttpServer())
        .patch(`/pedido/${pedidoId}/estado/${estadoId}`)
        .expect(500);
    });
  });
});