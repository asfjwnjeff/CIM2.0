'use client';

import React from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = '确认',
  cancelLabel = '取消',
  danger = false,
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />

      {/* 弹窗 */}
      <div className="relative bg-white rounded-t-2xl w-full max-w-lg px-6 pt-6 pb-8 animate-slideUp"
        style={{ paddingBottom: 'calc(32px + env(safe-area-inset-bottom, 0px))' }}>
        <h3 className="text-base font-semibold text-[#0A0A0A] text-center">{title}</h3>
        <p className="text-sm text-[#5A5A5A] mt-2 text-center">{message}</p>

        <div className="flex gap-3 mt-6">
          <button
            className="flex-1 h-11 border border-[#EBEBEB] rounded-xl text-sm font-medium text-[#5A5A5A] active:bg-[#F5F5F5] transition-colors"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            className={`flex-1 h-11 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50 ${
              danger ? 'bg-[#D63031] active:bg-[#B82020]' : 'bg-[#2D3BFF] active:bg-[#4338CA]'
            }`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? '处理中...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
