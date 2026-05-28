'use client';

import { useState } from 'react';
import { useApp } from '@/lib/store';

interface CustomerBillingField {
  id: string;
  customerId: string;
  customerName: string;
  name: string;
  options: string[];
  createdAt: number;
  updatedAt: number;
}

// 字典表中所有的字段名称（用于下拉选择）
const ALL_FIELD_NAMES = [
  '客户部门',
  'Plant',
  'Location',
  '报价单',
  '账单维度',
  '结算方式',
];

// 初始客户账单区分字段数据 - 根据账单主体规则管理中的实际数据配置
const initialCustomerFields: CustomerBillingField[] = [
  // 应用材料 (cust-001) - 规则中用到: Plant(账单主体代码), Location
  { id: 'cbf-1', customerId: 'cust-001', customerName: '应用材料', name: 'Plant', options: ['8635', '8639', '8644', '8641', '8603', '8642', '8645', '8646', '8601', '8693', '8661', '8655', '8634'], createdAt: Date.now() - 86400000 * 10, updatedAt: Date.now() - 86400000 * 2 },
  { id: 'cbf-2', customerId: 'cust-001', customerName: '应用材料', name: 'Location', options: ['0002', '0004'], createdAt: Date.now() - 86400000 * 10, updatedAt: Date.now() - 86400000 * 2 },
  // 飞雅贸易 (cust-002) - 规则中用到: 客户部门(物流部/Sales Operations Analyst部门/工程师部门/NNP 实验室部门/TMF部门)
  { id: 'cbf-4', customerId: 'cust-002', customerName: '飞雅贸易', name: '客户部门', options: ['物流部', 'Sales Operations Analyst部门', '工程师部门', 'NNP 实验室部门', 'TMF部门'], createdAt: Date.now() - 86400000 * 8, updatedAt: Date.now() - 86400000 * 3 },
  // 荏原 (cust-008) - 规则中用到: 客户部门(CMP部门/COMP部门)
  { id: 'cbf-6', customerId: 'cust-008', customerName: '荏原', name: '客户部门', options: ['CMP部门', 'COMP部门'], createdAt: Date.now() - 86400000 * 6, updatedAt: Date.now() - 86400000 * 4 },
  // 苏斯贸易 (cust-005) - 规则中用到: 客户部门(维保库/PE-保内库)
  { id: 'cbf-7', customerId: 'cust-005', customerName: '苏斯贸易', name: '客户部门', options: ['维保库', 'PE-保内库'], createdAt: Date.now() - 86400000 * 5, updatedAt: Date.now() - 86400000 * 5 },
  // 昇先创 (cust-006) - 规则中用到: 客户部门(上海部/德国部)
  { id: 'cbf-9', customerId: 'cust-006', customerName: '昇先创', name: '客户部门', options: ['上海部', '德国部'], createdAt: Date.now() - 86400000 * 4, updatedAt: Date.now() - 86400000 * 1 },
  // 华力 (cust-007) - 规则中用到: 客户部门(设备/资材/循环品/返片)
  { id: 'cbf-10', customerId: 'cust-007', customerName: '华力', name: '客户部门', options: ['设备', '资材', '循环品', '返片'], createdAt: Date.now() - 86400000 * 3, updatedAt: Date.now() - 86400000 * 1 },
  // 岛津 (cust-009) - 规则中用到: 客户部门(备件货/闲置品)
  { id: 'cbf-12', customerId: 'cust-009', customerName: '岛津', name: '客户部门', options: ['备件货', '闲置品'], createdAt: Date.now() - 86400000 * 2, updatedAt: Date.now() - 86400000 * 1 },
];

export default function BillingFieldsPage() {
  const { customers, addLog } = useApp();
  const [fields, setFields] = useState<CustomerBillingField[]>(initialCustomerFields);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingField, setEditingField] = useState<CustomerBillingField | null>(null);
  const [formData, setFormData] = useState<{
    customerId: string;
    name: string;
    options: string[];
  }>({
    customerId: '',
    name: '',
    options: [''],
  });

  // 获取筛选后的字段
  const filteredFields = selectedCustomerId === 'all'
    ? fields
    : fields.filter(f => f.customerId === selectedCustomerId);

  // 获取有字段配置的客户列表
  const customersWithFields = customers.filter(c => 
    fields.some(f => f.customerId === c.id)
  );

  // 统计
  const totalFieldsCount = fields.length;
  const selectedCustomerFieldsCount = filteredFields.length;

  // 打开新增弹窗
  const handleAdd = () => {
    setEditingField(null);
    setFormData({
      customerId: selectedCustomerId === 'all' ? '' : selectedCustomerId,
      name: '',
      options: [''],
    });
    setShowModal(true);
  };

  // 打开编辑弹窗
  const handleEdit = (field: CustomerBillingField) => {
    setEditingField(field);
    setFormData({
      customerId: field.customerId,
      name: field.name,
      options: field.options.length > 0 ? [...field.options] : [''],
    });
    setShowModal(true);
  };

  // 添加选项
  const handleAddOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, ''],
    }));
  };

  // 删除选项
  const handleRemoveOption = (index: number) => {
    if (formData.options.length > 1) {
      setFormData(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index),
      }));
    }
  };

  // 更新选项值
  const handleOptionChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => (i === index ? value : opt)),
    }));
  };

  // 获取客户名称
  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || '未知客户';
  };

  // 保存
  const handleSave = () => {
    if (!formData.customerId) {
      alert('请选择客户');
      return;
    }
    if (!formData.name.trim()) {
      alert('请选择字段名称');
      return;
    }

    const filteredOptions = formData.options.filter(opt => opt.trim() !== '');
    const customerName = getCustomerName(formData.customerId);

    if (editingField) {
      // 编辑模式
      setFields(prev => prev.map(f => 
        f.id === editingField.id 
          ? { 
              ...f, 
              customerId: formData.customerId,
              customerName,
              name: formData.name, 
              options: filteredOptions,
              updatedAt: Date.now(),
            }
          : f
      ));
      
      // 记录操作日志
      addLog({
        operator: '系统管理员',
        action: 'update',
        target: `${customerName}的账单区分字段「${formData.name}」`,
        details: `修改字段可选值为：${filteredOptions.join('、') || '无'}`,
        module: '客户信息配置管理',
      });
    } else {
      // 新增模式
      const newField: CustomerBillingField = {
        id: `cbf-${Date.now()}`,
        customerId: formData.customerId,
        customerName,
        name: formData.name,
        options: filteredOptions,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setFields(prev => [...prev, newField]);
      
      // 记录操作日志
      addLog({
        operator: '系统管理员',
        action: 'create',
        target: `${customerName}的账单区分字段「${formData.name}」`,
        details: `新增字段，可选值为：${filteredOptions.join('、') || '无'}`,
        module: '客户信息配置管理',
      });
    }

    setShowModal(false);
  };

  // 删除字段
  const handleDelete = (field: CustomerBillingField) => {
    if (confirm(`确定要删除客户「${field.customerName}」的字段「${field.name}」吗？`)) {
      setFields(prev => prev.filter(f => f.id !== field.id));
      
      addLog({
        operator: '系统管理员',
        action: 'delete',
        target: `${field.customerName}的账单区分字段「${field.name}」`,
        details: '删除字段',
        module: '客户信息配置管理',
      });
    }
  };

  // 按客户分组
  const groupedFields = filteredFields.reduce((acc, field) => {
    const customerId = field.customerId;
    if (!acc[customerId]) {
      acc[customerId] = {
        customerName: field.customerName,
        fields: [],
      };
    }
    acc[customerId].fields.push(field);
    return acc;
  }, {} as Record<string, { customerName: string; fields: CustomerBillingField[] }>);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A0A0A]">客户信息配置管理</h1>
        </div>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-[#2D3BFF] text-white rounded-lg hover:bg-[#4338CA] transition-colors flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>新增字段</span>
        </button>
      </div>

      {/* 筛选区域 */}
      <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-[#5A5A5A]">客户：</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="px-3 py-2 border border-[#EBEBEB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] min-w-[160px]"
              >
                <option value="all">全部客户</option>
                {customersWithFields.map(customer => (
                  <option key={customer.id} value={customer.id}>{customer.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* 数量统计 */}
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-[#E8EBFF] rounded-lg">
            <svg className="w-4 h-4 text-[#3B82F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span className="text-sm font-medium text-[#3B82F6]">
              {selectedCustomerId === 'all' 
                ? `总计 ${totalFieldsCount} 条字段` 
                : `${getCustomerName(selectedCustomerId)} ${selectedCustomerFieldsCount} 条字段`}
            </span>
          </div>
        </div>
      </div>

      {/* 按客户分组显示 */}
      {Object.keys(groupedFields).length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] p-12 text-center">
          <svg className="w-12 h-12 mx-auto text-[#D1D5DB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <p className="mt-4 text-[#999999]">暂无字段配置</p>
          <button
            onClick={handleAdd}
            className="mt-4 px-4 py-2 bg-[#3B82F6] text-white rounded-lg text-sm hover:bg-[#2563EB]"
          >
            新增第一个字段
          </button>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto space-y-6">
          {Object.entries(groupedFields).map(([customerId, { customerName, fields: customerFields }]) => (
            <div key={customerId} className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] overflow-hidden">
              {/* 客户标题 */}
              <div className="px-6 py-4 bg-[#F5F5F5] border-b border-[#EBEBEB] flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#3B82F6] rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-medium">{customerName.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#0A0A0A]">{customerName}</h3>
                    <p className="text-xs text-[#999999]">共 {customerFields.length} 个字段</p>
                  </div>
                </div>
              </div>

              {/* 字段列表 */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#FAFBFD] border-b border-[#EBEBEB]">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider whitespace-nowrap">序号</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider whitespace-nowrap">字段名称</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider whitespace-nowrap">可选值</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider whitespace-nowrap">可选值数量</th>
                      <th className="text-center px-6 py-3 text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider whitespace-nowrap">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerFields.map((field, index) => (
                      <tr key={field.id} className="border-b border-[#EBEBEB] hover:bg-[#F5F5F5] transition-colors">
                        <td className="px-6 py-4 text-sm text-[#5A5A5A]">{index + 1}</td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-[#0A0A0A]">{field.name}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {field.options.length > 0 ? (
                              field.options.slice(0, 5).map((opt, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 bg-[#E8EBFF] text-[#3B82F6] text-xs rounded-full"
                                >
                                  {opt}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-[#999999]">无限制（自由输入）</span>
                            )}
                            {field.options.length > 5 && (
                              <span className="px-2 py-0.5 bg-[#EBEBEB] text-[#5A5A5A] text-xs rounded-full">
                                +{field.options.length - 5}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#5A5A5A]">
                          {field.options.length > 0 ? `${field.options.length} 个` : '-'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleEdit(field)}
                              className="text-[#3B82F6] hover:text-[#2563EB] text-sm font-medium"
                            >
                              编辑
                            </button>
                            <span className="text-[#EBEBEB]">|</span>
                            <button
                              onClick={() => handleDelete(field)}
                              className="text-[#EF4444] hover:text-[#DC2626] text-sm font-medium"
                            >
                              删除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 新增/编辑弹窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="px-6 py-4 border-b border-[#EBEBEB]">
              <h3 className="text-lg font-semibold text-[#0A0A0A]">
                {editingField ? '编辑字段' : '新增字段'}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              {/* 客户选择 */}
              <div>
                <label className="block text-sm font-medium text-[#0A0A0A] mb-2">
                  客户 <span className="text-[#EF4444]">*</span>
                </label>
                <select
                  value={formData.customerId}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
                  disabled={!!editingField}
                  className="w-full px-3 py-2 border border-[#EBEBEB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] disabled:bg-[#F5F5F5] disabled:cursor-not-allowed"
                >
                  <option value="">请选择客户</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>{customer.name}</option>
                  ))}
                </select>
                {editingField && (
                  <p className="text-xs text-[#999999] mt-1">编辑时不可更改客户</p>
                )}
              </div>

              {/* 字段名称 */}
              <div>
                <label className="block text-sm font-medium text-[#0A0A0A] mb-2">
                  字段名称 <span className="text-[#EF4444]">*</span>
                </label>
                <select
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#EBEBEB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]"
                >
                  <option value="">请选择字段名称</option>
                  {ALL_FIELD_NAMES.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              {/* 可选值 */}
              <div>
                <label className="block text-sm font-medium text-[#0A0A0A] mb-2">
                  可选值
                </label>
                <p className="text-xs text-[#999999] mb-3">添加可选值后，该字段将显示为下拉单选框；不添加则为自由输入</p>
                
                <div className="space-y-2">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`选项 ${index + 1}`}
                        className="flex-1 px-3 py-2 border border-[#EBEBEB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(index)}
                        disabled={formData.options.length <= 1}
                        className={`p-2 rounded-lg transition-colors ${
                          formData.options.length <= 1
                            ? 'text-[#D1D5DB] cursor-not-allowed'
                            : 'text-[#EF4444] hover:bg-red-50'
                        }`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddOption}
                  className="mt-3 flex items-center space-x-1 text-[#3B82F6] hover:text-[#2563EB] text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>添加选项</span>
                </button>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#EBEBEB] flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-[#EBEBEB] rounded-lg text-[#5A5A5A] hover:bg-[#F5F5F5]"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-[#2D3BFF] text-white rounded-lg hover:shadow-lg"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
