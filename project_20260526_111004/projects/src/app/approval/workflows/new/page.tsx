'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { useApp } from '@/lib/store';
import { ApprovalNode, ApprovalWorkflow, ServiceProduct } from '@/lib/types';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { FIELD_STYLES } from '@/lib/ui-constants';

const serviceProductOptions = [
  { value: '货代', approvers: [{ id: 'u1', name: '张洁', role: '职能审批人' }], isCountersign: false },
  { value: '关务', approvers: [{ id: 'u2', name: '蒋总', role: '职能审批人' }], isCountersign: false },
  { value: '仓库', approvers: [{ id: 'u3', name: '吴总', role: '职能审批人' }], isCountersign: false },
  { value: '运输', approvers: [{ id: 'u4', name: '朱弢', role: '职能审批人' }], isCountersign: false },
  { value: '进出口', approvers: [{ id: 'u1', name: '张洁', role: '职能审批人' }], isCountersign: false },
  { value: '维修', approvers: [{ id: 'u2', name: '蒋总', role: '职能审批人' }], isCountersign: false },
  { value: '合同物流', approvers: [
    { id: 'u1', name: '张洁', role: '职能审批人' },
    { id: 'u2', name: '蒋总', role: '职能审批人' },
    { id: 'u3', name: '吴总', role: '职能审批人' },
    { id: 'u4', name: '朱弢', role: '职能审批人' },
  ], isCountersign: true },
];

const defaultNodes: ApprovalNode[] = [
  { id: 'node-1', nodeType: 'initiator', type: 'initiator', level: 1, order: 1, name: '发起人', description: '客户经理或销售人员发起审批申请', isRequired: true, isCountersign: false, approvers: [{ id: 'initiator', name: '发起人', role: '发起人' }] },
  { id: 'node-2', nodeType: 'department_manager', type: 'department_manager', level: 2, order: 2, name: '审批人（部门经理）', description: '部门经理审批', isRequired: true, isCountersign: false, approvers: [{ id: 'dept_mgr', name: '部门经理', role: '审批人' }] },
  { id: 'node-3', nodeType: 'functional', type: 'functional', level: 3, order: 3, name: '职能审批人', description: '根据服务产品自动匹配对应审批人', isRequired: true, isCountersign: false, approvers: [] },
  { id: 'node-4', nodeType: 'finance', type: 'finance', level: 4, order: 4, name: '审核人（财务会签）', description: '财务部门及中心总经理会签审批', isRequired: true, isCountersign: true, approvers: [
    { id: 'finance', name: '财务部门', role: '审核人' },
    { id: 'center_gm', name: '中心总经理', role: '审核人' },
  ]},
  { id: 'node-5', nodeType: 'general_manager', type: 'general_manager', level: 5, order: 5, name: '审核人（总经理）', description: '各中心负责人/总经理审批', isRequired: true, isCountersign: false, approvers: [{ id: 'gm', name: '总经理', role: '审核人' }] },
  { id: 'node-6', nodeType: 'it_ops', type: 'it_ops', level: 6, order: 6, name: 'IT运维确认', description: '确认审批信息并提供客户系统代码', isRequired: true, isCountersign: false, approvers: [{ id: 'it_ops', name: 'IT运维', role: '确认人' }] },
];

// 图标组件
const ArrowLeftIcon = ({ className }: { className?: string }) => (
  <svg className={`w-5 h-5 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const UserIcon = ({ className }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const UsersIcon = ({ className }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const MonitorIcon = ({ className }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const AlertCircleIcon = ({ className }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const InfoIcon = ({ className }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const nodeTypeIcons: Record<string, React.ReactNode> = {
  initiator: <UserIcon />,
  department_manager: <UserIcon />,
  functional: <UsersIcon />,
  finance: <UsersIcon />,
  general_manager: <UserIcon />,
  it_ops: <MonitorIcon />,
};

export default function ApprovalWorkflowEditPage() {
  const params = useParams();
  const router = useRouter();
  const { approvalWorkflows, addApprovalWorkflow, updateApprovalWorkflow } = useApp();
  const isEditing = !!params.id && params.id !== 'new';

  const [name, setName] = useState('');
  const [serviceProduct, setServiceProduct] = useState('');
  const [isTradeAgency, setIsTradeAgency] = useState(false);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [remark, setRemark] = useState('');
  const [approvalNodes, setApprovalNodes] = useState<ApprovalNode[]>(defaultNodes);

  useEffect(() => {
    if (isEditing) {
      const workflow = approvalWorkflows.find((w: ApprovalWorkflow) => w.id === params.id);
      if (workflow) {
        setName(workflow.name || '');
        setServiceProduct(workflow.serviceProduct || '');
        setIsTradeAgency(workflow.isTradeAgency ?? false);
        setStatus(workflow.status);
        setRemark(workflow.remark || '');
        setApprovalNodes(workflow.approvalNodes || defaultNodes);
      }
    }
  }, [isEditing, params.id, approvalWorkflows]);

  // 服务产品变更时更新职能审批人
  useEffect(() => {
    const selectedProduct = serviceProductOptions.find(p => p.value === serviceProduct);
    if (selectedProduct) {
      setApprovalNodes(prev => prev.map(node => {
        if (node.type === 'functional') {
          return {
            ...node,
            approvers: [...selectedProduct.approvers],
            isCountersign: selectedProduct.isCountersign,
          };
        }
        return node;
      }));
    }
  }, [serviceProduct]);

  // 贸易代理变更时更新职能审批人
  useEffect(() => {
    setApprovalNodes(prev => prev.map(node => {
      if (node.type === 'functional') {
        const hasBaili = node.approvers.some(a => a.name === '白沥');
        if (isTradeAgency && !hasBaili) {
          return {
            ...node,
            approvers: [...node.approvers, { id: 'baili', name: '白沥', role: '贸易代理职能审批人' }],
          };
        }
        if (!isTradeAgency && hasBaili) {
          return {
            ...node,
            approvers: node.approvers.filter(a => a.name !== '白沥'),
          };
        }
      }
      return node;
    }));
  }, [isTradeAgency]);

  const handleSave = (saveAndEnable = false) => {
    const workflowData = {
      name: name || `${serviceProduct}审批流程`,
      serviceProduct,
      serviceProducts: serviceProduct ? [serviceProduct as ServiceProduct] : [],
      isTradeAgency,
      status: saveAndEnable ? 'active' : status,
      remark,
      approvalNodes,
    };

    if (isEditing) {
      updateApprovalWorkflow(params.id as string, workflowData);
    } else {
      addApprovalWorkflow(workflowData);
    }
    router.push('/approval/workflows');
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6 -mx-2">
        {/* 顶部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/approval/workflows')} className="p-2 rounded-lg hover:bg-[#F5F5F5] transition-colors">
              <ArrowLeftIcon />
            </button>
            <h1 className="text-2xl font-bold text-[#0A0A0A]">
              {isEditing ? '编辑审批流程' : '新增审批流程'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/approval/workflows')} className="px-4 py-2.5 text-sm border border-[#D5D5D5] rounded-lg hover:bg-[#F5F5F5] transition-colors">
              取消
            </button>
            <button onClick={() => handleSave(false)} className="px-4 py-2.5 text-sm bg-[#2D3BFF] text-white rounded-lg hover:opacity-90 transition-all shadow-md">
              保存
            </button>
            <button onClick={() => handleSave(true)} className="px-4 py-2.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              保存并启用
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* 左侧 - 基本信息 */}
          <div className="col-span-4 space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] p-5 space-y-4">
              <h3 className="text-sm font-semibold text-[#0A0A0A]">基本信息</h3>
              <div>
                <label className="block text-sm text-[#5A5A5A] mb-1.5">流程名称</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={`${serviceProduct || '请选择服务产品'}审批流程`}
                  className="w-full px-4 py-2.5 border border-[#D5D5D5] rounded-lg text-sm focus:outline-none focus:border-[#2D3BFF] focus:ring-2 focus:ring-[#2D3BFF]/10"
                />
              </div>
              <div>
                <label className="block text-sm text-[#5A5A5A] mb-1.5">服务产品 <span className="text-red-500">*</span></label>
                <SearchableSelect
                  value={serviceProduct}
                  onChange={(value) => setServiceProduct(value)}
                  options={serviceProductOptions.map(opt => ({ value: opt.value, label: opt.value }))}
                  placeholder="请选择服务产品"
                />
              </div>
              <div>
                <label className="block text-sm text-[#5A5A5A] mb-1.5">状态</label>
                <SearchableSelect
                  value={status}
                  onChange={(value) => setStatus(value as 'active' | 'inactive')}
                  options={[{ value: 'active', label: '已启用' }, { value: 'inactive', label: '已停用' }]}
                  placeholder="请选择状态"
                />
              </div>
              <div>
                <label className="block text-sm text-[#5A5A5A] mb-1.5">备注</label>
                <textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="请输入备注..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-[#D5D5D5] rounded-lg text-sm focus:outline-none focus:border-[#2D3BFF] focus:ring-2 focus:ring-[#2D3BFF]/10 resize-none"
                />
              </div>
            </div>

            {/* 贸易代理开关 */}
            <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] p-5 space-y-3">
              <h3 className="text-sm font-semibold text-[#0A0A0A]">贸易代理设置</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#0A0A0A]">是否涉及贸易代理业务？</p>
                  <p className="text-xs text-[#5A5A5A] mt-0.5">开启后，白沥将自动加入职能审批人列表</p>
                </div>
                <button
                  onClick={() => setIsTradeAgency(!isTradeAgency)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isTradeAgency ? 'bg-[#2D3BFF]' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isTradeAgency ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              {isTradeAgency && (
                <div className="p-3 bg-[#E8EBFF] border border-[#2D3BFF]/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircleIcon className="text-[#2D3BFF] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-[#2D3BFF]">已开启贸易代理</p>
                      <p className="text-xs text-[#2D3BFF]/80 mt-0.5">白沥将自动加入职能审批人列表，作为贸易代理职能审批人。</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 服务产品与审批人映射说明 */}
            <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] p-5 space-y-3">
              <h3 className="text-sm font-semibold text-[#0A0A0A]">服务产品审批人映射</h3>
              <div className="space-y-2 text-xs">
                {serviceProductOptions.map(opt => (
                  <div key={opt.value} className={`flex items-center justify-between p-2.5 rounded-lg ${serviceProduct === opt.value ? 'bg-[#E8EBFF] border border-[#2D3BFF]/30' : 'bg-[#F5F5F5]'}`}>
                    <span className="font-medium text-[#0A0A0A]">{opt.value}</span>
                    <span className="text-[#5A5A5A]">{opt.approvers.map(a => a.name).join(' / ')}{opt.isCountersign ? ' (会签)' : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 右侧 - 审批流程可视化 */}
          <div className="col-span-8">
            <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] p-5">
              <h3 className="text-sm font-semibold text-[#0A0A0A] mb-4">审批流程节点</h3>
              <div className="space-y-3">
                {approvalNodes.map((node, index) => (
                  <div key={node.id} className="flex items-start gap-4 p-4 bg-[#F5F5F5] rounded-lg border border-[#D5D5D5]">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#E8EBFF] flex items-center justify-center">
                      <span className="text-[#2D3BFF]">{nodeTypeIcons[(node.type || node.nodeType) as keyof typeof nodeTypeIcons]}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#0A0A0A]">{node.name}</span>
                        {node.isCountersign && (
                          <span className="px-2 py-0.5 text-xs bg-orange-100 text-orange-800 rounded-full">会签</span>
                        )}
                      </div>
                      <p className="text-xs text-[#5A5A5A] mt-0.5">{node.description}</p>
                      {node.approvers.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {node.approvers.map((approver) => (
                            <span key={approver.id} className="inline-flex items-center px-2 py-0.5 text-xs bg-white border border-[#D5D5D5] rounded-full">
                              {approver.name}
                              {approver.role && <span className="text-[#5A5A5A] ml-1">({approver.role})</span>}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
