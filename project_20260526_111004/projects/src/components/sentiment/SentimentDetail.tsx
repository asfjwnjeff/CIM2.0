'use client';

import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SentimentAiPanel } from './SentimentAiPanel';
import type { SentimentItem } from '@/lib/types';

const SOURCE_TYPE_COLORS: Record<string, string> = {
  '官网公告': 'bg-[#E6F7F0] text-[#0D8A5E]',
  '监管公告': 'bg-[#FFF4E8] text-[#E8850C]',
  '媒体报道': 'bg-[#E8EBFF] text-[#2D3BFF]',
  '行业研报': 'bg-[#F3E8FF] text-[#7C3AED]',
};

const IMPACT_COLORS: Record<string, string> = {
  '正面': 'bg-[#E6F7F0] text-[#0D8A5E]',
  '中性': 'bg-[#F5F5F5] text-[#5A5A5A]',
  '负面': 'bg-[#FFEBEE] text-[#D63031]',
};

interface SentimentDetailProps {
  item: SentimentItem;
  customerName: string;
  customerId: string;
}

export function SentimentDetail({ item, customerName, customerId }: SentimentDetailProps) {
  const router = useRouter();

  // 将正文按双换行分段
  const paragraphs = item.content.split('\n\n').filter(Boolean);

  return (
    <div className="max-w-[1280px] mx-auto space-y-6">
      {/* 顶栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/customers/${customerId}`)}
            className="p-2 text-[#5A5A5A] hover:text-[#0A0A0A] hover:bg-[#F5F5F5] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Link
                href={`/customers/${customerId}`}
                className="text-[13px] text-[#2D3BFF] hover:underline"
              >
                {customerName}
              </Link>
              <span className="text-[#CCCCCC]">/</span>
              <span className="text-[13px] text-[#5A5A5A]">舆情分析</span>
            </div>
          </div>
        </div>
      </div>

      {/* 正文 + AI 面板 */}
      <div className="flex gap-6 items-start">
        {/* 左侧正文 */}
        <div className="flex-1 min-w-0 bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
          {/* 元信息 */}
          <div className="px-8 pt-8 pb-0">
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${SOURCE_TYPE_COLORS[item.sourceType] || 'bg-[#F5F5F5] text-[#5A5A5A]'}`}>
                {item.sourceType}
              </span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${IMPACT_COLORS[item.impactAssessment] || 'bg-[#F5F5F5] text-[#5A5A5A]'}`}>
                {item.impactAssessment}
              </span>
              <span className="text-sm text-[#999999]">{item.source}</span>
              <span className="text-[#DDDDDD]">|</span>
              <span className="text-sm text-[#999999]">{item.publishDate}</span>
            </div>

            <h1 className="text-[22px] font-bold text-[#0A0A0A] leading-[1.4] mb-6">
              {item.title}
            </h1>
          </div>

          {/* 头图 */}
          {item.images.length > 0 && (
            <div className="px-8 mb-6">
              <img
                src={item.images[0]}
                alt={item.title}
                className="w-full rounded-xl object-cover max-h-[400px]"
              />
            </div>
          )}

          {/* 正文 */}
          <div className="px-8 pb-8">
            <div className="text-[14px] leading-[2] text-[#333] space-y-4">
              {paragraphs.map((paragraph, idx) => {
                // 检测是否为 Markdown 格式的次级标题（**text**）
                const boldMatch = paragraph.match(/^\*\*(.+?)\*\*$/);
                if (boldMatch) {
                  return (
                    <h3 key={idx} className="text-[16px] font-semibold text-[#0A0A0A] mt-6 mb-2">
                      {boldMatch[1]}
                    </h3>
                  );
                }
                // 检测是否为列表项
                if (paragraph.trim().startsWith('- ') || paragraph.trim().match(/^\d+\.\s/)) {
                  const items = paragraph.split('\n').filter((line) => line.trim());
                  return (
                    <ul key={idx} className="list-disc pl-5 space-y-1">
                      {items.map((li, liIdx) => (
                        <li key={liIdx}>{li.replace(/^[-]\s+/, '').replace(/^\d+\.\s+/, '')}</li>
                      ))}
                    </ul>
                  );
                }
                return <p key={idx}>{paragraph}</p>;
              })}
            </div>

            {/* 原文链接 */}
            <div className="mt-8 pt-6 border-t border-[#EBEBEB] flex items-center justify-between">
              <a
                href={item.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#2D3BFF] hover:text-[#4338CA] transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                查看原文
              </a>
              <span className="text-xs text-[#BBBBBB]">系统采集时间：{item.collectedAt}</span>
            </div>
          </div>
        </div>

        {/* 右侧 AI 面板 */}
        <SentimentAiPanel item={item} />
      </div>
    </div>
  );
}
