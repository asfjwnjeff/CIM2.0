'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppContext } from '@/lib/store';
import { ApprovalWorkflow, ApprovalNode } from '@/lib/types';
import { ArrowLeft, Pencil, Copy, Power, User, Users, CheckCircle2, Clock, AlertCircle, Monitor } from 'lucide-react';

const nodeTypeLabels: Record<string, string> = {
  initiator: '发起人',
  department_manager: '部门经理',
  functional: '职能审批人',
  finance: '财务审批',
  general_manager: '总经理',
  it_ops: 'IT运维确认',
};

const nodeTypeIcons: Record<string, React.ReactNode> = {
  initiator: <User className="w-4 h-4" />,
  department_manager: <User className="w-4 h-4" />,
  functional: <Users className="w-4 h-4" />,
  finance: <Users className="w-4 h-4" />,
  general_manager: <User className="w-4 h-4" />,
  it_ops: <Monitor className="w-4 h-4" />,
};

export default function ApprovalWorkflowDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { approvalWorkflows, updateApprovalWorkflow } = useAppContext();
  const [activeTab, setActiveTab] = useState('flow');

  const workflow = approvalWorkflows.find((w: ApprovalWorkflow) => w.id === params.id);

  if (!workflow) {
    return (
      <div className="p-6">
        <div className="text-center py-20">
          <p className="text-muted-foreground">未找到该审批流程配置</p>
          <Link href="/approval/workflows" className="text-primary hover:underline mt-2 inline-block">返回列表</Link>
        </div>
      </div>
    );
  }

  const handleToggleStatus = () => {
    updateApprovalWorkflow(workflow.id, { status: workflow.status === 'active' ? 'inactive' : 'active' });
  };

  const functionalNode = (workflow.approvalNodes || []).find((n: ApprovalNode) => n.type === 'functional');

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* 顶部操作栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/approval/workflows')} className="p-2 rounded-lg hover:bg-muted/50">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#0A0A0A]">{workflow.name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              服务产品：{workflow.serviceProduct}
              {workflow.isTradeAgency && (
                <span className="ml-2 text-blue-600 font-medium">含贸易代理（白沥）</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/approval/workflows/${workflow.id}?edit=true`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm"
          >
            <Pencil className="w-4 h-4" />
            编辑
          </Link>
          <button
            onClick={handleToggleStatus}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm border ${
              workflow.status === 'active'
                ? 'border-orange-300 text-orange-700 hover:bg-orange-50'
                : 'border-green-300 text-green-700 hover:bg-green-50'
            }`}
          >
            <Power className="w-4 h-4" />
            {workflow.status === 'active' ? '停用' : '启用'}
          </button>
        </div>
      </div>

      {/* 基本信息 */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">服务产品</p>
          <p className="text-sm font-medium text-foreground">{workflow.serviceProduct}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">是否贸易代理</p>
          <p className="text-sm font-medium">
            {workflow.isTradeAgency ? (
              <span className="text-blue-600">是（含白沥）</span>
            ) : (
              <span>否</span>
            )}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">状态</p>
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
            workflow.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {workflow.status === 'active' ? '已启用' : '已停用'}
          </span>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">最后更新</p>
          <p className="text-sm font-medium text-foreground">{new Date(workflow.updatedAt || workflow.createdAt).toLocaleDateString('zh-CN')}</p>
        </div>
      </div>

      {/* 标签页 */}
      <div className="border-b border-border">
        <nav className="flex gap-6">
          {[
            { id: 'flow', label: '审批流程' },
            { id: 'rules', label: '自动审批规则' },
            { id: 'history', label: '变更历史' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* 审批流程可视化 */}
      {activeTab === 'flow' && (
        <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] p-6">
          <h3 className="text-base font-semibold text-[#0A0A0A] mb-6">审批流程</h3>
          <div className="space-y-0">
            {(workflow.approvalNodes || []).map((node: ApprovalNode, index: number) => {
              const isFunctional = (node.type || node.nodeType) === 'functional';
              const isLast = index === (workflow.approvalNodes || []).length - 1;
              return (
                <div key={node.level} className="flex gap-3">
                  {/* Timeline */}
                  <div className="flex flex-col items-center flex-shrink-0 pt-1">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      isFunctional
                        ? 'bg-[#2D3BFF] text-white shadow-[0_0_0_3px_rgba(45,59,255,0.15)]'
                        : 'bg-[#D5D5D5] text-white'
                    }`}>
                      {node.level || index + 1}
                    </div>
                    {!isLast && (
                      <div className={`w-0.5 flex-1 min-h-[28px] ${
                        isFunctional ? 'bg-[#2D3BFF]/30' : 'bg-[#EBEBEB]'
                      }`} />
                    )}
                  </div>
                  {/* Content card */}
                  <div className={`flex-1 pb-4 ${
                    isFunctional
                      ? 'bg-[#F0F1FF] border border-[#C7CAFF] rounded-lg p-3'
                      : 'bg-[#FAFAFA] border border-[#EBEBEB] rounded-lg p-3'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-[#0A0A0A]">{node.name}</span>
                      {isFunctional && (
                        <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-[#2D3BFF] text-white rounded">动态</span>
                      )}
                      {node.isCountersign && (
                        <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-[#FFF9EB] text-[#E8850C] rounded border border-[#FDE68A]">会签</span>
                      )}
                    </div>
                    <p className="text-xs text-[#5A5A5A] mb-2">{node.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {node.approvers.map((approver) => (
                        <span key={approver.id} className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full ${
                          isFunctional
                            ? 'bg-[#E8EBFF] text-[#2D3BFF] border border-[#2D3BFF]/20'
                            : 'bg-white border border-[#D5D5D5]'
                        }`}>
                          {approver.name}
                        </span>
                      ))}
                    </div>
                    {/* Conditional branch info */}
                    {isFunctional && workflow.isTradeAgency && (
                      <div className="mt-3 pt-3 border-t border-dashed border-[#E8850C]">
                        <span className="text-[10px] text-[#E8850C] font-medium">规则触发追加</span>
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs bg-[#FFF9EB] border border-[#FDE68A] ml-2">
                          <span className="text-[#E8850C] font-medium">+ 白沥</span>
                          <span className="text-[10px] text-[#E8850C]">涉及贸易代理</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 自动审批规则 */}
      {activeTab === 'rules' && (
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-foreground">关联的自动审批规则</h3>
            <Link
              href="/approval/auto-rules"
              className="text-sm text-primary hover:underline"
            >
              管理规则
            </Link>
          </div>
          <div className="space-y-3">
            {workflow.isTradeAgency && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">贸易代理自动添加白沥</p>
                  <p className="text-xs text-muted-foreground">条件：是否贸易代理 = 是 → 自动添加审批人白沥</p>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  已启用
                </span>
              </div>
            )}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">低金额自动通过</p>
                <p className="text-xs text-muted-foreground">条件：月开票金额 &lt; 5000 且 月均订单数 ≤ 5 → 自动通过</p>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                已启用
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 变更历史 */}
      {activeTab === 'history' && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-base font-semibold text-foreground mb-4">变更历史</h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <div className="w-0.5 flex-1 bg-border" />
              </div>
              <div className="pb-4">
                <p className="text-sm font-medium text-foreground">创建审批流程</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {workflow.createdBy} · {new Date(workflow.createdAt).toLocaleString('zh-CN')}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 rounded-full bg-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">最后更新</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(workflow.updatedAt || workflow.createdAt).toLocaleString('zh-CN')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 备注 */}
      {workflow.remark && (
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">备注</p>
          <p className="text-sm text-foreground">{workflow.remark}</p>
        </div>
      )}
    </div>
  );
}
