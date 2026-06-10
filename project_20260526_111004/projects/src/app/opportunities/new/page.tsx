'use client';

import React, { useState, Suspense } from 'react';

export const dynamic = 'force-dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { SearchableSelect } from '@/components/ui/searchable-select';
import type { SelectOption } from '@/components/ui/searchable-select';
import { FIELD_STYLES } from '@/lib/ui-constants';

// 内联SVG图标
const ArrowLeftIcon = () => (
  <svg className="w-5 h-5 text-[#5A5A5A]" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const SaveIcon = () => (
  <svg className="w-4 h-4" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
    <polyline points="17 21 17 13 7 13 7 21"></polyline>
    <polyline points="7 3 7 8 15 8"></polyline>
  </svg>
);

const UserIcon = () => (
  <svg className="w-4 h-4" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const UsersIcon = () => (
  <svg className="w-4 h-4" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const XIcon = () => (
  <svg className="w-3 h-3" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const FileIcon = () => (
  <svg className="w-4 h-4" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
  </svg>
);

const UploadIcon = () => (
  <svg className="w-5 h-5" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4 text-white" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

// Mock客户数据
const customers = [
  { id: '1', name: '嘉兴青芯正茂企业管理合伙企业(有限合伙)' },
  { id: '2', name: '江苏鑫华半导体科技股份有限公司' },
  { id: '3', name: '上海裘瑞经贸有限公司' },
  { id: '4', name: '精诚（中国）企业管理有限公司' },
  { id: '5', name: '卡尔蔡司（上海）管理有限公司' },
];

// Mock联系人数据
const contacts = [
  { id: '1', name: '陈女士', phone: '', address: '' },
  { id: '2', name: '张正阳', phone: '+86-18168762777', address: '' },
  { id: '3', name: '丁慧', phone: '', address: '' },
  { id: '4', name: '许悦', phone: '', address: '' },
  { id: '5', name: 'Peggy', phone: '+86-13764061373', address: '' },
];

// Mock负责人数据
const responsiblePersons = ['孙颖菁', '孙敏敏', '章小玉', '倪萍', '吴佳敏', '夏赟帆', '费斌'];

// Mock协同人数据
const collaboratorsList = ['史娅娅', '顾夏莲', '任雨晨', '狄梦瑶', '廖莉', '徐玲玲'];

// 销售阶段选项（与看板视图颜色一致）
const salesStages = [
  { value: 'demand_confirmation', label: '需求确认', bg: 'bg-[#E8F4FF]', text: 'text-[#2D3BFF]' },
  { value: 'solution_quotation', label: '方案报价', bg: 'bg-[#E6FFFA]', text: 'text-[#0D9488]' },
  { value: 'business_negotiation', label: '商务谈判', bg: 'bg-[#FFF7ED]', text: 'text-[#EA580C]' },
  { value: 'following', label: '跟进中', bg: 'bg-[#FEFCE8]', text: 'text-[#CA8A04]' },
  { value: 'won', label: '赢单', bg: 'bg-[#F0FDF4]', text: 'text-[#16A34A]' },
  { value: 'lost', label: '输单', bg: 'bg-[#FEF2F2]', text: 'text-[#DC2626]' },
];

// 服务产品选项
const serviceProducts = ['货代', '关务', '仓储', '运输', '进出口', '维修', '合同物流', '一体化供应链', '其他'];

// 关系与忠诚度选项
const relationshipLoyaltyOptions = ['高', '中', '低'];

// 同行影响力选项
const peerInfluenceOptions = ['高', '中', '低'];

// 结算货币选项
const currencyOptions = ['人民币', '美元', '欧元', '日元'];

function OpportunityFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    customer: searchParams.get('customerName') || '',
    opportunityNumber: '',
    existingServiceContract: '',
    newSite: '',
    newProduct: '',
    opportunityTitle: '',
    opportunityDate: '',
    opportunityContent: '',
    biddingProject: '',
    serviceProduct: '',
    serviceRequirement: '',
    intendedSite: '',
    currency: '',
    estimatedMonthlyAmount: '',
    startTime: '',
    expectedEndTime: '',
    contact: '',
    responsiblePerson: '',
    collaborators: [] as string[],
    salesStage: '',
    otherServiceProducts: '',
    relationshipLoyalty: '',
    peerInfluence: '',
    advantages: '',
    disadvantages: '',
    opportunities: '',
    threats: '',
    attachments: [] as string[],
    biddingDocuments: [] as string[],
    remarks: '',
  });

  const [collaboratorModalOpen, setCollaboratorModalOpen] = useState(false);
  const [selectedCollaborators, setSelectedCollaborators] = useState<string[]>([]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleCollaborator = (collaborator: string) => {
    setSelectedCollaborators(prev =>
      prev.includes(collaborator)
        ? prev.filter(c => c !== collaborator)
        : [...prev, collaborator]
    );
  };

  const saveCollaborators = () => {
    setFormData(prev => ({ ...prev, collaborators: selectedCollaborators }));
    setCollaboratorModalOpen(false);
  };

  const handleSave = () => {
    console.log('保存商机:', formData);
    router.push('/opportunities');
  };

  const handleCancel = () => {
    router.push('/opportunities');
  };

  const handleClear = () => {
    setFormData({
      customer: '', opportunityNumber: '', existingServiceContract: '', newSite: '', newProduct: '',
      opportunityTitle: '', opportunityDate: '', opportunityContent: '', biddingProject: '',
      serviceProduct: '', serviceRequirement: '', intendedSite: '', currency: '',
      estimatedMonthlyAmount: '', startTime: '', expectedEndTime: '', contact: '',
      responsiblePerson: '', collaborators: [], salesStage: '', otherServiceProducts: '',
      relationshipLoyalty: '', peerInfluence: '', advantages: '', disadvantages: '',
      opportunities: '', threats: '', attachments: [], biddingDocuments: [], remarks: '',
    });
    setSelectedCollaborators([]);
  };

  const selectedContact = contacts.find(c => c.id === formData.contact);

  const inputClass = FIELD_STYLES.input;
  const labelClass = FIELD_STYLES.label;
  const sectionTitleClass = "text-sm font-semibold text-[#0A0A0A] mb-4";

  return (<>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 顶部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/opportunities')} className="p-2 rounded-lg hover:bg-[#F5F5F5]">
              <ArrowLeftIcon />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#0A0A0A]">新建商机</h1>
              <p className="text-[#5A5A5A] mt-1">创建新的销售商机，跟踪商机进展和成交情况</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm bg-white border border-[#EBEBEB] text-[#0A0A0A] rounded-xl hover:bg-[#F5F5F5] transition-all"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm bg-[#2D3BFF] text-white rounded-xl hover:opacity-90 active:scale-[0.98] transition-all inline-flex items-center gap-2 shadow-sm"
            >
              <PlusIcon /> 保存
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 左侧 - 主要表单 */}
          <div className="col-span-7 space-y-6">
            {/* 基本信息 */}
            <div className="bg-white border border-[#EBEBEB] rounded-xl p-6 space-y-4">
              <h3 className={sectionTitleClass}>基本信息</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={labelClass}>客户 <span className="text-red-500">*</span></label>
                  <SearchableSelect
                    value={formData.customer}
                    onChange={(value) => handleInputChange('customer', value)}
                    options={customers.map(c => ({ value: c.id, label: c.name }))}
                    placeholder="请选择客户"
                  />
                </div>
                <div>
                  <label className={labelClass}>商机编号</label>
                  <div className="bg-[#F5F5F5] rounded-xl px-4 py-2.5 text-sm text-[#999999]">系统自动生成</div>
                </div>
                <div>
                  <label className={labelClass}>已有服务合同 <span className="text-red-500">*</span></label>
                  <SearchableSelect
                    value={formData.existingServiceContract}
                    onChange={(value) => handleInputChange('existingServiceContract', value)}
                    options={[{ value: '是', label: '是' }, { value: '否', label: '否' }]}
                    placeholder="请选择"
                  />
                </div>
                <div>
                  <label className={labelClass}>新站点</label>
                  <SearchableSelect
                    value={formData.newSite}
                    onChange={(value) => handleInputChange('newSite', value)}
                    options={[{ value: '是', label: '是' }, { value: '否', label: '否' }]}
                    placeholder="请选择"
                  />
                </div>
                <div>
                  <label className={labelClass}>新产品</label>
                  <SearchableSelect
                    value={formData.newProduct}
                    onChange={(value) => handleInputChange('newProduct', value)}
                    options={[{ value: '是', label: '是' }, { value: '否', label: '否' }]}
                    placeholder="请选择"
                  />
                </div>
              </div>
            </div>

            {/* 商机信息 */}
            <div className="bg-white border border-[#EBEBEB] rounded-xl p-6 space-y-4">
              <h3 className={sectionTitleClass}>商机信息</h3>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>商机标题 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="请概括商机主要内容，建议格式：客户+地区+业务种类"
                    value={formData.opportunityTitle}
                    onChange={(e) => handleInputChange('opportunityTitle', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>商机获取日期 <span className="text-red-500">*</span></label>
                    <input type="date" value={formData.opportunityDate} onChange={(e) => handleInputChange('opportunityDate', e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>招标项目</label>
                    <SearchableSelect
                      value={formData.biddingProject}
                      onChange={(value) => handleInputChange('biddingProject', value)}
                      options={[{ value: '是', label: '是' }, { value: '否', label: '否' }]}
                      placeholder="请选择"
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>商机内容 <span className="text-red-500">*</span></label>
                  <textarea
                    placeholder="具体描述客户需求和商业背景"
                    value={formData.opportunityContent}
                    onChange={(e) => handleInputChange('opportunityContent', e.target.value)}
                    rows={4}
                    className={inputClass + " resize-none"}
                  />
                </div>
              </div>
            </div>

            {/* 服务信息 */}
            <div className="bg-white border border-[#EBEBEB] rounded-xl p-6 space-y-4">
              <h3 className={sectionTitleClass}>服务信息</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>服务产品 <span className="text-red-500">*</span></label>
                  <SearchableSelect
                    value={formData.serviceProduct}
                    onChange={(value) => handleInputChange('serviceProduct', value)}
                    options={serviceProducts.map(p => ({ value: p, label: p }))}
                    placeholder="请选择"
                  />
                </div>
                <div>
                  <label className={labelClass}>服务要求 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="面积、温湿度、考核KPI等"
                    value={formData.serviceRequirement}
                    onChange={(e) => handleInputChange('serviceRequirement', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>意向站点 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="请输入意向站点"
                    value={formData.intendedSite}
                    onChange={(e) => handleInputChange('intendedSite', e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* 金额与时间 */}
            <div className="bg-white border border-[#EBEBEB] rounded-xl p-6 space-y-4">
              <h3 className={sectionTitleClass}>金额与时间</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>结算货币</label>
                  <SearchableSelect
                    value={formData.currency}
                    onChange={(value) => handleInputChange('currency', value)}
                    options={currencyOptions.map(c => ({ value: c, label: c }))}
                    placeholder="请选择"
                  />
                </div>
                <div>
                  <label className={labelClass}>预估月度结算金额</label>
                  <input
                    type="text"
                    placeholder="请输入金额"
                    value={formData.estimatedMonthlyAmount}
                    onChange={(e) => handleInputChange('estimatedMonthlyAmount', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>开始时间 <span className="text-red-500">*</span></label>
                  <input type="date" value={formData.startTime} onChange={(e) => handleInputChange('startTime', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>预计结束时间 <span className="text-red-500">*</span></label>
                  <input type="date" value={formData.expectedEndTime} onChange={(e) => handleInputChange('expectedEndTime', e.target.value)} className={inputClass} />
                </div>
              </div>
            </div>

            {/* 销售阶段与关系评估 */}
            <div className="bg-white border border-[#EBEBEB] rounded-xl p-6 space-y-4">
              <h3 className={sectionTitleClass}>销售阶段与关系评估</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>销售阶段 <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-2">
                    <SearchableSelect
                      value={formData.salesStage}
                      onChange={(value) => handleInputChange('salesStage', value)}
                      options={salesStages.map(s => ({ value: s.value, label: s.label }))}
                      placeholder="请选择"
                    />
                    {formData.salesStage && (() => {
                      const stage = salesStages.find(s => s.value === formData.salesStage);
                      return stage ? (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${stage.bg} ${stage.text}`}>
                          {stage.label}
                        </span>
                      ) : null;
                    })()}
                  </div>
                </div>
                <div>
                  <label className={labelClass}>其他服务产品</label>
                  <input
                    type="text"
                    placeholder="请输入"
                    value={formData.otherServiceProducts}
                    onChange={(e) => handleInputChange('otherServiceProducts', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>关系与忠诚度 <span className="text-red-500">*</span></label>
                  <SearchableSelect
                    value={formData.relationshipLoyalty}
                    onChange={(value) => handleInputChange('relationshipLoyalty', value)}
                    options={relationshipLoyaltyOptions.map(o => ({ value: o, label: o }))}
                    placeholder="请选择"
                  />
                </div>
                <div>
                  <label className={labelClass}>同行影响力 <span className="text-red-500">*</span></label>
                  <SearchableSelect
                    value={formData.peerInfluence}
                    onChange={(value) => handleInputChange('peerInfluence', value)}
                    options={peerInfluenceOptions.map(o => ({ value: o, label: o }))}
                    placeholder="请选择"
                  />
                </div>
              </div>
            </div>

            {/* SWOT分析 */}
            <div className="bg-white border border-[#EBEBEB] rounded-xl p-6 space-y-4">
              <h3 className={sectionTitleClass}>SWOT分析</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}><span className="text-green-600">优势</span> <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="请输入" value={formData.advantages} onChange={(e) => handleInputChange('advantages', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}><span className="text-red-600">劣势</span> <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="请输入" value={formData.disadvantages} onChange={(e) => handleInputChange('disadvantages', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}><span className="text-blue-600">机会</span> <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="请输入" value={formData.opportunities} onChange={(e) => handleInputChange('opportunities', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}><span className="text-orange-600">威胁</span> <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="请输入" value={formData.threats} onChange={(e) => handleInputChange('threats', e.target.value)} className={inputClass} />
                </div>
              </div>
            </div>

            {/* 备注 */}
            <div className="bg-white border border-[#EBEBEB] rounded-xl p-6 space-y-4">
              <h3 className={sectionTitleClass}>备注</h3>
              <textarea
                placeholder="请输入备注信息"
                value={formData.remarks}
                onChange={(e) => handleInputChange('remarks', e.target.value)}
                rows={3}
                className={inputClass + " resize-none"}
              />
            </div>
          </div>

          {/* 右侧 - 联系人、人员、附件 */}
          <div className="col-span-5 space-y-6">
            {/* 联系人信息 */}
            <div className="bg-white border border-[#EBEBEB] rounded-xl p-6 space-y-4">
              <h3 className={sectionTitleClass}>联系人信息</h3>
              <div>
                <label className={labelClass}>联系人 <span className="text-red-500">*</span></label>
                <SearchableSelect
                  value={formData.contact}
                  onChange={(value) => handleInputChange('contact', value)}
                  options={contacts.map(c => ({ value: c.id, label: c.name }))}
                  placeholder="请选择联系人"
                />
              </div>
              {selectedContact && (
                <div className="bg-[#F5F5F5] rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#2D3BFF] rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {selectedContact.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[#0A0A0A]">{selectedContact.name}</div>
                      {selectedContact.phone && <div className="text-xs text-[#5A5A5A]">{selectedContact.phone}</div>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 人员信息 */}
            <div className="bg-white border border-[#EBEBEB] rounded-xl p-6 space-y-4">
              <h3 className={sectionTitleClass}>人员信息</h3>
              <div>
                <label className={labelClass}>负责人 <span className="text-red-500">*</span></label>
                <SearchableSelect
                  value={formData.responsiblePerson}
                  onChange={(value) => handleInputChange('responsiblePerson', value)}
                  options={responsiblePersons.map(p => ({ value: p, label: p }))}
                  placeholder="请选择负责人"
                />
                {formData.responsiblePerson && (
                  <div className="flex items-center gap-2 mt-2 p-2 bg-[#F5F5F5] rounded-lg">
                    <div className="w-8 h-8 bg-[#2D3BFF] rounded-full flex items-center justify-center text-white text-sm">
                      {formData.responsiblePerson.charAt(0)}
                    </div>
                    <span className="text-sm text-[#0A0A0A]">{formData.responsiblePerson}</span>
                    <button
                      className="ml-auto p-1 rounded hover:bg-[#EBEBEB]"
                      onClick={() => handleInputChange('responsiblePerson', '')}
                    >
                      <XIcon />
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className={labelClass}>协作人</label>
                <button
                  onClick={() => setCollaboratorModalOpen(true)}
                  className="w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-2.5 text-sm text-[#999999] hover:bg-[#EBEBEB] transition-all flex items-center gap-2"
                >
                  <UsersIcon /> {formData.collaborators.length > 0 ? `已选 ${formData.collaborators.length} 人` : '添加协作人'}
                </button>
                {formData.collaborators.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.collaborators.map((collaborator, idx) => (
                      <div key={idx} className="flex items-center gap-1 p-1 pr-2 bg-[#F5F5F5] rounded-lg">
                        <div className="w-6 h-6 bg-[#2D3BFF] rounded-full flex items-center justify-center text-white text-xs">
                          {collaborator.charAt(0)}
                        </div>
                        <span className="text-xs text-[#0A0A0A]">{collaborator}</span>
                        <button
                          className="p-0.5 rounded hover:bg-[#EBEBEB]"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              collaborators: prev.collaborators.filter(c => c !== collaborator)
                            }));
                          }}
                        >
                          <XIcon />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 附件 */}
            <div className="bg-white border border-[#EBEBEB] rounded-xl p-6 space-y-4">
              <h3 className={sectionTitleClass}>附件</h3>
              <div className="space-y-3">
                <div>
                  <label className={labelClass}>附件（方案PPT，SOP等）<span className="text-red-500">*</span></label>
                  <button className="w-full border-2 border-dashed border-[#EBEBEB] rounded-xl px-4 py-6 text-sm text-[#999999] hover:border-[#2D3BFF]/30 hover:text-[#2D3BFF] transition-all flex flex-col items-center gap-2">
                    <UploadIcon />
                    <span>点击上传附件（最多9个）</span>
                  </button>
                </div>
                <div>
                  <label className={labelClass}>招标文件</label>
                  <button className="w-full border-2 border-dashed border-[#EBEBEB] rounded-xl px-4 py-6 text-sm text-[#999999] hover:border-[#2D3BFF]/30 hover:text-[#2D3BFF] transition-all flex flex-col items-center gap-2">
                    <FileIcon />
                    <span>点击上传招标文件</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部操作按钮 */}
        <div className="flex items-center justify-between bg-white border border-[#EBEBEB] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm border border-[#EBEBEB] text-[#5A5A5A] rounded-xl hover:bg-[#F5F5F5] transition-all inline-flex items-center gap-2"
            >
              <SaveIcon /> 暂存
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2 text-sm border border-[#EBEBEB] text-[#5A5A5A] rounded-xl hover:bg-[#F5F5F5] transition-all"
            >
              清空
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm bg-white border border-[#EBEBEB] text-[#0A0A0A] rounded-xl hover:bg-[#F5F5F5] transition-all"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm bg-[#2D3BFF] text-white rounded-xl hover:opacity-90 active:scale-[0.98] transition-all inline-flex items-center gap-2 shadow-sm"
            >
              <PlusIcon /> 提交
            </button>
          </div>
        </div>
      </div>

      {/* 协作人选择弹窗 */}
      {collaboratorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setCollaboratorModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#0A0A0A]">选择协作人</h3>
              <button onClick={() => setCollaboratorModalOpen(false)} className="p-1 rounded-lg hover:bg-[#F5F5F5]">
                <XIcon />
              </button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {collaboratorsList.map((collaborator) => (
                <div
                  key={collaborator}
                  className={`p-3 rounded-xl cursor-pointer transition-all ${
                    selectedCollaborators.includes(collaborator)
                      ? 'bg-[#2D3BFF]/10 border border-[#2D3BFF]/30'
                      : 'bg-[#F5F5F5] hover:bg-[#EBEBEB] border border-transparent'
                  }`}
                  onClick={() => toggleCollaborator(collaborator)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#2D3BFF] rounded-full flex items-center justify-center text-white text-sm">
                      {collaborator.charAt(0)}
                    </div>
                    <span className="text-sm text-[#0A0A0A]">{collaborator}</span>
                    {selectedCollaborators.includes(collaborator) && (
                      <div className="ml-auto w-5 h-5 bg-[#2D3BFF] rounded-full flex items-center justify-center">
                        <CheckIcon />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-[#EBEBEB]">
              <button
                onClick={() => setCollaboratorModalOpen(false)}
                className="px-4 py-2 text-sm bg-white border border-[#EBEBEB] text-[#0A0A0A] rounded-xl hover:bg-[#F5F5F5] transition-all"
              >
                取消
              </button>
              <button
                onClick={saveCollaborators}
                className="px-4 py-2 text-sm bg-[#2D3BFF] text-white rounded-xl hover:opacity-90 active:scale-[0.98] transition-all"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}
  </>);
}

export default function NewOpportunityPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-[#999999]">加载中...</div>}>
      <OpportunityFormContent />
    </Suspense>
  );
}
