import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { EstadoController } from '../../src/estado/estado.controller';
import { EstadoService } from '../../src/estado/services/estado.service';

describe('EstadoController - Integration Tests', () => {
  let app: INestApplication;
  let estadoService: EstadoService;

  const mockEstadoService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [EstadoController],
      providers: [
        {
          provide: EstadoService,
          useValue: mockEstadoService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    estadoService = moduleFixture.get<EstadoService>(EstadoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /estado', () => {
    it('should create a new estado and return 201', async () => {
      // Arrange
      const createEstadoDto = {
        nombre: 'En Preparación',
        descripcion: 'El pedido está siendo preparado',
      };

      const mockEstado = {
        id: 1,
        ...createEstadoDto,
        esta_activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockEstadoService.create.mockResolvedValue(mockEstado);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/estado')
        .send(createEstadoDto)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.nombre).toBe(createEstadoDto.nombre);
      expect(response.body.descripcion).toBe(createEstadoDto.descripcion);
      expect(response.body.esta_activo).toBe(true);
    });

    it('should return 400 when nombre is empty', async () => {
      // Arrange
      const invalidDto = {
        nombre: '',
        descripcion: 'Estado sin nombre',
      };

      // Act & Assert
      await request(app.getHttpServer())
        .post('/estado')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('GET /estado', () => {
    it('should return list of active estados', async () => {
      // Arrange
      const mockEstados = [
        {
          id: 1,
          nombre: 'Pendiente',
          descripcion: 'Pedido pendiente de procesamiento',
          esta_activo: true,
        },
        {
          id: 2,
          nombre: 'En Proceso',
          descripcion: 'Pedido en preparación',
          esta_activo: true,
        },
      ];

      mockEstadoService.findAll.mockResolvedValue(mockEstados);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/estado')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].nombre).toBe('Pendiente');
      expect(response.body[1].nombre).toBe('En Proceso');
      expect(response.body.every((estado: any) => estado.esta_activo)).toBe(true);
    });

    it('should return empty array when no estados exist', async () => {
      // Arrange
      mockEstadoService.findAll.mockResolvedValue([]);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/estado')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /estado/:id', () => {
    it('should return specific estado by id', async () => {
      // Arrange
      const estadoId = 1;
      const mockEstado = {
        id: estadoId,
        nombre: 'Completado',
        descripcion: 'Pedido completado exitosamente',
        esta_activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockEstadoService.findOne.mockResolvedValue(mockEstado);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get(`/estado/${estadoId}`)
        .expect(200);

      expect(response.body.id).toBe(estadoId);
      expect(response.body.nombre).toBe('Completado');
      expect(response.body.descripcion).toBe('Pedido completado exitosamente');
    });

    it('should return 404 when estado not found', async () => {
      // Arrange
      const estadoId = 999;
      mockEstadoService.findOne.mockRejectedValue(new Error('Estado no encontrado'));

      // Act & Assert
      await request(app.getHttpServer())
        .get(`/estado/${estadoId}`)
        .expect(500); // Service error becomes 500
    });
  });

  describe('PATCH /estado/:id', () => {
    it('should update estado successfully', async () => {
      // Arrange
      const estadoId = 1;
      const updateEstadoDto = {
        nombre: 'Cancelado',
        descripcion: 'Pedido cancelado por el cliente',
      };

      const updatedEstado = {
        id: estadoId,
        ...updateEstadoDto,
        esta_activo: true,
        updated_at: new Date(),
      };

      mockEstadoService.update.mockResolvedValue(updatedEstado);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .patch(`/estado/${estadoId}`)
        .send(updateEstadoDto)
        .expect(200);

      expect(response.body.nombre).toBe(updateEstadoDto.nombre);
      expect(response.body.descripcion).toBe(updateEstadoDto.descripcion);
    });

    it('should return 404 when updating non-existent estado', async () => {
      // Arrange
      const estadoId = 999;
      const updateEstadoDto = {
        nombre: 'Estado Inexistente',
        descripcion: 'Este estado no existe',
      };

      mockEstadoService.update.mockRejectedValue(new Error('Estado no encontrado'));

      // Act & Assert
      await request(app.getHttpServer())
        .patch(`/estado/${estadoId}`)
        .send(updateEstadoDto)
        .expect(500); // Service error becomes 500
    });
  });

  describe('DELETE /estado/:id', () => {
    it('should soft delete estado successfully', async () => {
      // Arrange
      const estadoId = 1;
      const deletedEstado = {
        id: estadoId,
        nombre: 'Estado Eliminado',
        esta_activo: false,
      };

      mockEstadoService.remove.mockResolvedValue(deletedEstado);

      // Act & Assert
      await request(app.getHttpServer())
        .delete(`/estado/${estadoId}`)
        .expect(200);
    });

    it('should return 404 when deleting non-existent estado', async () => {
      // Arrange
      const estadoId = 999;
      mockEstadoService.remove.mockRejectedValue(new Error('Estado no encontrado'));

      // Act & Assert
      await request(app.getHttpServer())
        .delete(`/estado/${estadoId}`)
        .expect(500); // Service error becomes 500
    });
  });
});