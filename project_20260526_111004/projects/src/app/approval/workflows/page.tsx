'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { useApp } from '@/lib/store';
import { ApprovalWorkflow } from '@/lib/types';

const serviceProducts = ['全部', '货代', '关务', '仓库', '运输', '进出口', '维修', '合同物流'];

const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const EyeIcon = ({ className }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const PencilIcon = ({ className }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const FilterIcon = ({ className }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg className={`w-3 h-3 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

export default function ApprovalWorkflowsPage() {
  const { approvalWorkflows, deleteApprovalWorkflow } = useApp();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterProduct, setFilterProduct] = useState('全部');
  const [filterStatus, setFilterStatus] = useState('全部');
  const [showProductFilter, setShowProductFilter] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filteredWorkflows = useMemo(() => {
    return approvalWorkflows.filter((w: ApprovalWorkflow) => {
      const matchesKeyword = !searchKeyword ||
        w.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        (w.serviceProduct || '').toLowerCase().includes(searchKeyword.toLowerCase());
      const matchesProduct = filterProduct === '全部' || w.serviceProduct === filterProduct;
      const matchesStatus = filterStatus === '全部' || w.status === filterStatus;
      return matchesKeyword && matchesProduct && matchesStatus;
    });
  }, [approvalWorkflows, searchKeyword, filterProduct, filterStatus]);

  const getFunctionalApprovers = (w: ApprovalWorkflow) => {
    const funcNode = (w.approvalNodes || []).find(n => n.type === 'functional');
    return funcNode ? funcNode.approvers.map(a => a.name).join('、') : '-';
  };

  const getTradeAgencyBadge = (w: ApprovalWorkflow) => {
    if (w.isTradeAgency) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#E8EBFF] text-[#2D3BFF] ml-2">
          含贸易代理
        </span>
      );
    }
    return null;
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6 -mx-2">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#0A0A0A]">审批流程配置</h1>
            <p className="text-[#5A5A5A] mt-1">管理各服务产品的审批流程和审批人配置</p>
          </div>
          <Link
            href="/approval/workflows/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2D3BFF] text-white rounded-lg hover:opacity-90 transition-all shadow-md"
          >
            <PlusIcon />
            新增流程
          </Link>
        </div>

        {/* 搜索和筛选 */}
        <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="text-[#999999]" />
              </div>
              <input
                type="text"
                placeholder="搜索流程名称或服务产品..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-[#D5D5D5] rounded-lg text-sm transition-all focus:outline-none focus:border-[#2D3BFF] focus:ring-2 focus:ring-[#2D3BFF]/10"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => { setShowProductFilter(!showProductFilter); setShowStatusFilter(false); }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#D5D5D5] rounded-lg text-sm hover:bg-[#F5F5F5] transition-colors"
              >
                <FilterIcon />
                {filterProduct === '全部' ? '服务产品' : filterProduct}
                <ChevronDownIcon />
              </button>
              {showProductFilter && (
                <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-[#D5D5D5] rounded-lg shadow-lg z-10">
                  {serviceProducts.map(p => (
                    <button
                      key={p}
                      onClick={() => { setFilterProduct(p); setShowProductFilter(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#E8EBFF] ${filterProduct === p ? 'bg-[#2D3BFF] text-white' : 'text-[#5A5A5A]'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => { setShowStatusFilter(!showStatusFilter); setShowProductFilter(false); }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#D5D5D5] rounded-lg text-sm hover:bg-[#F5F5F5] transition-colors"
              >
                {filterStatus === '全部' ? '状态' : filterStatus === 'active' ? '已启用' : '已停用'}
                <ChevronDownIcon />
              </button>
              {showStatusFilter && (
                <div className="absolute top-full left-0 mt-1 w-32 bg-white border border-[#D5D5D5] rounded-lg shadow-lg z-10">
                  {['全部', 'active', 'inactive'].map(s => (
                    <button
                      key={s}
                      onClick={() => { setFilterStatus(s); setShowStatusFilter(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#E8EBFF] ${filterStatus === s ? 'bg-[#2D3BFF] text-white' : 'text-[#5A5A5A]'}`}
                    >
                      {s === '全部' ? '全部' : s === 'active' ? '已启用' : '已停用'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 列表 */}
        <div className="space-y-4">
          {filteredWorkflows.map((workflow: ApprovalWorkflow) => (
            <div key={workflow.id} className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] p-5 hover:shadow-md hover:border-[#2D3BFF]/30 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#E8EBFF] text-[#2D3BFF]">
                        {workflow.serviceProduct}
                      </span>
                      {getTradeAgencyBadge(workflow)}
                    </div>
                    <h3 className="font-semibold text-[#0A0A0A]">{workflow.name}</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-[#5A5A5A]">职能审批人</span>
                      <p className="text-[#0A0A0A] mt-0.5">
                        {getFunctionalApprovers(workflow)}
                        {(() => {
                          const funcNode = (workflow.approvalNodes || []).find(n => n.type === 'functional');
                          return funcNode?.isCountersign ? (
                            <span className="ml-1 text-xs text-[#2D3BFF]">(会签)</span>
                          ) : null;
                        })()}
                      </p>
                    </div>
                    <div>
                      <span className="text-[#5A5A5A]">贸易代理</span>
                      <p className="text-[#0A0A0A] mt-0.5">
                        {workflow.isTradeAgency ? (
                          <span className="text-[#2D3BFF] font-medium">是 (含白沥)</span>
                        ) : (
                          <span className="text-[#5A5A5A]">否</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="text-[#5A5A5A]">更新时间</span>
                      <p className="text-[#0A0A0A] mt-0.5">
                        {new Date(workflow.updatedAt || workflow.createdAt).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    workflow.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-[#F5F5F5] text-[#5A5A5A]'
                  }`}>
                    {workflow.status === 'active' ? '已启用' : '已停用'}
                  </span>
                  
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/approval/workflows/${workflow.id}`}
                      className="p-1.5 rounded-lg hover:bg-[#F5F5F5] text-[#5A5A5A] hover:text-[#2D3BFF] transition-colors"
                      title="查看详情"
                    >
                      <EyeIcon />
                    </Link>
                    <Link
                      href={`/approval/workflows/${workflow.id}?edit=true`}
                      className="p-1.5 rounded-lg hover:bg-[#F5F5F5] text-[#5A5A5A] hover:text-[#2D3BFF] transition-colors"
                      title="编辑"
                    >
                      <PencilIcon />
                    </Link>
                    <button
                      onClick={() => setDeleteConfirm(workflow.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-[#5A5A5A] hover:text-red-600 transition-colors"
                      title="删除"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {filteredWorkflows.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F5F5F5] flex items-center justify-center">
                <svg className="w-8 h-8 text-[#999999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">暂无审批流程配置</h3>
              <p className="text-[#5A5A5A]">点击上方按钮添加第一个审批流程</p>
            </div>
          )}
        </div>

        {/* 删除确认弹窗 */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="px-6 py-4 border-b border-[#EBEBEB]">
                <h3 className="text-lg font-bold text-[#0A0A0A]">确认删除</h3>
              </div>
              <div className="p-6">
                <p className="text-[#5A5A5A] mb-6">
                  确定要删除此审批流程配置吗？此操作不可撤销。
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-4 py-2.5 text-sm border border-[#D5D5D5] rounded-lg hover:bg-[#F5F5F5] transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={() => {
                      deleteApprovalWorkflow(deleteConfirm);
                      setDeleteConfirm(null);
                    }}
                    className="px-4 py-2.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    确认删除
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
