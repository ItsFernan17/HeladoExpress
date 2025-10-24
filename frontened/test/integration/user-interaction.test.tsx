import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useConfirm } from '@/hooks/useConfirm';
import { useToast } from '@/hooks/useToast';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: jest.fn((message, options) => {
    // Mock the base toast function
    return 'toast-id-' + Math.random();
  }),
}));

// Add the methods to the toast mock after creation
const toastMock = require('react-hot-toast').toast;
toastMock.success = jest.fn();
toastMock.error = jest.fn();
toastMock.info = jest.fn();
toastMock.loading = jest.fn();

const UserInteractionTest = () => {
  const { showSuccess, showError, showInfo, showWarning, showLoading } = useToast();
  const { dialog, showConfirm, closeDialog } = useConfirm();

  const handleSuccess = () => showSuccess('Operation completed successfully!');
  const handleError = () => showError('Something went wrong!');
  const handleInfo = () => showInfo('Here is some information');
  const handleWarning = () => showWarning('Warning: Check your input');
  const handleLoading = () => showLoading('Loading data...');

  const handleConfirm = () => {
    showConfirm({
      title: 'Confirm Action',
      message: 'Are you sure you want to proceed?',
      confirmText: 'Yes',
      cancelText: 'No',
      onConfirm: () => showSuccess('Action confirmed!'),
    });
  };

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
      <button onClick={handleInfo}>Show Info</button>
      <button onClick={handleWarning}>Show Warning</button>
      <button onClick={handleLoading}>Show Loading</button>
      <button onClick={handleConfirm}>Show Confirm</button>

      {dialog && (
        <div data-testid="confirm-dialog">
          <h2>{dialog.title}</h2>
          <p>{dialog.message}</p>
          <button onClick={closeDialog}>Cancel</button>
          <button onClick={() => {
            dialog.onConfirm();
            closeDialog();
          }}>
            {dialog.confirmText || 'Confirm'}
          </button>
        </div>
      )}
    </div>
  );
};

describe('User Interaction Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show success toast', () => {
    render(<UserInteractionTest />);

    fireEvent.click(screen.getByRole('button', { name: /show success/i }));

    expect(require('react-hot-toast').toast.success).toHaveBeenCalledWith(
      'Operation completed successfully!',
      expect.objectContaining({
        duration: 3000,
        position: 'top-right',
      })
    );
  });

  it('should show error toast', () => {
    render(<UserInteractionTest />);

    fireEvent.click(screen.getByRole('button', { name: /show error/i }));

    expect(require('react-hot-toast').toast.error).toHaveBeenCalledWith(
      'Something went wrong!',
      expect.objectContaining({
        duration: 4000,
        position: 'top-right',
      })
    );
  });

  it('should show info toast', () => {
    render(<UserInteractionTest />);

    fireEvent.click(screen.getByRole('button', { name: /show info/i }));

    expect(require('react-hot-toast').toast).toHaveBeenCalledWith(
      'Here is some information',
      expect.objectContaining({
        duration: 3000,
        icon: 'ℹ️',
      })
    );
  });

  it('should show warning toast', () => {
    render(<UserInteractionTest />);

    fireEvent.click(screen.getByRole('button', { name: /show warning/i }));

    expect(require('react-hot-toast').toast).toHaveBeenCalledWith(
      'Warning: Check your input',
      expect.objectContaining({
        duration: 4000,
        icon: '⚠️',
      })
    );
  });

  it('should show loading toast and return toast id', () => {
    const mockToastId = 'loading-toast-123';
    require('react-hot-toast').toast.loading.mockReturnValue(mockToastId);

    render(<UserInteractionTest />);

    fireEvent.click(screen.getByRole('button', { name: /show loading/i }));

    expect(require('react-hot-toast').toast.loading).toHaveBeenCalledWith(
      'Loading data...',
      expect.objectContaining({
        position: 'top-right',
      })
    );
  });

  it('should show and handle confirm dialog', () => {
    render(<UserInteractionTest />);

    fireEvent.click(screen.getByRole('button', { name: /show confirm/i }));

    expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();

    // Click confirm
    fireEvent.click(screen.getByRole('button', { name: /yes/i }));

    expect(require('react-hot-toast').toast.success).toHaveBeenCalledWith(
      'Action confirmed!',
      expect.objectContaining({
        duration: 3000,
        position: 'top-right',
      })
    );
    expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
  });

  it('should close confirm dialog on cancel', () => {
    render(<UserInteractionTest />);

    fireEvent.click(screen.getByRole('button', { name: /show confirm/i }));

    expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
  });
});