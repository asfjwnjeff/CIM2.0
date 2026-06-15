'use client';

import React from 'react';
import StatusBadge from './StatusBadge';

interface ApprovalCardProps {
  id: string;
  companyName?: string;
  serviceProduct?: string;
  status: string;
  approvalStatus?: string;
  updatedAt?: string;
  createdAt?: string;
  onClick?: () => void;
}

export default function ApprovalCard({
  companyName,
  serviceProduct,
  status,
  approvalStatus,
  updatedAt,
  createdAt,
  onClick,
}: ApprovalCardProps) {
  const displayStatus = approvalStatus || status;

  return (
    <button
      className="w-full bg-white rounded-xl border border-[#EBEBEB] px-4 py-3.5 active:bg-[#F5F5F5] transition-colors text-left flex items-center gap-3"
      onClick={onClick}
    >
      {/* 状态指示条 */}
      <div
        className={`w-1 self-stretch rounded-full flex-shrink-0 ${
          displayStatus === '审批中' || displayStatus === 'in_review'
            ? 'bg-[#2D3BFF]'
            : displayStatus === '审批完成' || displayStatus === 'approved'
            ? 'bg-[#0D8A5E]'
            : displayStatus === '已驳回' || displayStatus === 'rejected'
            ? 'bg-[#D63031]'
            : 'bg-[#D5D5D5]'
        }`}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[#0A0A0A] truncate">
            {companyName || '未命名审批'}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          {serviceProduct && (
            <span className="text-xs text-[#999999]">{serviceProduct}</span>
          )}
          {(updatedAt || createdAt) && (
            <>
              {serviceProduct && <span className="w-1 h-1 rounded-full bg-[#D5D5D5]" />}
              <span className="text-xs text-[#999999]">
                {formatRelativeTime(updatedAt || createdAt || '')}
              </span>
            </>
          )}
        </div>
      </div>

      <StatusBadge status={displayStatus} />
    </button>
  );
}

function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}
