'use client';

import React, { useCallback, useRef, useState } from 'react';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

const overlayClass = [
  'fixed inset-0 z-50 bg-black/30 backdrop-blur-sm',
  'data-[state=open]:animate-in data-[state=closed]:animate-out',
  'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
].join(' ');

const contentClass = [
  'fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]',
  'w-[calc(100%-2rem)] max-w-[400px]',
  'rounded-2xl border-0',
  'bg-white dark:bg-[#1C1C1E]',
  'shadow-[0_16px_48px_rgba(0,0,0,0.15)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.5)]',
  'data-[state=open]:animate-in data-[state=closed]:animate-out',
  'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
  'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
  'duration-200',
].join(' ');

export function useConfirm() {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({ title: '', message: '' });
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((title: string, message: string, confirmLabel?: string, cancelLabel?: string, danger?: boolean): Promise<boolean> => {
    setOptions({ title, message, confirmLabel, cancelLabel, danger });
    setOpen(true);
    return new Promise((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const handleConfirm = useCallback(() => {
    resolverRef.current?.(true);
    resolverRef.current = null;
    setOpen(false);
  }, []);

  const handleCancel = useCallback(() => {
    resolverRef.current?.(false);
    resolverRef.current = null;
    setOpen(false);
  }, []);

  const btnBase = 'flex-1 h-11 rounded-xl text-sm active:scale-[0.98] transition-all';

  const ConfirmDialog = (
    <AlertDialogPrimitive.Root open={open} onOpenChange={(o) => { if (!o) handleCancel(); }}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className={overlayClass} />
        <AlertDialogPrimitive.Content className={contentClass}>
          <div className="px-6 pt-8 pb-0 text-center">
            <AlertDialogPrimitive.Title className="text-lg font-bold text-[#0A0A0A] dark:text-white">
              {options.title}
            </AlertDialogPrimitive.Title>
            <AlertDialogPrimitive.Description className="text-sm text-[#5A5A5A] dark:text-[#98989E] mt-2">
              {options.message}
            </AlertDialogPrimitive.Description>
          </div>
          <div className="flex gap-3 px-6 pb-6 pt-6">
            <button
              onClick={handleCancel}
              className={`${btnBase} border border-[#D5D5D5] dark:border-[#48484A] bg-white dark:bg-[#2C2C2E] text-[#0A0A0A] dark:text-white font-medium hover:bg-[#F5F5F5] dark:hover:bg-[#3A3A3C]`}
            >
              {options.cancelLabel || '取消'}
            </button>
            <button
              onClick={handleConfirm}
              className={`${btnBase} font-semibold text-white ${
                options.danger
                  ? 'bg-[#D63031] hover:bg-[#C62828] dark:bg-[#FF453A] dark:hover:bg-[#FF695E]'
                  : 'bg-[#2D3BFF] hover:bg-[#4338CA] dark:bg-[#0A84FF] dark:hover:bg-[#409CFF]'
              }`}
            >
              {options.confirmLabel || '确认'}
            </button>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );

  return { confirm, ConfirmDialog };
}
