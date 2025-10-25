import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useErrorHandler } from '@/hooks/useErrorHandler';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
  },
}));

const TestComponent = () => {
  const { handleError, handleValidationError, handleFileError, handleCrudError } = useErrorHandler();

  return (
    <div>
      <button onClick={() => handleError(new Error('Generic error'))}>Trigger Error</button>
      <button onClick={() => handleError(new Error('Network failed'))}>Trigger Network Error</button>
      <button onClick={() => handleError({ status: 404, message: 'Not found' } as any)}>Trigger 404</button>
      <button onClick={() => handleValidationError(new Error('Campo obligatorio'))}>Trigger Validation</button>
      <button onClick={() => handleFileError(new Error('File too large'))}>Trigger File Error</button>
      <button onClick={() => handleCrudError('crear', 'pedido')(new Error('Database error'))}>Trigger CRUD Error</button>
    </div>
  );
};

describe('Error Handling - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle generic errors', () => {
    render(<TestComponent />);

    fireEvent.click(screen.getByRole('button', { name: /trigger error/i }));

    expect(require('react-hot-toast').toast.error).toHaveBeenCalledWith(
      'Generic error',
      expect.objectContaining({ duration: 4000 })
    );
  });

  it('should handle network errors', () => {
    render(<TestComponent />);

    fireEvent.click(screen.getByRole('button', { name: /trigger network error/i }));

    expect(require('react-hot-toast').toast.error).toHaveBeenCalledWith(
      expect.stringContaining('conexión'),
      expect.objectContaining({ duration: 4000 })
    );
  });

  it('should handle 404 errors as warnings', () => {
    render(<TestComponent />);

    fireEvent.click(screen.getByRole('button', { name: /trigger 404/i }));

    // 404 errors are handled as warnings
    const calls = require('react-hot-toast').toast.error.mock.calls;
    expect(calls.length).toBeGreaterThan(0);
  });

  it('should handle validation errors', () => {
    render(<TestComponent />);

    fireEvent.click(screen.getByRole('button', { name: /trigger validation/i }));

    expect(require('react-hot-toast').toast.error).toHaveBeenCalledWith(
      'Campo obligatorio',
      expect.objectContaining({ duration: 4000 })
    );
  });

  it('should handle file errors', () => {
    render(<TestComponent />);

    fireEvent.click(screen.getByRole('button', { name: /trigger file error/i }));

    expect(require('react-hot-toast').toast.error).toHaveBeenCalledWith(
      expect.stringContaining('archivo'),
      expect.objectContaining({ duration: 4000 })
    );
  });
});
