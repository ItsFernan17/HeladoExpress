import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { useToast } from '@/hooks/useToast';

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

const FormWithValidation = () => {
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({ nombre: '', cantidad: '', precio: '' });
  const [submitting, setSubmitting] = useState(false);

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.nombre.trim()) {
      errors.push('El nombre es obligatorio');
    }
    
    if (!formData.cantidad || parseInt(formData.cantidad) <= 0) {
      errors.push('La cantidad debe ser mayor a 0');
    }
    
    if (!formData.precio || parseFloat(formData.precio) <= 0) {
      errors.push('El precio debe ser mayor a 0');
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach(error => showError(error));
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) throw new Error('Error al enviar');
      
      showSuccess('Formulario enviado correctamente');
      setFormData({ nombre: '', cantidad: '', precio: '' });
    } catch (error) {
      showError('Error al enviar el formulario');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nombre"
          value={formData.nombre}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          data-testid="input-nombre"
        />
        <input
          type="number"
          placeholder="Cantidad"
          value={formData.cantidad}
          onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
          data-testid="input-cantidad"
        />
        <input
          type="number"
          placeholder="Precio"
          value={formData.precio}
          onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
          data-testid="input-precio"
        />
        <button type="submit" disabled={submitting}>
          {submitting ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </div>
  );
};

describe('Form Validation and Submission - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show validation errors for empty fields', async () => {
    render(<FormWithValidation />);

    const submitButton = screen.getByRole('button', { name: /enviar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(require('react-hot-toast').toast.error).toHaveBeenCalledTimes(3);
    });

    expect(require('react-hot-toast').toast.error).toHaveBeenCalledWith(
      'El nombre es obligatorio',
      expect.any(Object)
    );
  });

  it('should show validation error for invalid quantity', async () => {
    render(<FormWithValidation />);

    fireEvent.change(screen.getByTestId('input-nombre'), { target: { value: 'Producto Test' } });
    fireEvent.change(screen.getByTestId('input-cantidad'), { target: { value: '0' } });
    fireEvent.change(screen.getByTestId('input-precio'), { target: { value: '10' } });

    const submitButton = screen.getByRole('button', { name: /enviar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(require('react-hot-toast').toast.error).toHaveBeenCalledWith(
        'La cantidad debe ser mayor a 0',
        expect.any(Object)
      );
    });
  });

  it('should submit form successfully without confirmation dialog', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    render(<FormWithValidation />);

    fireEvent.change(screen.getByTestId('input-nombre'), { target: { value: 'Helado Chocolate' } });
    fireEvent.change(screen.getByTestId('input-cantidad'), { target: { value: '3' } });
    fireEvent.change(screen.getByTestId('input-precio'), { target: { value: '20.00' } });

    const submitButton = screen.getByRole('button', { name: /enviar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(require('react-hot-toast').toast.success).toHaveBeenCalledWith(
        'Formulario enviado correctamente',
        expect.any(Object)
      );
    });

    // Form should be cleared after successful submission
    expect((screen.getByTestId('input-nombre') as HTMLInputElement).value).toBe('');
  });

  it('should handle API errors during form submission', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<FormWithValidation />);

    fireEvent.change(screen.getByTestId('input-nombre'), { target: { value: 'Helado Fresa' } });
    fireEvent.change(screen.getByTestId('input-cantidad'), { target: { value: '2' } });
    fireEvent.change(screen.getByTestId('input-precio'), { target: { value: '12.50' } });

    const submitButton = screen.getByRole('button', { name: /enviar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(require('react-hot-toast').toast.error).toHaveBeenCalledWith(
        'Error al enviar el formulario',
        expect.any(Object)
      );
    });
  });
});
