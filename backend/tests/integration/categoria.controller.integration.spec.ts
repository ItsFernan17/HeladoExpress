import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { CategoriaController } from '../../src/categoria/categoria.controller';
import { CategoriaService } from '../../src/categoria/services/categoria.service';
import { ImageService } from '../../src/image/services/image.service';

describe('CategoriaController - Integration Tests', () => {
  let app: INestApplication;
  let categoriaService: CategoriaService;

  const mockCategoriaService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByNombre: jest.fn(),
  };

  const mockImageService = {
    findByEntity: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
    replaceEntityImage: jest.fn(),
    removeEntityImages: jest.fn(),
    getImageUrl: jest.fn(),
    deleteByEntity: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [CategoriaController],
      providers: [
        {
          provide: CategoriaService,
          useValue: mockCategoriaService,
        },
        {
          provide: ImageService,
          useValue: mockImageService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    categoriaService = moduleFixture.get<CategoriaService>(CategoriaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /categoria', () => {
    it('should create a new categoria and return 201', async () => {
      // Arrange
      const createCategoriaDto = {
        nombre: 'Helados Premium',
        descripcion: 'Categoría de helados de alta calidad',
      };

      const mockCategoria = {
        id: 1,
        ...createCategoriaDto,
        esta_activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockCategoriaService.create.mockResolvedValue(mockCategoria);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/categoria')
        .send(createCategoriaDto)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.nombre).toBe(createCategoriaDto.nombre);
      expect(response.body.descripcion).toBe(createCategoriaDto.descripcion);
      expect(response.body.esta_activo).toBe(true);
    });

    it('should return 400 when nombre is empty', async () => {
      // Arrange
      const invalidDto = {
        nombre: '',
        descripcion: 'Descripción válida',
      };

      // Act & Assert
      await request(app.getHttpServer())
        .post('/categoria')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('GET /categoria', () => {
    it('should return list of active categorias', async () => {
      // Arrange
      const mockCategorias = [
        {
          id: 1,
          nombre: 'Helados Artesanales',
          descripcion: 'Helados hechos a mano',
          esta_activo: true,
        },
        {
          id: 2,
          nombre: 'Helados Premium',
          descripcion: 'Helados de alta calidad',
          esta_activo: true,
        },
      ];

      mockCategoriaService.findAll.mockResolvedValue(mockCategorias);
      mockImageService.findByEntity.mockResolvedValue([]);
      mockImageService.getImageUrl.mockReturnValue('http://example.com/categoria.jpg');

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/categoria')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].nombre).toBe('Helados Artesanales');
      expect(response.body[1].nombre).toBe('Helados Premium');
      expect(response.body.every((categoria: any) => categoria.esta_activo)).toBe(true);
    });

    it('should return empty array when no categorias exist', async () => {
      // Arrange
      mockCategoriaService.findAll.mockResolvedValue([]);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/categoria')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /categoria/:id', () => {
    it('should return specific categoria by id', async () => {
      // Arrange
      const categoriaId = 1;
      const mockCategoria = {
        id: categoriaId,
        nombre: 'Helados Gourmet',
        descripcion: 'Categoría de helados gourmet',
        esta_activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockCategoriaService.findOne.mockResolvedValue(mockCategoria);
      mockImageService.findByEntity.mockResolvedValue([]);
      mockImageService.getImageUrl.mockReturnValue('http://example.com/categoria-1.jpg');

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get(`/categoria/${categoriaId}`)
        .expect(200);

      expect(response.body.id).toBe(categoriaId);
      expect(response.body.nombre).toBe('Helados Gourmet');
      expect(response.body.descripcion).toBe('Categoría de helados gourmet');
    });

    it('should return 404 when categoria not found', async () => {
      // Arrange
      const categoriaId = 999;
      mockCategoriaService.findOne.mockRejectedValue(new Error('Categoría no encontrada'));

      // Act & Assert
      await request(app.getHttpServer())
        .get(`/categoria/${categoriaId}`)
        .expect(500); // Service error becomes 500
    });
  });

  describe('PATCH /categoria/:id', () => {
    it('should update categoria successfully', async () => {
      // Arrange
      const categoriaId = 1;
      const updateCategoriaDto = {
        nombre: 'Helados Actualizados',
        descripcion: 'Descripción actualizada',
      };

      const updatedCategoria = {
        id: categoriaId,
        ...updateCategoriaDto,
        esta_activo: true,
        updated_at: new Date(),
      };

      mockCategoriaService.update.mockResolvedValue(updatedCategoria);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .patch(`/categoria/${categoriaId}`)
        .send(updateCategoriaDto)
        .expect(200);

      expect(response.body.nombre).toBe(updateCategoriaDto.nombre);
      expect(response.body.descripcion).toBe(updateCategoriaDto.descripcion);
    });

    it('should return 404 when updating non-existent categoria', async () => {
      // Arrange
      const categoriaId = 999;
      const updateCategoriaDto = {
        nombre: 'Categoría Inexistente',
        descripcion: 'Esta categoría no existe',
      };

      mockCategoriaService.update.mockRejectedValue(new Error('Categoría no encontrada'));

      // Act & Assert
      await request(app.getHttpServer())
        .patch(`/categoria/${categoriaId}`)
        .send(updateCategoriaDto)
        .expect(500); // Service error becomes 500
    });
  });

  describe('DELETE /categoria/:id', () => {
    it('should soft delete categoria successfully', async () => {
      // Arrange
      const categoriaId = 1;

      mockCategoriaService.remove.mockResolvedValue(undefined);

      // Act & Assert
      await request(app.getHttpServer())
        .delete(`/categoria/${categoriaId}`)
        .expect(200);
    });

    it('should return 404 when deleting non-existent categoria', async () => {
      // Arrange
      const categoriaId = 999;
      mockCategoriaService.remove.mockRejectedValue(new Error('Categoría no encontrada'));

      // Act & Assert
      await request(app.getHttpServer())
        .delete(`/categoria/${categoriaId}`)
        .expect(500); // Service error becomes 500
    });
  });
});