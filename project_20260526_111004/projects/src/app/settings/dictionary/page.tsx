'use client';

import { useState } from 'react';
import { useApp } from '@/lib/store';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { FIELD_STYLES } from '@/lib/ui-constants';

type FieldType = 'text' | 'select' | 'multiselect' | 'number' | 'date';
type FieldCategory = 'billing' | 'business' | 'semiconductor';

interface DictionaryField {
  id: string;
  name: string;
  fieldKey: string;
  type: FieldType;
  category: FieldCategory;
  options: string[];
  required: boolean;
  description?: string;
}

// 字段类型标签
const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: '字符串',
  select: '下拉单选框',
  multiselect: '下拉多选框',
  number: '数字',
  date: '日期'
};

// 字段分类标签
const CATEGORY_LABELS: Record<FieldCategory, string> = {
  billing: '账单拆分字段',
  business: '工商档案字段',
  semiconductor: '半导体产业链字段'
};

// 初始字典数据
const initialDictionaryFields: DictionaryField[] = [
  // 账单拆分字段（可选值在客户信息配置管理中按客户配置）
  { id: 'd-1', name: '客户部门', fieldKey: 'department', type: 'select', category: 'billing', options: [], required: false },
  { id: 'd-2', name: 'Plant', fieldKey: 'plant', type: 'select', category: 'billing', options: [], required: false },
  { id: 'd-3', name: 'Location', fieldKey: 'location', type: 'select', category: 'billing', options: [], required: false },
  { id: 'd-4', name: '报价单', fieldKey: 'quotation', type: 'text', category: 'billing', options: [], required: false },
  { id: 'd-5', name: '账单维度', fieldKey: 'billingDimension', type: 'select', category: 'billing', options: [], required: false },
  { id: 'd-6', name: '结算方式', fieldKey: 'settlementMethod', type: 'select', category: 'billing', options: [], required: false },
  
  // 工商档案字段
  { id: 'd-101', name: '统一社会信用代码', fieldKey: 'unifiedSocialCreditCode', type: 'text', category: 'business', options: [], required: false },
  { id: 'd-102', name: '电话', fieldKey: 'phone', type: 'text', category: 'business', options: [], required: false },
  { id: 'd-103', name: '登记状态', fieldKey: 'registrationStatus', type: 'select', category: 'business', options: ['存续', '在业', '吊销', '注销', '停业', '清算'], required: false },
  { id: 'd-104', name: '法定代表人', fieldKey: 'legalRepresentative', type: 'text', category: 'business', options: [], required: false },
  { id: 'd-105', name: '邮箱', fieldKey: 'email', type: 'text', category: 'business', options: [], required: false },
  { id: 'd-106', name: '企业规模', fieldKey: 'enterpriseScale', type: 'select', category: 'business', options: ['微型', '小型', '中型', '大型', '超大型'], required: false },
  { id: 'd-107', name: '注册资本', fieldKey: 'registeredCapital', type: 'text', category: 'business', options: [], required: false },
  { id: 'd-108', name: '官网', fieldKey: 'website', type: 'text', category: 'business', options: [], required: false },
  { id: 'd-109', name: '成立日期', fieldKey: 'establishmentDate', type: 'date', category: 'business', options: [], required: false },
  { id: 'd-110', name: '国家（地区）', fieldKey: 'countryRegion', type: 'text', category: 'business', options: [], required: false },
  { id: 'd-111', name: '实缴资本', fieldKey: 'paidInCapital', type: 'text', category: 'business', options: [], required: false },
  { id: 'd-112', name: '组织机构代码', fieldKey: 'organizationCode', type: 'text', category: 'business', options: [], required: false },
  { id: 'd-113', name: '工商注册号', fieldKey: 'businessRegistrationNumber', type: 'text', category: 'business', options: [], required: false },
  { id: 'd-114', name: '纳税人识别号', fieldKey: 'taxpayerIdentificationNumber', type: 'text', category: 'business', options: [], required: false },
  { id: 'd-115', name: '企业类型', fieldKey: 'enterpriseType', type: 'select', category: 'business', options: ['有限责任公司', '股份有限公司', '合伙企业', '个人独资企业', '外商投资企业', '国有企业', '集体企业'], required: false },
  { id: 'd-116', name: '营业期限', fieldKey: 'businessTerm', type: 'text', category: 'business', options: [], required: false },
  { id: 'd-117', name: '纳税人资质', fieldKey: 'taxpayerQualification', type: 'select', category: 'business', options: ['一般纳税人', '小规模纳税人', '简易征收'], required: false },
  { id: 'd-118', name: '人员规模', fieldKey: 'staffSize', type: 'text', category: 'business', options: [], required: false },
  { id: 'd-119', name: '参保人数', fieldKey: 'insuredNumber', type: 'number', category: 'business', options: [], required: false },
  { id: 'd-120', name: '核准日期', fieldKey: 'approvalDate', type: 'date', category: 'business', options: [], required: false },
  { id: 'd-121', name: '所属地区', fieldKey: 'region', type: 'text', category: 'business', options: [], required: false },
  { id: 'd-122', name: '登记机关', fieldKey: 'registrationAuthority', type: 'text', category: 'business', options: [], required: false },
  { id: 'd-123', name: '英文名', fieldKey: 'englishName', type: 'text', category: 'business', options: [], required: false },
  { id: 'd-124', name: '注册地址', fieldKey: 'registeredAddress', type: 'text', category: 'business', options: [], required: false },
  { id: 'd-125', name: '通信地址', fieldKey: 'correspondenceAddress', type: 'text', category: 'business', options: [], required: false },
  { id: 'd-126', name: '经营范围', fieldKey: 'businessScope', type: 'text', category: 'business', options: [], required: false },
  
  // 半导体产业链字段
  { id: 'd-201', name: '产业链层级', fieldKey: 'industryChainLevel', type: 'select', category: 'semiconductor', options: ['上游', '中游', '下游'], required: false },
  { id: 'd-202', name: '产业链角色', fieldKey: 'industryChainRole', type: 'select', category: 'semiconductor', options: [
    'EDA 企业', 'IP 企业', '材料供应商', '掩膜版厂商', '硅片厂商', '零部件厂商', '设备供应商',
    '芯片设计企业', '晶圆厂（IDM）', '晶圆代工', '封测厂（IDM）', '封测代工',
    '分销代理商', '终端应用厂商'
  ], required: false },
  { id: 'd-203', name: '行业标签', fieldKey: 'industryTags', type: 'multiselect', category: 'semiconductor', options: [
    '半导体', '集成电路', '芯片设计', '晶圆制造', '封装测试', 'EDA', 'IP',
    '半导体材料', '半导体设备', '新能源', '汽车电子', '消费电子', '工业控制',
    '通信', '计算机', '医疗电子', '国防科技'
  ], required: false },
  { id: 'd-204', name: '上下游关系', fieldKey: 'upstreamDownstreamRelation', type: 'select', category: 'semiconductor', options: ['供应商', '代工', '采购商', '合作伙伴'], required: false },
];

export default function DictionaryPage() {
  const { addLog } = useApp();
  const [fields, setFields] = useState<DictionaryField[]>(initialDictionaryFields);
  const [activeCategory, setActiveCategory] = useState<FieldCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingField, setEditingField] = useState<DictionaryField | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    fieldKey: string;
    type: FieldType;
    category: FieldCategory;
    options: string[];
    required: boolean;
    description: string;
  }>({
    name: '',
    fieldKey: '',
    type: 'text',
    category: 'billing',
    options: [''],
    required: false,
    description: '',
  });

  // 筛选字段
  const filteredFields = fields.filter(field => {
    const matchCategory = activeCategory === 'all' || field.category === activeCategory;
    const matchSearch = !searchTerm || 
      field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.fieldKey.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  // 打开新增弹窗
  const handleAdd = () => {
    setEditingField(null);
    setFormData({
      name: '',
      fieldKey: '',
      type: 'text',
      category: 'billing',
      options: [''],
      required: false,
      description: '',
    });
    setShowModal(true);
  };

  // 打开编辑弹窗
  const handleEdit = (field: DictionaryField) => {
    setEditingField(field);
    setFormData({
      name: field.name,
      fieldKey: field.fieldKey,
      type: field.type,
      category: field.category,
      options: field.options.length > 0 ? [...field.options] : [''],
      required: field.required,
      description: field.description || '',
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

  // 保存
  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('请输入字段名称');
      return;
    }
    if (!formData.fieldKey.trim()) {
      alert('请输入字段标识');
      return;
    }

    const filteredOptions = formData.options.filter(opt => opt.trim() !== '');

    if (editingField) {
      // 编辑模式
      setFields(prev => prev.map(f => 
        f.id === editingField.id 
          ? { ...f, ...formData, options: filteredOptions }
          : f
      ));
      
      addLog({
        operator: '系统管理员',
        action: 'update',
        target: `字典字段「${formData.name}」`,
        details: `修改字段配置`,
        module: '字典管理',
      });
    } else {
      // 新增模式
      const newField: DictionaryField = {
        id: `d-${Date.now()}`,
        ...formData,
        options: filteredOptions,
      };
      setFields(prev => [...prev, newField]);
      
      addLog({
        operator: '系统管理员',
        action: 'create',
        target: `字典字段「${formData.name}」`,
        details: `新增字典字段`,
        module: '字典管理',
      });
    }

    setShowModal(false);
  };

  // 删除字段
  const handleDelete = (field: DictionaryField) => {
    if (confirm(`确定要删除字段「${field.name}」吗？`)) {
      setFields(prev => prev.filter(f => f.id !== field.id));
      
      addLog({
        operator: '系统管理员',
        action: 'delete',
        target: `字典字段「${field.name}」`,
        details: '删除字典字段',
        module: '字典管理',
      });
    }
  };

  // 统计数据
  const stats = {
    total: fields.length,
    billing: fields.filter(f => f.category === 'billing').length,
    business: fields.filter(f => f.category === 'business').length,
    semiconductor: fields.filter(f => f.category === 'semiconductor').length,
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E2340]">字典管理</h1>
          <p className="text-[#5A5A5A] mt-1">管理系统中所有字段的完整配置信息</p>
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

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div 
          onClick={() => setActiveCategory('all')}
          className={`bg-white rounded-xl p-4 border cursor-pointer transition-all ${
            activeCategory === 'all' ? 'border-[#3B82F6] shadow-md' : 'border-[#EBEBEB]'
          }`}
        >
          <div className="text-2xl font-bold text-[#1E2340]">{stats.total}</div>
          <div className="text-sm text-[#5A5A5A]">全部字段</div>
        </div>
        <div 
          onClick={() => setActiveCategory('billing')}
          className={`bg-white rounded-xl p-4 border cursor-pointer transition-all ${
            activeCategory === 'billing' ? 'border-[#3B82F6] shadow-md' : 'border-[#EBEBEB]'
          }`}
        >
          <div className="text-2xl font-bold text-[#3B82F6]">{stats.billing}</div>
          <div className="text-sm text-[#5A5A5A]">账单拆分字段</div>
        </div>
        <div 
          onClick={() => setActiveCategory('business')}
          className={`bg-white rounded-xl p-4 border cursor-pointer transition-all ${
            activeCategory === 'business' ? 'border-[#3B82F6] shadow-md' : 'border-[#EBEBEB]'
          }`}
        >
          <div className="text-2xl font-bold text-[#22C55E]">{stats.business}</div>
          <div className="text-sm text-[#5A5A5A]">工商档案字段</div>
        </div>
        <div 
          onClick={() => setActiveCategory('semiconductor')}
          className={`bg-white rounded-xl p-4 border cursor-pointer transition-all ${
            activeCategory === 'semiconductor' ? 'border-[#3B82F6] shadow-md' : 'border-[#EBEBEB]'
          }`}
        >
          <div className="text-2xl font-bold text-[#F59E0B]">{stats.semiconductor}</div>
          <div className="text-sm text-[#5A5A5A]">半导体产业链字段</div>
        </div>
      </div>

      {/* 搜索 */}
      <div className="bg-white rounded-xl p-4 border border-[#EBEBEB]">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="搜索字段名称或字段标识..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-[#EBEBEB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]"
          />
        </div>
      </div>

      {/* 字段列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F5F5F5] border-b border-[#EBEBEB]">
                <th className="text-left px-4 py-3 text-sm font-semibold text-[#1E2340] whitespace-nowrap">字段名称</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-[#1E2340] whitespace-nowrap">字段标识</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-[#1E2340] whitespace-nowrap">字段类型</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-[#1E2340] whitespace-nowrap">字段分类</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-[#1E2340] whitespace-nowrap">可选值</th>
                <th className="text-center px-4 py-3 text-sm font-semibold text-[#1E2340] whitespace-nowrap">必填</th>
                <th className="text-center px-4 py-3 text-sm font-semibold text-[#1E2340] whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredFields.map((field) => (
                <tr key={field.id} className="border-b border-[#EBEBEB] hover:bg-[#F5F5F5] transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-[#1E2340]">{field.name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs bg-[#EBEBEB] px-2 py-1 rounded text-[#5A5A5A]">{field.fieldKey}</code>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-[#E8EBFF] text-[#3B82F6] text-xs rounded-full">
                      {FIELD_TYPE_LABELS[field.type]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      field.category === 'billing' ? 'bg-blue-100 text-blue-600' :
                      field.category === 'business' ? 'bg-green-100 text-green-600' :
                      'bg-amber-100 text-amber-600'
                    }`}>
                      {CATEGORY_LABELS[field.category]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {field.category === 'billing' ? (
                      <span className="text-xs text-[#3B82F6]">在客户信息配置管理中设置</span>
                    ) : field.options.length > 0 ? (
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {field.options.slice(0, 3).map((opt, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-[#EBEBEB] text-[#5A5A5A] text-xs rounded">
                            {opt}
                          </span>
                        ))}
                        {field.options.length > 3 && (
                          <span className="px-1.5 py-0.5 bg-[#EBEBEB] text-[#999999] text-xs rounded">
                            +{field.options.length - 3}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-[#999999]">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {field.required ? (
                      <span className="text-[#22C55E]">✓</span>
                    ) : (
                      <span className="text-[#D1D5DB]">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
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

        {filteredFields.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-12 h-12 mx-auto text-[#D1D5DB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-4 text-[#999999]">暂无匹配的字段</p>
          </div>
        )}
      </div>

      {/* 新增/编辑弹窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 my-8">
            <div className="px-6 py-4 border-b border-[#EBEBEB]">
              <h3 className="text-lg font-semibold text-[#1E2340]">
                {editingField ? '编辑字段' : '新增字段'}
              </h3>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* 字段名称 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1E2340] mb-2">
                    字段名称 <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="请输入字段名称"
                    className="w-full px-3 py-2 border border-[#EBEBEB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1E2340] mb-2">
                    字段标识 <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fieldKey}
                    onChange={(e) => setFormData(prev => ({ ...prev, fieldKey: e.target.value }))}
                    placeholder="如：department"
                    className="w-full px-3 py-2 border border-[#EBEBEB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]"
                  />
                </div>
              </div>

              {/* 字段类型和分类 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1E2340] mb-2">字段类型</label>
                  <SearchableSelect
                    value={formData.type}
                    onChange={(value) => setFormData(prev => ({ ...prev, type: value as FieldType }))}
                    options={[
                      { value: 'text', label: '字符串' },
                      { value: 'select', label: '下拉单选框' },
                      { value: 'multiselect', label: '下拉多选框' },
                      { value: 'number', label: '数字' },
                      { value: 'date', label: '日期' },
                    ]}
                    placeholder="请选择字段类型"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1E2340] mb-2">字段分类</label>
                  <SearchableSelect
                    value={formData.category}
                    onChange={(value) => setFormData(prev => ({ ...prev, category: value as FieldCategory }))}
                    options={[
                      { value: 'billing', label: '账单拆分字段' },
                      { value: 'business', label: '工商档案字段' },
                      { value: 'semiconductor', label: '半导体产业链字段' },
                    ]}
                    placeholder="请选择字段分类"
                  />
                </div>
              </div>

              {/* 可选值 */}
              <div>
                <label className="block text-sm font-medium text-[#1E2340] mb-2">
                  可选值
                </label>
                
                {formData.category === 'billing' ? (
                  <div className="px-4 py-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg">
                    <p className="text-sm text-[#3B82F6]">账单区分字段的可选值请在「客户信息配置管理」中按客户进行配置</p>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-[#999999] mb-3">适用于下拉单选框和下拉多选框类型，每行一个选项</p>
                    
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
                  </>
                )}
              </div>

              {/* 是否必填 */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="required"
                  checked={formData.required}
                  onChange={(e) => setFormData(prev => ({ ...prev, required: e.target.checked }))}
                  className="w-4 h-4 text-[#3B82F6] border-[#EBEBEB] rounded focus:ring-[#3B82F6]"
                />
                <label htmlFor="required" className="text-sm text-[#1E2340]">
                  设为必填字段
                </label>
              </div>

              {/* 字段描述 */}
              <div>
                <label className="block text-sm font-medium text-[#1E2340] mb-2">字段描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="可选，用于说明字段用途"
                  rows={2}
                  className="w-full px-3 py-2 border border-[#EBEBEB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]"
                />
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
