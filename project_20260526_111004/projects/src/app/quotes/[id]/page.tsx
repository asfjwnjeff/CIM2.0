'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import type { Quote } from '@/lib/types';

export default function QuoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { salesQuotes } = useApp();

  const quote = salesQuotes.find((q: Quote) => q.id === params.id);

  if (!quote) {
    return (
        <div className="flex flex-col items-center justify-center h-full p-16">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-[#F5F5F5] flex items-center justify-center">
            <svg className="w-12 h-12 text-[#999999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">报价单不存在</h3>
          <p className="text-[#5A5A5A] mb-6">找不到您要查看的报价单</p>
          <button
            onClick={() => router.push('/quotes')}
            className="bg-[#2D3BFF] text-white px-5 py-2.5 rounded-lg font-medium hover:opacity-90 transition-all active:scale-[0.98] flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回列表
          </button>
        </div>
    );
  }

  return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2.5 border border-[#EBEBEB] rounded-lg bg-white text-[#5A5A5A] hover:bg-[#F5F5F5] hover:text-[#0A0A0A] transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              返回
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#0A0A0A]">{quote.title || '报价单'}</h1>
              <p className="text-[#5A5A5A] mt-1">{quote.quoteNumber || ''}</p>
            </div>
          </div>
          <Link href={`/quotes/${quote.id}/edit`}>
            <button className="flex items-center gap-2 px-4 py-2.5 border border-[#EBEBEB] rounded-lg bg-white text-[#5A5A5A] hover:bg-[#F5F5F5] hover:text-[#0A0A0A] transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              编辑
            </button>
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-[#EBEBEB] p-6">
          <h2 className="text-lg font-semibold text-[#0A0A0A] mb-6">报价单详情</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#5A5A5A] mb-2">客户</label>
              <p className="text-[#0A0A0A]">{quote.customerName || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#5A5A5A] mb-2">状态</label>
              <p className="text-[#0A0A0A]">{quote.status || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#5A5A5A] mb-2">总金额</label>
              <p className="text-[#2D3BFF] font-bold text-xl">{quote.totalAmount ? `${quote.currency || 'CNY'} ${quote.totalAmount}` : '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#5A5A5A] mb-2">创建日期</label>
              <p className="text-[#0A0A0A]">{quote.createdAt ? new Date(quote.createdAt).toLocaleDateString('zh-CN') : '-'}</p>
            </div>
          </div>
        </div>
      </div>
  );
}
