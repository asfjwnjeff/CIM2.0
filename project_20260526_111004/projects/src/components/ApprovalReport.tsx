'use client';

export interface ReportItem {
  ruleName: string;
  fieldName: string;
  fieldValue?: string;
  result: 'pass' | 'warn';
  reason: string;
}

export interface ApprovalReportProps {
  customerName: string;
  serviceProduct: string;
  generatedAt: string;
  items: ReportItem[];
  passCount: number;
  warnCount: number;
}

const resultConfig = {
  pass: { color: '#0D8A5E', bg: 'bg-white', dot: 'bg-[#0D8A5E]', label: '通过' },
  warn: { color: '#E8850C', bg: 'bg-[#FFF9EB]', dot: 'bg-[#E8850C]', label: '风险提醒' },
};

export default function ApprovalReport({
  customerName,
  serviceProduct,
  generatedAt,
  items,
  passCount,
  warnCount,
}: ApprovalReportProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#EBEBEB]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-[#0A0A0A]">审批辅助报告</h3>
          </div>
          <span className="text-[10px] text-[#999]">
            {new Date(generatedAt).toLocaleString('zh-CN')}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-[#5A5A5A]">
          <span>客户：{customerName}</span>
          <span>服务产品：{serviceProduct}</span>
        </div>
        {/* Summary counts */}
        <div className="flex items-center gap-4 mt-2 pt-2 border-t border-[#EBEBEB]">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#0D8A5E]" />
            <span className="text-xs font-medium text-[#0D8A5E]">{passCount} 通过</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#E8850C]" />
            <span className="text-xs font-medium text-[#E8850C]">{warnCount} 风险提醒</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#EBEBEB] bg-[#FAFAFA]">
              <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-[#5A5A5A] uppercase tracking-wider">规则名称</th>
              <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-[#5A5A5A] uppercase tracking-wider">字段</th>
              <th className="text-center px-4 py-2.5 text-[10px] font-semibold text-[#5A5A5A] uppercase tracking-wider">判定结果</th>
              <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-[#5A5A5A] uppercase tracking-wider">原因</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBEBEB]">
            {items.map((item, idx) => {
              const cfg = resultConfig[item.result];
              return (
                <tr key={idx} className={`${cfg.bg} text-xs`}>
                  <td className="px-4 py-2.5" style={{ borderLeft: `3px solid ${cfg.color}` }}>
                    <span className="text-[#0A0A0A]">{item.ruleName}</span>
                  </td>
                  <td className="px-4 py-2.5 text-[#5A5A5A]">{item.fieldName}</td>
                  <td className="px-4 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      <span style={{ color: cfg.color }} className="font-medium">{cfg.label}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-[#5A5A5A]">{item.reason}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-[#EBEBEB] bg-[#FAFAFA]">
        <div className="flex items-center justify-end text-[10px] text-[#999]">
          <span>CIM2.0 自动审批引擎</span>
        </div>
      </div>
    </div>
  );
}
