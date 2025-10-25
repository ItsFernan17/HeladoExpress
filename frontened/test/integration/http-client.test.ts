import { http } from '@/lib/http';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('HTTP Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should make GET request successfully', async () => {
    const mockResponse = { data: 'test' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await http('/test', { method: 'GET' });

    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/v1/test', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    expect(result).toEqual(mockResponse);
  });

  it('should make POST request with body', async () => {
    const requestBody = { name: 'test' };
    const mockResponse = { id: 1 };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await http('/test', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/v1/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      cache: 'no-store',
    });
    expect(result).toEqual(mockResponse);
  });

  it('should handle HTTP errors', async () => {
    const errorResponse = { message: 'Not found' };
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: () => Promise.resolve(errorResponse),
    });

    await expect(http('/test')).rejects.toThrow('Not found');
  });

  it('should handle network errors', async () => {
    const networkError = new Error('Network error');
    mockFetch.mockRejectedValueOnce(networkError);

    await expect(http('/test')).rejects.toThrow('Network error');
  });

  it('should include AbortSignal when provided', async () => {
    const abortController = new AbortController();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    await http('/test', { signal: abortController.signal });

    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/v1/test', {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      signal: abortController.signal,
    });
  });

  it('should handle JSON parsing errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.reject(new Error('Invalid JSON')),
    });

    await expect(http('/test')).rejects.toThrow('Invalid JSON');
  });
});