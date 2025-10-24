import { render, screen, fireEvent } from '@testing-library/react';
import PedidoCard from '@/components/PedidoCard';
import type { PedidoCompleto } from '@/types/pedido';

// Mock next/font/google
jest.mock('next/font/google', () => ({
  Paytone_One: jest.fn(() => ({
    style: { fontFamily: 'Paytone One' },
    className: 'mock-paytone-class',
  })),
  Poppins: jest.fn(() => ({
    className: 'mock-poppins-class',
  })),
}));

const mockPedido: PedidoCompleto = {
  id: 123,
  pedido: '#P0123',
  estado: 'Nuevo',
  total: 25.50,
  items: [
    {
      tipo: 'Helado',
      nombre: 'Vainilla',
      sabores: ['Vainilla'],
      cantidad: 2,
      subtotal: 15.00,
    },
    {
      tipo: 'Postre',
      nombre: 'Tarta',
      sabores: ['Fresa', 'Chocolate'],
      cantidad: 1,
      subtotal: 10.50,
    },
  ],
};

const mockEstados = [
  { id: 1, nombre: 'Nuevo' },
  { id: 2, nombre: 'Preparando' },
  { id: 3, nombre: 'Entregado' },
];

describe('PedidoCard', () => {
  it('should render pedido information', () => {
    render(<PedidoCard pedido={mockPedido} />);

    expect(screen.getByText('Pedido #P0123')).toBeInTheDocument();
    expect(screen.getByText('Total: Q. 25.50')).toBeInTheDocument();
    expect(screen.getByText('Nuevo')).toBeInTheDocument();
  });

  it('should render all items', () => {
    render(<PedidoCard pedido={mockPedido} />);

    expect(screen.getByText('Item No. 1')).toBeInTheDocument();
    expect(screen.getByText('Item No. 2')).toBeInTheDocument();
    
    // Use getAllByText for elements that appear multiple times
    const tipoLabels = screen.getAllByText('Tipo', { exact: false });
    expect(tipoLabels.length).toBeGreaterThan(0);
    
    expect(screen.getByText('Helado')).toBeInTheDocument();
    expect(screen.getByText('Postre')).toBeInTheDocument();
    
    // Vainilla appears twice (nombre and sabor), use getAllByText
    const vainillaElements = screen.getAllByText('Vainilla');
    expect(vainillaElements.length).toBe(2);
    
    expect(screen.getByText('Tarta')).toBeInTheDocument();
    expect(screen.getByText('Fresa, Chocolate')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Q. 15.00')).toBeInTheDocument();
    expect(screen.getByText('Q. 10.50')).toBeInTheDocument();
  });

  it('should show advance button when next state exists', () => {
    const mockOnAdvance = jest.fn();
    render(
      <PedidoCard
        pedido={mockPedido}
        estados={mockEstados}
        onAdvance={mockOnAdvance}
      />
    );

    const button = screen.getByRole('button', { name: /preparar/i });
    expect(button).toBeInTheDocument();
  });

  it('should call onAdvance when button is clicked', () => {
    const mockOnAdvance = jest.fn();
    render(
      <PedidoCard
        pedido={mockPedido}
        estados={mockEstados}
        onAdvance={mockOnAdvance}
      />
    );

    const button = screen.getByRole('button', { name: /preparar/i });
    fireEvent.click(button);

    expect(mockOnAdvance).toHaveBeenCalledWith(mockEstados[1]);
  });

  it('should disable button when disabled prop is true', () => {
    const mockOnAdvance = jest.fn();
    render(
      <PedidoCard
        pedido={mockPedido}
        estados={mockEstados}
        onAdvance={mockOnAdvance}
        disabled={true}
      />
    );

    const button = screen.getByRole('button', { name: /preparar/i });
    expect(button).toBeDisabled();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <PedidoCard pedido={mockPedido} className="custom-class" />
    );

    const article = container.querySelector('article');
    expect(article).toHaveClass('custom-class');
  });
});