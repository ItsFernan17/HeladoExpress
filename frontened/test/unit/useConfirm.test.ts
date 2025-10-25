import { renderHook, act } from '@testing-library/react';
import { useConfirm } from '@/hooks/useConfirm';

describe('useConfirm', () => {
  it('should initialize with null dialog', () => {
    const { result } = renderHook(() => useConfirm());
    expect(result.current.dialog).toBeNull();
  });

  it('should show confirm dialog with config', () => {
    const { result } = renderHook(() => useConfirm());
    const config = {
      title: 'Test Title',
      message: 'Test Message',
      onConfirm: jest.fn(),
    };

    act(() => {
      result.current.showConfirm(config);
    });

    expect(result.current.dialog).toEqual(config);
  });

  it('should close dialog', () => {
    const { result } = renderHook(() => useConfirm());
    const config = {
      title: 'Test Title',
      message: 'Test Message',
      onConfirm: jest.fn(),
    };

    act(() => {
      result.current.showConfirm(config);
    });
    expect(result.current.dialog).not.toBeNull();

    act(() => {
      result.current.closeDialog();
    });
    expect(result.current.dialog).toBeNull();
  });

  it('should handle confirm config with all properties', () => {
    const { result } = renderHook(() => useConfirm());
    const config = {
      title: 'Test Title',
      message: 'Test Message',
      confirmText: 'Yes',
      cancelText: 'No',
      danger: true,
      onConfirm: jest.fn(),
    };

    act(() => {
      result.current.showConfirm(config);
    });

    expect(result.current.dialog).toEqual(config);
  });
});