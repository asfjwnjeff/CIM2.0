'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { useConfirm } from '@/hooks/useConfirm';
import type { Contact } from '@/lib/types';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  customerName: string;
  readonly?: boolean;
}

export default function ContactManagementDialog({
  open, onOpenChange, customerId, customerName, readonly,
}: Props) {
  const { confirm, ConfirmDialog } = useConfirm();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<'view' | 'add' | 'edit'>('view');
  const [form, setForm] = useState<Partial<Contact>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // 加载联系人列表
  const loadContacts = useCallback(async () => {
    try {
      const res = await fetch(`/api/contacts?customerId=${encodeURIComponent(customerId)}`);
      const data = await res.json();
      if (Array.isArray(data)) setContacts(data);
    } catch { /* ignore */ }
  }, [customerId]);

  useEffect(() => {
    if (open) {
      loadContacts();
      setSelectedId(null);
      setMode('view');
      setForm({});
      setErrors({});
      setDirty(false);
    }
  }, [open, loadContacts]);

  // 选中联系人
  const selectContact = async (ct: Contact) => {
    if (dirty) {
      const ok = await confirm('未保存的更改', '有未保存的更改，是否放弃？', '放弃', '取消', true);
      if (!ok) return;
    }
    setSelectedId(ct.id);
    setMode(readonly ? 'view' : 'edit');
    setForm({ ...ct });
    setErrors({});
    setDirty(false);
  };

  // 新增联系人
  const startAdd = async () => {
    if (dirty) {
      const ok = await confirm('未保存的更改', '有未保存的更改，是否放弃？', '放弃', '取消', true);
      if (!ok) return;
    }
    setSelectedId(null);
    setMode('add');
    setForm({
      customerId,
      name: '',
      englishName: '',
      phone: '',
      isKeyDecisionMaker: false,
      email: '',
      wechat: '',
      address: '',
      department: '',
      position: '',
      gender: '' as Contact['gender'],
      birthday: '',
      age: undefined,
      hobbies: '',
      hometown: '',
      familySituation: '',
      zipCode: '',
    });
    setErrors({});
    setDirty(false);
  };

  // 表单字段更新
  const updateField = (field: string, value: unknown) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setDirty(true);
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  // 校验
  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name?.trim()) errs.name = '请输入姓名';
    if (!form.department?.trim()) errs.department = '请输入部门';
    if (!form.position?.trim()) errs.position = '请输入职务';
    if (!form.gender) errs.gender = '请选择性别';
    if (form.isKeyDecisionMaker === undefined || form.isKeyDecisionMaker === null) {
      errs.isKeyDecisionMaker = '请选择是否关键决策人';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // 保存
  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (mode === 'add') {
        const res = await fetch('/api/contacts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, id: undefined }),
        });
        const data = await res.json();
        if (!res.ok) { toast.error(data.error || '保存失败'); setSaving(false); return; }
        setDirty(false);
        await loadContacts();
        const latest = await fetch(`/api/contacts?customerId=${encodeURIComponent(customerId)}`);
        const latestData = await latest.json();
        if (Array.isArray(latestData) && latestData.length > 0) {
          const newest = latestData[latestData.length - 1];
          setSelectedId(newest.id);
          setMode('edit');
          setForm(newest);
        }
        toast.success('联系人已添加');
      } else {
        const res = await fetch('/api/contacts', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, id: selectedId }),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          toast.error((errData as { error?: string }).error || '保存失败');
          setSaving(false);
          return;
        }
        setDirty(false);
        // 重新加载联系人列表并更新当前表单
        const fresh = await fetch(`/api/contacts?customerId=${encodeURIComponent(customerId)}`);
        const freshList = await fresh.json();
        if (Array.isArray(freshList)) {
          setContacts(freshList);
          const updated = freshList.find((c: Contact) => c.id === selectedId);
          if (updated) setForm({ ...updated });
        }
        toast.success('联系人已保存');
      }
    } catch (e) {
      toast.error('保存失败: ' + String(e));
    }
    setSaving(false);
  };

  // 删除
  const handleDelete = async () => {
    if (!selectedId) return;
    const ok = await confirm('删除联系人', `确定要删除联系人「${form.name || ''}」吗？此操作不可撤销。`, '删除', '取消', true);
    if (!ok) return;
    setDeleting(true);
    try {
      await fetch(`/api/contacts?id=${encodeURIComponent(selectedId)}`, { method: 'DELETE' });
      setSelectedId(null);
      setMode('view');
      setForm({});
      setDirty(false);
      await loadContacts();
      toast.success('联系人已删除');
    } catch (e) {
      toast.error('删除失败: ' + String(e));
    }
    setDeleting(false);
  };

  const selectedContact = contacts.find(c => c.id === selectedId);
  const showForm = mode === 'add' || mode === 'edit' || (mode === 'view' && !!selectedId);

  return (
    <Dialog open={open} onOpenChange={async (v) => {
      if (!v && dirty) {
        const ok = await confirm('未保存的更改', '有未保存的更改，确定关闭吗？', '关闭', '取消', true);
        if (!ok) return;
      }
      onOpenChange(v);
    }}>
      <DialogContent className="sm:max-w-[900px] max-h-[85vh] p-0 gap-0 flex flex-col [&>button:last-of-type]:hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBEBEB] dark:border-[#38383A] shrink-0">
          <div>
            <DialogTitle className="text-[18px] font-semibold text-[#0A0A0A] dark:text-white">联系人管理</DialogTitle>
            <DialogDescription className="text-sm text-[#5A5A5A] dark:text-[#98989E] mt-0.5">{customerName}</DialogDescription>
          </div>
          <button
            onClick={async () => {
              if (dirty) {
                const ok = await confirm('未保存的更改', '有未保存的更改，确定关闭吗？', '关闭', '取消', true);
                if (!ok) return;
              }
              onOpenChange(false);
            }}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#F5F5F5] dark:hover:bg-[#3A3A3C] transition-colors text-[#999] text-lg"
            aria-label="关闭"
          >✕</button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Left Panel: Contact List */}
          <div className="w-[260px] shrink-0 border-r border-[#EBEBEB] dark:border-[#38383A] bg-[#FAFAFA] dark:bg-[#0D0D0D] flex flex-col">
            <div className="px-4 py-3 border-b border-[#EBEBEB] dark:border-[#38383A] flex items-center justify-between">
              <span className="text-xs text-[#999]">共 {contacts.length} 位联系人</span>
              {!readonly && (
              <button
                onClick={startAdd}
                className="text-xs px-2.5 py-1 rounded-md border border-[#EBEBEB] dark:border-[#48484A] bg-white dark:bg-[#2C2C2E] text-[#5A5A5A] dark:text-[#98989E] hover:bg-[#F5F5F5] dark:hover:bg-[#3A3A3C] transition-colors"
              >
                ＋ 新增
              </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {contacts.length === 0 ? (
                <div className="text-center py-10 text-sm text-[#999]">暂无联系人</div>
              ) : (
                contacts.map((ct) => (
                  <button
                    key={ct.id}
                    onClick={() => selectContact(ct)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl mb-1 transition-all border ${
                      ct.id === selectedId
                        ? 'bg-white dark:bg-[#2C2C2E] border-[#2D3BFF] shadow-[0_0_0_1px_#2D3BFF]'
                        : 'bg-transparent border-transparent hover:bg-[#F5F5F5] dark:hover:bg-[#2C2C2E] hover:border-[#EBEBEB] dark:hover:border-[#48484A]'
                    }`}
                  >
                    <div className="text-sm font-semibold text-[#0A0A0A] dark:text-white">{ct.name}</div>
                    <div className="text-xs text-[#5A5A5A] dark:text-[#98989E] mt-0.5">{ct.phone || '未填写手机号'}</div>
                    <div className="flex gap-1 mt-1.5">
                      {ct.isKeyDecisionMaker && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#E8EBFF] dark:bg-[#1A2233] text-[#2D3BFF] dark:text-[#0A84FF]">
                          关键决策人
                        </span>
                      )}
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] text-[#999] bg-[#F5F5F5] dark:bg-[#2C2C2E]">
                        {ct.department} · {ct.position}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right Panel: Form */}
          <div className="flex-1 overflow-y-auto p-6">
            {!showForm ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-20">
                <div className="text-5xl mb-4">👤</div>
                <div className="text-sm font-medium text-[#5A5A5A] dark:text-[#98989E]">选择左侧联系人查看详情</div>
                <div className="text-xs text-[#999] mt-1">或点击「新增」添加联系人</div>
              </div>
            ) : (
              <fieldset disabled={readonly} className="space-y-0 border-none p-0">
                {/* 基本信息 */}
                <div className="text-[11px] font-semibold text-[#999] uppercase tracking-wide mb-3 pb-2 border-b border-[#EBEBEB] dark:border-[#38383A]">
                  基本信息
                </div>
                <div className="grid grid-cols-2 gap-x-5 gap-y-3 mb-2">
                  <FormField label="姓名" required error={errors.name}>
                    <input
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/20 focus:border-[#2D3BFF] ${errors.name ? 'border-[#D63031]' : 'border-[#D5D5D5]'}`}
                      value={form.name || ''} onChange={e => updateField('name', e.target.value)}
                      placeholder="请输入姓名"
                    />
                  </FormField>
                  <FormField label="英文名">
                    <input
                      className="w-full px-3 py-2 border border-[#D5D5D5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/20 focus:border-[#2D3BFF]"
                      value={form.englishName || ''} onChange={e => updateField('englishName', e.target.value)}
                      placeholder="请输入英文名"
                    />
                  </FormField>
                  <FormField label="手机号">
                    <input
                      className="w-full px-3 py-2 border border-[#D5D5D5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/20 focus:border-[#2D3BFF]"
                      value={form.phone || ''} onChange={e => updateField('phone', e.target.value)}
                      placeholder="请输入手机号" type="tel"
                    />
                  </FormField>
                  <FormField label="是否关键决策人" required error={errors.isKeyDecisionMaker}>
                    <div className="flex gap-4 pt-1.5">
                      <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                        <input type="radio" name="isKey" checked={form.isKeyDecisionMaker === true}
                          onChange={() => updateField('isKeyDecisionMaker', true)}
                          className="accent-[#2D3BFF] w-4 h-4" /> 是
                      </label>
                      <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                        <input type="radio" name="isKey" checked={form.isKeyDecisionMaker === false}
                          onChange={() => updateField('isKeyDecisionMaker', false)}
                          className="accent-[#2D3BFF] w-4 h-4" /> 否
                      </label>
                    </div>
                  </FormField>
                </div>
                <div className="grid grid-cols-2 gap-x-5 gap-y-3 mb-1">
                  <FormField label="邮箱">
                    <input
                      className="w-full px-3 py-2 border border-[#D5D5D5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/20 focus:border-[#2D3BFF]"
                      value={form.email || ''} onChange={e => updateField('email', e.target.value)}
                      placeholder="请输入邮箱" type="email"
                    />
                  </FormField>
                  <FormField label="微信">
                    <input
                      className="w-full px-3 py-2 border border-[#D5D5D5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/20 focus:border-[#2D3BFF]"
                      value={form.wechat || ''} onChange={e => updateField('wechat', e.target.value)}
                      placeholder="请输入微信号"
                    />
                  </FormField>
                </div>

                <hr className="my-4 border-[#EBEBEB] dark:border-[#38383A]" />

                {/* 工作信息 */}
                <div className="text-[11px] font-semibold text-[#999] uppercase tracking-wide mb-3 pb-2 border-b border-[#EBEBEB] dark:border-[#38383A]">
                  工作信息
                </div>
                <div className="grid grid-cols-2 gap-x-5 gap-y-3 mb-2">
                  <FormField label="部门" required error={errors.department}>
                    <input
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/20 focus:border-[#2D3BFF] ${errors.department ? 'border-[#D63031]' : 'border-[#D5D5D5]'}`}
                      value={form.department || ''} onChange={e => updateField('department', e.target.value)}
                      placeholder="请输入部门"
                    />
                  </FormField>
                  <FormField label="职务" required error={errors.position}>
                    <input
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/20 focus:border-[#2D3BFF] ${errors.position ? 'border-[#D63031]' : 'border-[#D5D5D5]'}`}
                      value={form.position || ''} onChange={e => updateField('position', e.target.value)}
                      placeholder="请输入职务"
                    />
                  </FormField>
                  <FormField label="地址">
                    <input
                      className="w-full px-3 py-2 border border-[#D5D5D5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/20 focus:border-[#2D3BFF]"
                      value={form.address || ''} onChange={e => updateField('address', e.target.value)}
                      placeholder="请输入地址"
                    />
                  </FormField>
                  <FormField label="邮政编码">
                    <input
                      className="w-full px-3 py-2 border border-[#D5D5D5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/20 focus:border-[#2D3BFF]"
                      value={form.zipCode || ''} onChange={e => updateField('zipCode', e.target.value)}
                      placeholder="请输入邮政编码"
                    />
                  </FormField>
                </div>

                <hr className="my-4 border-[#EBEBEB] dark:border-[#38383A]" />

                {/* 个人信息 */}
                <div className="text-[11px] font-semibold text-[#999] uppercase tracking-wide mb-3 pb-2 border-b border-[#EBEBEB] dark:border-[#38383A]">
                  个人信息
                </div>
                <div className="grid grid-cols-3 gap-x-5 gap-y-3 mb-2">
                  <FormField label="性别" required error={errors.gender}>
                    <div className="flex gap-4 pt-1.5">
                      <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                        <input type="radio" name="gender" checked={form.gender === 'male'}
                          onChange={() => updateField('gender', 'male')}
                          className="accent-[#2D3BFF] w-4 h-4" /> 男
                      </label>
                      <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                        <input type="radio" name="gender" checked={form.gender === 'female'}
                          onChange={() => updateField('gender', 'female')}
                          className="accent-[#2D3BFF] w-4 h-4" /> 女
                      </label>
                    </div>
                  </FormField>
                  <FormField label="生日">
                    <input
                      className="w-full px-3 py-2 border border-[#D5D5D5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/20 focus:border-[#2D3BFF]"
                      value={form.birthday || ''} onChange={e => updateField('birthday', e.target.value)}
                      type="date"
                    />
                  </FormField>
                  <FormField label="年龄">
                    <input
                      className="w-full px-3 py-2 border border-[#D5D5D5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/20 focus:border-[#2D3BFF]"
                      value={form.age ?? ''} onChange={e => updateField('age', e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="请输入年龄" type="number" min={0} max={150}
                    />
                  </FormField>
                </div>
                <div className="grid grid-cols-2 gap-x-5 gap-y-3 mb-2">
                  <FormField label="爱好">
                    <input
                      className="w-full px-3 py-2 border border-[#D5D5D5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/20 focus:border-[#2D3BFF]"
                      value={form.hobbies || ''} onChange={e => updateField('hobbies', e.target.value)}
                      placeholder="请输入爱好"
                    />
                  </FormField>
                  <FormField label="籍贯">
                    <input
                      className="w-full px-3 py-2 border border-[#D5D5D5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/20 focus:border-[#2D3BFF]"
                      value={form.hometown || ''} onChange={e => updateField('hometown', e.target.value)}
                      placeholder="请输入籍贯"
                    />
                  </FormField>
                </div>
                <div className="mt-3">
                  <FormField label="家庭情况">
                    <input
                      className="w-full px-3 py-2 border border-[#D5D5D5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/20 focus:border-[#2D3BFF]"
                      value={form.familySituation || ''} onChange={e => updateField('familySituation', e.target.value)}
                      placeholder="请输入家庭情况"
                    />
                  </FormField>
                </div>
              </fieldset>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#EBEBEB] dark:border-[#38383A] shrink-0">
          <div>
            {mode === 'edit' && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm border border-[#D63031] dark:border-[#FF453A] text-[#D63031] dark:text-[#FF453A] rounded-xl hover:bg-[#FFF0F0] dark:hover:bg-[#2E1A1D] transition-colors disabled:opacity-50"
              >
                {deleting ? '删除中...' : '删除联系人'}
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                if (dirty) {
                  const ok = await confirm('未保存的更改', '有未保存的更改，确定关闭吗？', '关闭', '取消', true);
                  if (!ok) return;
                }
                onOpenChange(false);
              }}
              className="px-4 py-2 text-sm border border-[#EBEBEB] dark:border-[#48484A] text-[#5A5A5A] dark:text-[#98989E] rounded-xl hover:bg-[#F5F5F5] dark:hover:bg-[#3A3A3C] transition-colors"
            >
              取消
            </button>
            {mode !== 'view' && showForm && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm bg-[#2D3BFF] text-white rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            )}
          </div>
        </div>
      </DialogContent>
      {ConfirmDialog}
    </Dialog>
  );
}

// 表单字段包装组件
function FormField({
  label, required, error, children,
}: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[13px] font-medium text-[#5A5A5A] dark:text-[#98989E]">
        {required && <span className="text-[#D63031] mr-0.5">*</span>}
        {label}
      </label>
      {children}
      {error && <span className="text-xs text-[#D63031]">{error}</span>}
    </div>
  );
}
