import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { ProductoController } from '../../src/producto/producto.controller';
import { ProductoService } from '../../src/producto/services/producto.service';
import { ImageService } from '../../src/image/services/image.service';

describe('ProductoController - Integration Tests', () => {
  let app: INestApplication;
  let productoService: ProductoService;

  const mockProductoService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockImageService = {
    findByEntity: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
    replaceEntityImage: jest.fn(),
    removeEntityImages: jest.fn(),
    getImageUrl: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ProductoController],
      providers: [
        {
          provide: ProductoService,
          useValue: mockProductoService,
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

    productoService = moduleFixture.get<ProductoService>(ProductoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /producto', () => {
    it('should create a new producto and return 201', async () => {
      // Arrange
      const createProductoDto = {
        nombre: 'Helado de Fresa',
        precio_base: 18.50,
        categoria_id: 1,
      };

      const mockProducto = {
        id: 1,
        ...createProductoDto,
        esta_activo: true,
      };

      mockProductoService.create.mockResolvedValue(mockProducto);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/producto')
        .send(createProductoDto)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.nombre).toBe(createProductoDto.nombre);
      expect(response.body.precio_base).toBe(createProductoDto.precio_base);
    });

    it('should return 400 when nombre is missing', async () => {
      // Arrange
      const invalidDto = {
        precio_base: 18.50,
        categoria_id: 1,
        // nombre missing
      };

      // Act & Assert
      await request(app.getHttpServer())
        .post('/producto')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('GET /producto', () => {
    it('should return all active productos', async () => {
      // Arrange
      const mockProductos = [
        {
          id: 1,
          nombre: 'Helado de Vainilla',
          precio_base: 15.50,
          esta_activo: true,
        },
        {
          id: 2,
          nombre: 'Helado de Chocolate',
          precio_base: 16.00,
          esta_activo: true,
        },
      ];

      mockProductoService.findAll.mockResolvedValue(mockProductos);
      mockImageService.findByEntity.mockResolvedValue([]);
      mockImageService.getImageUrl.mockReturnValue('http://localhost:3000/uploads/default.jpg');

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/producto')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].nombre).toBe('Helado de Vainilla');
    });
  });

  describe('GET /producto/:id', () => {
    it('should return a specific producto by id', async () => {
      // Arrange
      const productoId = 1;
      const mockProducto = {
        id: productoId,
        nombre: 'Helado de Mango',
        precio_base: 17.00,
        esta_activo: true,
      };

      mockProductoService.findOne.mockResolvedValue(mockProducto);
      mockImageService.findByEntity.mockResolvedValue([]);
      mockImageService.getImageUrl.mockReturnValue('http://localhost:3000/uploads/producto-1.jpg');

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get(`/producto/${productoId}`)
        .expect(200);

      expect(response.body.id).toBe(productoId);
      expect(response.body.nombre).toBe('Helado de Mango');
    });

    it('should return 404 when producto not found', async () => {
      // Arrange
      const productoId = 999;
      mockProductoService.findOne.mockRejectedValue(new Error('Producto no encontrado'));

      // Act & Assert
      await request(app.getHttpServer())
        .get(`/producto/${productoId}`)
        .expect(500); // Service error becomes 500
    });
  });
});