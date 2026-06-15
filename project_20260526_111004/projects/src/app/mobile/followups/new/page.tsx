'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useApp } from '@/lib/store';
import type { FollowUpRecord, FollowUpType, FollowUpMethod, FollowUpStatus } from '@/lib/types';
import MobileFormSection from '@/components/mobile/MobileFormSection';
import CheckInCard from '@/components/mobile/CheckInCard';
import AIRecordingCard from '@/components/mobile/AIRecordingCard';

const FOLLOWUP_TYPES: { value: FollowUpType; label: string }[] = [
  { value: 'kpi_not_met', label: 'KPI未达标' }, { value: 'contract_mgmt', label: '合同管理' },
  { value: 'biz_meeting', label: '业务会议' }, { value: 'other_customer', label: '其他客户事项' },
];
const FOLLOWUP_METHODS: { value: FollowUpMethod; label: string; icon: string }[] = [
  { value: 'phone_visit', label: '电话拜访', icon: '📞' }, { value: 'onsite_visit', label: '上门拜访', icon: '🚗' },
  { value: 'online_visit', label: '网络拜访', icon: '💻' }, { value: 'hmg_meeting', label: 'HMG现场会议', icon: '🏢' },
];
const FOLLOWUP_STATUSES: { value: FollowUpStatus; label: string }[] = [
  { value: 'new', label: '新建需求' }, { value: 'discussing', label: '沟通方案' },
  { value: 'promoting', label: '促单' }, { value: 'success', label: '成功' },
  { value: 'no_progress', label: '无进展' }, { value: 'cancelled', label: '需求取消' },
  { value: 'terminated', label: '合同终止' }, { value: 'failed', label: '失败' },
];

interface CheckInRecord { lat: number; lng: number; address: string; timestamp: string; photos: string[]; }

export default function MobileNewFollowupPage() {
  const router = useRouter();
  const { addFollowUp, customers, currentUser } = useApp();
  const [saving, setSaving] = useState(false);
  const [showRecording, setShowRecording] = useState(false);

  const [form, setForm] = useState({
    customerId: '', type: 'biz_meeting' as FollowUpType, method: 'phone_visit' as FollowUpMethod,
    followUpDate: new Date().toISOString().slice(0, 16), status: 'new' as FollowUpStatus,
    contactName: '', owner: currentUser.name, collaborators: '', nextFollowUpDate: '', content: '',
  });

  const [checkInRecords, setCheckInRecords] = useState<CheckInRecord[]>([]);
  const [aiData, setAiData] = useState<{ transcript?: string; meetingSummary?: string; keyPoints?: string[]; actionItems?: string[]; decisions?: string[] }>({});

  const updateField = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }));
  const selectedCustomer = customers.find((c) => c.id === form.customerId);
  const customerContacts = selectedCustomer?.contacts || [];

  const handleSubmit = async () => {
    const errors: string[] = [];
    if (!form.customerId) errors.push('关联客户');
    if (!form.content.trim()) errors.push('跟进内容');
    if (!form.followUpDate) errors.push('跟进时间');
    if (errors.length > 0) { toast.error(`请填写：${errors.join('、')}`); return; }

    setSaving(true);
    try {
      const now = new Date().toISOString();
      addFollowUp({
        customerId: form.customerId, customerName: selectedCustomer?.name || '',
        type: form.type, followUpType: form.type, method: form.method,
        followUpDate: form.followUpDate, date: form.followUpDate, status: form.status,
        owner: form.owner || currentUser.name, collaborators: form.collaborators || undefined,
        contactName: form.contactName || undefined, contactPerson: form.contactName || undefined,
        nextFollowUpDate: form.nextFollowUpDate || undefined, content: form.content,
        checkInRecords: checkInRecords.length > 0 ? checkInRecords : undefined,
        transcript: aiData.transcript, meetingSummary: aiData.meetingSummary,
        keyPoints: aiData.keyPoints, actionItems: aiData.actionItems, decisions: aiData.decisions,
        updatedAt: now,
      });
      toast.success('跟进已保存');
      router.push('/mobile/followups');
    } catch { toast.error('保存失败'); }
    finally { setSaving(false); }
  };

  return (
    <div className="flex flex-col gap-3 pb-[calc(80px+var(--mobile-tab-height))]">
      <div className="flex items-center gap-3">
        <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-[#EBEBEB] text-[#5A5A5A] active:bg-[#F5F5F5]" onClick={() => router.back()}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-lg font-bold text-[#0A0A0A]">新增跟进</h1>
      </div>

      <MobileFormSection title="基本信息" defaultExpanded>
        <Field label="关联客户" required>
          <select className="mobile-input" value={form.customerId} onChange={(e) => updateField('customerId', e.target.value)}><option value="">请选择客户</option>{customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        </Field>
        <Field label="跟进类型" required>
          <select className="mobile-input" value={form.type} onChange={(e) => updateField('type', e.target.value as FollowUpType)}>{FOLLOWUP_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select>
        </Field>
        <Field label="跟进时间" required>
          <input type="datetime-local" className="mobile-input" value={form.followUpDate} onChange={(e) => updateField('followUpDate', e.target.value)} />
        </Field>
        <Field label="跟进方式">
          <div className="grid grid-cols-2 gap-2">{FOLLOWUP_METHODS.map((m) => <button key={m.value} type="button" className={`h-10 rounded-lg border text-xs font-medium transition-colors ${form.method === m.value ? 'border-[#2D3BFF] bg-[#E8EBFF] text-[#2D3BFF]' : 'border-[#EBEBEB] bg-white text-[#5A5A5A]'}`} onClick={() => updateField('method', m.value)}>{m.icon} {m.label}</button>)}</div>
        </Field>
        <Field label="跟进内容" required>
          <textarea className="mobile-textarea" rows={6} placeholder="请输入跟进内容..." value={form.content} onChange={(e) => updateField('content', e.target.value)} />
        </Field>
      </MobileFormSection>

      <MobileFormSection title="更多信息" subtitle="可选" defaultExpanded={false}>
        <Field label="跟进状态"><select className="mobile-input" value={form.status} onChange={(e) => updateField('status', e.target.value as FollowUpStatus)}>{FOLLOWUP_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select></Field>
        <Field label="联系人">{customerContacts.length > 0 ? <select className="mobile-input" value={form.contactName} onChange={(e) => updateField('contactName', e.target.value)}><option value="">请选择</option>{customerContacts.map((ct) => <option key={ct.id} value={ct.name}>{ct.name} · {ct.position}</option>)}</select> : <input className="mobile-input" placeholder="输入联系人姓名" value={form.contactName} onChange={(e) => updateField('contactName', e.target.value)} />}</Field>
        <Field label="负责人"><input className="mobile-input" placeholder="负责人姓名" value={form.owner} onChange={(e) => updateField('owner', e.target.value)} /></Field>
        <Field label="协同人"><input className="mobile-input" placeholder="多个人用逗号分隔" value={form.collaborators} onChange={(e) => updateField('collaborators', e.target.value)} /></Field>
        <Field label="下次跟进"><input type="datetime-local" className="mobile-input" value={form.nextFollowUpDate} onChange={(e) => updateField('nextFollowUpDate', e.target.value)} /></Field>
      </MobileFormSection>

      {form.method === 'onsite_visit' && (
        <div className="bg-white rounded-xl border border-[#EBEBEB] p-4"><CheckInCard records={checkInRecords} onRecordsChange={setCheckInRecords} /></div>
      )}

      {/* AI听记：默认折叠，点击展开 */}
      {!showRecording ? (
        <button className="bg-white rounded-xl border border-dashed border-[#D5D5D5] p-4 text-center active:bg-[#F5F5F5]" onClick={() => setShowRecording(true)}>
          <span className="text-sm text-[#2D3BFF] font-medium">🎙️ 开启 AI 听记</span>
          <p className="text-xs text-[#999999] mt-1">会议录音 + 自动转写 + 生成纪要</p>
        </button>
      ) : (
        <div className="bg-white rounded-xl border border-[#EBEBEB] p-4"><AIRecordingCard onDataChange={setAiData} /></div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#EBEBEB] px-4 py-3 z-40" style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px) + 56px)' }}>
        <button className="w-full h-11 bg-[#2D3BFF] text-white rounded-xl text-sm font-semibold active:bg-[#4338CA] disabled:opacity-50" onClick={handleSubmit} disabled={saving}>{saving ? '保存中...' : '保存跟进'}</button>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return <div><label className="text-sm font-medium text-[#0A0A0A] block mb-1.5">{label}{required && <span className="text-[#D63031] ml-0.5">*</span>}</label>{children}</div>;
}
