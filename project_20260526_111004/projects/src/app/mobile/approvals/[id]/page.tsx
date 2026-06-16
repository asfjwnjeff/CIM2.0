'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useApp, evaluateApprovalRules } from '@/lib/store';
import ApprovalFlowMini from '@/components/mobile/ApprovalFlowMini';
import ApprovalReportMini from '@/components/mobile/ApprovalReportMini';
import StatusBadge, { getStatusColor } from '@/components/mobile/StatusBadge';
import ConfirmDialog from '@/components/mobile/ConfirmDialog';
import { Section, InfoRow } from '@/components/mobile/SharedComponents';
import { formatShortDateTime } from '@/lib/mobile-utils';

export default function MobileApprovalDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  if (!id || Array.isArray(id)) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-base font-semibold text-[#0A0A0A]">无效的审批 ID</h2>
        <button className="mt-4 text-sm text-[#2D3BFF] font-medium" onClick={() => router.push('/mobile/approvals')}>返回列表</button>
      </div>
    );
  }
  const { riskApprovals, updateRiskApproval, currentUser, autoApprovalRules, approvalFields } = useApp();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'withdraw' | 'reject' | null>(null);

  const approval = useMemo(() => riskApprovals.find((a) => a.id === id), [riskApprovals, id]);

  if (!approval) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-[#F5F5F5] flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-[#D5D5D5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h2 className="text-base font-semibold text-[#0A0A0A]">审批未找到</h2>
        <button className="mt-4 text-sm text-[#2D3BFF] font-medium" onClick={() => router.back()}>返回</button>
      </div>
    );
  }

  const displayStatus = approval.approvalStatus || approval.status;
  const isDraft = displayStatus === 'draft' || displayStatus === '草稿';
  const isInReview = displayStatus === 'in_review' || displayStatus === '审批中';
  const isRejected = displayStatus === 'rejected' || displayStatus === '已驳回';
  const isApproved = displayStatus === 'approved' || displayStatus === '审批完成';
  const steps = (approval.approvalSteps || []) as Array<Record<string, unknown>>;

  // 审批辅助报告
  const reportData = useMemo(() => {
    const dynamicVals = approval.dynamicFieldValues || {};
    const fieldValues: Record<string, string> = {
      company_name: approval.companyName || '', service_product: approval.serviceProduct || '',
      is_trade_agent: approval.isTradeAgent || '否', business_type: approval.businessType || '',
      goods_type: approval.goodsType || '', monthly_orders: approval.monthlyBusinessVolume || '',
      monthly_invoice_amount: approval.monthlyInvoiceAmount || '', ...dynamicVals,
    };
    const results = evaluateApprovalRules(fieldValues, autoApprovalRules, approvalFields, approval.serviceProduct);
    const items = Array.from(results.values());
    return { items, passCount: items.filter((r) => r.result === 'pass').length, warnCount: items.filter((r) => r.result === 'warn').length };
  }, [approval, autoApprovalRules, approvalFields]);

  /** 执行通过 */
  const executeApprove = async () => {
    setActionLoading('approve');
    try {
      const updatedSteps = steps.map((step, idx) => {
        if (step.status === 'current') return { ...step, status: 'completed' };
        const prev = idx > 0 ? steps[idx - 1] : null;
        if (prev && (prev as Record<string,unknown>).status === 'completed' && step.status === 'pending' && !steps.some((s) => s.status === 'current'))
          return { ...step, status: 'current' };
        return step;
      });
      const allDone = updatedSteps.every((s) => s.status === 'completed');
      const currentNode = steps.find((s) => s.status === 'current');
      const nodeNameStr = (currentNode?.name as string) || '未知节点';
      const historyEntry = { id: `hist-${Date.now()}`, approvalId: approval.id, action: 'approved' as const, operator: currentUser.id, operatorName: currentUser.name, nodeName: nodeNameStr, timestamp: new Date().toISOString() };
      updateRiskApproval(approval.id, { approvalSteps: updatedSteps, status: allDone ? 'approved' : 'in_review', approvalStatus: allDone ? '审批完成' : '审批中', updatedAt: new Date().toISOString(), history: [...(approval.history || []), historyEntry] });
      toast.success('审批已通过');
      router.push('/mobile/approvals');
    } catch (e) { console.error('[审批详情] 通过失败:', e); toast.error('操作失败'); }
    finally { setActionLoading(null); }
  };

  /** 执行驳回 */
  const executeReject = async () => {
    if (!rejectReason.trim()) { setShowRejectInput(true); toast.error('请填写驳回理由'); return; }
    setActionLoading('reject');
    try {
      const updatedSteps = steps.map((step) => step.status === 'current' ? { ...step, status: 'rejected', rejected: true, rejectReason: rejectReason.trim() } : step);
      const currentNode = steps.find((s) => s.status === 'current');
      const nodeNameStr = (currentNode?.name as string) || '未知节点';
      const historyEntry = { id: `hist-${Date.now()}`, approvalId: approval.id, action: 'rejected' as const, operator: currentUser.id, operatorName: currentUser.name, nodeName: nodeNameStr, reason: rejectReason.trim(), timestamp: new Date().toISOString() };
      updateRiskApproval(approval.id, { approvalSteps: updatedSteps, status: 'rejected', approvalStatus: '已驳回', updatedAt: new Date().toISOString(), history: [...(approval.history || []), historyEntry] });
      toast.success('审批已驳回');
      router.push('/mobile/approvals');
    } catch (e) { console.error('[审批详情] 驳回失败:', e); toast.error('操作失败'); }
    finally { setActionLoading(null); setShowRejectInput(false); setRejectReason(''); }
  };

  /** 发起审批 */
  const handleSubmit = async () => {
    setActionLoading('submit');
    try {
      const updatedSteps = steps.map((step, idx) => {
        if (idx === 0) return { ...step, status: 'completed' };
        if (idx === 1) return { ...step, status: 'current' };
        return step;
      });
      const historyEntry = { id: `hist-${Date.now()}`, approvalId: approval.id, action: 'submitted' as const, operator: currentUser.id, operatorName: currentUser.name, timestamp: new Date().toISOString() };
      updateRiskApproval(approval.id, { approvalSteps: updatedSteps, status: 'in_review', approvalStatus: '审批中', updatedAt: new Date().toISOString(), submitTime: new Date().toISOString(), history: [...(approval.history || []), historyEntry] });
      toast.success('审批已提交');
      router.push('/mobile/approvals');
    } catch (e) { console.error('[审批详情] 提交失败:', e); toast.error('操作失败'); }
    finally { setActionLoading(null); }
  };

  /** 撤回审批 */
  const executeWithdraw = async () => {
    setActionLoading('withdraw');
    try {
      const updatedSteps = steps.map((step, idx) => {
        if (idx === 0) return { ...step, status: 'current' };
        return { ...step, status: 'pending', rejected: false };
      });
      const historyEntry = { id: `hist-${Date.now()}`, approvalId: approval.id, action: 'withdrawn' as const, operator: currentUser.id, operatorName: currentUser.name, timestamp: new Date().toISOString() };
      updateRiskApproval(approval.id, { approvalSteps: updatedSteps, status: 'draft', approvalStatus: '草稿', updatedAt: new Date().toISOString(), history: [...(approval.history || []), historyEntry] });
      toast.success('审批已撤回');
      router.push('/mobile/approvals');
    } catch (e) { console.error('[审批详情] 撤回失败:', e); toast.error('操作失败'); }
    finally { setActionLoading(null); setConfirmAction(null); }
  };

  return (
    <div className="flex flex-col gap-4 pb-[140px]">
      {/* 头部 */}
      <div className="flex items-center gap-3">
        <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-[#EBEBEB] text-[#5A5A5A] active:bg-[#F5F5F5]" onClick={() => router.back()}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold text-[#0A0A0A] truncate">{approval.companyName || '审批详情'}</h1>
          <div className={`text-sm font-medium ${getStatusColor(displayStatus)}`}>
            {isDraft ? '草稿' : isApproved ? '审批通过' : isRejected ? '审批驳回' : '审批进行中'}
          </div>
        </div>
        <StatusBadge status={displayStatus} />
      </div>

      {/* 基本信息 */}
      <Section title="基本信息">
        <InfoRow label="公司全称" value={approval.companyName} />
        {approval.englishName && <InfoRow label="英文名称" value={approval.englishName} />}
        {approval.parentCompany && <InfoRow label="集团母公司" value={approval.parentCompany} />}
        {approval.subsidiaryCompany && <InfoRow label="分子公司" value={approval.subsidiaryCompany} />}
      </Section>

      {/* 关联信息 */}
      <Section title="关联信息">
        <InfoRow label="服务产品" value={approval.serviceProduct} />
        {approval.opportunityId && <InfoRow label="关联商机" value={approval.opportunityId} />}
        <InfoRow label="结算账期" value={approval.settlementPeriod} />
        <InfoRow label="联系人" value={approval.contactName} />
      </Section>

      {/* 业务信息 */}
      <Section title="业务信息">
        <InfoRow label="贸易代理" value={approval.isTradeAgent} />
        <InfoRow label="业务类型" value={approval.businessType} />
        <InfoRow label="货物类型" value={approval.goodsType} />
        {approval.monthlyBusinessVolume && <InfoRow label="月均订单数" value={approval.monthlyBusinessVolume} />}
        {approval.monthlyInvoiceAmount && <InfoRow label="月均开票额" value={approval.monthlyInvoiceAmount} />}
        {approval.customsKpiRequirement && <InfoRow label="通关KPI" value={approval.customsKpiRequirement} />}
        {approval.transportKpiRequirement && <InfoRow label="运输KPI" value={approval.transportKpiRequirement} />}
        {approval.warehouseLeaseRequirement && <InfoRow label="仓库要求" value={approval.warehouseLeaseRequirement} />}
        {approval.customServiceRequirement && <InfoRow label="定制化服务" value={approval.customServiceRequirement} />}
        {approval.customRequirementDescription && <InfoRow label="定制化描述" value={approval.customRequirementDescription} />}
      </Section>

      {/* 合规审核动态字段 */}
      {approval.dynamicFieldValues && Object.keys(approval.dynamicFieldValues).length > 0 && (
        <Section title="合规审核">
          {Object.entries(approval.dynamicFieldValues).map(([key, val]) => (
            <InfoRow key={key} label={key} value={String(val)} />
          ))}
        </Section>
      )}

      {/* 审批流程 */}
      <Section title="审批流程">
        <ApprovalFlowMini steps={steps} />
      </Section>

      {/* 辅助报告 */}
      {reportData.items.length > 0 && (
        <Section title={`审批辅助报告 · ${reportData.passCount}通过 ${reportData.warnCount}风险`}>
          <ApprovalReportMini customerName={approval.companyName || ''} serviceProduct={approval.serviceProduct || ''} generatedAt={approval.submitTime || approval.updatedAt || approval.createdAt || ''} items={reportData.items} passCount={reportData.passCount} warnCount={reportData.warnCount} />
        </Section>
      )}

      {/* 操作历史 */}
      {approval.history && approval.history.length > 0 && (
        <Section title="操作历史">
          {approval.history.map((entry, idx) => (
            <div key={entry.id || idx} className="flex items-start gap-2 text-sm py-0.5">
              <span className="text-[#999999] shrink-0">{formatShortDateTime(entry.timestamp)}</span>
              <span className="text-[#0A0A0A]">
                <strong>{entry.operatorName}</strong>
                {entry.action === 'submitted' && ' 发起审批'}
                {entry.action === 'approved' && ` 通过（${entry.nodeName || ''}）`}
                {entry.action === 'rejected' && ` 驳回 — ${entry.reason || ''}`}
                {entry.action === 'withdrawn' && ' 撤回审批'}
              </span>
            </div>
          ))}
        </Section>
      )}

      {/* 驳回理由 */}
      {showRejectInput && (
        <Section title="驳回理由">
          <textarea className="mobile-textarea" rows={3} placeholder="请输入驳回理由..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} autoFocus />
        </Section>
      )}

      {/* 底部操作栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#EBEBEB] px-4 py-3 flex gap-3 z-40"
        style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px) + 56px)' }}>
        {isDraft && (
          <>
            <button className="flex-1 h-11 bg-white border border-[#EBEBEB] text-[#5A5A5A] rounded-xl text-sm font-semibold active:bg-[#F5F5F5] disabled:opacity-50" onClick={() => router.push(`/mobile/approvals/${approval.id}/edit`)}>
              编辑
            </button>
            <button className="flex-1 h-11 bg-[#2D3BFF] text-white rounded-xl text-sm font-semibold active:bg-[#4338CA] disabled:opacity-50" onClick={handleSubmit} disabled={actionLoading !== null}>
              {actionLoading === 'submit' ? '处理中...' : '发起审批'}
            </button>
          </>
        )}
        {isInReview && (
          <>
            <button className="flex-1 h-11 bg-white border border-[#EBEBEB] text-[#5A5A5A] rounded-xl text-sm font-semibold active:bg-[#F5F5F5] disabled:opacity-50" onClick={() => setConfirmAction('withdraw')} disabled={actionLoading !== null}>
              撤回
            </button>
            <button className="flex-1 h-11 bg-[#D63031] text-white rounded-xl text-sm font-semibold active:bg-[#B82020] disabled:opacity-50" onClick={executeReject} disabled={actionLoading !== null}>
              {actionLoading === 'reject' ? '处理中...' : '驳回'}
            </button>
            <button className="flex-1 h-11 bg-[#0D8A5E] text-white rounded-xl text-sm font-semibold active:bg-[#0A6E4A] disabled:opacity-50" onClick={executeApprove} disabled={actionLoading !== null}>
              {actionLoading === 'approve' ? '处理中...' : '通过'}
            </button>
          </>
        )}
        {isRejected && (
          <button className="flex-1 h-11 bg-[#2D3BFF] text-white rounded-xl text-sm font-semibold active:bg-[#4338CA]" onClick={() => router.push(`/mobile/approvals/${approval.id}/edit`)}>
            编辑并重新发起
          </button>
        )}
        {isApproved && (
          <div className="flex-1 text-center text-sm text-[#0D8A5E] font-medium py-3">✅ 审批已完成</div>
        )}
      </div>

      {/* 二次确认弹窗 */}
      <ConfirmDialog open={confirmAction === 'withdraw'} title="撤回审批" message="确定要撤回此审批吗？撤回后所有已完成的审批节点将重置。" confirmLabel="确认撤回" danger onConfirm={executeWithdraw} onCancel={() => setConfirmAction(null)} loading={actionLoading === 'withdraw'} />
    </div>
  );
}

