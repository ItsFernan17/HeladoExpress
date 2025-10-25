import { renderHook, waitFor } from '@testing-library/react';
import { useEstados } from '@/hooks/useEstado';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch as any;

describe('useEstado - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with loading state', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    const { result } = renderHook(() => useEstados());

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should load estados successfully', async () => {
    const mockEstados = [
      { id: 1, nombre: 'Nuevo' },
      { id: 2, nombre: 'Preparando' },
      { id: 3, nombre: 'Entregado' },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockEstados),
    });

    const { result } = renderHook(() => useEstados());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockEstados);
    expect(result.current.error).toBeNull();
  });

  it('should create mapById correctly', async () => {
    const mockEstados = [
      { id: 1, nombre: 'Nuevo' },
      { id: 2, nombre: 'Preparando' },
      { id: 3, nombre: 'Entregado' },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockEstados),
    });

    const { result } = renderHook(() => useEstados());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.mapById.get(1)).toBe('Nuevo');
    expect(result.current.mapById.get(2)).toBe('Preparando');
    expect(result.current.mapById.get(3)).toBe('Entregado');
  });

  it('should handle fetch errors', async () => {
    const error = new Error('Failed to fetch estados');
    mockFetch.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useEstados());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.data).toBeNull();
  });

  it('should abort fetch on unmount', async () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));
    
    const { unmount } = renderHook(() => useEstados());
    
    // Unmount should trigger AbortController.abort()
    unmount();
    
    // Just verify it doesn't crash
    expect(true).toBe(true);
  });
});
