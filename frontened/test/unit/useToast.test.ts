import { renderHook } from '@testing-library/react';
import { useToast } from '@/hooks/useToast';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
  },
}));

describe('useToast', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return all toast functions', () => {
    const { result } = renderHook(() => useToast());

    expect(result.current).toHaveProperty('showSuccess');
    expect(result.current).toHaveProperty('showError');
    expect(result.current).toHaveProperty('showInfo');
    expect(result.current).toHaveProperty('showWarning');
    expect(result.current).toHaveProperty('showLoading');
    expect(typeof result.current.showSuccess).toBe('function');
    expect(typeof result.current.showError).toBe('function');
    expect(typeof result.current.showInfo).toBe('function');
    expect(typeof result.current.showWarning).toBe('function');
    expect(typeof result.current.showLoading).toBe('function');
  });

  it('should call toast.success with correct parameters', () => {
    const { result } = renderHook(() => useToast());
    const message = 'Success message';

    result.current.showSuccess(message);

    expect(require('react-hot-toast').toast.success).toHaveBeenCalledWith(message, {
      duration: 3000,
      position: 'top-right',
      style: {
        background: '#10B981',
        color: '#ffffff',
        fontWeight: '500',
        padding: '12px 16px',
      },
    });
  });

  it('should call toast.error with correct parameters', () => {
    const { result } = renderHook(() => useToast());
    const message = 'Error message';

    result.current.showError(message);

    expect(require('react-hot-toast').toast.error).toHaveBeenCalledWith(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#EF4444',
        color: '#ffffff',
        fontWeight: '500',
        padding: '12px 16px',
      },
    });
  });

  it('should call toast.loading and return toast id', () => {
    const { result } = renderHook(() => useToast());
    const message = 'Loading message';
    const mockToastId = 'toast-123';
    require('react-hot-toast').toast.loading.mockReturnValue(mockToastId);

    const toastId = result.current.showLoading(message);

    expect(require('react-hot-toast').toast.loading).toHaveBeenCalledWith(message, {
      position: 'top-right',
      style: {
        background: '#6B7280',
        color: '#ffffff',
        fontWeight: '500',
        padding: '12px 16px',
      },
    });
    expect(toastId).toBe(mockToastId);
  });
});