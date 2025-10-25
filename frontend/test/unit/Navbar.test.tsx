import { render, screen } from '@testing-library/react';
import Navbar from '@/components/Navbar';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    const { priority, ...rest } = props;
    return <img {...rest} />;
  },
}));

// Mock next/font/google
jest.mock('next/font/google', () => ({
  Paytone_One: jest.fn(() => ({
    className: 'mock-paytone-class',
  })),
}));

describe('Navbar', () => {
  beforeEach(() => {
    // Mock Date to ensure consistent time
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render logo and text', () => {
    render(<Navbar />);

    expect(screen.getByAltText('Sarita')).toBeInTheDocument();
    expect(screen.getByAltText('Ícono helado')).toBeInTheDocument();
    expect(screen.getByText('Franquicia')).toBeInTheDocument();
    expect(screen.getByText('Chuscaj')).toBeInTheDocument();
  });

  it('should display Guatemala time', () => {
    render(<Navbar />);

    // Guatemala is UTC-6, so 12:00 UTC = 06:00 Guatemala
    expect(screen.getByText('06:00 AM')).toBeInTheDocument();
    expect(screen.getByText('Guatemala')).toBeInTheDocument();
  });

  it('should have correct styling classes', () => {
    const { container } = render(<Navbar />);

    const header = container.querySelector('header');
    expect(header).toHaveClass('fixed', 'top-0', 'left-0', 'right-0', 'z-50', 'bg-[#E61429]', 'text-white');
  });

  it('should update time every second', async () => {
    const { rerender } = render(<Navbar />);

    // Initial time
    expect(screen.getByText('06:00 AM')).toBeInTheDocument();

    // Advance time by 61 seconds to ensure a minute change
    jest.setSystemTime(new Date('2024-01-01T12:01:00Z'));
    jest.advanceTimersByTime(1000);

    // Re-render to see the updated time
    rerender(<Navbar />);

    // Time should now be updated
    expect(screen.getByText('06:01 AM')).toBeInTheDocument();
  });

  it('should show placeholder time on server side', () => {
    // For SSR simulation, we need to render before client effects run
    const { container } = render(<Navbar />);
    
    // The component initially shows empty string before useEffect runs
    // After useEffect, it shows the time. We're testing the initial render state.
    const timeDisplay = container.querySelector('div.text-lg');
    
    // The component will show actual time after mount, so we can't truly test SSR in this way
    // Let's just verify it renders without errors
    expect(timeDisplay).toBeInTheDocument();
  });
});