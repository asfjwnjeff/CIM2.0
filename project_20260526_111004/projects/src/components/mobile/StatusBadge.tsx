'use client';

import React from 'react';

type ApprovalStatus = 'draft' | 'in_review' | 'approved' | 'rejected' | string;

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  draft:      { label: '草稿',   bg: 'bg-[#F5F5F5]', text: 'text-[#5A5A5A]', dot: 'bg-[#999999]' },
  in_review:  { label: '审批中', bg: 'bg-[#E8EBFF]', text: 'text-[#2D3BFF]', dot: 'bg-[#2D3BFF]' },
  approved:   { label: '已完成', bg: 'bg-[#E6F7F0]', text: 'text-[#0D8A5E]', dot: 'bg-[#0D8A5E]' },
  rejected:   { label: '已驳回', bg: 'bg-[#FFEBEE]', text: 'text-[#D63031]', dot: 'bg-[#D63031]' },
};

// 兼容中文状态
const STATUS_ALIAS: Record<string, string> = {
  '草稿': 'draft',
  '审批中': 'in_review',
  '审批完成': 'approved',
  '已驳回': 'rejected',
};

export default function StatusBadge({ status, className = '' }: { status: string; className?: string }) {
  const key = STATUS_ALIAS[status] || status;
  const config = STATUS_CONFIG[key] || STATUS_CONFIG.draft;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${config.bg} ${config.text} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

export function getStatusLabel(status: string): string {
  const key = STATUS_ALIAS[status] || status;
  return STATUS_CONFIG[key]?.label || status;
}

export function getStatusColor(status: string): string {
  const key = STATUS_ALIAS[status] || status;
  return STATUS_CONFIG[key]?.text || 'text-[#5A5A5A]';
}
