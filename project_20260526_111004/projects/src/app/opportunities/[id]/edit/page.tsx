'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

const SaveIcon = () => (
  <svg className="w-4 h-4" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
    <polyline points="17 21 17 13 7 13 7 21"></polyline>
    <polyline points="7 3 7 8 15 8"></polyline>
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
  { id: '1', name: '应用材料(中国)有限公司' },
  { id: '2', name: '飞雅贸易(上海)有限公司' },
  { id: '3', name: '荏原机械(中国)有限公司' },
  { id: '4', name: '昇先创(上海)贸易有限公司' },
];

// Mock联系人数据
const contacts = [
  { id: '1', name: '李总', phone: '+86-138-0000-0001' },
  { id: '2', name: '王经理', phone: '+86-139-0000-0002' },
  { id: '3', name: '张总监', phone: '+86-137-0000-0003' },
  { id: '4', name: '刘总', phone: '+86-136-0000-0004' },
  { id: '5', name: '陈总监', phone: '+86-135-0000-0005' },
];

// Mock负责人数据
const responsiblePersons = ['李雪', '王磊', '张伟', '陈静', '赵敏', '孙颖菁', '章小玉'];

// Mock协同人数据
const collaboratorsList = ['李雪', '王磊', '张伟', '陈静', '赵敏', '史娅娅', '顾夏莲', '任雨晨'];

// 销售阶段选项
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

// 完整示例数据
const mockOpportunities = [
  {
    id: '1',
    opportunityNumber: 'OPP-2026-05-0001',
    opportunityTitle: '应用材料-半导体设备物流需求',
    customerId: '1',
    customer: '应用材料(中国)有限公司',
    existingServiceContract: '是',
    newSite: '否',
    newProduct: '是',
    opportunityDate: '2026-05-15',
    biddingProject: '否',
    opportunityContent: '客户有半导体设备进口物流需求，需要评估货代服务能力，包括海运、空运、报关等全流程服务',
    serviceProduct: '货代',
    serviceRequirement: '恒温恒湿仓库，防静电包装，精密设备搬运',
    intendedSite: '上海浦东新区张江高科技园区',
    currency: '人民币',
    estimatedMonthlyAmount: '200,000',
    startTime: '2026-06-01',
    expectedEndTime: '2027-05-31',
    contactId: '1',
    contact: '李总',
    contactPhone: '+86-138-0000-0001',
    responsiblePerson: '李雪',
    collaborators: ['王磊', '张伟'],
    salesStage: 'demand_confirmation',
    otherServiceProducts: '关务',
    relationshipLoyalty: '高',
    peerInfluence: '中',
    advantages: '长期合作关系，客户信任度高',
    disadvantages: '竞争对手价格优势明显',
    opportunities: '半导体行业扩产，物流需求增长',
    threats: '国际局势不确定，供应链风险',
    remarks: '客户需求比较明确，需要尽快给出方案',
  },
  {
    id: '2',
    opportunityNumber: 'OPP-2026-05-0002',
    opportunityTitle: '飞雅贸易-电子产品进口仓储',
    customerId: '2',
    customer: '飞雅贸易(上海)有限公司',
    existingServiceContract: '否',
    newSite: '是',
    newProduct: '否',
    opportunityDate: '2026-05-16',
    biddingProject: '否',
    opportunityContent: '客户需要上海地区的仓储服务，用于电子产品进口存储，要求恒温恒湿环境',
    serviceProduct: '仓储',
    serviceRequirement: '恒温恒湿仓库，温度20±2℃，湿度45-65%，面积2000㎡',
    intendedSite: '上海外高桥保税区',
    currency: '人民币',
    estimatedMonthlyAmount: '80,000',
    startTime: '2026-07-01',
    expectedEndTime: '2027-06-30',
    contactId: '2',
    contact: '王经理',
    contactPhone: '+86-139-0000-0002',
    responsiblePerson: '王磊',
    collaborators: ['陈静'],
    salesStage: 'solution_quotation',
    otherServiceProducts: '',
    relationshipLoyalty: '中',
    peerInfluence: '低',
    advantages: '仓库条件优越，地理位置便利',
    disadvantages: '报价偏高，需要优化成本',
    opportunities: '跨境电商发展带动仓储需求',
    threats: '多家仓储企业竞争激烈',
    remarks: '客户对仓储条件要求较高，需要恒温恒湿',
  },
  {
    id: '3',
    opportunityNumber: 'OPP-2026-05-0003',
    opportunityTitle: '荏原机械-大型设备运输项目',
    customerId: '3',
    customer: '荏原机械(中国)有限公司',
    existingServiceContract: '是',
    newSite: '否',
    newProduct: '否',
    opportunityDate: '2026-05-17',
    biddingProject: '是',
    opportunityContent: '机械制造企业有大型设备运输需求，包括泵类设备的公路运输和吊装服务',
    serviceProduct: '运输',
    serviceRequirement: '超限设备运输，需特种车辆，最大单件重量30吨',
    intendedSite: '上海闵行工业区',
    currency: '人民币',
    estimatedMonthlyAmount: '150,000',
    startTime: '2026-06-15',
    expectedEndTime: '2026-12-31',
    contactId: '3',
    contact: '张总监',
    contactPhone: '+86-137-0000-0003',
    responsiblePerson: '张伟',
    collaborators: ['李雪', '赵敏'],
    salesStage: 'business_negotiation',
    otherServiceProducts: '货代',
    relationshipLoyalty: '高',
    peerInfluence: '高',
    advantages: '丰富的超限运输经验，专业团队',
    disadvantages: '运力紧张，需要协调车辆',
    opportunities: '制造业复苏带动设备运输需求',
    threats: '客户预算有限，压价明显',
    remarks: '价格谈判中，客户希望有一定的折扣',
  },
  {
    id: '4',
    opportunityNumber: 'OPP-2026-05-0004',
    opportunityTitle: '应用材料-半导体进出口服务',
    customerId: '1',
    customer: '应用材料(中国)有限公司',
    existingServiceContract: '是',
    newSite: '否',
    newProduct: '是',
    opportunityDate: '2026-05-18',
    biddingProject: '否',
    opportunityContent: '半导体产品进出口代理服务需求，包括报关、报检、外汇结算等全流程服务',
    serviceProduct: '进出口',
    serviceRequirement: '快速通关，24小时内完成报关，合规性强',
    intendedSite: '上海浦东国际机场',
    currency: '美元',
    estimatedMonthlyAmount: '300,000',
    startTime: '2026-07-01',
    expectedEndTime: '2027-06-30',
    contactId: '4',
    contact: '刘总',
    contactPhone: '+86-136-0000-0004',
    responsiblePerson: '李雪',
    collaborators: ['王磊'],
    salesStage: 'following',
    otherServiceProducts: '关务, 货代',
    relationshipLoyalty: '高',
    peerInfluence: '中',
    advantages: '专业进出口团队，通关效率高',
    disadvantages: '汇率波动影响利润',
    opportunities: '半导体进出口量持续增长',
    threats: '贸易政策变化带来不确定性',
    remarks: '客户有长期合作意向，需要持续跟进',
  },
  {
    id: '5',
    opportunityNumber: 'OPP-2026-05-0005',
    opportunityTitle: '昇先创-一体化供应链方案',
    customerId: '4',
    customer: '昇先创(上海)贸易有限公司',
    existingServiceContract: '否',
    newSite: '是',
    newProduct: '是',
    opportunityDate: '2026-05-19',
    biddingProject: '是',
    opportunityContent: '客户需要一体化供应链解决方案，涵盖货代、仓储、运输、关务等全方位服务',
    serviceProduct: '一体化供应链',
    serviceRequirement: '全链条服务，包括国际物流、仓储管理、国内配送、关务合规',
    intendedSite: '上海松江综合保税区',
    currency: '人民币',
    estimatedMonthlyAmount: '500,000',
    startTime: '2026-08-01',
    expectedEndTime: '2028-07-31',
    contactId: '5',
    contact: '陈总监',
    contactPhone: '+86-135-0000-0005',
    responsiblePerson: '陈静',
    collaborators: ['李雪', '王磊', '张伟'],
    salesStage: 'solution_quotation',
    otherServiceProducts: '',
    relationshipLoyalty: '中',
    peerInfluence: '高',
    advantages: '一站式服务能力，资源整合优势',
    disadvantages: '项目复杂度高，管理难度大',
    opportunities: '供应链一体化是行业趋势',
    threats: '大型物流企业同样具备一体化能力',
    remarks: '客户正在制定方案报价，需要尽快完成方案设计',
  },
];

export default function EditOpportunityPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const opportunity = mockOpportunities.find(opp => opp.id === id) || mockOpportunities[0];

  const [formData, setFormData] = useState({
    customer: opportunity.customerId,
    existingServiceContract: opportunity.existingServiceContract,
    newSite: opportunity.newSite,
    newProduct: opportunity.newProduct,
    opportunityTitle: opportunity.opportunityTitle,
    opportunityDate: opportunity.opportunityDate,
    opportunityContent: opportunity.opportunityContent,
    biddingProject: opportunity.biddingProject,
    serviceProduct: opportunity.serviceProduct,
    serviceRequirement: opportunity.serviceRequirement,
    intendedSite: opportunity.intendedSite,
    currency: opportunity.currency,
    estimatedMonthlyAmount: opportunity.estimatedMonthlyAmount,
    startTime: opportunity.startTime,
    expectedEndTime: opportunity.expectedEndTime,
    contact: opportunity.contactId,
    responsiblePerson: opportunity.responsiblePerson,
    collaborators: opportunity.collaborators,
    salesStage: opportunity.salesStage,
    otherServiceProducts: opportunity.otherServiceProducts,
    relationshipLoyalty: opportunity.relationshipLoyalty,
    peerInfluence: opportunity.peerInfluence,
    advantages: opportunity.advantages,
    disadvantages: opportunity.disadvantages,
    opportunities: opportunity.opportunities,
    threats: opportunity.threats,
    remarks: opportunity.remarks,
  });

  const [collaboratorModalOpen, setCollaboratorModalOpen] = useState(false);
  const [selectedCollaborators, setSelectedCollaborators] = useState<string[]>(opportunity.collaborators);

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
              <h1 className="text-2xl font-bold text-[#0A0A0A]">编辑商机</h1>
              <p className="text-[#5A5A5A] mt-1">编辑商机信息，修改商机内容和进展状态</p>
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
              <SaveIcon /> 保存
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
                  <div className="bg-[#F5F5F5] rounded-xl px-4 py-2.5 text-sm text-[#999999]">{opportunity.opportunityNumber}</div>
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
                  <input type="text" value={formData.opportunityTitle} onChange={(e) => handleInputChange('opportunityTitle', e.target.value)} className={inputClass} />
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
                  <textarea value={formData.opportunityContent} onChange={(e) => handleInputChange('opportunityContent', e.target.value)} rows={4} className={inputClass + " resize-none"} />
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
                  <input type="text" value={formData.serviceRequirement} onChange={(e) => handleInputChange('serviceRequirement', e.target.value)} className={inputClass} />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>意向站点 <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.intendedSite} onChange={(e) => handleInputChange('intendedSite', e.target.value)} className={inputClass} />
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
                  <input type="text" value={formData.estimatedMonthlyAmount} onChange={(e) => handleInputChange('estimatedMonthlyAmount', e.target.value)} className={inputClass} />
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
                  <input type="text" value={formData.otherServiceProducts} onChange={(e) => handleInputChange('otherServiceProducts', e.target.value)} className={inputClass} />
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
                  <input type="text" value={formData.advantages} onChange={(e) => handleInputChange('advantages', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}><span className="text-red-600">劣势</span> <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.disadvantages} onChange={(e) => handleInputChange('disadvantages', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}><span className="text-blue-600">机会</span> <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.opportunities} onChange={(e) => handleInputChange('opportunities', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}><span className="text-orange-600">威胁</span> <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.threats} onChange={(e) => handleInputChange('threats', e.target.value)} className={inputClass} />
                </div>
              </div>
            </div>

            {/* 备注 */}
            <div className="bg-white border border-[#EBEBEB] rounded-xl p-6 space-y-4">
              <h3 className={sectionTitleClass}>备注</h3>
              <textarea value={formData.remarks} onChange={(e) => handleInputChange('remarks', e.target.value)} rows={3} className={inputClass + " resize-none"} />
            </div>
          </div>

          {/* 右侧 */}
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
                <div className="bg-[#F5F5F5] rounded-xl p-4">
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
                <div className="flex items-center gap-2">
                  {formData.responsiblePerson ? (
                    <span className="inline-flex items-center px-3 py-1.5 bg-[#F0F1FF] text-[#2D3BFF] rounded-lg text-sm font-medium">{formData.responsiblePerson}</span>
                  ) : (
                    <span className="text-sm text-[#999]">—</span>
                  )}
                </div>
              </div>
              <div>
                <label className={labelClass}>协作人</label>
                <div className="flex flex-wrap gap-1.5">
                  {(formData.collaborators || []).length > 0 ? formData.collaborators.map((c: string, i: number) => (
                    <span key={i} className="inline-flex items-center px-3 py-1.5 bg-[#F0F1FF] text-[#2D3BFF] rounded-lg text-sm">{c}</span>
                  )) : <span className="text-sm text-[#999]">—</span>}
                </div>
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
          <div></div>
          <div className="flex items-center gap-3">
            <button onClick={handleCancel} className="px-4 py-2 text-sm bg-white border border-[#EBEBEB] text-[#0A0A0A] rounded-xl hover:bg-[#F5F5F5] transition-all">
              取消
            </button>
            <button onClick={handleSave} className="px-4 py-2 text-sm bg-[#2D3BFF] text-white rounded-xl hover:opacity-90 active:scale-[0.98] transition-all inline-flex items-center gap-2 shadow-sm">
              <SaveIcon /> 保存
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
              <button onClick={() => setCollaboratorModalOpen(false)} className="px-4 py-2 text-sm bg-white border border-[#EBEBEB] text-[#0A0A0A] rounded-xl hover:bg-[#F5F5F5] transition-all">
                取消
              </button>
              <button onClick={saveCollaborators} className="px-4 py-2 text-sm bg-[#2D3BFF] text-white rounded-xl hover:opacity-90 active:scale-[0.98] transition-all">
                确认
              </button>
            </div>
          </div>
        </div>
      )}
  </>);
}
