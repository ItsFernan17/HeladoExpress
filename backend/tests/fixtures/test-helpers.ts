import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Función helper para crear módulos de prueba
export const createTestingModule = async (moduleMetadata: any): Promise<TestingModule> => {
  return await Test.createTestingModule(moduleMetadata).compile();
};

// Mock para repositorios con métodos específicos
export const createMockRepository = <T = any>(): jest.Mocked<Repository<T>> => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  delete: jest.fn(),
  update: jest.fn(),
  create: jest.fn(),
  preload: jest.fn(),
  count: jest.fn(),
  findAndCount: jest.fn(),
  query: jest.fn(),
  manager: {
    transaction: jest.fn(),
  } as any,
} as any);

// Mock específico para ProductoRepository
export const createMockProductoRepository = () => ({
  create: jest.fn(),
  findOne: jest.fn(),
  findAll: jest.fn(),
  findActiveById: jest.fn(),
  save: jest.fn(),
});

// Mock específico para PedidoRepository
export const createMockPedidoRepository = () => ({
  create: jest.fn(),
  findOne: jest.fn(),
  findAll: jest.fn(),
  findActiveById: jest.fn(),
  save: jest.fn(),
});

// Mock específico para EstadoRepository
export const createMockEstadoRepository = () => ({
  create: jest.fn(),
  findActiveStates: jest.fn(),
  findActiveById: jest.fn(),
  findByNombre: jest.fn(),
  softDeleteById: jest.fn(),
  save: jest.fn(),
});

// Mock específico para CategoriaRepository
export const createMockCategoriaRepository = () => ({
  create: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findActiveById: jest.fn(),
  findActiveStates: jest.fn(),
  findByNombre: jest.fn(),
  save: jest.fn(),
  softDeleteById: jest.fn(),
  hasActiveProducts: jest.fn(),
});

// Mock específico para SaborRepository
export const createMockSaborRepository = () => ({
  create: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findActiveById: jest.fn(),
  findActiveStates: jest.fn(),
  findByNombre: jest.fn(),
  save: jest.fn(),
  softDeleteById: jest.fn(),
});

// Datos de prueba comunes
export const mockProducto = {
  id: 1,
  nombre: 'Helado de Vainilla',
  precio_base: 15.50,
  categoria_id: 1,
  moneda: 'Q',
  esta_activo: true,
};

export const mockCategoria = {
  id: 1,
  nombre: 'Helados',
  esta_activo: true,
};

export const mockPedido = {
  id: 1,
  fecha_pedido: new Date(),
  total: 50.00,
  estado_id: 1,
  detalles: [],
  esta_activo: true,
};

export const mockEstado = {
  id: 1,
  nombre: 'Pendiente',
  esta_activo: true,
};

export const mockSabor = {
  id: 1,
  nombre: 'Vainilla',
  esta_activo: true,
};