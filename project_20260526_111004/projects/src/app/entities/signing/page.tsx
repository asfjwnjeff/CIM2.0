'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';

function StatusBadge({ status }: { status: string }) {
  const isActive = status === 'active';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
      isActive ? 'bg-[#E6F7F0] text-[#0D8A5E]' : 'bg-[#EBEBEB] text-[#5A5A5A]'
    }`}>
      {isActive ? '启用' : '停用'}
    </span>
  );
}

export default function SigningEntitiesPage() {
  const router = useRouter();
  const { signingEntities, deleteSigningEntity } = useApp();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredEntities = useMemo(() => {
    return signingEntities.filter(entity => {
      const matchesKeyword = !searchKeyword ||
        entity.name.includes(searchKeyword) ||
        (entity.code || '').includes(searchKeyword) ||
        (entity.unifiedSocialCreditCode || '').includes(searchKeyword);
      const matchesStatus = filterStatus === 'all' || entity.status === filterStatus;
      return matchesKeyword && matchesStatus;
    });
  }, [signingEntities, searchKeyword, filterStatus]);

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`确定要删除签约主体"${name}"吗？`)) return;
    deleteSigningEntity(id);
  };

  return (
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-[13px] text-[#999999] mb-1">
              <button onClick={() => router.push('/entities')} className="hover:text-[#2D3BFF] transition-colors">主体管理</button>
              <span className="text-[#D5D5D5]">/</span>
              <span>签约主体</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0A0A0A]">签约主体管理</h1>
            <p className="text-[#5A5A5A] text-[13px] mt-0.5">管理所有签约主体信息，包括基本信息、联系方式和经营数据</p>
          </div>
          <button
            onClick={() => router.push('/entities/signing/new')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#2D3BFF] text-white rounded-lg text-sm font-medium hover:bg-[#4338CA] transition-colors"
          >
            <Plus className="w-4 h-4" />
            新增签约主体
          </button>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 max-w-sm relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="搜索主体名称、代码、统一社会信用代码..."
                className="w-full pl-9 pr-4 py-2 h-[38px] border border-[#D5D5D5] rounded-lg text-sm focus:outline-none focus:border-[#2D3BFF] focus:shadow-[0_0_0_2px_rgba(45,59,255,0.10)]"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 h-[38px] border border-[#D5D5D5] rounded-lg text-sm bg-white focus:outline-none focus:border-[#2D3BFF] focus:shadow-[0_0_0_2px_rgba(45,59,255,0.10)]"
            >
              <option value="all">全部状态</option>
              <option value="active">启用</option>
              <option value="inactive">停用</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#EBEBEB] bg-[#FAFAFA] h-[36px]">
                  <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase text-[#5A5A5A]">主体名称</th>
                  <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase text-[#5A5A5A]">主体代码</th>
                  <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase text-[#5A5A5A]">统一社会信用代码</th>
                  <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase text-[#5A5A5A]">联系人</th>
                  <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase text-[#5A5A5A]">联系电话</th>
                  <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase text-[#5A5A5A]">状态</th>
                  <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase text-[#5A5A5A]">创建时间</th>
                  <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase text-[#5A5A5A] w-[120px]">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntities.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-[#999999] py-12 text-sm">暂无签约主体数据</td>
                  </tr>
                ) : (
                  filteredEntities.map((entity) => (
                    <tr key={entity.id} className="border-b border-[#EBEBEB] h-[44px] hover:bg-[#F5F5F5] transition-colors">
                      <td className="px-3 py-3 text-[13px] font-medium text-[#0A0A0A]">{entity.name}</td>
                      <td className="px-3 py-3 text-[13px] text-[#5A5A5A] font-mono text-xs">{entity.code || '-'}</td>
                      <td className="px-3 py-3 text-[13px] text-[#5A5A5A] font-mono text-xs">{entity.unifiedSocialCreditCode || '-'}</td>
                      <td className="px-3 py-3 text-[13px] text-[#0A0A0A]">{entity.contactPerson || '-'}</td>
                      <td className="px-3 py-3 text-[13px] text-[#5A5A5A]">{entity.phone || '-'}</td>
                      <td className="px-3 py-3"><StatusBadge status={entity.status} /></td>
                      <td className="px-3 py-3 text-[13px] text-[#5A5A5A]">{entity.createdAt?.slice(0, 10) || '-'}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/entities/signing/${entity.id}/edit`)}
                            className="text-[#2D3BFF] text-[13px] font-medium hover:underline"
                          >
                            <Pencil className="w-3.5 h-3.5 inline mr-0.5" />
                            编辑
                          </button>
                          <button
                            onClick={() => handleDelete(entity.id, entity.name)}
                            className="text-[#D63031] text-[13px] font-medium hover:underline"
                          >
                            <Trash2 className="w-3.5 h-3.5 inline mr-0.5" />
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
}
