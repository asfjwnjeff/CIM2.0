'use client';

import { useState, useEffect } from 'react';

interface AuditLogItem {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  detail: string;
  ip: string;
  createdAt: string;
}

const ACTION_LABELS: Record<string, string> = {
  login: '登录',
  logout: '登出',
  create: '创建',
  update: '修改',
  delete: '删除',
  grant_permission: '授予权限',
  revoke_permission: '撤销权限',
};

const ACTION_COLORS: Record<string, string> = {
  login: 'bg-[#E8FCEF] text-[#22C55E]',
  logout: 'bg-[#F1F5F9] text-[#5A5A5A]',
  create: 'bg-[#E8EBFF] text-[#2D3BFF]',
  update: 'bg-[#FFF4E8] text-[#E8850C]',
  delete: 'bg-[#FEE2E2] text-[#EF4444]',
  grant_permission: 'bg-[#E8EBFF] text-[#2D3BFF]',
  revoke_permission: 'bg-[#FEE2E2] text-[#EF4444]',
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionFilter, setActionFilter] = useState('');

  useEffect(() => {
    loadLogs();
  }, [page, actionFilter]);

  async function loadLogs() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '50' });
      if (actionFilter) params.set('action', actionFilter);
      const res = await fetch(`/api/audit-logs?${params}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.data);
        setTotal(data.meta?.total || 0);
      }
    } catch {
      // 静默处理
    } finally {
      setLoading(false);
    }
  }

  const totalPages = Math.ceil(total / 50);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0A0A0A]">审计日志</h1>
        <p className="text-sm text-[#5A5A5A] mt-1">查看用户操作记录，追溯系统变更历史</p>
      </div>

      {/* 筛选栏 */}
      <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] p-4">
        <div className="flex items-center gap-4">
          <select
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/20 focus:border-[#2D3BFF]"
          >
            <option value="">全部操作</option>
            {Object.entries(ACTION_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <button
            onClick={() => { setActionFilter(''); setPage(1); }}
            className="px-4 py-2 border border-[#EBEBEB] rounded-lg text-sm text-[#5A5A5A] hover:bg-[#F5F5F5] transition-colors"
          >
            重置
          </button>
        </div>
      </div>

      {/* 日志列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#B0B8D1]">加载中...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-[#B0B8D1]">暂无审计日志</div>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr className="bg-[#F5F5F5] border-b border-[#EBEBEB]">
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider whitespace-nowrap">时间</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider whitespace-nowrap">用户</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider whitespace-nowrap">操作</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider whitespace-nowrap">对象</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider whitespace-nowrap">详情</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider whitespace-nowrap">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBEBEB]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-[#F5F5F5] transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-sm text-[#5A5A5A] whitespace-nowrap font-mono text-xs">
                      {new Date(log.createdAt).toLocaleString('zh-CN')}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-[#0A0A0A] whitespace-nowrap">{log.userName || log.userId}</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${ACTION_COLORS[log.action] || 'bg-[#F1F5F9] text-[#5A5A5A]'}`}>
                      {ACTION_LABELS[log.action] || log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-[#0A0A0A] whitespace-nowrap">{log.resource || '-'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-[#5A5A5A] max-w-xs truncate">{log.detail || '-'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-[#B0B8D1] whitespace-nowrap font-mono text-xs">{log.ip || '-'}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-[#EBEBEB] flex items-center justify-between">
            <span className="text-sm text-[#5A5A5A]">共 {total} 条</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded text-sm text-[#5A5A5A] hover:bg-[#F5F5F5] transition-colors disabled:opacity-50"
              >
                上一页
              </button>
              <span className="px-3 py-1 text-sm text-[#0A0A0A]">{page} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 rounded text-sm text-[#5A5A5A] hover:bg-[#F5F5F5] transition-colors disabled:opacity-50"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
