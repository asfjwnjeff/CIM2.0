'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';

// 内联SVG图标
const ArrowLeftIcon = () => (
  <svg className="w-5 h-5 text-[#5A5A5A]" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const UserIcon = () => (
  <svg className="w-4 h-4" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const FileIcon = () => (
  <svg className="w-4 h-4" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
  </svg>
);

// 销售阶段映射
const salesStageMap: Record<string, string> = {
  demand_confirmation: '需求确认',
  solution_quotation: '方案报价',
  business_negotiation: '商务谈判',
  following: '跟进中',
  won: '赢单',
  lost: '输单',
};

// 销售阶段颜色映射（与看板视图一致）
const stageColorMap: Record<string, { bg: string; text: string }> = {
  demand_confirmation: { bg: 'bg-[#E8F4FF]', text: 'text-[#2D3BFF]' },
  solution_quotation: { bg: 'bg-[#E6FFFA]', text: 'text-[#0D9488]' },
  business_negotiation: { bg: 'bg-[#FFF7ED]', text: 'text-[#EA580C]' },
  following: { bg: 'bg-[#FEFCE8]', text: 'text-[#CA8A04]' },
  won: { bg: 'bg-[#F0FDF4]', text: 'text-[#16A34A]' },
  lost: { bg: 'bg-[#FEF2F2]', text: 'text-[#DC2626]' },
};

// 完整示例数据
const mockOpportunities = [
  {
    id: '1',
    opportunityNumber: 'OPP-2026-05-0001',
    opportunityTitle: '应用材料-半导体设备物流需求',
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
    createdAt: '2026-05-15 09:30:00',
  },
  {
    id: '2',
    opportunityNumber: 'OPP-2026-05-0002',
    opportunityTitle: '飞雅贸易-电子产品进口仓储',
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
    createdAt: '2026-05-16 14:20:00',
  },
  {
    id: '3',
    opportunityNumber: 'OPP-2026-05-0003',
    opportunityTitle: '荏原机械-大型设备运输项目',
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
    createdAt: '2026-05-17 10:15:00',
  },
  {
    id: '4',
    opportunityNumber: 'OPP-2026-05-0004',
    opportunityTitle: '应用材料-半导体进出口服务',
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
    createdAt: '2026-05-18 11:00:00',
  },
  {
    id: '5',
    opportunityNumber: 'OPP-2026-05-0005',
    opportunityTitle: '昇先创-一体化供应链方案',
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
    createdAt: '2026-05-19 15:30:00',
  },
];

export default function OpportunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const opportunity = mockOpportunities.find(opp => opp.id === id) || mockOpportunities[0];

  const displayClass = "w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-2.5 text-sm text-[#0A0A0A]";
  const labelClass = "block text-sm font-medium text-[#5A5A5A] mb-2";
  const sectionTitleClass = "text-sm font-semibold text-[#0A0A0A] mb-4";

  return (
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 顶部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/opportunities')} className="p-2 rounded-lg hover:bg-[#F5F5F5]">
              <ArrowLeftIcon />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#0A0A0A]">商机详情</h1>
              <p className="text-[#5A5A5A] mt-1">查看商机详细信息，包括基本信息、金额和联系人</p>
            </div>
          </div>
          <button
            onClick={() => router.push(`/opportunities/${id}/edit`)}
            className="px-4 py-2 text-sm bg-[#2D3BFF] text-white rounded-xl hover:opacity-90 active:scale-[0.98] transition-all inline-flex items-center gap-2 shadow-sm"
          >
            <EditIcon /> 编辑
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 左侧 - 主要信息 */}
          <div className="col-span-7 space-y-6">
            {/* 基本信息 */}
            <div className="bg-white border border-[#EBEBEB] rounded-xl p-6 space-y-4">
              <h3 className={sectionTitleClass}>基本信息</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={labelClass}>客户</label>
                  <div className={displayClass}>{opportunity.customer}</div>
                </div>
                <div>
                  <label className={labelClass}>商机编号</label>
                  <div className={displayClass}>{opportunity.opportunityNumber}</div>
                </div>
                <div>
                  <label className={labelClass}>已有服务合同</label>
                  <div className={displayClass}>{opportunity.existingServiceContract}</div>
                </div>
                <div>
                  <label className={labelClass}>新站点</label>
                  <div className={displayClass}>{opportunity.newSite}</div>
                </div>
                <div>
                  <label className={labelClass}>新产品</label>
                  <div className={displayClass}>{opportunity.newProduct}</div>
                </div>
              </div>
            </div>

            {/* 商机信息 */}
            <div className="bg-white border border-[#EBEBEB] rounded-xl p-6 space-y-4">
              <h3 className={sectionTitleClass}>商机信息</h3>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>商机标题</label>
                  <div className={displayClass}>{opportunity.opportunityTitle}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>商机获取日期</label>
                    <div className={displayClass}>{opportunity.opportunityDate}</div>
                  </div>
                  <div>
                    <label className={labelClass}>招标项目</label>
                    <div className={displayClass}>{opportunity.biddingProject}</div>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>商机内容</label>
                  <div className={displayClass + " min-h-[80px]"}>{opportunity.opportunityContent}</div>
                </div>
              </div>
            </div>

            {/* 服务信息 */}
            <div className="bg-white border border-[#EBEBEB] rounded-xl p-6 space-y-4">
              <h3 className={sectionTitleClass}>服务信息</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>服务产品</label>
                  <div className={displayClass}>{opportunity.serviceProduct}</div>
                </div>
                <div>
                  <label className={labelClass}>服务要求</label>
                  <div className={displayClass}>{opportunity.serviceRequirement}</div>
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>意向站点</label>
                  <div className={displayClass}>{opportunity.intendedSite}</div>
                </div>
              </div>
            </div>

            {/* 金额与时间 */}
            <div className="bg-white border border-[#EBEBEB] rounded-xl p-6 space-y-4">
              <h3 className={sectionTitleClass}>金额与时间</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>结算货币</label>
                  <div className={displayClass}>{opportunity.currency}</div>
                </div>
                <div>
                  <label className={labelClass}>预估月度结算金额</label>
                  <div className={displayClass}>{opportunity.currency === '人民币' ? '¥' : '$'}{opportunity.estimatedMonthlyAmount}</div>
                </div>
                <div>
                  <label className={labelClass}>开始时间</label>
                  <div className={displayClass}>{opportunity.startTime}</div>
                </div>
                <div>
                  <label className={labelClass}>预计结束时间</label>
                  <div className={displayClass}>{opportunity.expectedEndTime}</div>
                </div>
              </div>
            </div>

            {/* 销售阶段与关系评估 */}
            <div className="bg-white border border-[#EBEBEB] rounded-xl p-6 space-y-4">
              <h3 className={sectionTitleClass}>销售阶段与关系评估</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>销售阶段</label>
                  {(() => {
                    const colors = stageColorMap[opportunity.salesStage];
                    return colors ? (
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${colors.bg} ${colors.text}`}>
                        {salesStageMap[opportunity.salesStage] || opportunity.salesStage}
                      </span>
                    ) : (
                      <div className={displayClass}>{salesStageMap[opportunity.salesStage] || opportunity.salesStage}</div>
                    );
                  })()}
                </div>
                <div>
                  <label className={labelClass}>其他服务产品</label>
                  <div className={displayClass}>{opportunity.otherServiceProducts || '-'}</div>
                </div>
                <div>
                  <label className={labelClass}>关系与忠诚度</label>
                  <div className={displayClass}>{opportunity.relationshipLoyalty}</div>
                </div>
                <div>
                  <label className={labelClass}>同行影响力</label>
                  <div className={displayClass}>{opportunity.peerInfluence}</div>
                </div>
              </div>
            </div>

            {/* SWOT分析 */}
            <div className="bg-white border border-[#EBEBEB] rounded-xl p-6 space-y-4">
              <h3 className={sectionTitleClass}>SWOT分析</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}><span className="text-green-600">优势</span></label>
                  <div className={displayClass}>{opportunity.advantages}</div>
                </div>
                <div>
                  <label className={labelClass}><span className="text-red-600">劣势</span></label>
                  <div className={displayClass}>{opportunity.disadvantages}</div>
                </div>
                <div>
                  <label className={labelClass}><span className="text-blue-600">机会</span></label>
                  <div className={displayClass}>{opportunity.opportunities}</div>
                </div>
                <div>
                  <label className={labelClass}><span className="text-orange-600">威胁</span></label>
                  <div className={displayClass}>{opportunity.threats}</div>
                </div>
              </div>
            </div>

            {/* 备注 */}
            <div className="bg-white border border-[#EBEBEB] rounded-xl p-6 space-y-4">
              <h3 className={sectionTitleClass}>备注</h3>
              <div className={displayClass + " min-h-[60px]"}>{opportunity.remarks || '-'}</div>
            </div>
          </div>

          {/* 右侧 */}
          <div className="col-span-5 space-y-6">
            {/* 联系人信息 */}
            <div className="bg-white border border-[#EBEBEB] rounded-xl p-6 space-y-4">
              <h3 className={sectionTitleClass}>联系人信息</h3>
              <div>
                <label className={labelClass}>联系人</label>
                <div className="bg-[#F5F5F5] rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#2D3BFF] rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {opportunity.contact.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[#0A0A0A]">{opportunity.contact}</div>
                      <div className="text-xs text-[#5A5A5A]">{opportunity.contactPhone}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 人员信息 */}
            <div className="bg-white border border-[#EBEBEB] rounded-xl p-6 space-y-4">
              <h3 className={sectionTitleClass}>人员信息</h3>
              <div>
                <label className={labelClass}>负责人</label>
                <div className="flex items-center gap-2 p-2 bg-[#F5F5F5] rounded-lg">
                  <div className="w-8 h-8 bg-[#2D3BFF] rounded-full flex items-center justify-center text-white text-sm">
                    {opportunity.responsiblePerson.charAt(0)}
                  </div>
                  <span className="text-sm text-[#0A0A0A]">{opportunity.responsiblePerson}</span>
                </div>
              </div>
              <div>
                <label className={labelClass}>协作人</label>
                <div className="flex flex-wrap gap-2">
                  {opportunity.collaborators.map((collaborator, idx) => (
                    <div key={idx} className="flex items-center gap-1 p-1 pr-2 bg-[#F5F5F5] rounded-lg">
                      <div className="w-6 h-6 bg-[#2D3BFF] rounded-full flex items-center justify-center text-white text-xs">
                        {collaborator.charAt(0)}
                      </div>
                      <span className="text-xs text-[#0A0A0A]">{collaborator}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 附件 */}
            <div className="bg-white border border-[#EBEBEB] rounded-xl p-6 space-y-4">
              <h3 className={sectionTitleClass}>附件</h3>
              <div className="space-y-3">
                <div>
                  <label className={labelClass}>附件（方案PPT，SOP等）</label>
                  <div className="flex items-center gap-2 p-3 bg-[#F5F5F5] rounded-xl text-sm text-[#5A5A5A]">
                    <FileIcon />
                    <span>暂无附件</span>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>招标文件</label>
                  <div className="flex items-center gap-2 p-3 bg-[#F5F5F5] rounded-xl text-sm text-[#5A5A5A]">
                    <FileIcon />
                    <span>暂无招标文件</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
