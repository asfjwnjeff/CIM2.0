'use client';

import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { useSentiment } from '@/hooks/useSentiment';
import { SentimentDetail } from '@/components/sentiment/SentimentDetail';

export default function SentimentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;
  const itemId = params.itemId as string;

  const { customers } = useApp();
  const { getItemById } = useSentiment(customerId);

  const customer = customers.find((c) => c.id === customerId);
  const item = getItemById(itemId);

  if (!customer) {
    return (
      <div className="max-w-[1280px] mx-auto py-12 text-center">
        <h2 className="text-2xl font-bold text-[#0A0A0A] mb-4">客户不存在</h2>
        <button
          onClick={() => router.push('/customers')}
          className="inline-flex items-center px-4 py-2 bg-[#2D3BFF] text-white rounded-lg font-medium hover:bg-[#4338CA] transition-colors"
        >
          返回客户列表
        </button>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-[1280px] mx-auto py-12 text-center">
        <h2 className="text-2xl font-bold text-[#0A0A0A] mb-4">舆情不存在</h2>
        <button
          onClick={() => router.push(`/customers/${customerId}`)}
          className="inline-flex items-center px-4 py-2 bg-[#2D3BFF] text-white rounded-lg font-medium hover:bg-[#4338CA] transition-colors"
        >
          返回客户详情
        </button>
      </div>
    );
  }

  return (
    <SentimentDetail
      item={item}
      customerName={customer.name}
      customerId={customerId}
    />
  );
}
