'use client';

import type { SentimentItem } from '@/lib/types';

const IMPACT_STYLES: Record<string, { bg: string; text: string; icon: string; label: string }> = {
  '正面': { bg: 'bg-[#E6F7F0]', text: 'text-[#0D8A5E]', icon: '😊', label: '正面' },
  '中性': { bg: 'bg-[#F5F5F5]', text: 'text-[#5A5A5A]', icon: '😐', label: '中性' },
  '负面': { bg: 'bg-[#FFEBEE]', text: 'text-[#D63031]', icon: '😟', label: '负面' },
};

const IMPACT_BAR_COLORS: Record<string, string> = {
  '正面': 'bg-[#0D8A5E]',
  '中性': 'bg-[#999999]',
  '负面': 'bg-[#D63031]',
};

interface SentimentAiPanelProps {
  item: SentimentItem;
}

export function SentimentAiPanel({ item }: SentimentAiPanelProps) {
  const impactStyle = IMPACT_STYLES[item.impactAssessment] || IMPACT_STYLES['中性'];

  // 模拟的百分比分布数据（将来由 AI 生成）
  const finalDistribution =
    item.impactAssessment === '负面'
      ? { '正面': 8, '中性': 15, '负面': 77 }
      : item.impactAssessment === '正面'
        ? { '正面': 72, '中性': 20, '负面': 8 }
        : { '正面': 15, '中性': 70, '负面': 15 };

  return (
    <div className="w-[280px] flex-shrink-0 flex flex-col gap-4">
      {/* AI 核心摘要 */}
      <div className="bg-gradient-to-br from-[#2D3BFF] to-[#4338CA] rounded-2xl p-5 text-white">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🤖</span>
          <span className="text-sm font-semibold">AI 核心摘要</span>
        </div>
        <div className="text-xs leading-relaxed space-y-2 opacity-95">
          <p className="font-medium">一句话总结：</p>
          <p className="text-[13px]">{item.summary}</p>
        </div>
      </div>

      {/* 影响评估 */}
      <div className="bg-white rounded-xl border border-[#E8E8E8] p-4">
        <div className="text-[11px] text-[#999999] uppercase tracking-wider mb-3">影响评估</div>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-full ${impactStyle.bg} flex items-center justify-center text-2xl`}>
            {impactStyle.icon}
          </div>
          <div>
            <div className={`font-bold text-base ${impactStyle.text}`}>{impactStyle.label}</div>
            <div className="text-[11px] text-[#999999]">综合舆情分析</div>
          </div>
        </div>
        {/* 分布条 */}
        <div className="space-y-2">
          {Object.entries(finalDistribution).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="text-[11px] text-[#888] w-8">{key}</span>
              <div className="flex-1 h-1.5 bg-[#F5F5F5] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${IMPACT_BAR_COLORS[key] || 'bg-[#999]'}`}
                  style={{ width: `${value}%` }}
                />
              </div>
              <span className="text-[11px] text-[#999] w-8 text-right">{value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* 关键标签 */}
      {item.tags.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E8E8E8] p-4">
          <div className="text-[11px] text-[#999999] uppercase tracking-wider mb-3">关键标签</div>
          <div className="flex flex-wrap gap-2">
            {item.tags.map((tag) => {
              const isKeyTag = ['业绩下滑', '融资', 'IPO', '处罚', '高管变动'].includes(tag);
              return (
                <span
                  key={tag}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium ${
                    isKeyTag
                      ? 'bg-[#FFEBEE] text-[#D63031]'
                      : 'bg-[#F5F5F5] text-[#5A5A5A]'
                  }`}
                >
                  {tag}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* 信息来源 */}
      <div className="bg-white rounded-xl border border-[#E8E8E8] p-4">
        <div className="text-[11px] text-[#999999] uppercase tracking-wider mb-3">信息来源</div>
        <div className="text-xs text-[#333] space-y-1.5">
          <div className="flex items-center gap-1.5">
            <span>📰</span>
            <span>来源：{item.source}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>📋</span>
            <span>类型：{item.sourceType}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>📅</span>
            <span>发布：{item.publishDate}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>🕐</span>
            <span>采集：{item.collectedAt}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
