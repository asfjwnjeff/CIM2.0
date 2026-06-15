'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useApp, evaluateApprovalRules } from '@/lib/store';
import ApprovalFlowMini from '@/components/mobile/ApprovalFlowMini';
import StatusBadge, { getStatusColor } from '@/components/mobile/StatusBadge';
import ApprovalReportMini from '@/components/mobile/ApprovalReportMini';

export default function MobileApprovalDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { riskApprovals, updateRiskApproval, currentUser, autoApprovalRules, approvalFields } = useApp();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  const approval = useMemo(
    () => riskApprovals.find((a) => a.id === id),
    [riskApprovals, id]
  );

  if (!approval) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-[#F5F5F5] flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-[#D5D5D5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-base font-semibold text-[#0A0A0A]">审批未找到</h2>
        <button
          className="mt-4 text-sm text-[#2D3BFF] font-medium"
          onClick={() => router.back()}
        >
          返回
        </button>
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
      company_name: approval.companyName || '',
      service_product: approval.serviceProduct || '',
      is_trade_agent: approval.isTradeAgent || '否',
      business_type: approval.businessType || '',
      goods_type: approval.goodsType || '',
      monthly_orders: approval.monthlyBusinessVolume || '',
      monthly_invoice_amount: approval.monthlyInvoiceAmount || '',
      ...dynamicVals,
    };
    const results = evaluateApprovalRules(fieldValues, autoApprovalRules, approvalFields, approval.serviceProduct);
    const items = Array.from(results.values());
    return {
      items,
      passCount: items.filter((r) => r.result === 'pass').length,
      warnCount: items.filter((r) => r.result === 'warn').length,
    };
  }, [approval, autoApprovalRules, approvalFields]);

  /** 执行通过 */
  const handleApprove = async () => {
    setActionLoading('approve');
    try {
      // 推进审批：找到当前 current 节点设为 completed，下一个 pending 设为 current
      const updatedSteps = steps.map((step, idx) => {
        if (step.status === 'current') {
          return { ...step, status: 'completed' };
        }
        // 下一个 pending 节点变为 current
        const prevStep = idx > 0 ? steps[idx - 1] : null;
        if (
          prevStep &&
          prevStep.status === 'completed' &&
          step.status === 'pending' &&
          // 确保前一个是被我们刚设为 completed 的
          steps.some((s) => s.status === 'current') === false
        ) {
          return { ...step, status: 'current' };
        }
        return step;
      });

      // 检查是否全部完成
      const allDone = updatedSteps.every(
        (s) => s.status === 'completed' || s.status === 'current' || s.status === 'init'
      );
      const newStatus = allDone ? 'approved' : 'in_review';

      // 生成历史记录
      const currentNode = steps.find((s) => s.status === 'current');
      const nodeNameStr = (currentNode?.name as string) || '未知节点';
      const historyEntry = {
        id: `hist-${Date.now()}`,
        approvalId: approval.id,
        action: 'approved' as const,
        operator: currentUser.id,
        operatorName: currentUser.name,
        nodeName: nodeNameStr,
        timestamp: new Date().toISOString(),
      };

      updateRiskApproval(approval.id, {
        approvalSteps: updatedSteps,
        status: newStatus,
        approvalStatus: newStatus === 'approved' ? '审批完成' : '审批中',
        updatedAt: new Date().toISOString(),
        history: [...(approval.history || []), historyEntry],
      });

      router.push('/mobile/approvals');
    } catch {
      // ignore
    } finally {
      setActionLoading(null);
    }
  };

  /** 执行驳回 */
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setShowRejectInput(true);
      return;
    }
    setActionLoading('reject');
    try {
      const updatedSteps = steps.map((step) => {
        if (step.status === 'current') {
          return { ...step, status: 'rejected', rejected: true, rejectReason: rejectReason.trim() };
        }
        return step;
      });

      const currentNode = steps.find((s) => s.status === 'current');
      const nodeNameStr = (currentNode?.name as string) || '未知节点';
      const historyEntry = {
        id: `hist-${Date.now()}`,
        approvalId: approval.id,
        action: 'rejected' as const,
        operator: currentUser.id,
        operatorName: currentUser.name,
        nodeName: nodeNameStr,
        reason: rejectReason.trim(),
        timestamp: new Date().toISOString(),
      };

      updateRiskApproval(approval.id, {
        approvalSteps: updatedSteps,
        status: 'rejected',
        approvalStatus: '已驳回',
        updatedAt: new Date().toISOString(),
        history: [...(approval.history || []), historyEntry],
      });

      router.push('/mobile/approvals');
    } catch {
      // ignore
    } finally {
      setActionLoading(null);
      setShowRejectInput(false);
      setRejectReason('');
    }
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

      const historyEntry = {
        id: `hist-${Date.now()}`,
        approvalId: approval.id,
        action: 'submitted' as const,
        operator: currentUser.id,
        operatorName: currentUser.name,
        timestamp: new Date().toISOString(),
      };

      updateRiskApproval(approval.id, {
        approvalSteps: updatedSteps,
        status: 'in_review',
        approvalStatus: '审批中',
        updatedAt: new Date().toISOString(),
        submitTime: new Date().toISOString(),
        history: [...(approval.history || []), historyEntry],
      });

      router.push('/mobile/approvals');
    } catch {
      // ignore
    } finally {
      setActionLoading(null);
    }
  };

  /** 撤回审批 */
  const handleWithdraw = async () => {
    setActionLoading('withdraw');
    try {
      const updatedSteps = steps.map((step, idx) => {
        if (idx === 0) return { ...step, status: 'current' };
        return { ...step, status: 'pending', rejected: false };
      });

      const historyEntry = {
        id: `hist-${Date.now()}`,
        approvalId: approval.id,
        action: 'withdrawn' as const,
        operator: currentUser.id,
        operatorName: currentUser.name,
        timestamp: new Date().toISOString(),
      };

      updateRiskApproval(approval.id, {
        approvalSteps: updatedSteps,
        status: 'draft',
        approvalStatus: '草稿',
        updatedAt: new Date().toISOString(),
        history: [...(approval.history || []), historyEntry],
      });

      router.push('/mobile/approvals');
    } catch {
      // ignore
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-24">
      {/* 返回按钮 + 状态横幅 */}
      <div className="flex items-center gap-3">
        <button
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-[#EBEBEB] text-[#5A5A5A] active:bg-[#F5F5F5]"
          onClick={() => router.back()}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-lg font-bold text-[#0A0A0A]">审批详情</h1>
          <div className={`text-sm font-medium mt-0.5 ${getStatusColor(displayStatus)}`}>
            {displayStatus === 'draft' || displayStatus === '草稿'
              ? '草稿 · 待发起'
              : displayStatus === 'approved' || displayStatus === '审批完成'
              ? '审批通过'
              : displayStatus === 'rejected' || displayStatus === '已驳回'
              ? '审批驳回'
              : '审批进行中'}
          </div>
        </div>
        <div className="ml-auto">
          <StatusBadge status={displayStatus} />
        </div>
      </div>

      {/* 基本信息卡片 */}
      <Section title="基本信息">
        <InfoRow label="公司全称" value={approval.companyName} />
        {approval.englishName && <InfoRow label="英文名称" value={approval.englishName} />}
        {approval.parentCompany && <InfoRow label="集团母公司" value={approval.parentCompany} />}
        <InfoRow label="服务产品" value={approval.serviceProduct} />
        <InfoRow label="贸易代理" value={approval.isTradeAgent} />
        {approval.businessType && <InfoRow label="业务类型" value={approval.businessType} />}
        {approval.goodsType && <InfoRow label="货物类型" value={approval.goodsType} />}
        {approval.settlementPeriod && <InfoRow label="结算账期" value={approval.settlementPeriod} />}
      </Section>

      {/* 审批流程卡片 */}
      <Section title="审批流程">
        <ApprovalFlowMini steps={steps} />
      </Section>

      {/* 审批辅助报告 */}
      {reportData.items.length > 0 && (
        <Section title={`审批辅助报告 · ${reportData.passCount}通过 ${reportData.warnCount}风险`}>
          <ApprovalReportMini
            customerName={approval.companyName || ''}
            serviceProduct={approval.serviceProduct || ''}
            generatedAt={approval.submitTime || approval.updatedAt || approval.createdAt || ''}
            items={reportData.items}
            passCount={reportData.passCount}
            warnCount={reportData.warnCount}
          />
        </Section>
      )}

      {/* 操作历史 */}
      {approval.history && approval.history.length > 0 && (
        <Section title="操作历史">
          <div className="space-y-2">
            {approval.history.map((entry, idx) => (
              <div key={entry.id || idx} className="flex items-start gap-2 text-sm">
                <span className="text-[#999999] shrink-0">
                  {new Date(entry.timestamp).toLocaleDateString('zh-CN', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span className="text-[#0A0A0A]">
                  <strong>{entry.operatorName}</strong>
                  {entry.action === 'submitted' && ' 发起了审批'}
                  {entry.action === 'approved' && ` 通过（${entry.nodeName || ''}）`}
                  {entry.action === 'rejected' && ` 驳回 — ${entry.reason || ''}`}
                  {entry.action === 'withdrawn' && ' 撤回了审批'}
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* 驳回理由输入 */}
      {showRejectInput && (
        <div className="bg-white rounded-xl border border-[#EBEBEB] p-4">
          <label className="text-sm font-medium text-[#0A0A0A] block mb-2">驳回理由</label>
          <textarea
            className="w-full h-20 px-3 py-2 border border-[#EBEBEB] rounded-lg text-sm resize-none focus:outline-none focus:border-[#D63031] focus:ring-1 focus:ring-[#D63031]"
            placeholder="请输入驳回理由..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            autoFocus
          />
        </div>
      )}

      {/* 底部操作栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#EBEBEB] px-4 py-3 flex gap-3 z-40"
        style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px) + 56px)' }}
      >
        {/* 草稿状态：发起审批 */}
        {isDraft && (
          <button
            className="flex-1 h-11 bg-[#2D3BFF] text-white rounded-xl text-sm font-semibold active:bg-[#4338CA] transition-colors disabled:opacity-50"
            onClick={handleSubmit}
            disabled={actionLoading !== null}
          >
            {actionLoading === 'submit' ? '处理中...' : '发起审批'}
          </button>
        )}

        {/* 审批中状态：通过 + 驳回 */}
        {isInReview && (
          <>
            <button
              className="flex-1 h-11 bg-[#D63031] text-white rounded-xl text-sm font-semibold active:bg-[#B82020] transition-colors disabled:opacity-50"
              onClick={handleReject}
              disabled={actionLoading !== null}
            >
              {actionLoading === 'reject' ? '处理中...' : '驳回'}
            </button>
            <button
              className="flex-1 h-11 bg-[#0D8A5E] text-white rounded-xl text-sm font-semibold active:bg-[#0A6E4A] transition-colors disabled:opacity-50"
              onClick={handleApprove}
              disabled={actionLoading !== null}
            >
              {actionLoading === 'approve' ? '处理中...' : '通过'}
            </button>
          </>
        )}

        {/* 已驳回状态：重新发起提示 */}
        {isRejected && (
          <button
            className="flex-1 h-11 bg-[#2D3BFF] text-white rounded-xl text-sm font-semibold active:bg-[#4338CA] transition-colors"
            onClick={() => router.push(`/approvals/${approval.id}/edit`)}
          >
            编辑并重新发起
          </button>
        )}

        {/* 审批完成：仅查看 */}
        {isApproved && (
          <div className="flex-1 text-center text-sm text-[#0D8A5E] font-medium py-3">
            ✅ 审批已完成
          </div>
        )}
      </div>
    </div>
  );
}

/* ====== 子组件 ====== */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-[#EBEBEB] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#EBEBEB]">
        <h3 className="text-sm font-semibold text-[#0A0A0A]">{title}</h3>
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-start py-1.5 text-sm">
      <span className="text-[#999999] shrink-0 mr-3">{label}</span>
      <span className="text-[#0A0A0A] text-right">{value}</span>
    </div>
  );
}
