'use client';

import { useState } from 'react';

interface ConfirmConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void;
}

export function useConfirm() {
  const [dialog, setDialog] = useState<ConfirmConfig | null>(null);

  const showConfirm = (config: ConfirmConfig) => {
    setDialog(config);
  };

  const closeDialog = () => {
    setDialog(null);
  };

  return { dialog, showConfirm, closeDialog };
}