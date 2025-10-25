'use client';

import { toast } from 'react-hot-toast';

export function useToast() {
  const showSuccess = (message: string) => {
    toast.success(message, {
      duration: 3000,
      position: 'top-right',
      style: {
        background: '#10B981',
        color: '#ffffff',
        fontWeight: '500',
        padding: '12px 16px',
      },
    });
  };

  const showError = (message: string) => {
    toast.error(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#EF4444',
        color: '#ffffff',
        fontWeight: '500',
        padding: '12px 16px',
      },
    });
  };

  const showInfo = (message: string) => {
    toast(message, {
      duration: 3000,
      position: 'top-right',
      icon: 'ℹ️',
      style: {
        background: '#3B82F6',
        color: '#ffffff',
        fontWeight: '500',
        padding: '12px 16px',
      },
    });
  };

  const showWarning = (message: string) => {
    toast(message, {
      duration: 4000,
      position: 'top-right',
      icon: '⚠️',
      style: {
        background: '#F59E0B',
        color: '#ffffff',
        fontWeight: '500',
        padding: '12px 16px',
      },
    });
  };

  const showLoading = (message: string) => {
    return toast.loading(message, {
      position: 'top-right',
      style: {
        background: '#6B7280',
        color: '#ffffff',
        fontWeight: '500',
        padding: '12px 16px',
      },
    });
  };

  return { showSuccess, showError, showInfo, showWarning, showLoading };
}