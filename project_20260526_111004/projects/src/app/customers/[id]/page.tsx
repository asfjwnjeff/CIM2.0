'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { ProgressStepper } from '@/components/ProgressStepper';
import { CollaborationDialogs, type CollaborationResult, type CollaborationDialogType } from '@/components/CollaborationDialogs';
import type { ProgressStatus, RuleGroup } from '@/lib/types';
import {
  INDUSTRY_CHAIN_LEVEL_LABELS,
  INDUSTRY_CHAIN_LEVEL_COLORS,
  PROGRESS_STATUS_LABELS,
  PROGRESS_STATUS_COLORS,
  RELATION_LABELS,
  MOCK_USERS,
  getCustomerLevelIcon,
  getCustomerChainRoleLabel,
  getCustomerStatusColor,
} from '@/lib/sample-data';
import { ArrowLeft, Edit3, UserPlus, UserCheck, UserX } from 'lucide-react';
import { useSentiment } from '@/hooks/useSentiment';
import { SentimentList } from '@/components/sentiment/SentimentList';

type TabType = 'basic' | 'business' | 'semiconductor' | 'relations' | 'products' | 'config' | 'billing' | 'followup' | 'opportunities' | 'approvals' | 'logs' | 'sentiment';

function getUserById(id: string) {
  return MOCK_USERS.find((u) => u.id === id);
}

function UserAvatar({ userId, size }: { userId: string; size?: 'sm' | 'md' }) {
  const user = getUserById(userId);
  const initial = user ? user.name.charAt(0) : '?';
  const sizeClass = size === 'sm' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm';
  return (
    <div className={`${sizeClass} rounded-full bg-[#2D3BFF] text-white flex items-center justify-center font-medium shrink-0`}>
      {initial}
    </div>
  );
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const {
    customers,
    billingEntities,
    billingRules,
    followUps,
    opportunities,
    contracts,
    riskApprovals,
    signingEntities,
    serviceEntities,
    settlementEntities,
    updateCustomerProgress,
    collaborateCustomer,
    assignCustomer,
    transferCustomer,
    addLog,
    deleteFollowUp,
    deleteOpportunity,
    deleteRiskApproval,
  } = useApp();

  const [activeTab, setActiveTab] = useState<TabType>('basic');

  // 支持 URL 参数 ?tab=xxx 指定初始 tab
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    const validTabs: TabType[] = ['basic', 'business', 'semiconductor', 'relations', 'products', 'config', 'billing', 'followup', 'opportunities', 'approvals', 'logs', 'sentiment'];
    if (tab && validTabs.includes(tab as TabType)) {
      setActiveTab(tab as TabType);
    }
  }, []);

  // Collaboration dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<CollaborationDialogType>('collaborate');

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'followup' | 'opportunity' | 'approval'; id: string } | null>(null);

  const handleDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'followup') deleteFollowUp(deleteTarget.id);
    else if (deleteTarget.type === 'opportunity') deleteOpportunity(deleteTarget.id);
    else if (deleteTarget.type === 'approval') deleteRiskApproval(deleteTarget.id);
    setDeleteTarget(null);
  };

  const customer = useMemo(
    () => customers.find((c) => c.id === params.id),
    [params.id, customers],
  );

  const customerFollowUps = useMemo(
    () => followUps.filter((fu) => fu.customerId === customer?.id),
    [followUps, customer],
  );
  const customerOpportunities = useMemo(
    () => opportunities.filter((opp) => opp.customerId === customer?.id),
    [opportunities, customer],
  );
  const customerContracts = useMemo(
    () => contracts.filter((c) => c.customerId === customer?.id),
    [contracts, customer],
  );
  const customerRiskApprovals = useMemo(
    () => riskApprovals.filter((ra) => ra.companyName === customer?.name),
    [riskApprovals, customer],
  );

  const sentiment = useSentiment(customer?.id || '');

  if (!customer) {
    return (
        <div className="max-w-[1440px] mx-auto py-12 text-center">
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

  const levelColor = INDUSTRY_CHAIN_LEVEL_COLORS[customer.semiconductorInfo?.industryChainLevel || 'upstream'];
  const customerBillingEntities = billingEntities.filter((be) => (customer.billingEntities || []).includes(be.id));
  const customerRules = billingRules.filter((rule) => rule.customerId === customer.id);

  const ownerUser = getUserById(customer.responsiblePersons[0] || '');
  const createdByUser = getUserById(customer.createdBy);

  // Progress stepper handler
  const handleAdvance = useCallback((status: ProgressStatus) => {
    updateCustomerProgress(customer.id, status);
    addLog({
      action: 'advance',
      operator: '系统管理员',
      targetType: 'customer',
      targetId: customer.id,
      targetName: customer.name,
      details: `跟进进度变更为：${PROGRESS_STATUS_LABELS[status]}`,
    });
  }, [customer.id, customer.name, updateCustomerProgress, addLog]);

  const handleRollback = useCallback((status: ProgressStatus) => {
    updateCustomerProgress(customer.id, status);
    addLog({
      action: 'rollback',
      operator: '系统管理员',
      targetType: 'customer',
      targetId: customer.id,
      targetName: customer.name,
      details: `跟进进度回退为：${PROGRESS_STATUS_LABELS[status]}`,
    });
  }, [customer.id, customer.name, updateCustomerProgress, addLog]);

  // Collaboration dialog handlers
  const openDialog = useCallback((type: CollaborationDialogType) => {
    setDialogType(type);
    setDialogOpen(true);
  }, []);

  const handleDialogConfirm = useCallback((result: CollaborationResult) => {
    if (result.type === 'collaborate') {
      collaborateCustomer(customer.id, result.collaboratorIds || []);
      addLog({
        action: 'collaborate',
        operator: '系统管理员',
        targetType: 'customer',
        targetId: customer.id,
        targetName: customer.name,
        details: '更新了协同人',
      });
    } else if (result.type === 'assign' && result.responsiblePersonIds) {
      assignCustomer(customer.id, result.responsiblePersonIds);
      const user = getUserById(result.responsiblePersonIds[0] || '');
      addLog({
        action: 'assign',
        operator: '系统管理员',
        targetType: 'customer',
        targetId: customer.id,
        targetName: customer.name,
        details: `分配负责人为 ${user?.name || result.responsiblePersonIds.join(', ')}`,
      });
    } else if (result.type === 'transfer' && result.newResponsiblePersonId && result.transferFromId) {
      transferCustomer(customer.id, result.transferFromId, result.newResponsiblePersonId, result.reason);
      const fromUser = getUserById(result.transferFromId);
      const toUser = getUserById(result.newResponsiblePersonId);
      addLog({
        action: 'transfer',
        operator: '系统管理员',
        targetType: 'customer',
        targetId: customer.id,
        targetName: customer.name,
        details: `将负责人 ${fromUser?.name || result.transferFromId} 移交给 ${toUser?.name || result.newResponsiblePersonId}${result.reason ? `，原因: ${result.reason}` : ''}`,
      });
    }
    setDialogOpen(false);
  }, [customer.id, customer.name, collaborateCustomer, assignCustomer, transferCustomer, addLog]);

  const tabLabels: Record<TabType, string> = {
    basic: '企业基本信息',
    business: '工商资质全景',
    semiconductor: '半导体产业链定位',
    relations: '上下游关联关系',
    products: '经营商品档案',
    config: '客户信息配置',
    billing: '账单主体配置',
    followup: '跟进记录',
    opportunities: '商机',
    approvals: '风控审批记录',
    logs: '操作日志',
    sentiment: '舆情分析',
  };

  return (
      <div className="max-w-[1440px] mx-auto space-y-6">
        {/* Top bar: back + name + actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/customers')}
              className="p-2 text-[#5A5A5A] hover:text-[#0A0A0A] hover:bg-[#F5F5F5] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold ${levelColor.bg} ${levelColor.text}`}>
              {customer.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#0A0A0A]">{customer.name}</h1>
              <p className="text-[13px] text-[#5A5A5A]">客户代码: {customer.customerCode || '-'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/customers/${customer.id}/edit`)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2D3BFF] text-white rounded-lg text-sm font-medium hover:bg-[#4338CA] transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              编辑
            </button>
            <button
              onClick={() => openDialog('collaborate')}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#E8EBFF] text-[#2D3BFF] border border-[#C7CCFF] rounded-lg text-sm font-medium hover:bg-[#D8DCFF] transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              协同
            </button>
            <button
              onClick={() => openDialog('assign')}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#E6F7F0] text-[#0D8A5E] border border-[#B8E8D4] rounded-lg text-sm font-medium hover:bg-[#D0F0E4] transition-colors"
            >
              <UserCheck className="w-4 h-4" />
              分配
            </button>
            <button
              onClick={() => openDialog('transfer')}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#FFF4E8] text-[#E8850C] border border-[#FFE0B2] rounded-lg text-sm font-medium hover:bg-[#FFECD0] transition-colors"
            >
              <UserX className="w-4 h-4" />
              移交
            </button>
          </div>
        </div>

        {/* Progress stepper */}
        <ProgressStepper
          readonly={true}
          currentStatus={customer.progressStatus}
          onAdvance={handleAdvance}
          onRollback={handleRollback}
        />

        {/* Tabs */}
        <div className="border-b border-[#EBEBEB] overflow-x-auto">
          <div className="flex space-x-1">
            {(Object.keys(tabLabels) as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? 'text-[#2D3BFF] font-semibold border-b-2 border-[#2D3BFF] bg-transparent shadow-none'
                    : 'text-[#5A5A5A] font-normal hover:text-[#0A0A0A]'
                }`}
              >
                {tabLabels[tab]}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="pb-8">
          {activeTab === 'basic' && (
            <div className="space-y-6">
              {/* New fields: creator, owner, collaborators, progress */}
              <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
                <h3 className="text-[16px] font-semibold text-[#0A0A0A] mb-4">协同管理信息</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[13px] text-[#5A5A5A] mb-1">创建人</label>
                    <div className="flex items-center gap-2">
                      {createdByUser && <UserAvatar userId={customer.createdBy} size="sm" />}
                      <span className="text-[#0A0A0A] text-sm">{createdByUser?.name || '-'}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[13px] text-[#5A5A5A] mb-1">负责人</label>
                    <div className="flex items-center gap-2">
                      {customer.responsiblePersons.length > 0 ? (
                        <>
                          <div className="flex items-center">
                            {customer.responsiblePersons.map((id, idx) => (
                              <div key={id} className={idx > 0 ? '-ml-1' : ''}>
                                <UserAvatar userId={id} size="sm" />
                              </div>
                            ))}
                          </div>
                          <span className="text-[#0A0A0A] text-sm">{ownerUser?.name || '未分配'}</span>
                          {ownerUser && <span className="text-xs text-[#999999]">{ownerUser.department}</span>}
                        </>
                      ) : (
                        <span className="text-[#0A0A0A] text-sm">未分配</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[13px] text-[#5A5A5A] mb-1">协同人</label>
                    <div className="flex items-center gap-1">
                      {customer.collaborators.length > 0 ? (
                        customer.collaborators.map((id) => {
                          const u = getUserById(id);
                          return u ? (
                            <div key={id} className="w-7 h-7 rounded-full bg-[#2D3BFF] text-white text-[10px] flex items-center justify-center border-2 border-white -ml-1 first:ml-0" title={u.name}>
                              {u.name.charAt(0)}
                            </div>
                          ) : null;
                        })
                      ) : (
                        <span className="text-sm text-[#999999]">暂无协同人</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[13px] text-[#5A5A5A] mb-1">跟进进度</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PROGRESS_STATUS_COLORS[customer.progressStatus].bg} ${PROGRESS_STATUS_COLORS[customer.progressStatus].text}`}>
                      {PROGRESS_STATUS_LABELS[customer.progressStatus]}
                    </span>
                  </div>
                  <div>
                    <label className="block text-[13px] text-[#5A5A5A] mb-1">客户代码</label>
                    <p className="text-[13px] text-[#0A0A0A] font-mono">{customer.customerCode || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-[13px] text-[#5A5A5A] mb-1">客户状态</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCustomerStatusColor(customer.status)}`}>
                      {customer.status === 'active' ? '活跃' : customer.status === 'inactive' ? '非活跃' : customer.status === 'potential' ? '潜在' : customer.status === 'frozen' ? '冻结' : customer.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-[13px] text-[#5A5A5A] mb-1">签约主体</label>
                    <div className="flex flex-wrap gap-1">
                      {(customer.signingEntityIds || []).length > 0 ? (
                        customer.signingEntityIds!.map((id) => {
                          const entity = signingEntities.find((e) => e.id === id);
                          return entity ? (
                            <span key={id} className="px-2 py-0.5 rounded-full text-xs bg-[#E8EBFF] text-[#2D3BFF]">{entity.name}</span>
                          ) : null;
                        })
                      ) : (
                        <span className="text-sm text-[#999999]">-</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[13px] text-[#5A5A5A] mb-1">服务主体</label>
                    <div className="flex flex-wrap gap-1">
                      {(customer.serviceEntityIds || []).length > 0 ? (
                        customer.serviceEntityIds!.map((id) => {
                          const entity = serviceEntities.find((e) => e.id === id);
                          return entity ? (
                            <span key={id} className="px-2 py-0.5 rounded-full text-xs bg-[#E8EBFF] text-[#2D3BFF]">{entity.name}</span>
                          ) : null;
                        })
                      ) : (
                        <span className="text-sm text-[#999999]">-</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[13px] text-[#5A5A5A] mb-1">结算主体</label>
                    <div className="flex flex-wrap gap-1">
                      {(customer.settlementEntityIds || []).length > 0 ? (
                        customer.settlementEntityIds!.map((id) => {
                          const entity = settlementEntities.find((e) => e.id === id);
                          return entity ? (
                            <span key={id} className="px-2 py-0.5 rounded-full text-xs bg-[#E8EBFF] text-[#2D3BFF]">{entity.name}</span>
                          ) : null;
                        })
                      ) : (
                        <span className="text-sm text-[#999999]">-</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 企业基本信息 - new fields */}
              <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
                <h3 className="text-[16px] font-semibold text-[#0A0A0A] mb-4">企业基本信息</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[13px] text-[#5A5A5A] mb-1">客户LOGO</label>
                    <div className="flex flex-wrap gap-1">
                      {customer.basicInfo?.logoUrls?.length ? (
                        customer.basicInfo.logoUrls.map((url, idx) => (
                          <img key={idx} src={url} alt={`LOGO ${idx + 1}`} className="w-8 h-8 rounded object-cover border border-[#EBEBEB]" />
                        ))
                      ) : <span className="text-sm text-[#999999]">-</span>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[13px] text-[#5A5A5A] mb-1">客户名称</label>
                    <p className="text-[13px] text-[#0A0A0A] font-medium">{customer.name || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-[13px] text-[#5A5A5A] mb-1">统一社会信用证代码</label>
                    <p className="text-[13px] text-[#0A0A0A] font-mono">{customer.basicInfo?.unifiedSocialCreditCode || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-[13px] text-[#5A5A5A] mb-1">客户国（地）别</label>
                    <p className="text-[13px] text-[#0A0A0A]">{customer.basicInfo?.countryRegion || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-[13px] text-[#5A5A5A] mb-1">产业分类</label>
                    <p className="text-[13px] text-[#0A0A0A]">{customer.basicInfo?.industryCategory || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-[13px] text-[#5A5A5A] mb-1">主营产品工艺</label>
                    <p className="text-[13px] text-[#0A0A0A]">{customer.basicInfo?.mainProducts || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-[13px] text-[#5A5A5A] mb-1">产业链业态</label>
                    <p className="text-[13px] text-[#0A0A0A]">{customer.basicInfo?.industryChainFormat || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-[13px] text-[#5A5A5A] mb-1">供应链角色</label>
                    <p className="text-[13px] text-[#0A0A0A]">{customer.basicInfo?.supplyChainRole || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-[13px] text-[#5A5A5A] mb-1">跨境模式</label>
                    <p className="text-[13px] text-[#0A0A0A]">{customer.basicInfo?.crossBorderMode || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-[13px] text-[#5A5A5A] mb-1">客户渠道</label>
                    <p className="text-[13px] text-[#0A0A0A]">{customer.basicInfo?.customerChannel || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-[13px] text-[#5A5A5A] mb-1">客户来源</label>
                    <p className="text-[13px] text-[#0A0A0A]">{customer.basicInfo?.customerSource || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-[13px] text-[#5A5A5A] mb-1">客户等级</label>
                    <p className="text-[13px] text-[#0A0A0A]">{customer.basicInfo?.customerLevel || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-[13px] text-[#5A5A5A] mb-1">潜在竞争对手</label>
                    <p className="text-[13px] text-[#0A0A0A]">{customer.basicInfo?.potentialCompetitors || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-[13px] text-[#5A5A5A] mb-1">关联上下游企业</label>
                    <p className="text-[13px] text-[#0A0A0A]">{customer.basicInfo?.relatedEnterprises || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-[13px] text-[#5A5A5A] mb-1">意向服务地区</label>
                    <div className="flex flex-wrap gap-1">
                      {customer.basicInfo?.intendedServiceRegions?.length ? (
                        customer.basicInfo.intendedServiceRegions.map((city, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-full text-xs bg-[#E8EBFF] text-[#2D3BFF]">{city}</span>
                        ))
                      ) : <span className="text-sm text-[#999999]">-</span>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[13px] text-[#5A5A5A] mb-1">服务产品</label>
                    <div className="flex flex-wrap gap-1">
                      {customer.basicInfo?.serviceProducts?.length ? (
                        customer.basicInfo.serviceProducts.map((sp, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-full text-xs bg-[#E6F7F0] text-[#0D8A5E]">{sp}</span>
                        ))
                      ) : <span className="text-sm text-[#999999]">-</span>}
                    </div>
                  </div>
                  <div className="lg:col-span-4">
                    <label className="block text-[13px] text-[#5A5A5A] mb-1">公司营业地址</label>
                    <p className="text-[13px] text-[#0A0A0A]">
                      {[customer.basicInfo?.addressProvince, customer.basicInfo?.addressCity, customer.basicInfo?.addressDistrict, customer.basicInfo?.addressDetail].filter(Boolean).join(' ') || '-'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-[13px] text-[#5A5A5A] mb-1">预计月均业务量（票）</label>
                    <p className="text-[13px] text-[#0A0A0A]">{customer.basicInfo?.estimatedMonthlyVolume || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-[13px] text-[#5A5A5A] mb-1">仓库面积（㎡）</label>
                    <p className="text-[13px] text-[#0A0A0A]">{customer.basicInfo?.warehouseArea || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-[13px] text-[#5A5A5A] mb-1">仓库温湿度要求</label>
                    <p className="text-[13px] text-[#0A0A0A]">{customer.basicInfo?.warehouseConditions || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-[13px] text-[#5A5A5A] mb-1">客户系统代码</label>
                    <p className="text-[13px] text-[#0A0A0A] font-mono">{customer.basicInfo?.customerSystemCode || '-'}</p>
                  </div>
                  <div className="lg:col-span-2">
                    <label className="block text-[13px] text-[#5A5A5A] mb-1">我司优势简述</label>
                    <p className="text-[13px] text-[#0A0A0A]">{customer.basicInfo?.ourAdvantage || '-'}</p>
                  </div>
                  <div className="lg:col-span-2">
                    <label className="block text-[13px] text-[#5A5A5A] mb-1">我司劣势简述</label>
                    <p className="text-[13px] text-[#0A0A0A]">{customer.basicInfo?.ourDisadvantage || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'business' && (
            <div className="space-y-6">
              {/* 企业工商信息（从旧基本信息移入） */}
              <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
                <h3 className="text-[16px] font-semibold text-[#0A0A0A] mb-4">企业工商信息</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div><label className="block text-[13px] text-[#5A5A5A] mb-1">电话</label><p className="text-[13px] text-[#0A0A0A]">{customer.businessInfo?.phone || '-'}</p></div>
                  <div><label className="block text-[13px] text-[#5A5A5A] mb-1">登记状态</label><p className="text-[13px] text-[#0A0A0A]">{customer.businessInfo?.registrationStatus || '-'}</p></div>
                  <div><label className="block text-[13px] text-[#5A5A5A] mb-1">法定代表人</label><p className="text-[13px] text-[#0A0A0A]">{customer.businessInfo?.legalRepresentative || '-'}</p></div>
                  <div><label className="block text-[13px] text-[#5A5A5A] mb-1">邮箱</label><p className="text-[13px] text-[#0A0A0A]">{customer.businessInfo?.email || '-'}</p></div>
                  <div><label className="block text-[13px] text-[#5A5A5A] mb-1">企业规模</label><p className="text-[13px] text-[#0A0A0A]">{customer.businessInfo?.enterpriseScale || '-'}</p></div>
                  <div><label className="block text-[13px] text-[#5A5A5A] mb-1">注册资本</label><p className="text-[13px] text-[#0A0A0A]">{customer.businessInfo?.registeredCapital || '-'}</p></div>
                  <div>
                    <label className="block text-[13px] text-[#5A5A5A] mb-1">官网</label>
                    <p className="text-sm text-[#2D3BFF]">
                      {customer.businessInfo?.website ? (
                        <a href={customer.businessInfo.website} target="_blank" rel="noopener noreferrer">{customer.businessInfo.website}</a>
                      ) : '-'}
                    </p>
                  </div>
                  <div><label className="block text-[13px] text-[#5A5A5A] mb-1">成立日期</label><p className="text-[13px] text-[#0A0A0A]">{customer.businessInfo?.establishmentDate || '-'}</p></div>
                  <div><label className="block text-[13px] text-[#5A5A5A] mb-1">国家（地区）</label><p className="text-[13px] text-[#0A0A0A]">{customer.businessInfo?.countryRegion || '-'}</p></div>
                  <div className="lg:col-span-2">
                    <label className="block text-[13px] text-[#5A5A5A] mb-1">行业标签</label>
                    <div className="flex flex-wrap gap-1.5">
                      {customer.businessInfo?.industryTags?.length ? (
                        customer.businessInfo.industryTags.map((tag, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-full text-xs bg-[#E8EBFF] text-[#2D3BFF]">{tag}</span>
                        ))
                      ) : <span className="text-sm text-[#999999]">-</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* 工商登记信息 */}
              <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
                <h3 className="text-[16px] font-semibold text-[#0A0A0A] mb-4">工商登记信息</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div><label className="block text-[13px] text-[#5A5A5A] mb-1">实缴资本</label><p className="text-[13px] text-[#0A0A0A]">{customer.businessInfo?.paidInCapital || '-'}</p></div>
                  <div><label className="block text-[13px] text-[#5A5A5A] mb-1">组织机构代码</label><p className="text-[13px] text-[#0A0A0A] font-mono">{customer.businessInfo?.organizationCode || '-'}</p></div>
                  <div><label className="block text-[13px] text-[#5A5A5A] mb-1">工商注册号</label><p className="text-[13px] text-[#0A0A0A] font-mono">{customer.businessInfo?.businessRegistrationNumber || '-'}</p></div>
                  <div><label className="block text-[13px] text-[#5A5A5A] mb-1">纳税人识别号</label><p className="text-[13px] text-[#0A0A0A] font-mono">{customer.businessInfo?.taxpayerIdentificationNumber || '-'}</p></div>
                  <div><label className="block text-[13px] text-[#5A5A5A] mb-1">企业类型</label><p className="text-[13px] text-[#0A0A0A]">{customer.businessInfo?.enterpriseType || '-'}</p></div>
                  <div><label className="block text-[13px] text-[#5A5A5A] mb-1">营业期限</label><p className="text-[13px] text-[#0A0A0A]">{customer.businessInfo?.businessTerm || '-'}</p></div>
                  <div><label className="block text-[13px] text-[#5A5A5A] mb-1">纳税人资质</label><p className="text-[13px] text-[#0A0A0A]">{customer.businessInfo?.taxpayerQualification || '-'}</p></div>
                  <div><label className="block text-[13px] text-[#5A5A5A] mb-1">人员规模</label><p className="text-[13px] text-[#0A0A0A]">{customer.businessInfo?.staffSize || '-'}</p></div>
                  <div><label className="block text-[13px] text-[#5A5A5A] mb-1">参保人数</label><p className="text-[13px] text-[#0A0A0A]">{customer.businessInfo?.insuredNumber || '-'}</p></div>
                  <div><label className="block text-[13px] text-[#5A5A5A] mb-1">核准日期</label><p className="text-[13px] text-[#0A0A0A]">{customer.businessInfo?.approvalDate || '-'}</p></div>
                  <div><label className="block text-[13px] text-[#5A5A5A] mb-1">所属地区</label><p className="text-[13px] text-[#0A0A0A]">{customer.businessInfo?.region || '-'}</p></div>
                  <div><label className="block text-[13px] text-[#5A5A5A] mb-1">登记机关</label><p className="text-[13px] text-[#0A0A0A]">{customer.businessInfo?.registrationAuthority || '-'}</p></div>
                  <div><label className="block text-[13px] text-[#5A5A5A] mb-1">英文名</label><p className="text-[13px] text-[#0A0A0A]">{customer.businessInfo?.englishName || '-'}</p></div>
                  <div className="md:col-span-2"><label className="block text-[13px] text-[#5A5A5A] mb-1">注册地址</label><p className="text-[13px] text-[#0A0A0A]">{customer.businessInfo?.registeredAddress || '-'}</p></div>
                  <div className="md:col-span-2"><label className="block text-[13px] text-[#5A5A5A] mb-1">通信地址</label><p className="text-[13px] text-[#0A0A0A]">{customer.businessInfo?.correspondenceAddress || '-'}</p></div>
                  <div className="lg:col-span-4"><label className="block text-[13px] text-[#5A5A5A] mb-1">经营范围</label><p className="text-[13px] text-[#0A0A0A]">{customer.businessInfo?.businessScope || '-'}</p></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'semiconductor' && (
            <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
              <h3 className="text-[16px] font-semibold text-[#0A0A0A] mb-4">半导体产业链定位</h3>
              <div className="bg-[#F5F5F5] rounded-xl p-6 mb-6">
                <div className="flex items-center justify-center gap-4">
                  <div className={`px-6 py-3 rounded-lg font-semibold text-lg ${levelColor.bg} ${levelColor.text}`}>
                    {getCustomerLevelIcon(customer.semiconductorInfo?.industryChainLevel || 'upstream')}
                    <span className="ml-2">{INDUSTRY_CHAIN_LEVEL_LABELS[customer.semiconductorInfo?.industryChainLevel || 'upstream']}</span>
                  </div>
                  {customer.semiconductorInfo?.industryChainRole && (
                    <div className="px-4 py-2 bg-white rounded-lg text-[#0A0A0A] shadow-sm">
                      {getCustomerChainRoleLabel(customer.semiconductorInfo.industryChainRole)}
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div><label className="block text-[13px] font-medium text-[#0A0A0A] mb-2">产业链层级</label><span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${levelColor.bg} ${levelColor.text}`}>{INDUSTRY_CHAIN_LEVEL_LABELS[customer.semiconductorInfo?.industryChainLevel || 'upstream']}</span></div>
                <div><label className="block text-[13px] font-medium text-[#0A0A0A] mb-2">细分产业链角色</label>{customer.semiconductorInfo?.industryChainRole ? <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white text-[#0A0A0A] border">{getCustomerChainRoleLabel(customer.semiconductorInfo.industryChainRole)}</span> : <span className="text-sm text-[#999999]">-</span>}</div>
              </div>
              <div><label className="block text-[13px] font-medium text-[#0A0A0A] mb-2">半导体行业标签</label><div className="flex flex-wrap gap-2">{customer.semiconductorInfo?.industryTags?.map((tag, idx) => <span key={idx} className="px-3 py-1.5 rounded-full text-sm bg-[#E8EBFF] text-[#2D3BFF]">{tag}</span>) || <span className="text-sm text-[#999999]">-</span>}</div></div>
            </div>
          )}

          {activeTab === 'relations' && (
            <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
              <div className="p-6 border-b border-[#EBEBEB] flex items-center justify-between">
                <h3 className="text-[16px] font-semibold text-[#0A0A0A]">企业上下游关联关系</h3>
                <span className="text-[13px] text-[#5A5A5A]">共 {customer.relatedCompanies?.length || 0} 条关联</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#FAFAFA] text-[11px] font-semibold uppercase text-[#5A5A5A]">
                    <tr>
                      <th className="px-4 py-3 text-left">序号</th>
                      <th className="px-4 py-3 text-left">关联企业名称</th>
                      <th className="px-4 py-3 text-left">与本企业关系</th>
                      <th className="px-4 py-3 text-left">对方产业链层级</th>
                      <th className="px-4 py-3 text-left">关联有效期</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EBEBEB]">
                    {customer.relatedCompanies?.length ? customer.relatedCompanies.map((rel, idx) => {
                      const relColors = INDUSTRY_CHAIN_LEVEL_COLORS[rel.relatedCompanyLevel || 'upstream'];
                      return (
                        <tr key={rel.id} className="hover:bg-[#F5F5F5]">
                          <td className="px-4 py-3 text-[13px] text-[#5A5A5A]">{idx + 1}</td>
                          <td className="px-4 py-3 text-sm font-medium text-[#0A0A0A]">{rel.relatedCompanyName}</td>
                          <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${rel.relation === 'supplier' ? 'bg-[#E8EBFF] text-[#2D3BFF]' : rel.relation === 'purchaser' ? 'bg-[#E6F7F0] text-[#0D8A5E]' : 'bg-[#FFF4E8] text-[#E8850C]'}`}>{RELATION_LABELS[rel.relation]}</span></td>
                          <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${relColors.bg} ${relColors.text}`}>{INDUSTRY_CHAIN_LEVEL_LABELS[rel.relatedCompanyLevel || 'upstream']}</span></td>
                          <td className="px-4 py-3 text-[13px] text-[#5A5A5A]">{rel.validFrom && rel.validTo ? `${rel.validFrom} 至 ${rel.validTo}` : '长期有效'}</td>
                        </tr>
                      );
                    }) : <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-[#999999]">暂无上下游关联关系</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
              <div className="p-6 border-b border-[#EBEBEB]"><h3 className="text-[16px] font-semibold text-[#0A0A0A]">企业经营商品档案</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#FAFAFA] text-[11px] font-semibold uppercase text-[#5A5A5A]">
                    <tr>
                      <th className="px-4 py-3 text-left">商品名称</th>
                      <th className="px-4 py-3 text-left">商品编码</th>
                      <th className="px-4 py-3 text-left">海关申报要素</th>
                      <th className="px-4 py-3 text-left">原产地</th>
                      <th className="px-4 py-3 text-left">所属产业链品类</th>
                      <th className="px-4 py-3 text-left">关联账单主体</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EBEBEB]">
                    {customer.products?.length ? customer.products.map((prod, idx) => (
                      <tr key={prod.id || idx} className="hover:bg-[#F5F5F5]">
                        <td className="px-4 py-3 text-sm font-medium text-[#0A0A0A]">{prod.productName || '-'}</td>
                        <td className="px-4 py-3 text-sm font-mono text-[#5A5A5A]">{prod.productCode || '-'}</td>
                        <td className="px-4 py-3 text-[13px] text-[#5A5A5A] max-w-[200px] truncate">{prod.customsDeclarationElements || '-'}</td>
                        <td className="px-4 py-3 text-[13px] text-[#5A5A5A]">{prod.origin || '-'}</td>
                        <td className="px-4 py-3">{prod.industryChainCategory ? <span className="px-2 py-0.5 rounded-full text-xs bg-[#E8EBFF] text-[#2D3BFF]">{prod.industryChainCategory}</span> : '-'}</td>
                        <td className="px-4 py-3 text-[13px] text-[#5A5A5A]">{prod.relatedBillingEntityId ? (billingEntities.find(be => be.id === prod.relatedBillingEntityId)?.name || '-') : '-'}</td>
                      </tr>
                    )) : <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-[#999999]">暂无商品档案</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'config' && <ConfigTab customer={customer} />}
          {activeTab === 'billing' && <BillingTab customer={customer} customerBillingEntities={customerBillingEntities} customerRules={customerRules} />}
          {activeTab === 'followup' && <FollowUpTab customerFollowUps={customerFollowUps} setDeleteTarget={setDeleteTarget} customer={customer} />}
          {activeTab === 'opportunities' && <OpportunitiesTab customerOpportunities={customerOpportunities} setDeleteTarget={setDeleteTarget} customer={customer} />}
          {activeTab === 'approvals' && <ApprovalsTab customerRiskApprovals={customerRiskApprovals} setDeleteTarget={setDeleteTarget} customer={customer} />}
          {activeTab === 'logs' && <LogsTab auditLogs={customer.auditLogs} />}
          {activeTab === 'sentiment' && (
            <SentimentList
              items={sentiment.items}
              headline={sentiment.headline}
              filters={sentiment.filters}
              onFilterChange={sentiment.setFilters}
              hasMore={sentiment.hasMore}
              onLoadMore={sentiment.loadMore}
              isLoading={sentiment.isLoading}
            />
          )}
        </div>

        {/* Collaboration dialog */}
        <CollaborationDialogs
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          type={dialogType}
          customerName={customer.name}
          currentOwnerIds={customer.responsiblePersons}
          currentCollaboratorIds={customer.collaborators}
          onConfirm={handleDialogConfirm}
        />

        {/* Delete confirmation dialog */}
        {deleteTarget && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
              <h3 className="text-lg font-bold text-[#0A0A0A] mb-2">确认删除</h3>
              <p className="text-[#5A5A5A] mb-6">确定要删除此记录吗？此操作不可撤销。</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm border border-[#D5D5D5] rounded-lg hover:bg-[#F5F5F5]">取消</button>
                <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">确认删除</button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}

// ==================== Sub-components ====================

function ConfigTab({ customer }: { customer: ReturnType<typeof useApp>['customers'][number] }) {
  const router = useRouter();
  const { addLog } = useApp();

  const [customerFields, setCustomerFields] = useState([
    { id: 'cbf-1', customerId: 'cust-001', name: 'Plant', options: ['8635', '8639', '8644', '8641', '8603', '8642', '8645', '8646', '8601', '8693', '8661', '8655', '8634'] },
    { id: 'cbf-2', customerId: 'cust-001', name: 'Location', options: ['0002', '0004'] },
    { id: 'cbf-4', customerId: 'cust-002', name: '客户部门', options: ['物流部', 'Sales Operations Analyst部门', '工程师部门', 'NNP 实验室部门', 'TMF部门'] },
    { id: 'cbf-6', customerId: 'cust-008', name: '客户部门', options: ['CMP部门', 'COMP部门'] },
    { id: 'cbf-7', customerId: 'cust-005', name: '客户部门', options: ['维保库', 'PE-保内库'] },
    { id: 'cbf-9', customerId: 'cust-006', name: '客户部门', options: ['上海部', '德国部'] },
    { id: 'cbf-10', customerId: 'cust-007', name: '客户部门', options: ['设备', '资材', '循环品', '返片'] },
    { id: 'cbf-12', customerId: 'cust-009', name: '客户部门', options: ['备件货', '闲置品'] },
  ]);

  const [showFieldModal, setShowFieldModal] = useState(false);
  const [editingField, setEditingField] = useState<{ id: string; name: string; options: string[] } | null>(null);
  const [formData, setFormData] = useState({ name: '', options: [''] });

  const allFieldNames = ['客户部门', 'Plant', 'Location', '报价单', '账单维度', '结算方式'];
  const fields = customerFields.filter(f => f.customerId === customer.id);

  const handleAddField = () => { setEditingField(null); setFormData({ name: '', options: [''] }); setShowFieldModal(true); };
  const handleEditField = (field: { id: string; name: string; options: string[] }) => { setEditingField(field); setFormData({ name: field.name, options: [...field.options] }); setShowFieldModal(true); };
  const handleDeleteField = (fieldId: string) => { setCustomerFields(prev => prev.filter(f => f.id !== fieldId)); addLog({ action: 'delete', operator: '系统管理员', targetType: 'customer', targetId: customer.id, targetName: customer.name, details: '删除字段配置' }); };

  const handleSaveField = () => {
    if (!formData.name || formData.options.every(o => !o.trim())) return;
    const filteredOptions = formData.options.filter(o => o.trim());
    if (editingField) {
      setCustomerFields(prev => prev.map(f => f.id === editingField.id ? { ...f, name: formData.name, options: filteredOptions } : f));
      addLog({ action: 'update', operator: '系统管理员', targetType: 'customer', targetId: customer.id, targetName: customer.name, details: `编辑字段: ${formData.name}` });
    } else {
      setCustomerFields(prev => [...prev, { id: `cbf-${Date.now()}`, customerId: customer.id, name: formData.name, options: filteredOptions }]);
      addLog({ action: 'create', operator: '系统管理员', targetType: 'customer', targetId: customer.id, targetName: customer.name, details: `新增字段: ${formData.name}` });
    }
    setShowFieldModal(false);
    setEditingField(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-[16px] font-semibold text-[#0A0A0A]">字段配置</h3>
        <button onClick={handleAddField} className="px-4 py-2 bg-[#2D3BFF] text-white rounded-lg text-[13px] font-medium hover:bg-[#4338CA] transition-colors">+ 新增字段</button>
      </div>
      {fields.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-8 text-center"><p className="text-sm text-[#999999]">暂无字段配置</p></div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#FAFAFA] text-[11px] font-semibold uppercase text-[#5A5A5A]"><tr><th className="px-4 py-3 text-left">序号</th><th className="px-4 py-3 text-left">字段名称</th><th className="px-4 py-3 text-center">可选值数量</th><th className="px-4 py-3 text-left">可选值</th><th className="px-4 py-3 text-center">操作</th></tr></thead>
            <tbody className="divide-y divide-[#EBEBEB]">
              {fields.map((field, idx) => (
                <tr key={field.id} className="hover:bg-[#F5F5F5]">
                  <td className="px-4 py-3 text-[13px] text-[#5A5A5A]">{idx + 1}</td>
                  <td className="px-4 py-3 text-[13px] font-medium text-[#0A0A0A]">{field.name}</td>
                  <td className="px-4 py-3 text-center"><span className="px-3 py-1 bg-[#E8EBFF] text-[#2D3BFF] rounded-full text-xs font-medium">{field.options.length}</span></td>
                  <td className="px-4 py-3"><div className="flex flex-wrap gap-1">{field.options.map((v, i) => <span key={i} className="px-2 py-0.5 bg-[#F5F5F5] text-[#5A5A5A] rounded text-xs">{v}</span>)}</div></td>
                  <td className="px-4 py-3 text-center text-[13px]">
                    <button onClick={() => handleEditField(field)} className="text-[#2D3BFF] hover:text-[#0A0A0A] mr-3">编辑</button>
                    <button onClick={() => handleDeleteField(field.id)} className="text-[#D63031] hover:text-[#0A0A0A]">删除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showFieldModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <h4 className="text-[16px] font-semibold mb-4">{editingField ? '编辑字段' : '新增字段'}</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#5A5A5A] mb-1">字段名称</label>
                <select className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#2D3BFF]" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} disabled={!!editingField}>
                  <option value="">请选择字段</option>
                  {allFieldNames.map(name => <option key={name} value={name}>{name}</option>)}
                </select>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[13px] font-medium text-[#5A5A5A]">可选值</label>
                  <button onClick={() => setFormData(prev => ({ ...prev, options: [...prev.options, ''] }))} className="text-[#2D3BFF] text-[13px] hover:underline">+ 添加</button>
                </div>
                <div className="space-y-2">
                  {formData.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input type="text" value={opt} onChange={(e) => setFormData(prev => ({ ...prev, options: prev.options.map((o, i) => i === idx ? e.target.value : o) }))} className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#2D3BFF]" placeholder={`选项 ${idx + 1}`} />
                      {formData.options.length > 1 && (
                        <button onClick={() => setFormData(prev => ({ ...prev, options: prev.options.filter((_, i) => i !== idx) }))} className="p-2 text-[#D63031] hover:bg-[#FFEBEE] rounded">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowFieldModal(false)} className="px-4 py-2 border rounded-lg text-[13px] text-[#5A5A5A] hover:bg-[#F5F5F5]">取消</button>
              <button onClick={handleSaveField} className="px-4 py-2 bg-[#2D3BFF] text-white rounded-lg text-sm">保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BillingTab({ customer, customerBillingEntities, customerRules }: {
  customer: ReturnType<typeof useApp>['customers'][number];
  customerBillingEntities: ReturnType<typeof useApp>['billingEntities'];
  customerRules: ReturnType<typeof useApp>['billingRules'];
}) {
  const router = useRouter();
  const [expandedRules, setExpandedRules] = useState<Set<string>>(new Set());

  const toggleRule = (ruleId: string) => {
    setExpandedRules(prev => { const next = new Set(prev); if (next.has(ruleId)) next.delete(ruleId); else next.add(ruleId); return next; });
  };

  const billingEntityNames = new Set(customerRules.map(r => r.targetBillingEntity).filter(Boolean)) as Set<string>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
        <h3 className="text-[16px] font-semibold text-[#0A0A0A] mb-4">关联账单主体</h3>
        <div className="flex flex-wrap gap-2">
          {Array.from(billingEntityNames).map((name, index) => (
            <div key={index} className="flex items-center gap-2 px-4 py-2 bg-[#E8EBFF] rounded-lg"><span className="text-[#2D3BFF] font-medium text-[13px]">{name}</span></div>
          ))}
          {billingEntityNames.size === 0 && <span className="text-sm text-[#999999]">暂未关联账单主体</span>}
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <div className="p-6 border-b border-[#EBEBEB] flex items-center justify-between">
          <h3 className="text-[16px] font-semibold text-[#0A0A0A]">账单拆分规则</h3>
          <button onClick={() => router.push('/rules')} className="text-[#2D3BFF] hover:text-[#4338CA] text-sm font-medium">管理规则 →</button>
        </div>
        <div className="divide-y divide-[#EBEBEB]">
          {customerRules.length === 0 ? (
            <div className="p-12 text-center text-sm text-gray-400">暂未配置拆分规则</div>
          ) : customerRules.map(rule => (
            <div key={rule.id}>
              <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50" onClick={() => toggleRule(rule.id)}>
                <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedRules.has(rule.id) ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                <div className="flex-1">
                  <div className="flex items-center gap-3"><span className="font-medium text-sm">{rule.name}</span><span className={`px-2 py-0.5 text-xs rounded-full ${rule.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{rule.status === 'active' ? '已启用' : '已禁用'}</span></div>
                  <div className="text-sm text-gray-500 mt-1">账单主体: <span className="text-blue-600 font-medium">{rule.targetBillingEntity}</span></div>
                </div>
              </div>
              {expandedRules.has(rule.id) && (
                <div className="px-4 pb-4 pl-12"><div className="bg-gray-50 rounded-lg p-4"><h4 className="text-sm font-medium text-gray-700 mb-3">匹配条件</h4><ConditionGroupRenderer group={rule.conditionGroup} /></div></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ConditionGroupRenderer({ group }: { group: RuleGroup | undefined }) {
  if (!group) return null;
  const g = group as unknown as { logic: string; items: Array<{ type: string; condition?: { id: string; fieldKey?: string; fieldName?: string; operator: string; value: string }; group?: RuleGroup }> };
  const conditions = g.items?.filter(i => i.type === 'condition') || [];
  const subGroups = g.items?.filter(i => i.type === 'group') || [];

  return (
    <div className="space-y-2">
      {conditions.map((item, index) => {
        if (!item.condition) return null;
        const c = item.condition;
        return (
          <div key={index} className="flex items-center gap-2">
            {index > 0 && <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{g.logic}</span>}
            <span className="text-sm">
              <span className="font-medium text-gray-700">{c.fieldName || c.fieldKey}</span>
              <span className="text-gray-500 mx-1">{c.operator}</span>
              <span className="text-blue-600">{c.value || '-'}</span>
            </span>
          </div>
        );
      })}
      {subGroups.map((sub, index) => (
        <div key={index} className="ml-4 pl-3 border-l-2 border-gray-200"><ConditionGroupRenderer group={sub.group} /></div>
      ))}
    </div>
  );
}

function FollowUpTab({ customerFollowUps, setDeleteTarget, customer }: { customerFollowUps: ReturnType<typeof useApp>['followUps']; setDeleteTarget: (target: { type: 'followup' | 'opportunity' | 'approval'; id: string } | null) => void; customer: ReturnType<typeof useApp>['customers'][number] }) {
  const router = useRouter();
  return (
    <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      <div className="p-6 border-b border-[#EBEBEB] flex items-center justify-between">
        <h3 className="text-[16px] font-semibold text-[#0A0A0A]">跟进记录</h3>
        <button onClick={() => router.push(`/followup/new?customerId=${customer.id}&customerName=${encodeURIComponent(customer.name)}`)} className="text-[#2D3BFF] hover:text-[#4338CA] text-sm font-medium">新增跟进记录</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#FAFAFA] text-[11px] font-semibold uppercase text-[#5A5A5A]"><tr><th className="px-4 py-3 text-left">跟进时间</th><th className="px-4 py-3 text-left">跟进类型</th><th className="px-4 py-3 text-left">跟进方式</th><th className="px-4 py-3 text-left">跟进状态</th><th className="px-4 py-3 text-left">负责人</th><th className="px-4 py-3 text-left">联系人</th><th className="px-4 py-3 text-center">操作</th></tr></thead>
          <tbody className="divide-y divide-[#EBEBEB]">
            {customerFollowUps.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-[#999999]">暂无跟进记录</td></tr>
            ) : customerFollowUps.map(fu => (
              <tr key={fu.id} className="hover:bg-[#F5F5F5]">
                <td className="px-4 py-3 text-[13px] text-[#5A5A5A]">{fu.followUpDate || fu.date}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${fu.type === 'kpi_not_met' ? 'bg-[#FFEBEE] text-[#D63031]' : fu.type === 'contract_mgmt' ? 'bg-[#E8EBFF] text-[#2D3BFF]' : fu.type === 'biz_meeting' ? 'bg-[#FFF4E8] text-[#E8850C]' : 'bg-[#F5F5F5] text-[#5A5A5A]'}`}>{fu.type === 'kpi_not_met' ? 'KPI未达标' : fu.type === 'contract_mgmt' ? '合同管理' : fu.type === 'biz_meeting' ? '业务会议' : '其他客户事项'}</span></td>
                <td className="px-4 py-3 text-[13px] text-[#0A0A0A]">{fu.method === 'phone_visit' ? '电话拜访' : fu.method === 'onsite_visit' ? '上门拜访' : fu.method === 'online_visit' ? '网络拜访' : fu.method === 'hmg_meeting' ? 'HMG现场会议' : (fu.method || '-')}</td>
                <td className="px-4 py-3"><StatusBadgeSmall status={fu.status} /></td>
                <td className="px-4 py-3 text-[13px] text-[#0A0A0A]">{fu.owner || '-'}</td>
                <td className="px-4 py-3 text-[13px] text-[#5A5A5A]">{fu.contactPerson || '-'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                  <button onClick={() => router.push(`/followup/${fu.id}`)} className="text-[#2D3BFF] text-sm whitespace-nowrap hover:text-[#0A0A0A]">查看</button>
                  <button onClick={() => router.push(`/followup/${fu.id}/edit`)} className="text-[#5A5A5A] text-sm whitespace-nowrap hover:text-[#0A0A0A]">编辑</button>
                  <button onClick={() => setDeleteTarget({ type: 'followup', id: fu.id })} className="text-red-500 text-sm whitespace-nowrap hover:text-red-700">删除</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OpportunitiesTab({ customerOpportunities, setDeleteTarget, customer }: { customerOpportunities: ReturnType<typeof useApp>['opportunities']; setDeleteTarget: (target: { type: 'followup' | 'opportunity' | 'approval'; id: string } | null) => void; customer: ReturnType<typeof useApp>['customers'][number] }) {
  const router = useRouter();
  return (
    <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      <div className="p-6 border-b border-[#EBEBEB] flex items-center justify-between">
        <h3 className="text-[16px] font-semibold text-[#0A0A0A]">商机</h3>
        <button onClick={() => router.push(`/opportunities/new?customerId=${customer.id}&customerName=${encodeURIComponent(customer.name)}`)} className="text-[#2D3BFF] hover:text-[#4338CA] text-sm font-medium">新增商机</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#FAFAFA] text-[11px] font-semibold uppercase text-[#5A5A5A]"><tr><th className="px-4 py-3 text-left">商机编号</th><th className="px-4 py-3 text-left">商机名称</th><th className="px-4 py-3 text-left">服务产品</th><th className="px-4 py-3 text-left">销售阶段</th><th className="px-4 py-3 text-left">商机金额</th><th className="px-4 py-3 text-left">负责人</th><th className="px-4 py-3 text-center">操作</th></tr></thead>
          <tbody className="divide-y divide-[#EBEBEB]">
            {customerOpportunities.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-[#999999]">暂无商机</td></tr>
            ) : customerOpportunities.map(opp => (
              <tr key={opp.id} className="hover:bg-[#F5F5F5]">
                <td className="px-4 py-3 text-sm font-mono text-[#5A5A5A]">{opp.opportunityNumber || '-'}</td>
                <td className="px-4 py-3 text-sm font-medium text-[#0A0A0A]">{opp.opportunityName || opp.name}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs bg-[#E8EBFF] text-[#2D3BFF]">{opp.serviceProduct || '-'}</span></td>
                <td className="px-4 py-3"><StageBadge stage={opp.salesStage || opp.stage} /></td>
                <td className="px-4 py-3 text-[13px] text-[#0A0A0A]">¥{(opp.opportunityAmount || opp.amount || 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-[13px] text-[#5A5A5A]">{opp.owner || '-'}</td>
                <td className="px-4 py-3"><div className="flex items-center gap-2"><button onClick={() => router.push(`/opportunities/${opp.id}`)} className="text-[#2D3BFF] text-sm whitespace-nowrap hover:text-[#0A0A0A]">查看</button><button onClick={() => router.push(`/opportunities/${opp.id}/edit`)} className="text-[#5A5A5A] text-sm whitespace-nowrap hover:text-[#0A0A0A]">编辑</button><button onClick={() => setDeleteTarget({ type: 'opportunity', id: opp.id })} className="text-red-500 text-sm whitespace-nowrap hover:text-red-700">删除</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ApprovalsTab({ customerRiskApprovals, setDeleteTarget, customer }: { customerRiskApprovals: ReturnType<typeof useApp>['riskApprovals']; setDeleteTarget: (target: { type: 'followup' | 'opportunity' | 'approval'; id: string } | null) => void; customer: ReturnType<typeof useApp>['customers'][number] }) {
  const router = useRouter();
  return (
    <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      <div className="p-6 border-b border-[#EBEBEB] flex items-center justify-between">
        <h3 className="text-[16px] font-semibold text-[#0A0A0A]">风控审批记录</h3>
        <button onClick={() => router.push(`/approvals/new?companyName=${encodeURIComponent(customer.name)}`)} className="text-[#2D3BFF] hover:text-[#4338CA] text-sm font-medium">新增风控审批</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#FAFAFA] text-[11px] font-semibold uppercase text-[#5A5A5A]"><tr><th className="px-4 py-3 text-left">审批单号</th><th className="px-4 py-3 text-left">服务产品</th><th className="px-4 py-3 text-left">业务类型</th><th className="px-4 py-3 text-left">风控目的</th><th className="px-4 py-3 text-left">状态</th><th className="px-4 py-3 text-left">提交时间</th><th className="px-4 py-3 text-center">操作</th></tr></thead>
          <tbody className="divide-y divide-[#EBEBEB]">
            {customerRiskApprovals.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-[#999999]">暂无风控审批记录</td></tr>
            ) : customerRiskApprovals.map(ra => (
              <tr key={ra.id} className="hover:bg-[#F5F5F5]">
                <td className="px-4 py-3 text-sm font-mono text-[#5A5A5A]">{ra.id || '-'}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs bg-[#E8EBFF] text-[#2D3BFF]">{ra.serviceProduct || '-'}</span></td>
                <td className="px-4 py-3 text-[13px] text-[#0A0A0A]">{ra.businessType || '-'}</td>
                <td className="px-4 py-3 text-[13px] text-[#0A0A0A]">{ra.riskControlPurpose || '-'}</td>
                <td className="px-4 py-3"><ApprovalStatusBadge status={ra.status} /></td>
                <td className="px-4 py-3 text-[13px] text-[#5A5A5A]">{ra.submitTime || '-'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                  <button onClick={() => router.push(`/approvals/${ra.id}`)} className="text-[#2D3BFF] text-sm whitespace-nowrap hover:text-[#0A0A0A]">查看</button>
                  <button onClick={() => router.push(`/approvals/${ra.id}/edit`)} className="text-[#5A5A5A] text-sm whitespace-nowrap hover:text-[#0A0A0A]">编辑</button>
                  <button onClick={() => setDeleteTarget({ type: 'approval', id: ra.id })} className="text-red-500 text-sm whitespace-nowrap hover:text-red-700">删除</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LogsTab({ auditLogs }: { auditLogs: ReturnType<typeof useApp>['customers'][number]['auditLogs'] }) {
  return (
    <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      <div className="p-6 border-b border-[#EBEBEB]"><h3 className="text-[16px] font-semibold text-[#0A0A0A]">操作日志</h3></div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#FAFAFA] text-[11px] font-semibold uppercase text-[#5A5A5A]"><tr><th className="px-4 py-3 text-left">操作时间</th><th className="px-4 py-3 text-left">操作类型</th><th className="px-4 py-3 text-left">操作内容</th><th className="px-4 py-3 text-left">操作人</th></tr></thead>
          <tbody className="divide-y divide-[#EBEBEB]">
            {!auditLogs || auditLogs.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-[#999999]">暂无操作日志</td></tr>
            ) : auditLogs.map((log, idx) => (
              <tr key={log.id || idx} className="hover:bg-[#F5F5F5]">
                <td className="px-4 py-3 text-[13px] text-[#5A5A5A]">{log.timestamp}</td>
                <td className="px-4 py-3"><ActionBadge action={log.action} /></td>
                <td className="px-4 py-3 text-[13px] text-[#0A0A0A]">{log.details || log.targetName || '-'}</td>
                <td className="px-4 py-3 text-[13px] text-[#5A5A5A]">{log.operator}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Small helper badges
function StatusBadgeSmall({ status }: { status?: string }) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    new: { bg: 'bg-[#E8EBFF]', text: 'text-[#2D3BFF]', label: '新建需求' },
    discussing: { bg: 'bg-[#FFF4E8]', text: 'text-[#E8850C]', label: '沟通方案' },
    promoting: { bg: 'bg-[#FFF4E8]', text: 'text-[#E8850C]', label: '促单' },
    success: { bg: 'bg-[#E6F7F0]', text: 'text-[#0D8A5E]', label: '成功' },
    no_progress: { bg: 'bg-[#F5F5F5]', text: 'text-[#5A5A5A]', label: '无进展' },
    cancelled: { bg: 'bg-[#FFEBEE]', text: 'text-[#D63031]', label: '需求取消' },
    terminated: { bg: 'bg-[#FFEBEE]', text: 'text-[#D63031]', label: '合同终止' },
  };
  const m = map[status || ''];
  if (!m) return <span className="px-2 py-0.5 text-xs whitespace-nowrap text-[#5A5A5A]">{status || '-'}</span>;
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${m.bg} ${m.text}`}>{m.label}</span>;
}

function StageBadge({ stage }: { stage?: string }) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    demand_confirmation: { bg: 'bg-[#E8EBFF]', text: 'text-[#2D3BFF]', label: '需求确认' },
    requirements_confirmation: { bg: 'bg-[#E8EBFF]', text: 'text-[#2D3BFF]', label: '需求确认' },
    solution_quotation: { bg: 'bg-[#FFF4E8]', text: 'text-[#E8850C]', label: '方案报价' },
    business_negotiation: { bg: 'bg-[#FFF4E8]', text: 'text-[#E8850C]', label: '商务谈判' },
    following: { bg: 'bg-[#F5F5F5]', text: 'text-[#5A5A5A]', label: '跟进中' },
    following_up: { bg: 'bg-[#F5F5F5]', text: 'text-[#5A5A5A]', label: '跟进中' },
    won: { bg: 'bg-[#E6F7F0]', text: 'text-[#0D8A5E]', label: '赢单' },
    lost: { bg: 'bg-[#FFEBEE]', text: 'text-[#D63031]', label: '输单' },
  };
  const m = map[stage || ''];
  if (!m) return <span className="px-2 py-0.5 text-xs text-[#5A5A5A]">{stage || '-'}</span>;
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.bg} ${m.text}`}>{m.label}</span>;
}

function ApprovalStatusBadge({ status }: { status?: string }) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    draft: { bg: 'bg-[#F5F5F5]', text: 'text-[#5A5A5A]', label: '暂存' },
    in_review: { bg: 'bg-[#FFF4E8]', text: 'text-[#E8850C]', label: '审批中' },
    approved: { bg: 'bg-[#E6F7F0]', text: 'text-[#0D8A5E]', label: '已通过' },
    rejected: { bg: 'bg-[#FFEBEE]', text: 'text-[#D63031]', label: '已驳回' },
  };
  const m = map[status || ''];
  if (!m) return <span className="px-2 py-0.5 text-xs text-[#5A5A5A]">{status || '-'}</span>;
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.bg} ${m.text}`}>{m.label}</span>;
}

function ActionBadge({ action }: { action?: string }) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    create: { bg: 'bg-[#E6F7F0]', text: 'text-[#0D8A5E]', label: '创建' },
    update: { bg: 'bg-[#E8EBFF]', text: 'text-[#2D3BFF]', label: '更新' },
    delete: { bg: 'bg-[#FFEBEE]', text: 'text-[#D63031]', label: '删除' },
    advance: { bg: 'bg-[#E8EBFF]', text: 'text-[#2D3BFF]', label: '推进' },
    rollback: { bg: 'bg-[#FFF4E8]', text: 'text-[#E8850C]', label: '回退' },
    collaborate: { bg: 'bg-[#E8EBFF]', text: 'text-[#2D3BFF]', label: '协同' },
    assign: { bg: 'bg-[#E8EBFF]', text: 'text-[#2D3BFF]', label: '分配' },
    transfer: { bg: 'bg-[#FFF4E8]', text: 'text-[#E8850C]', label: '移交' },
  };
  const m = map[action || ''];
  if (!m) return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#F5F5F5] text-[#5A5A5A]">{action || '-'}</span>;
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.bg} ${m.text}`}>{m.label}</span>;
}
