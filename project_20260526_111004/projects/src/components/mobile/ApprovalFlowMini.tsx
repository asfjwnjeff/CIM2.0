'use client';

import React from 'react';

interface ApprovalStep {
  id?: string;
  name: string;
  role?: string;
  approver?: string;
  status?: string;      // 'completed' | 'current' | 'pending' | 'rejected'
  level?: number;
  order?: number;
  isRequired?: boolean;
  rejected?: boolean;
  nodeType?: string;
}

interface ApprovalFlowMiniProps {
  steps?: Record<string, unknown>[] | ApprovalStep[];
  className?: string;
}

export default function ApprovalFlowMini({ steps, className = '' }: ApprovalFlowMiniProps) {
  if (!steps || steps.length === 0) {
    return (
      <div className={`text-xs text-[#999999] py-4 text-center ${className}`}>
        暂无审批流程
      </div>
    );
  }

  // 派生审批状态
  const hasRejected = steps.some((s) => {
    const step = s as ApprovalStep;
    return step.rejected === true || step.status === 'rejected';
  });
  const allCompleted = steps.every((s) => {
    const step = s as ApprovalStep;
    return step.status === 'completed';
  });

  return (
    <div className={`space-y-0 ${className}`}>
      {steps.map((stepRaw, index) => {
        const step = stepRaw as ApprovalStep;
        const isLast = index === steps.length - 1;
        const isCompleted = step.status === 'completed';
        const isCurrent = step.status === 'current';
        const isRejected = step.status === 'rejected' || step.rejected === true;
        const isPending = !isCompleted && !isCurrent && !isRejected;

        // 状态颜色
        let dotColor = 'bg-[#D5D5D5]';  // pending
        let lineColor = 'bg-[#EBEBEB]';
        let textColor = 'text-[#999999]';
        let icon = null;

        if (isCompleted) {
          dotColor = 'bg-[#0D8A5E]';
          lineColor = 'bg-[#0D8A5E]';
          textColor = 'text-[#0D8A5E]';
          icon = (
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          );
        } else if (isCurrent) {
          dotColor = 'bg-[#2D3BFF]';
          textColor = 'text-[#2D3BFF]';
          icon = (
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="4" />
            </svg>
          );
        } else if (isRejected) {
          dotColor = 'bg-[#D63031]';
          textColor = 'text-[#D63031]';
          icon = (
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          );
        }

        return (
          <div key={step.id || index} className="flex gap-3">
            {/* 左侧：圆点 + 连线 */}
            <div className="flex flex-col items-center">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${dotColor}`}
              >
                {icon}
              </div>
              {!isLast && <div className={`w-0.5 flex-1 min-h-[16px] ${lineColor}`} />}
            </div>

            {/* 右侧：步骤信息 */}
            <div className={`flex-1 min-w-0 ${!isLast ? 'pb-3' : ''}`}>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${textColor}`}>
                  {step.name}
                </span>
                {isCurrent && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-[#E8EBFF] text-[#2D3BFF] font-medium">
                    当前
                  </span>
                )}
                {isRejected && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-[#FFEBEE] text-[#D63031] font-medium">
                    驳回
                  </span>
                )}
              </div>
              {(step.approver || step.role) && (
                <div className="text-xs text-[#999999] mt-0.5">
                  {step.role && <span>{step.role}：</span>}
                  {step.approver || '待分配'}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
