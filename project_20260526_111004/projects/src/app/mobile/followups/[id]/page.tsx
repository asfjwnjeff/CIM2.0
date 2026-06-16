'use client';

import React, { useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useApp } from '@/lib/store';
import { formatShortDateTime, getFollowupTypeLabel, getFollowupStatusColor, getFollowupMethodLabel } from '@/lib/mobile-utils';

const STATUS_LABELS: Record<string, string> = {
  'new': '新建需求', 'discussing': '沟通方案', 'promoting': '促单', 'success': '成功', 'no_progress': '无进展', 'cancelled': '需求取消', 'terminated': '合同终止', 'failed': '失败',
};

export default function MobileFollowupDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { followUps, customers } = useApp();

  const followup = useMemo(() => followUps.find((f) => f.id === id), [followUps, id]);
  const customer = useMemo(() => customers.find((c) => c.id === followup?.customerId), [customers, followup]);

  if (!followup) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-[#F5F5F5] flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-[#D5D5D5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
        </div>
        <h2 className="text-base font-semibold text-[#0A0A0A]">跟进未找到</h2>
        <button className="mt-4 text-sm text-[#2D3BFF] font-medium" onClick={() => router.back()}>返回</button>
      </div>
    );
  }

  const checkInRecords = followup.checkInRecords || [];
  const keyPoints = followup.keyPoints || [];
  const actionItems = followup.actionItems || [];
  const decisions = followup.decisions || [];
  const method = followup.method || (followup as any).followUpMethod;
  const fDate = followup.followUpDate || followup.date || followup.createdAt;
  const fType = followup.type || followup.followUpType || 'other_customer';

  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex items-center gap-3">
        <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-[#EBEBEB] text-[#5A5A5A] active:bg-[#F5F5F5]" onClick={() => router.back()}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold text-[#0A0A0A] truncate">{followup.customerName || customer?.name || '跟进详情'}</h1>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getFollowupStatusColor(followup.status || '')}`}>{STATUS_LABELS[followup.status || ''] || followup.status}</span>
        </div>
      </div>

      <Section title="基本信息">
        <InfoRow label="客户" value={followup.customerName || customer?.name} />
        <InfoRow label="跟进类型" value={getFollowupTypeLabel(fType)} />
        <InfoRow label="跟进方式" value={method ? getFollowupMethodLabel(method as string) : ''} />
        <InfoRow label="跟进时间" value={formatShortDateTime(fDate || '')} />
        <InfoRow label="负责人" value={followup.owner} />
        {followup.collaborators && <InfoRow label="协同人" value={followup.collaborators} />}
        {(followup.contactName || followup.contactPerson) && <InfoRow label="联系人" value={followup.contactName || followup.contactPerson} />}
        {followup.nextFollowUpDate && <InfoRow label="下次跟进" value={followup.nextFollowUpDate} />}
      </Section>

      <Section title="跟进内容">
        <p className="text-sm text-[#5A5A5A] whitespace-pre-wrap">{followup.content || '无内容'}</p>
      </Section>

      {/* 打卡记录 */}
      {method === 'onsite_visit' && checkInRecords.length > 0 && (
        <Section title={`📍 打卡记录（${checkInRecords.length}次）`}>
          {checkInRecords.map((rec, idx) => (
            <div key={idx} className="bg-[#F5F5F5] rounded-lg p-3 mb-2 last:mb-0 text-xs space-y-1">
              <div className="text-[#5A5A5A]">📍 {rec.address}</div>
              <div className="text-[#999999]">🕐 {formatShortDateTime(rec.timestamp)}</div>
              <div className="text-[#999999]">📐 {rec.lat.toFixed(4)}, {rec.lng.toFixed(4)}</div>
              {rec.photos.length > 0 && (
                <div className="flex gap-2 mt-1 flex-wrap">{rec.photos.map((p, pi) => <img key={pi} src={p} className="w-12 h-12 rounded-lg object-cover" alt="现场照片" />)}</div>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* AI听记纪要 */}
      {(followup.meetingSummary || keyPoints.length > 0 || actionItems.length > 0) && (
        <Section title="🎙️ 会议纪要">
          {followup.meetingSummary && <div className="text-sm text-[#5A5A5A] mb-3 whitespace-pre-wrap">{followup.meetingSummary}</div>}
          {keyPoints.length > 0 && (
            <div className="mb-2"><span className="text-xs font-medium text-[#0A0A0A]">关键要点</span><ul className="text-sm text-[#5A5A5A] list-disc pl-4 mt-1">{keyPoints.map((kp, i) => <li key={i}>{kp}</li>)}</ul></div>
          )}
          {actionItems.length > 0 && (
            <div className="mb-2"><span className="text-xs font-medium text-[#0A0A0A]">待办事项</span><ul className="text-sm text-[#5A5A5A] list-disc pl-4 mt-1">{actionItems.map((ai, i) => <li key={i}>{ai}</li>)}</ul></div>
          )}
          {decisions.length > 0 && (
            <div><span className="text-xs font-medium text-[#0A0A0A]">决策事项</span><ul className="text-sm text-[#5A5A5A] list-disc pl-4 mt-1">{decisions.map((d, i) => <li key={i}>{d}</li>)}</ul></div>
          )}
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="bg-white rounded-xl border border-[#EBEBEB] overflow-hidden"><div className="px-4 py-3 border-b border-[#EBEBEB]"><h3 className="text-sm font-semibold text-[#0A0A0A]">{title}</h3></div><div className="px-4 py-3">{children}</div></div>;
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return <div className="flex justify-between items-start py-1.5 text-sm"><span className="text-[#999999] shrink-0 mr-3">{label}</span><span className="text-[#0A0A0A] text-right">{value}</span></div>;
}
