'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { useApp } from '@/lib/store';
import { Plus, Search, Filter, Edit, Trash2 } from 'lucide-react';

export default function SettlementEntitiesPage() {
  const router = useRouter();
  const { settlementEntities } = useApp();
  
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredEntities = useMemo(() => {
    return settlementEntities.filter(entity => {
      const matchesKeyword = !searchKeyword || 
        entity.name.includes(searchKeyword) ||
        (entity.code || '').includes(searchKeyword) ||
        (entity.taxId && entity.taxId.includes(searchKeyword));
      const matchesStatus = filterStatus === 'all' || entity.status === filterStatus;
      return matchesKeyword && matchesStatus;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [settlementEntities, searchKeyword, filterStatus]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'enabled': return 'bg-success/15 text-success';
      case 'disabled': return 'bg-error/15 text-error';
      default: return 'bg-surface-container text-on-surface-variant';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'enabled': return '启用';
      case 'disabled': return '停用';
      default: return status;
    }
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-on-surface">结算主体管理</h1>
        </div>

        {/* 页面顶部操作区 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="搜索主体名称、代码、统一社会信用代码..."
                className="w-80 bg-surface-container border-none rounded-md pl-9 pr-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-surface-container border-none rounded-md px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="all">全部状态</option>
              <option value="enabled">启用</option>
              <option value="disabled">停用</option>
            </select>
          </div>
          <button
            onClick={() => router.push('/entities/settlement/new')}
            className="bg-primary text-on-primary px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            新增结算主体
          </button>
        </div>

        {/* 列表区 */}
        <div className="bg-surface rounded-lg shadow-card overflow-hidden">
          <div className="grid grid-cols-8 px-4 py-3 bg-surface-container text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
            <span>主体名称</span>
            <span>主体代码</span>
            <span>统一社会信用代码</span>
            <span>开户银行</span>
            <span>银行账号</span>
            <span>状态</span>
            <span>创建时间</span>
            <span>操作</span>
          </div>
          <div className="divide-y divide-outline-variant/50">
            {filteredEntities.length === 0 ? (
              <div className="px-4 py-8 text-center text-on-surface-variant">
                暂无结算主体
              </div>
            ) : (
              filteredEntities.map((entity) => (
                <div
                  key={entity.id}
                  className="grid grid-cols-8 px-4 py-3 hover:bg-surface-container/50 transition-colors items-center"
                >
                  <span className="text-sm font-medium text-on-surface">{entity.name}</span>
                  <span className="text-sm text-on-surface-variant">{entity.code}</span>
                  <span className="text-sm text-on-surface-variant">{entity.taxId || '-'}</span>
                  <span className="text-sm text-on-surface-variant">{entity.bankName || '-'}</span>
                  <span className="text-sm text-on-surface-variant">{entity.bankAccount || '-'}</span>
                  <span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium ${getStatusBadgeClass(entity.status)}`}>
                      {getStatusLabel(entity.status)}
                    </span>
                  </span>
                  <span className="text-sm text-on-surface-variant">{entity.createdAt.split(' ')[0]}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/entities/settlement/${entity.id}/edit`)}
                      className="text-primary text-sm font-medium hover:underline"
                    >
                      编辑
                    </button>
                    <button className="text-error text-sm font-medium hover:underline">
                      删除
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
