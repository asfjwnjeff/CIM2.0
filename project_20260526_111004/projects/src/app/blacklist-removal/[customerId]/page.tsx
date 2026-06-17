'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { MOCK_USERS } from '@/lib/sample-data';
import { ArrowLeft } from 'lucide-react';

export default function BlacklistRemovalPage() {
  const params = useParams();
  const router = useRouter();
  const { customers, currentUser, approveBlacklistRemoval, rejectBlacklistRemoval, addLog } = useApp();
  const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | null>(null);
  const [done, setDone] = useState(false);

  const customerId = Array.isArray(params.customerId) ? params.customerId[0] : params.customerId;
  const customer = useMemo(() => customers.find((c) => c.id === customerId), [customerId, customers]);

  const applicant = customer?.blacklistInfo?.removalRequest?.requestedBy
    ? MOCK_USERS.find((u) => u.id === customer.blacklistInfo!.removalRequest!.requestedBy)
    : null;

  if (!customer || customer.status !== 'blacklisted' || customer.blacklistInfo?.removalRequest?.status !== 'pending') {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-[#5A5A5A] mb-4">该审批不存在或已处理</p>
          <button onClick={() => router.push('/')} className="px-4 py-2 bg-[#2D3BFF] text-white rounded-lg text-sm">返回首页</button>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-[#0D8A5E] font-semibold mb-2">✅ 审批已处理</p>
          <button onClick={() => router.push(`/customers/${customer.id}`)} className="px-4 py-2 bg-[#2D3BFF] text-white rounded-lg text-sm mt-4">返回客户详情</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.push(`/customers/${customer.id}`)} className="p-2 rounded-lg hover:bg-hover transition-colors">
            <ArrowLeft className="w-5 h-5 text-secondary" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-primary">黑名单解除审批</h1>
            <p className="text-sm text-secondary">审批编号：BLR-{customer.id}</p>
          </div>
        </div>

        {/* 客户信息 */}
        <div className="bg-surface rounded-2xl border border-light shadow-sm p-6 mb-6">
          <h2 className="text-base font-semibold text-primary mb-4">客户信息</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="text-secondary">客户名称</label>
              <p className="text-primary font-medium">{customer.name}</p>
            </div>
            <div>
              <label className="text-secondary">客户代码</label>
              <p className="text-primary">{customer.customerCode || '-'}</p>
            </div>
            <div>
              <label className="text-secondary">统一社会信用代码</label>
              <p className="text-primary font-mono text-xs">{customer.basicInfo?.unifiedSocialCreditCode || '-'}</p>
            </div>
            <div>
              <label className="text-secondary">法定代表人</label>
              <p className="text-primary">{customer.businessInfo?.legalRepresentative || '-'}</p>
            </div>
          </div>
        </div>

        {/* 黑名单信息 */}
        <div className="bg-surface rounded-2xl border border-light shadow-sm p-6 mb-6">
          <h2 className="text-base font-semibold text-primary mb-4">黑名单信息</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="text-secondary">加入时间</label>
              <p className="text-primary">{customer.blacklistInfo?.blacklistedAt?.slice(0, 10) || '-'}</p>
            </div>
            <div>
              <label className="text-secondary">操作人</label>
              <p className="text-primary">{MOCK_USERS.find((u) => u.id === customer.blacklistInfo?.blacklistedBy)?.name || '-'}</p>
            </div>
            <div className="col-span-2">
              <label className="text-secondary">黑名单原因</label>
              <p className="text-primary">{customer.blacklistInfo?.blacklistReason || '-'}</p>
            </div>
          </div>
        </div>

        {/* 解除申请 */}
        <div className="bg-surface rounded-2xl border border-light shadow-sm p-6 mb-6">
          <h2 className="text-base font-semibold text-primary mb-4">解除申请</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="text-secondary">申请人</label>
              <p className="text-primary">{applicant?.name || '-'}</p>
            </div>
            <div>
              <label className="text-secondary">申请时间</label>
              <p className="text-primary">{customer.blacklistInfo?.removalRequest?.requestedAt?.slice(0, 10) || '-'}</p>
            </div>
            <div className="col-span-2">
              <label className="text-secondary">申请原因</label>
              <p className="text-primary">{customer.blacklistInfo?.removalRequest?.reason || '（未填写）'}</p>
            </div>
          </div>
        </div>

        {/* 审批操作 */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => setConfirmAction('reject')}
            className="px-8 py-2.5 border border-[#D5D5D5] text-[#5A5A5A] rounded-lg text-sm font-medium hover:bg-[#F5F5F5] transition-colors"
          >
            驳回
          </button>
          <button
            onClick={() => setConfirmAction('approve')}
            className="px-8 py-2.5 bg-[#0D8A5E] text-white rounded-lg text-sm font-medium hover:bg-[#0A7250] transition-colors"
          >
            通过
          </button>
        </div>

        {/* 确认弹窗 */}
        {confirmAction && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
              <h3 className="text-lg font-bold text-[#0A0A0A] mb-2">
                {confirmAction === 'approve' ? '确认通过' : '确认驳回'}
              </h3>
              <p className="text-sm text-[#5A5A5A] mb-6">
                {confirmAction === 'approve'
                  ? `确认通过「${customer.name}」的黑名单解除审批吗？通过后该公司将恢复为正常状态。`
                  : `确认驳回「${customer.name}」的黑名单解除审批吗？驳回后可重新发起申请。`
                }
              </p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setConfirmAction(null)} className="px-4 py-2 text-sm border border-[#EBEBEB] rounded-lg hover:bg-[#F5F5F5]">取消</button>
                <button
                  onClick={() => {
                    if (confirmAction === 'approve') {
                      approveBlacklistRemoval(customer.id, currentUser.id);
                      addLog({ action: 'update', operator: currentUser.name, targetType: 'customer', targetId: customer.id, targetName: customer.name, details: '审批通过：解除黑名单' });
                    } else {
                      rejectBlacklistRemoval(customer.id, currentUser.id);
                      addLog({ action: 'update', operator: currentUser.name, targetType: 'customer', targetId: customer.id, targetName: customer.name, details: '审批驳回：解除黑名单' });
                    }
                    setDone(true);
                  }}
                  className={`px-4 py-2 text-sm text-white rounded-lg ${confirmAction === 'approve' ? 'bg-[#0D8A5E] hover:bg-[#0A7250]' : 'bg-[#D63031] hover:bg-[#B52828]'}`}
                >
                  {confirmAction === 'approve' ? '确认通过' : '确认驳回'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
