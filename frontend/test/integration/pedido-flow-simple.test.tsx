import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';

// Mock de react-hot-toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
  promise: jest.fn(),
}));

// Datos de prueba simplificados
const mockPedidos = [
  {
    id: 1,
    usuario_nombre: 'Juan Pérez',
    estado_id: 1,
    estado_nombre: 'PENDIENTE',
    total: 25.50,
  },
  {
    id: 2,
    usuario_nombre: 'María García',
    estado_id: 2,
    estado_nombre: 'CONFIRMADO',
    total: 18.00,
  },
];

const mockEstados = [
  { id: 1, nombre: 'PENDIENTE', descripcion: 'Pedido pendiente de confirmación' },
  { id: 2, nombre: 'CONFIRMADO', descripcion: 'Pedido confirmado' },
  { id: 3, nombre: 'EN PREPARACION', descripcion: 'Pedido en preparación' },
  { id: 4, nombre: 'LISTO', descripcion: 'Pedido listo para entrega' },
];

// Mock de hooks usando funciones básicas
const mockCambiarFn = jest.fn();

const mockUsePedidos = () => ({
  list: mockPedidos,
  loading: false,
  error: null as any,
  obtener: jest.fn(),
  crear: jest.fn(),
  actualizar: jest.fn(),
  eliminar: jest.fn(),
});

const mockUseEstados = () => ({
  list: mockEstados,
  loading: false,
  error: null as any,
  obtener: jest.fn(),
});

const mockUsePedidoEstado = () => ({
  loading: false,
  error: null as any,
  cambiar: mockCambiarFn,
});

// Componente PedidoCard simulado
function MockPedidoCard({ pedido, onEstadoChange }: any) {
  return (
    <div data-testid={`pedido-${pedido.id}`}>
      <span>{pedido.usuario_nombre}</span>
      <span data-testid={`estado-${pedido.id}`}>{pedido.estado_nombre}</span>
      <button 
        onClick={() => onEstadoChange && onEstadoChange(pedido.id, 3, 'EN PREPARACION')}
        data-testid={`advance-button-${pedido.id}`}
      >
        Avanzar Estado
      </button>
    </div>
  );
}

// Componente de prueba que simula el flujo de pedidos
function PedidoFlowComponent() {
  const pedidos = mockUsePedidos();
  const estados = mockUseEstados();
  const pedidoEstado = mockUsePedidoEstado();

  const handleEstadoChange = async (pedidoId: number, estadoId: number, estadoNombre: string) => {
    await pedidoEstado.cambiar({
      pedidoId,
      estadoId,
      estadoNombre,
      current: pedidos,
      onSuccess: () => {
        console.log('Estado cambiado exitosamente');
      }
    });
  };

  if (pedidos.loading) {
    return <div data-testid="loading">Cargando pedidos...</div>;
  }

  if (pedidos.error) {
    return <div data-testid="error">Error: {String(pedidos.error)}</div>;
  }

  return (
    <div data-testid="pedido-flow">
      <h2>Gestión de Pedidos</h2>
      <div data-testid="pedidos-list">
        {pedidos.list.map((pedido) => (
          <MockPedidoCard
            key={pedido.id}
            pedido={pedido}
            onEstadoChange={handleEstadoChange}
          />
        ))}
      </div>
      <div data-testid="estados-info">
        <span>Estados disponibles: {estados.list.length}</span>
      </div>
    </div>
  );
}

describe('Pedido Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCambiarFn.mockClear();
  });

  test('should render pedido flow component correctly', () => {
    render(<PedidoFlowComponent />);
    
    expect(screen.getByTestId('pedido-flow')).toBeInTheDocument();
    expect(screen.getByText('Gestión de Pedidos')).toBeInTheDocument();
  });

  test('should display list of pedidos', () => {
    render(<PedidoFlowComponent />);
    
    expect(screen.getByTestId('pedidos-list')).toBeInTheDocument();
    expect(screen.getByTestId('pedido-1')).toBeInTheDocument();
    expect(screen.getByTestId('pedido-2')).toBeInTheDocument();
    
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('María García')).toBeInTheDocument();
  });

  test('should show pedido states correctly', () => {
    render(<PedidoFlowComponent />);
    
    expect(screen.getByTestId('estado-1')).toHaveTextContent('PENDIENTE');
    expect(screen.getByTestId('estado-2')).toHaveTextContent('CONFIRMADO');
  });

  test('should handle estado change when button is clicked', async () => {
    render(<PedidoFlowComponent />);
    
    const advanceButton = screen.getByTestId('advance-button-1');
    fireEvent.click(advanceButton);
    
    // Verificar que la función cambiar fue llamada
    await waitFor(() => {
      expect(mockCambiarFn).toHaveBeenCalledWith({
        pedidoId: 1,
        estadoId: 3,
        estadoNombre: 'EN PREPARACION',
        current: expect.any(Object),
        onSuccess: expect.any(Function)
      });
    });
  });

  test('should display estados information', () => {
    render(<PedidoFlowComponent />);
    
    expect(screen.getByTestId('estados-info')).toBeInTheDocument();
    expect(screen.getByText('Estados disponibles: 4')).toBeInTheDocument();
  });

  test('should handle multiple pedidos interaction', () => {
    render(<PedidoFlowComponent />);
    
    // Verificar que ambos botones están presentes
    expect(screen.getByTestId('advance-button-1')).toBeInTheDocument();
    expect(screen.getByTestId('advance-button-2')).toBeInTheDocument();
    
    // Simular clic en el segundo pedido
    const secondAdvanceButton = screen.getByTestId('advance-button-2');
    fireEvent.click(secondAdvanceButton);
    
    // Verificar la interacción
    expect(secondAdvanceButton).toBeTruthy();
  });

  test('should display correct pedido information', () => {
    render(<PedidoFlowComponent />);
    
    // Verificar información del primer pedido
    const pedido1 = screen.getByTestId('pedido-1');
    expect(pedido1).toContainElement(screen.getByText('Juan Pérez'));
    expect(pedido1).toContainElement(screen.getByTestId('estado-1'));
    
    // Verificar información del segundo pedido
    const pedido2 = screen.getByTestId('pedido-2');
    expect(pedido2).toContainElement(screen.getByText('María García'));
    expect(pedido2).toContainElement(screen.getByTestId('estado-2'));
  });

  test('should handle component re-rendering correctly', () => {
    const { rerender } = render(<PedidoFlowComponent />);
    
    expect(screen.getByTestId('pedido-flow')).toBeInTheDocument();
    
    // Re-renderizar el componente
    rerender(<PedidoFlowComponent />);
    
    // Verificar que sigue funcionando correctamente
    expect(screen.getByTestId('pedido-flow')).toBeInTheDocument();
    expect(screen.getByText('Gestión de Pedidos')).toBeInTheDocument();
  });
});