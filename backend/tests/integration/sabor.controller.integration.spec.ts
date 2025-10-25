import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { SaborController } from '../../src/sabor/sabor.controller';
import { SaborService } from '../../src/sabor/services/sabor.service';
import { CreateSaborDto } from '../../src/sabor/dto/create-sabor.dto';
import { UpdateSaborDto } from '../../src/sabor/dto/update-sabor.dto';

describe('SaborController (Integration)', () => {
  let app: INestApplication;
  let saborService: SaborService;

  const mockSaborService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SaborController],
      providers: [
        {
          provide: SaborService,
          useValue: mockSaborService,
        },
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();

    saborService = module.get<SaborService>(SaborService);
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('POST /sabor', () => {
    it('should create a new sabor successfully', async () => {
      const createSaborDto: CreateSaborDto = {
        nombre: 'Chocolate',
        esta_activo: true,
      };

      const expectedResult = {
        id: 1,
        nombre: 'Chocolate',
        esta_activo: true,
        created_at: expect.any(String),
        updated_at: expect.any(String),
      };

      mockSaborService.create.mockResolvedValue(expectedResult);

      const response = await request(app.getHttpServer())
        .post('/sabor')
        .send(createSaborDto)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expectedResult.id,
        nombre: expectedResult.nombre,
        esta_activo: expectedResult.esta_activo,
      });
      expect(mockSaborService.create).toHaveBeenCalledWith(createSaborDto);
    });

    it('should fail when creating sabor with invalid data', async () => {
      const invalidSaborDto = {
        nombre: '', // Invalid: empty name
        esta_activo: 'invalid_boolean', // Invalid: not a boolean
      };

      await request(app.getHttpServer())
        .post('/sabor')
        .send(invalidSaborDto)
        .expect(400);

      expect(mockSaborService.create).not.toHaveBeenCalled();
    });

    it('should fail when creating sabor with invalid name characters', async () => {
      const invalidSaborDto = {
        nombre: 'Sabor@#$%', // Invalid: contains special characters
      };

      await request(app.getHttpServer())
        .post('/sabor')
        .send(invalidSaborDto)
        .expect(400);

      expect(mockSaborService.create).not.toHaveBeenCalled();
    });
  });

  describe('GET /sabor', () => {
    it('should return all sabores', async () => {
      const expectedSabores = [
        {
          id: 1,
          nombre: 'Chocolate',
          esta_activo: true,
          created_at: expect.any(String),
          updated_at: expect.any(String),
        },
        {
          id: 2,
          nombre: 'Vainilla',
          esta_activo: true,
          created_at: expect.any(String),
          updated_at: expect.any(String),
        },
      ];

      mockSaborService.findAll.mockResolvedValue(expectedSabores);

      const response = await request(app.getHttpServer())
        .get('/sabor')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toMatchObject({
        id: 1,
        nombre: 'Chocolate',
        esta_activo: true,
      });
      expect(response.body[1]).toMatchObject({
        id: 2,
        nombre: 'Vainilla',
        esta_activo: true,
      });
      expect(mockSaborService.findAll).toHaveBeenCalled();
    });
  });

  describe('GET /sabor/:id', () => {
    it('should return a specific sabor by id', async () => {
      const saborId = 1;
      const expectedSabor = {
        id: saborId,
        nombre: 'Chocolate',
        esta_activo: true,
        created_at: expect.any(String),
        updated_at: expect.any(String),
      };

      mockSaborService.findOne.mockResolvedValue(expectedSabor);

      const response = await request(app.getHttpServer())
        .get(`/sabor/${saborId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: saborId,
        nombre: 'Chocolate',
        esta_activo: true,
      });
      expect(mockSaborService.findOne).toHaveBeenCalledWith(saborId);
    });

    it('should fail when id is not a valid number', async () => {
      await request(app.getHttpServer())
        .get('/sabor/invalid-id')
        .expect(400);

      expect(mockSaborService.findOne).not.toHaveBeenCalled();
    });
  });

  describe('PATCH /sabor/:id', () => {
    it('should update a sabor successfully', async () => {
      const saborId = 1;
      const updateSaborDto: UpdateSaborDto = {
        nombre: 'Chocolate Premium',
        esta_activo: false,
      };

      const expectedResult = {
        id: saborId,
        nombre: 'Chocolate Premium',
        esta_activo: false,
        created_at: expect.any(String),
        updated_at: expect.any(String),
      };

      mockSaborService.update.mockResolvedValue(expectedResult);

      const response = await request(app.getHttpServer())
        .patch(`/sabor/${saborId}`)
        .send(updateSaborDto)
        .expect(200);

      expect(response.body).toMatchObject({
        id: saborId,
        nombre: 'Chocolate Premium',
        esta_activo: false,
      });
      expect(mockSaborService.update).toHaveBeenCalledWith(saborId, updateSaborDto);
    });

    it('should fail when updating with invalid data', async () => {
      const saborId = 1;
      const invalidUpdateDto = {
        nombre: 'A', // Invalid: too short
      };

      await request(app.getHttpServer())
        .patch(`/sabor/${saborId}`)
        .send(invalidUpdateDto)
        .expect(400);

      expect(mockSaborService.update).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /sabor/:id', () => {
    it('should delete a sabor successfully', async () => {
      const saborId = 1;
      const expectedResult = { message: 'Sabor eliminado exitosamente' };

      mockSaborService.remove.mockResolvedValue(expectedResult);

      const response = await request(app.getHttpServer())
        .delete(`/sabor/${saborId}`)
        .expect(200);

      expect(response.body).toEqual(expectedResult);
      expect(mockSaborService.remove).toHaveBeenCalledWith(saborId);
    });

    it('should fail when id is not a valid number', async () => {
      await request(app.getHttpServer())
        .delete('/sabor/invalid-id')
        .expect(400);

      expect(mockSaborService.remove).not.toHaveBeenCalled();
    });
  });
});