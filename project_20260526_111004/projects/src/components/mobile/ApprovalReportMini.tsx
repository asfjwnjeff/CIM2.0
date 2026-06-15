'use client';

import React from 'react';

interface ReportItem {
  ruleName: string;
  fieldName: string;
  fieldValue?: string;
  result: 'pass' | 'warn';
  reason: string;
}

interface ApprovalReportMiniProps {
  customerName: string;
  serviceProduct: string;
  generatedAt: string;
  items: ReportItem[];
  passCount: number;
  warnCount: number;
}

export default function ApprovalReportMini({
  customerName,
  serviceProduct,
  generatedAt,
  items,
  passCount,
  warnCount,
}: ApprovalReportMiniProps) {
  return (
    <div className="space-y-3">
      {/* 报告头部 */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-semibold text-[#0A0A0A]">审批辅助报告</span>
          <div className="text-[11px] text-[#999999] mt-0.5">
            {new Date(generatedAt).toLocaleString('zh-CN')}
            {customerName && ` · ${customerName}`}
            {serviceProduct && ` · ${serviceProduct}`}
          </div>
        </div>
      </div>

      {/* 判定摘要 */}
      <div className="flex gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0D8A5E]" />
          <span className="text-xs text-[#0D8A5E] font-medium">{passCount} 通过</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E8850C]" />
          <span className="text-xs text-[#E8850C] font-medium">{warnCount} 风险提醒</span>
        </div>
      </div>

      {/* 报告表格（移动端适配：横滑） */}
      <div className="overflow-x-auto -mx-1">
        <div className="min-w-[400px]">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#EBEBEB]">
                <th className="text-left py-2 px-2 text-[#999999] font-medium">规则</th>
                <th className="text-left py-2 px-2 text-[#999999] font-medium">字段</th>
                <th className="text-left py-2 px-2 text-[#999999] font-medium">结果</th>
                <th className="text-left py-2 px-2 text-[#999999] font-medium">原因</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="border-b border-[#F5F5F5]">
                  <td className="py-2 px-2 text-[#0A0A0A]">{item.ruleName}</td>
                  <td className="py-2 px-2 text-[#5A5A5A]">
                    {item.fieldName}
                    {item.fieldValue && <span className="text-[#0A0A0A] ml-1">「{item.fieldValue}」</span>}
                  </td>
                  <td className="py-2 px-2">
                    {item.result === 'pass' ? (
                      <span className="inline-flex items-center gap-1 text-[#0D8A5E]">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                        </svg>
                        通过
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[#E8850C]">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        风险提醒
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-2 text-[#5A5A5A] text-[11px]">{item.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 底部 */}
      <div className="text-[10px] text-[#B5B5B5] text-center">CIM 2.0 自动审批引擎</div>
    </div>
  );
}
