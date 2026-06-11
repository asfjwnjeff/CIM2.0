'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/lib/store';
import { ApprovalField, ApprovalFieldType, ApprovalFieldOption, ServiceProduct } from '@/lib/types';

const fieldTypeLabels: Record<ApprovalFieldType, string> = {
  single_select: '单选',
  multi_select: '多选',
  single_other: '单选+其他',
  boolean: '布尔',
  percentage: '百分比',
  number: '数字',
  text: '文本输入',
};

const fieldTypesWithOptions: ApprovalFieldType[] = [
  'single_select', 'multi_select', 'single_other',
];

const serviceProducts: { label: string; value: string }[] = [
  { label: '全部', value: '全部' },
  { label: '货代', value: '货代' },
  { label: '关务', value: '关务' },
  { label: '仓库', value: '仓库' },
  { label: '运输', value: '运输' },
  { label: '进出口', value: '进出口' },
  { label: '维修', value: '维修' },
  { label: '合同物流', value: '合同物流' },
];

const emptyField = (): Partial<ApprovalField> => ({
  name: '',
  fieldKey: '',
  fieldType: 'text',
  serviceProducts: [],
  options: [],
  isRequired: false,
  approvalPoint: '',
  status: 'active',
  remark: '',
});

// Icons
const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
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
const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);
const XIcon = ({ className }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function ApprovalFieldsPage() {
  const { approvalFields, addApprovalField, updateApprovalField, deleteApprovalField } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterProduct, setFilterProduct] = useState('全部');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<Partial<ApprovalField>>(emptyField());
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [productDropdown, setProductDropdown] = useState(false);

  const filteredFields = useMemo(() => {
    return approvalFields.filter((f) => {
      const matchSearch = !searchQuery ||
        f.name.includes(searchQuery) ||
        f.fieldKey.toLowerCase().includes(searchQuery.toLowerCase());
      const matchProduct = filterProduct === '全部' ||
        f.serviceProducts.includes(filterProduct as ServiceProduct);
      return matchSearch && matchProduct;
    });
  }, [approvalFields, searchQuery, filterProduct]);

  const openNewDialog = () => {
    setEditingField(emptyField());
    setIsEditing(false);
    setDialogOpen(true);
  };

  const openEditDialog = (field: ApprovalField) => {
    setEditingField({ ...field });
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleSave = () => {
    const f = editingField;
    if (!f.name || !f.fieldKey) return;

    if (isEditing && f.id) {
      updateApprovalField(f.id, f);
    } else {
      addApprovalField(f as Omit<ApprovalField, 'id' | 'createdAt'>);
    }
    setDialogOpen(false);
  };

  const toggleProduct = (p: string) => {
    const current = editingField.serviceProducts || [];
    const next = current.includes(p as ServiceProduct)
      ? current.filter(x => x !== p)
      : [...current, p as ServiceProduct];
    setEditingField({ ...editingField, serviceProducts: next });
  };

  const addOption = () => {
    const opts = [...(editingField.options || [])];
    opts.push({ id: `opt-${Date.now()}`, label: '', order: opts.length + 1 });
    setEditingField({ ...editingField, options: opts });
  };

  const updateOption = (idx: number, label: string) => {
    const opts = [...(editingField.options || [])];
    opts[idx] = { ...opts[idx], label };
    setEditingField({ ...editingField, options: opts });
  };

  const removeOption = (idx: number) => {
    const opts = (editingField.options || []).filter((_, i) => i !== idx);
    setEditingField({ ...editingField, options: opts });
  };

  const toggleStatus = (field: ApprovalField) => {
    updateApprovalField(field.id, { status: field.status === 'active' ? 'inactive' : 'active' });
  };

  const showOptionsEditor = fieldTypesWithOptions.includes(editingField.fieldType || 'text');

  return (
    <div className="max-w-[1440px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A0A0A]">审批字段配置</h1>
          <p className="text-[#5A5A5A] mt-1">管理审批结构化字段，按服务产品绑定动态展示</p>
        </div>
        <button
          onClick={openNewDialog}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2D3BFF] text-white rounded-lg hover:opacity-90 transition-all shadow-md"
        >
          <PlusIcon />
          新增字段
        </button>
      </div>

      {/* Search + Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="text-[#999999]" />
            </div>
            <input
              type="text"
              placeholder="搜索字段名称或Key..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[#D5D5D5] rounded-lg text-sm transition-all focus:outline-none focus:border-[#2D3BFF] focus:ring-2 focus:ring-[#2D3BFF]/10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {serviceProducts.map((p) => (
              <button
                key={p.value}
                onClick={() => setFilterProduct(p.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterProduct === p.value
                    ? 'bg-[#2D3BFF] text-white'
                    : 'bg-[#F5F5F5] text-[#5A5A5A] hover:bg-[#E8EBFF]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#EBEBEB] bg-[#FAFAFA]">
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider">字段名称</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider">Key</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider">类型</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider">绑定服务产品</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider">审批点</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider">状态</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBEBEB]">
            {filteredFields.map((field) => (
              <tr key={field.id} className="hover:bg-[#FAFAFA] transition-colors">
                <td className="px-4 py-3">
                  <span className="font-medium text-[#0A0A0A] text-sm">{field.name}</span>
                  {field.isRequired && (
                    <span className="ml-1 text-[#D63031] text-xs">*</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <code className="text-xs bg-[#F5F5F5] px-2 py-0.5 rounded text-[#5A5A5A]">{field.fieldKey}</code>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-[#5A5A5A]">{fieldTypeLabels[field.fieldType]}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {field.serviceProducts.map((sp) => (
                      <span key={sp} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#E8EBFF] text-[#2D3BFF]">
                        {sp}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-[#5A5A5A]">{field.approvalPoint || '-'}</span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleStatus(field)}
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                      field.status === 'active'
                        ? 'bg-green-50 text-green-700 hover:bg-green-100'
                        : 'bg-[#F5F5F5] text-[#999] hover:bg-[#EBEBEB]'
                    }`}
                  >
                    {field.status === 'active' ? '启用' : '停用'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => openEditDialog(field)}
                      className="p-1.5 rounded-lg hover:bg-[#F5F5F5] text-[#5A5A5A] hover:text-[#2D3BFF] transition-colors"
                      title="编辑"
                    >
                      <PencilIcon />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(field.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-[#5A5A5A] hover:text-red-600 transition-colors"
                      title="删除"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredFields.length === 0 && (
          <div className="p-12 text-center">
            <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">暂无审批字段配置</h3>
            <p className="text-[#5A5A5A]">点击上方按钮添加第一个字段</p>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-[10vh] overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="px-6 py-4 border-b border-[#EBEBEB] flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#0A0A0A]">
                {isEditing ? '编辑字段' : '新增字段'}
              </h3>
              <button onClick={() => setDialogOpen(false)} className="p-1 rounded-lg hover:bg-[#F5F5F5] text-[#999]">
                <XIcon />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Row 1: Name + Key */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#5A5A5A] mb-1.5">字段名称 <span className="text-[#D63031]">*</span></label>
                  <input
                    type="text"
                    value={editingField.name || ''}
                    onChange={(e) => setEditingField({ ...editingField, name: e.target.value })}
                    placeholder="如：月订单数"
                    className="w-full px-3 py-2 border border-[#D5D5D5] rounded-lg text-sm focus:outline-none focus:border-[#2D3BFF] focus:ring-2 focus:ring-[#2D3BFF]/10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5A5A5A] mb-1.5">字段Key <span className="text-[#D63031]">*</span></label>
                  <input
                    type="text"
                    value={editingField.fieldKey || ''}
                    onChange={(e) => setEditingField({ ...editingField, fieldKey: e.target.value })}
                    placeholder="如：monthly_orders"
                    className="w-full px-3 py-2 border border-[#D5D5D5] rounded-lg text-sm focus:outline-none focus:border-[#2D3BFF] focus:ring-2 focus:ring-[#2D3BFF]/10"
                  />
                </div>
              </div>

              {/* Row 2: Type + Approval Point */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#5A5A5A] mb-1.5">字段类型</label>
                  <select
                    value={editingField.fieldType || 'text'}
                    onChange={(e) => setEditingField({ ...editingField, fieldType: e.target.value as ApprovalFieldType })}
                    className="w-full px-3 py-2 border border-[#D5D5D5] rounded-lg text-sm focus:outline-none focus:border-[#2D3BFF] focus:ring-2 focus:ring-[#2D3BFF]/10"
                  >
                    {Object.entries(fieldTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5A5A5A] mb-1.5">审批点</label>
                  <input
                    type="text"
                    value={editingField.approvalPoint || ''}
                    onChange={(e) => setEditingField({ ...editingField, approvalPoint: e.target.value })}
                    placeholder="如：业务量"
                    className="w-full px-3 py-2 border border-[#D5D5D5] rounded-lg text-sm focus:outline-none focus:border-[#2D3BFF] focus:ring-2 focus:ring-[#2D3BFF]/10"
                  />
                </div>
              </div>

              {/* Row 3: Service Products */}
              <div>
                <label className="block text-xs font-semibold text-[#5A5A5A] mb-1.5">绑定服务产品</label>
                <div className="flex flex-wrap gap-2">
                  {serviceProducts.filter(p => p.value !== '全部').map((p) => {
                    const selected = (editingField.serviceProducts || []).includes(p.value as ServiceProduct);
                    return (
                      <button
                        key={p.value}
                        onClick={() => toggleProduct(p.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          selected
                            ? 'bg-[#2D3BFF] text-white'
                            : 'bg-[#F5F5F5] text-[#5A5A5A] hover:bg-[#E8EBFF]'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 4: Options Editor */}
              {showOptionsEditor && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-[#5A5A5A]">可选值配置</label>
                    <button
                      onClick={addOption}
                      className="inline-flex items-center gap-1 text-xs text-[#2D3BFF] hover:underline"
                    >
                      <PlusIcon className="w-3 h-3" />
                      添加选项
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(editingField.options || []).map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-xs text-[#999] w-5">{idx + 1}.</span>
                        <input
                          type="text"
                          value={opt.label}
                          onChange={(e) => updateOption(idx, e.target.value)}
                          placeholder={`选项 ${idx + 1}`}
                          className="flex-1 px-3 py-1.5 border border-[#D5D5D5] rounded text-sm focus:outline-none focus:border-[#2D3BFF]"
                        />
                        <button
                          onClick={() => removeOption(idx)}
                          className="p-1 rounded text-[#999] hover:text-[#D63031] hover:bg-red-50 transition-colors"
                        >
                          <XIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {(editingField.options || []).length === 0 && (
                      <p className="text-xs text-[#999] py-2">暂无选项，点击"添加选项"开始配置</p>
                    )}
                  </div>
                </div>
              )}

              {/* Row 5: isRequired + Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-semibold text-[#5A5A5A]">是否必填</label>
                  <button
                    onClick={() => setEditingField({ ...editingField, isRequired: !editingField.isRequired })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      editingField.isRequired ? 'bg-[#2D3BFF]' : 'bg-[#D5D5D5]'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      editingField.isRequired ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-xs font-semibold text-[#5A5A5A]">状态</label>
                  <button
                    onClick={() => setEditingField({ ...editingField, status: editingField.status === 'active' ? 'inactive' : 'active' })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      editingField.status === 'active' ? 'bg-green-500' : 'bg-[#D5D5D5]'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      editingField.status === 'active' ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                  <span className="text-xs text-[#5A5A5A]">
                    {editingField.status === 'active' ? '启用' : '停用'}
                  </span>
                </div>
              </div>

              {/* Row 6: Remark */}
              <div>
                <label className="block text-xs font-semibold text-[#5A5A5A] mb-1.5">备注</label>
                <textarea
                  value={editingField.remark || ''}
                  onChange={(e) => setEditingField({ ...editingField, remark: e.target.value })}
                  placeholder="字段说明或备注信息"
                  rows={2}
                  className="w-full px-3 py-2 border border-[#D5D5D5] rounded-lg text-sm focus:outline-none focus:border-[#2D3BFF] focus:ring-2 focus:ring-[#2D3BFF]/10 resize-none"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#EBEBEB] flex justify-end gap-3">
              <button
                onClick={() => setDialogOpen(false)}
                className="px-4 py-2.5 text-sm border border-[#D5D5D5] rounded-lg hover:bg-[#F5F5F5] transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={!editingField.name || !editingField.fieldKey}
                className="px-4 py-2.5 text-sm bg-[#2D3BFF] text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isEditing ? '保存' : '新增'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-[#EBEBEB]">
              <h3 className="text-lg font-bold text-[#0A0A0A]">确认删除</h3>
            </div>
            <div className="p-6">
              <p className="text-[#5A5A5A] mb-6">确定要删除此审批字段吗？此操作不可撤销。</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2.5 text-sm border border-[#D5D5D5] rounded-lg hover:bg-[#F5F5F5] transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    deleteApprovalField(deleteConfirm);
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
  );
}
