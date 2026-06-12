'use client';

import { useState, useEffect } from 'react';

const LEVEL_LABELS: Record<string, string> = {
  K: 'K — 核心客户',
  A: 'A — 重点客户',
  B: 'B — 普通客户',
  C: 'C — 一般客户',
  D: 'D — 潜在客户',
};

export default function FollowupReminderSettings() {
  const [configs, setConfigs] = useState<Array<{ id: string; level: string; days: number }>>([]);
  const [editingCfg, setEditingCfg] = useState<{ id: string; level: string; days: number } | null>(null);
  const [editDays, setEditDays] = useState<number>(30);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const loadConfigs = () => {
    fetch('/api/followup-reminder-config')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setConfigs(data); })
      .catch(() => {});
  };

  useEffect(() => { loadConfigs(); }, []);

  const openEdit = (cfg: { id: string; level: string; days: number }) => {
    setEditingCfg(cfg);
    setEditDays(cfg.days);
  };

  const saveEdit = async () => {
    if (!editingCfg || editDays < 1) return;
    setSaving(true);
    try {
      await fetch('/api/followup-reminder-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingCfg.id, days: editDays }),
      });
      setConfigs(prev => prev.map(c => c.id === editingCfg.id ? { ...c, days: editDays } : c));
      setEditingCfg(null);
      setMessage('保存成功');
      setTimeout(() => setMessage(''), 2000);
    } catch { alert('保存失败'); }
    setSaving(false);
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A0A0A]">跟进提醒配置</h1>
          <p className="text-sm text-[#5A5A5A] mt-1">
            设置不同客户等级的跟进频率，系统将据此自动提醒负责人和协同人
            {message && <span className="ml-3 text-[#0D8A5E]">{message}</span>}
          </p>
        </div>
      </div>

      {/* 配置表格 */}
      <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F5F5F5] border-b border-[#EBEBEB]">
              <th className="text-left px-4 py-3 text-sm font-semibold text-[#0A0A0A] whitespace-nowrap">客户等级</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-[#0A0A0A] whitespace-nowrap">标签</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-[#0A0A0A] whitespace-nowrap">跟进频率</th>
              <th className="text-center px-4 py-3 text-sm font-semibold text-[#0A0A0A] whitespace-nowrap">操作</th>
            </tr>
          </thead>
          <tbody>
            {configs.map((cfg) => (
              <tr key={cfg.id} className="border-b border-[#EBEBEB] hover:bg-[#F5F5F5] transition-colors">
                <td className="px-4 py-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#E8EBFF] text-[#2D3BFF] text-sm font-bold">{cfg.level}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-[#5A5A5A]">{LEVEL_LABELS[cfg.level] || '-'}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-[#0A0A0A]">{cfg.days} 天</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => openEdit(cfg)}
                    className="text-sm font-medium text-[#2D3BFF] hover:text-[#4338CA] transition-colors"
                  >
                    编辑
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 编辑弹窗 */}
      {editingCfg && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setEditingCfg(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-[#EBEBEB]">
              <h3 className="text-lg font-semibold text-[#0A0A0A]">修改跟进频率</h3>
              <p className="text-sm text-[#5A5A5A] mt-0.5">{editingCfg.level} 级客户 · {LEVEL_LABELS[editingCfg.level]}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0A0A0A] mb-1.5">跟进频率（天）</label>
                <input
                  type="number"
                  min={1}
                  value={editDays}
                  onChange={e => setEditDays(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2 border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/20 focus:border-[#2D3BFF]"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#EBEBEB] flex justify-end space-x-3">
              <button
                onClick={() => setEditingCfg(null)}
                className="px-4 py-2 border border-[#EBEBEB] rounded-lg text-sm font-medium text-[#5A5A5A] hover:bg-[#F5F5F5] transition-colors"
              >
                取消
              </button>
              <button
                onClick={saveEdit}
                disabled={saving}
                className="px-4 py-2 bg-[#2D3BFF] text-white rounded-lg text-sm font-medium hover:bg-[#4338CA] transition-colors disabled:opacity-50"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
