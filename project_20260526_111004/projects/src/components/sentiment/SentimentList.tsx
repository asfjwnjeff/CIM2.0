'use client';

import { useRouter, useParams } from 'next/navigation';
import { Search, Calendar, ExternalLink } from 'lucide-react';
import type { SentimentItem, SentimentFilters, SentimentSourceType, ImpactAssessment } from '@/lib/types';

const SOURCE_TYPE_OPTIONS: { value: SentimentSourceType | 'all'; label: string }[] = [
  { value: 'all', label: '全部来源' },
  { value: '官网公告', label: '官网公告' },
  { value: '监管公告', label: '监管公告' },
  { value: '媒体报道', label: '媒体报道' },
  { value: '行业研报', label: '行业研报' },
];

const IMPACT_OPTIONS: { value: ImpactAssessment | 'all'; label: string }[] = [
  { value: 'all', label: '全部影响' },
  { value: '正面', label: '正面' },
  { value: '中性', label: '中性' },
  { value: '负面', label: '负面' },
];

const IMPACT_COLORS: Record<string, string> = {
  '正面': 'bg-[#E6F7F0] text-[#0D8A5E]',
  '中性': 'bg-[#F5F5F5] text-[#5A5A5A]',
  '负面': 'bg-[#FFEBEE] text-[#D63031]',
};

const SOURCE_TYPE_COLORS: Record<string, string> = {
  '官网公告': 'bg-[#E6F7F0] text-[#0D8A5E]',
  '监管公告': 'bg-[#FFF4E8] text-[#E8850C]',
  '媒体报道': 'bg-[#E8EBFF] text-[#2D3BFF]',
  '行业研报': 'bg-[#F3E8FF] text-[#7C3AED]',
};

interface SentimentListProps {
  items: SentimentItem[];
  headline: SentimentItem | null;
  filters: SentimentFilters;
  onFilterChange: (f: Partial<SentimentFilters>) => void;
  hasMore: boolean;
  onLoadMore: () => void;
  isLoading: boolean;
}

export function SentimentList({
  items,
  headline,
  filters,
  onFilterChange,
  hasMore,
  onLoadMore,
  isLoading,
}: SentimentListProps) {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;

  return (
    <div className="space-y-6">
      {/* 筛选栏 */}
      <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
            <input
              type="text"
              placeholder="搜索标题、摘要、标签或来源..."
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              className="w-full pl-9 pr-4 py-2 h-[38px] border border-[#D5D5D5] rounded-lg text-sm focus:outline-none focus:border-[#2D3BFF] focus:ring-2 focus:ring-[#2D3BFF]/10"
            />
          </div>
          <select
            value={filters.sourceType}
            onChange={(e) => onFilterChange({ sourceType: e.target.value as SentimentSourceType | 'all' })}
            className="px-3 py-2 h-[38px] border border-[#D5D5D5] rounded-lg text-sm bg-white focus:outline-none focus:border-[#2D3BFF] focus:ring-2 focus:ring-[#2D3BFF]/10"
          >
            {SOURCE_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            value={filters.impactAssessment}
            onChange={(e) => onFilterChange({ impactAssessment: e.target.value as ImpactAssessment | 'all' })}
            className="px-3 py-2 h-[38px] border border-[#D5D5D5] rounded-lg text-sm bg-white focus:outline-none focus:border-[#2D3BFF] focus:ring-2 focus:ring-[#2D3BFF]/10"
          >
            {IMPACT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <div className="flex items-center gap-2 px-3 py-2 h-[38px] border border-[#D5D5D5] rounded-lg bg-white">
            <Calendar className="w-4 h-4 text-[#999999]" />
            <input
              type="date"
              value={filters.dateRange?.start || ''}
              onChange={(e) =>
                onFilterChange({
                  dateRange: e.target.value
                    ? { start: e.target.value, end: filters.dateRange?.end || '' }
                    : null,
                })
              }
              className="text-sm border-none outline-none bg-transparent"
              placeholder="开始日期"
            />
            <span className="text-[#999999]">-</span>
            <input
              type="date"
              value={filters.dateRange?.end || ''}
              onChange={(e) =>
                onFilterChange({
                  dateRange: filters.dateRange?.start
                    ? { start: filters.dateRange.start, end: e.target.value }
                    : e.target.value
                      ? { start: '', end: e.target.value }
                      : null,
                })
              }
              className="text-sm border-none outline-none bg-transparent"
              placeholder="结束日期"
            />
          </div>
        </div>
      </div>

      {/* 头条区域 */}
      {headline && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[13px] font-semibold text-[#D63031]">📌 重点舆情</span>
          </div>
          <div
            onClick={() => router.push(`/customers/${customerId}/sentiment/${headline.id}`)}
            className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5 flex gap-5 cursor-pointer hover:shadow-md hover:border-[#2D3BFF]/30 transition-all group"
          >
            {headline.images.length > 0 && (
              <div className="w-[240px] h-[150px] flex-shrink-0 rounded-xl overflow-hidden bg-[#F5F5F5]">
                <img
                  src={headline.images[0]}
                  alt={headline.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${SOURCE_TYPE_COLORS[headline.sourceType] || 'bg-[#F5F5F5] text-[#5A5A5A]'}`}>
                    {headline.sourceType}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${IMPACT_COLORS[headline.impactAssessment] || 'bg-[#F5F5F5] text-[#5A5A5A]'}`}>
                    {headline.impactAssessment}
                  </span>
                </div>
                <h3 className="text-[16px] font-semibold text-[#0A0A0A] mb-2 group-hover:text-[#2D3BFF] transition-colors line-clamp-2">
                  {headline.title}
                </h3>
                <p className="text-[13px] text-[#5A5A5A] line-clamp-2 leading-relaxed">
                  {headline.summary}
                </p>
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-[#999999]">
                <span>{headline.source}</span>
                <span>{headline.publishDate}</span>
                <span className="ml-auto flex items-center gap-1 text-[#2D3BFF] opacity-0 group-hover:opacity-100 transition-opacity">
                  查看详情 <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 舆情列表 */}
      {items.length > 0 ? (
        <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
          {items.map((item, index) => (
            <div
              key={item.id}
              onClick={() => router.push(`/customers/${customerId}/sentiment/${item.id}`)}
              className={`flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-[#F5F5F5] transition-colors group ${
                index < items.length - 1 ? 'border-b border-[#EBEBEB]' : ''
              }`}
            >
              {/* 缩略图 */}
              <div className="w-[80px] h-[56px] flex-shrink-0 rounded-lg overflow-hidden bg-[#F5F5F5]">
                {item.images.length > 0 ? (
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#CCCCCC] text-[10px]">
                    暂无图片
                  </div>
                )}
              </div>

              {/* 内容 */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-[#0A0A0A] group-hover:text-[#2D3BFF] transition-colors truncate">
                  {item.title}
                </h4>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-[#999999]">
                  <span>{item.source}</span>
                  <span>{item.publishDate}</span>
                </div>
              </div>

              {/* 标签 */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${IMPACT_COLORS[item.impactAssessment] || 'bg-[#F5F5F5] text-[#5A5A5A]'}`}>
                  {item.impactAssessment}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${SOURCE_TYPE_COLORS[item.sourceType] || 'bg-[#F5F5F5] text-[#5A5A5A]'}`}>
                  {item.sourceType}
                </span>
              </div>
            </div>
          ))}

          {/* 加载更多 */}
          {hasMore && (
            <div className="px-5 py-4 text-center border-t border-[#EBEBEB]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLoadMore();
                }}
                disabled={isLoading}
                className="px-6 py-2 text-sm text-[#2D3BFF] border border-[#C7CCFF] rounded-lg hover:bg-[#E8EBFF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isLoading ? '加载中...' : '加载更多'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-12 text-center">
          <p className="text-sm text-[#999999]">暂无舆情数据</p>
        </div>
      )}
    </div>
  );
}
