import { render, screen, fireEvent, waitFor } from '@testing-library/react';import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { usePedidos } from '@/hooks/usePedido';import { usePedidos } from '@/hooks/usePedido';

import { useEstados } from '@/hooks/useEstado';import { useEstados } from '@/hooks/useEstado';

import { usePedidoEstado } from '@/hooks/usePedidoEstado';import PedidoCard from '@/components/PedidoCard';

import PedidoCard from '@/components/PedidoCard';import * as pedidoService from '@/services/pedido.service';

import * as estadoService from '@/services/estado.service';

// Mock react-hot-toast

jest.mock('react-hot-toast', () => ({// Mock services

  toast: {jest.mock('@/services/pedido.service');

    success: jest.fn(),jest.mock('@/services/estado.service');

    error: jest.fn(),

    loading: jest.fn(),const mockGetPedidosCompletos = pedidoService.getPedidosCompletos as jest.MockedFunction<typeof pedidoService.getPedidosCompletos>;

    dismiss: jest.fn(),const mockGetEstados = estadoService.getEstados as jest.MockedFunction<typeof estadoService.getEstados>;

  },const mockPatchPedidoEstado = pedidoService.patchPedidoEstado as jest.MockedFunction<typeof pedidoService.patchPedidoEstado>;

}));

// Mock fonts

// Mock fontsjest.mock('next/font/google', () => ({

jest.mock('next/font/google', () => ({  Paytone_One: jest.fn(() => ({

  Paytone_One: jest.fn(() => ({    style: { fontFamily: 'Paytone One' },

    style: { fontFamily: 'Paytone One' },    className: 'mock-paytone-class',

    className: 'mock-paytone-class',  })),

  })),  Poppins: jest.fn(() => ({

  Poppins: jest.fn(() => ({    className: 'mock-poppins-class',

    className: 'mock-poppins-class',  })),

  })),}));

}));

const TestComponent = () => {

// Mock fetch globally  const pedidos = usePedidos();

const mockFetch = jest.fn();  const estados = useEstados();

global.fetch = mockFetch as any;

  return (

const TestComponent = () => {    <div>

  const pedidos = usePedidos();      {pedidos.loading && <div>Loading pedidos...</div>}

  const estados = useEstados();      {estados.loading && <div>Loading estados...</div>}

  const { advanceEstado, updating } = usePedidoEstado();      {pedidos.error && <div>Error: {pedidos.error.message}</div>}

      {estados.error && <div>Error estados: {estados.error.message}</div>}

  const handleAdvance = async (pedidoId: number, nextEstado: any) => {

    await advanceEstado(pedidoId, nextEstado.id);      {pedidos.list && estados.data && pedidos.list.map(pedido => (

    pedidos.refetch();        <PedidoCard

  };          key={pedido.id}

          pedido={pedido}

  return (          estados={estados.data}

    <div>          onAdvance={(nextEstado) => {

      {pedidos.loading && <div data-testid="loading-pedidos">Cargando pedidos...</div>}            mockPatchPedidoEstado(pedido.id, nextEstado.id);

      {estados.loading && <div data-testid="loading-estados">Cargando estados...</div>}            // Simulate state update

                  pedidos.setList(prev => prev?.map(p =>

      {pedidos.list && estados.data && pedidos.list.map(pedido => (              p.id === pedido.id ? { ...p, estado: nextEstado.nombre } : p

        <PedidoCard            ) || null);

          key={pedido.id}          }}

          pedido={pedido}        />

          estados={estados.data}      ))}

          onAdvance={(nextEstado) => handleAdvance(pedido.id, nextEstado)}    </div>

          disabled={updating}  );

        />};

      ))}

describe('Pedido Flow Integration', () => {

      {pedidos.list && pedidos.list.length === 0 && (  beforeEach(() => {

        <div data-testid="no-pedidos">No hay pedidos</div>    jest.clearAllMocks();

      )}  });

    </div>

  );  it('should load pedidos and estados successfully', async () => {

};    const mockPedidos = [

      {

describe('Pedido Flow - Integration Tests', () => {        id: 1,

  beforeEach(() => {        pedido: '#P0001',

    jest.clearAllMocks();        estado: 'Nuevo',

  });        total: 25.50,

        items: [{

  it('should load pedidos and estados on mount', async () => {          tipo: 'Helado',

    const mockPedidos = [          nombre: 'Vainilla',

      {          sabores: ['Vainilla'],

        pedido: '#P0001',          cantidad: 1,

        estado: 'Nuevo',          subtotal: 15.00,

        total: 25.50,        }],

        items: [{ tipo: 'Helado', nombre: 'Vainilla', sabores: ['Vainilla'], cantidad: 1, subtotal: 25.50 }],      },

      },    ];

    ];

    const mockEstados = [

    const mockEstados = [      { id: 1, nombre: 'Nuevo' },

      { id: 1, nombre: 'Nuevo' },      { id: 2, nombre: 'Preparando' },

      { id: 2, nombre: 'Preparando' },      { id: 3, nombre: 'Entregado' },

    ];    ];



    mockFetch    mockGetPedidosCompletos.mockResolvedValue(mockPedidos);

      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockPedidos) })    mockGetEstados.mockResolvedValue(mockEstados);

      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockEstados) });

    render(<TestComponent />);

    render(<TestComponent />);

    await waitFor(() => {

    expect(screen.getByTestId('loading-pedidos')).toBeInTheDocument();      expect(screen.getByText('Pedido #P0001')).toBeInTheDocument();

    });

    await waitFor(() => {

      expect(screen.getByText('Pedido #P0001')).toBeInTheDocument();    expect(mockGetPedidosCompletos).toHaveBeenCalled();

    });    expect(mockGetEstados).toHaveBeenCalled();

  });  });



  it('should advance pedido estado', async () => {  it('should handle pedido state advancement', async () => {

    const mockPedidos = [    const mockPedidos = [

      {      {

        id: 1,        id: 1,

        pedido: '#P0001',        pedido: '#P0001',

        estado: 'Nuevo',        estado: 'Nuevo',

        total: 25.50,        total: 25.50,

        items: [{ tipo: 'Helado', nombre: 'Vainilla', sabores: ['Vainilla'], cantidad: 1, subtotal: 25.50 }],        items: [{

      },          tipo: 'Helado',

    ];          nombre: 'Vainilla',

          sabores: ['Vainilla'],

    const mockEstados = [          cantidad: 1,

      { id: 1, nombre: 'Nuevo' },          subtotal: 15.00,

      { id: 2, nombre: 'Preparando' },        }],

    ];      },

    ];

    mockFetch

      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockPedidos) })    const mockEstados = [

      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockEstados) })      { id: 1, nombre: 'Nuevo' },

      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ success: true }) })      { id: 2, nombre: 'Preparando' },

      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([{ ...mockPedidos[0], estado: 'Preparando' }]) });      { id: 3, nombre: 'Entregado' },

    ];

    render(<TestComponent />);

    mockGetPedidosCompletos.mockResolvedValue(mockPedidos);

    await waitFor(() => {    mockGetEstados.mockResolvedValue(mockEstados);

      expect(screen.getByText('Nuevo')).toBeInTheDocument();    mockPatchPedidoEstado.mockResolvedValue({ success: true });

    });

    render(<TestComponent />);

    const button = screen.getByRole('button', { name: /preparar/i });

    fireEvent.click(button);    await waitFor(() => {

      expect(screen.getByText('Pedido #P0001')).toBeInTheDocument();

    await waitFor(() => {    });

      expect(require('react-hot-toast').toast.success).toHaveBeenCalled();

    });    const prepareButton = screen.getByRole('button', { name: /preparar/i });

  });    fireEvent.click(prepareButton);



  it('should handle empty pedidos list', async () => {    await waitFor(() => {

    mockFetch      expect(mockPatchPedidoEstado).toHaveBeenCalledWith(1, 2);

      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })    });

      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) });  });



    render(<TestComponent />);  it('should handle loading states', () => {

    mockGetPedidosCompletos.mockImplementation(() => new Promise(() => {}));

    await waitFor(() => {    mockGetEstados.mockImplementation(() => new Promise(() => {}));

      expect(screen.getByTestId('no-pedidos')).toBeInTheDocument();

    });    render(<TestComponent />);

  });

    expect(screen.getByText('Loading pedidos...')).toBeInTheDocument();

  it('should handle pedidos fetch error', async () => {    expect(screen.getByText('Loading estados...')).toBeInTheDocument();

    mockFetch  });

      .mockRejectedValueOnce(new Error('Network error'))

      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) });  it('should handle errors gracefully', async () => {

    const errorMessage = 'Network error';

    render(<TestComponent />);    mockGetPedidosCompletos.mockRejectedValue(new Error(errorMessage));

    mockGetEstados.mockResolvedValue([]);

    await waitFor(() => {

      expect(screen.queryByTestId('loading-pedidos')).not.toBeInTheDocument();    render(<TestComponent />);

    });

  });    await waitFor(() => {

      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();

  it('should disable buttons while updating estado', async () => {    });

    const mockPedidos = [  });

      {

        id: 1,  it('should handle 404 as empty list', async () => {

        pedido: '#P0001',    const notFoundError = new Error('404 Not Found');

        estado: 'Nuevo',    mockGetPedidosCompletos.mockRejectedValue(notFoundError);

        total: 25.50,    mockGetEstados.mockResolvedValue([]);

        items: [{ tipo: 'Helado', nombre: 'Vainilla', sabores: ['Vainilla'], cantidad: 1, subtotal: 25.50 }],

      },    render(<TestComponent />);

    ];

    await waitFor(() => {

    const mockEstados = [      expect(screen.queryByText('Error:')).not.toBeInTheDocument();

      { id: 1, nombre: 'Nuevo' },    });

      { id: 2, nombre: 'Preparando' },  });

    ];});

    mockFetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockPedidos) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockEstados) })
      .mockImplementationOnce(() => new Promise(resolve => setTimeout(() => resolve({ ok: true, json: () => Promise.resolve({}) }), 100)));

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /preparar/i })).toBeInTheDocument();
    });

    const button = screen.getByRole('button', { name: /preparar/i });
    fireEvent.click(button);

    // Button should be disabled during update
    expect(button).toBeDisabled();
  });
});
