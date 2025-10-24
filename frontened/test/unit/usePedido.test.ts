import { renderHook, waitFor } from '@testing-library/react';
import { usePedidos } from '@/hooks/usePedido';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
  },
}));

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch as any;

describe('usePedido - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with loading state', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    const { result } = renderHook(() => usePedidos());

    expect(result.current.loading).toBe(true);
    expect(result.current.list).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should load pedidos successfully', async () => {
    const mockPedidos = [
      {
        pedido: '#P0001',
        estado: 'Nuevo',
        total: 25.50,
        items: [{ tipo: 'Helado', nombre: 'Vainilla', sabores: ['Vainilla'], cantidad: 1, subtotal: 15.00 }],
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockPedidos),
    });

    const { result } = renderHook(() => usePedidos());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.list).toHaveLength(1);
    expect(result.current.list![0]).toHaveProperty('id');
    expect(result.current.error).toBeNull();
  });

  it('should handle 404 errors as empty list', async () => {
    mockFetch.mockRejectedValueOnce(new Error('404 Not Found'));

    const { result } = renderHook(() => usePedidos());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.list).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should handle network errors', async () => {
    const networkError = new Error('Network error');
    mockFetch.mockRejectedValueOnce(networkError);

    const { result } = renderHook(() => usePedidos());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.list).toBeNull();
  });

  it('should normalize pedido IDs correctly', async () => {
    const mockPedidos = [
      { pedido: '#P0123', estado: 'Nuevo', total: 10, items: [] },
      { id: 999, pedido: '#P0456', estado: 'Preparando', total: 20, items: [] },
      { pedidoId: 777, pedido: '#P0789', estado: 'Entregado', total: 30, items: [] },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockPedidos),
    });

    const { result } = renderHook(() => usePedidos());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.list![0].id).toBe(123); // Extraído de #P0123
    expect(result.current.list![1].id).toBe(999); // Tomado de id
    expect(result.current.list![2].id).toBe(777); // Tomado de pedidoId
  });
});
