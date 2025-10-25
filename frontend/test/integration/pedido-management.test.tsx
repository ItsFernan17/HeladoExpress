import { renderHook, waitFor } from '@testing-library/react';
import { usePedidos } from '@/hooks/usePedido';
import { useEstados } from '@/hooks/useEstado';
import { usePedidoEstado } from '@/hooks/usePedidoEstado';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn(),
  },
}));

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch as any;

describe('Pedido Management - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load multiple pedidos successfully', async () => {
    const mockPedidos = [
      {
        id: 1,
        pedido: '#P0001',
        estado: 'Nuevo',
        total: 25.50,
        items: [{ tipo: 'Helado', nombre: 'Vainilla', sabores: ['Vainilla'], cantidad: 1, subtotal: 25.50 }],
      },
      {
        id: 2,
        pedido: '#P0002',
        estado: 'Preparando',
        total: 35.00,
        items: [{ tipo: 'Postre', nombre: 'Tarta', sabores: ['Chocolate'], cantidad: 1, subtotal: 35.00 }],
      },
      {
        id: 3,
        pedido: '#P0003',
        estado: 'Nuevo',
        total: 15.00,
        items: [{ tipo: 'Helado', nombre: 'Fresa', sabores: ['Fresa'], cantidad: 1, subtotal: 15.00 }],
      },
    ];

    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockPedidos) });

    const { result } = renderHook(() => usePedidos());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.list).toHaveLength(3);
    expect(result.current.list?.[0].pedido).toBe('#P0001');
    expect(result.current.list?.[1].estado).toBe('Preparando');
  });

  it('should handle empty pedidos list', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) });

    const { result } = renderHook(() => usePedidos());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.list).toHaveLength(0);
    expect(result.current.error).toBeNull();
  });

  it('should update pedido estado successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    const { result } = renderHook(() => usePedidoEstado());

    await result.current.cambiar({
      pedidoId: 1,
      estadoId: 2,
      estadoNombre: 'Preparando',
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/pedido/1/estado'),
      expect.objectContaining({ method: 'PATCH' })
    );
  });

  it('should load estados successfully with mapById', async () => {
    const mockEstados = [
      { id: 1, nombre: 'Nuevo' },
      { id: 2, nombre: 'Preparando' },
      { id: 3, nombre: 'Entregado' },
    ];

    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockEstados) });

    const { result } = renderHook(() => useEstados());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toHaveLength(3);
    expect(result.current.mapById.get(1)).toBe('Nuevo');
    expect(result.current.mapById.get(2)).toBe('Preparando');
  });

  it('should integrate pedidos and estados data correctly', async () => {
    const mockPedidos = [
      { id: 1, pedido: '#P0001', estado: 'Nuevo', total: 25.50, items: [] },
    ];
    const mockEstados = [
      { id: 1, nombre: 'Nuevo' },
      { id: 2, nombre: 'Preparando' },
    ];

    mockFetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockPedidos) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockEstados) });

    const { result: pedidosResult } = renderHook(() => usePedidos());
    const { result: estadosResult } = renderHook(() => useEstados());

    await waitFor(() => {
      expect(pedidosResult.current.loading).toBe(false);
      expect(estadosResult.current.loading).toBe(false);
    });

    expect(pedidosResult.current.list).toHaveLength(1);
    expect(estadosResult.current.data).toHaveLength(2);
    
    // Verify that we can correlate the estado name
    const pedidoEstado = pedidosResult.current.list?.[0].estado;
    const matchingEstado = estadosResult.current.data?.find(e => e.nombre === pedidoEstado);
    expect(matchingEstado).toBeDefined();
    expect(matchingEstado?.nombre).toBe('Nuevo');
  });
});
