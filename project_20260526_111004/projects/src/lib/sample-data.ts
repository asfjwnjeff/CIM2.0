import { 
  Customer, 
  BillingEntity, 
  SplitField,
  Quote,
  QuoteItem,
  QuoteCollaborator,
  QuoteHistory,
  QuoteStatus,
  QuoteTemplate,
  ApprovalWorkflow,
  AutoApprovalRule,
  ServiceProduct,
  ApprovalNodeType,
  AutoApprovalOperator,
  AutoApprovalActionType,
  BillingRule,
} from './types';

// 报价单状态标签
export const QUOTE_STATUS_LABELS: Record<string, string> = {
  draft: '草稿',
  pending_review: '待审批',
  approved: '已批准',
  rejected: '已拒绝',
  accepted: '客户已接受',
  sent: '已发送',
  transferred: '已转CPQ'
};

// 预置拆分字段 - 新增工商和半导体产业链字段
export const initialSplitFields: SplitField[] = [
  // 原有账单拆分字段
  { id: 'f-1', name: '客户部门', fieldKey: 'department', type: 'select', options: ['FWD', 'RVC', 'TKM'], required: false },
  { id: 'f-2', name: 'Plant', fieldKey: 'plant', type: 'text', required: false },
  { id: 'f-3', name: 'Location', fieldKey: 'location', type: 'text', required: false },
  { id: 'f-4', name: '报价单', fieldKey: 'quotation', type: 'text', required: false },
  { id: 'f-5', name: '账单维度', fieldKey: 'billingDimension', type: 'select', options: ['物流部', '工程师部门', 'NNP实验室部门', 'TMF部门', 'CMP部门', 'COMP部门', '维保库', '寄售库', '公用库', '销售库', '设备', '资材', '循环品', '返片'], required: false },
  { id: 'f-6', name: '结算方式', fieldKey: 'settlementMethod', type: 'select', options: ['单独报价单', '一份报价单'], required: false },
  
  // 企业工商全量档案字段
  { id: 'f-101', name: '统一社会信用代码', fieldKey: 'unifiedSocialCreditCode', type: 'text', required: false },
  { id: 'f-102', name: '电话', fieldKey: 'phone', type: 'text', required: false },
  { id: 'f-103', name: '登记状态', fieldKey: 'registrationStatus', type: 'select', options: ['存续', '在业', '吊销', '注销', '停业', '清算'], required: false },
  { id: 'f-104', name: '法定代表人', fieldKey: 'legalRepresentative', type: 'text', required: false },
  { id: 'f-105', name: '邮箱', fieldKey: 'email', type: 'text', required: false },
  { id: 'f-106', name: '企业规模', fieldKey: 'enterpriseScale', type: 'select', options: ['微型', '小型', '中型', '大型', '超大型'], required: false },
  { id: 'f-107', name: '注册资本', fieldKey: 'registeredCapital', type: 'text', required: false },
  { id: 'f-108', name: '官网', fieldKey: 'website', type: 'text', required: false },
  { id: 'f-109', name: '成立日期', fieldKey: 'establishmentDate', type: 'text', required: false },
  { id: 'f-110', name: '国家（地区）', fieldKey: 'countryRegion', type: 'text', required: false },
  { id: 'f-111', name: '实缴资本', fieldKey: 'paidInCapital', type: 'text', required: false },
  { id: 'f-112', name: '组织机构代码', fieldKey: 'organizationCode', type: 'text', required: false },
  { id: 'f-113', name: '工商注册号', fieldKey: 'businessRegistrationNumber', type: 'text', required: false },
  { id: 'f-114', name: '纳税人识别号', fieldKey: 'taxpayerIdentificationNumber', type: 'text', required: false },
  { id: 'f-115', name: '企业类型', fieldKey: 'enterpriseType', type: 'select', options: ['有限责任公司', '股份有限公司', '合伙企业', '个人独资企业', '外商投资企业', '国有企业', '集体企业'], required: false },
  { id: 'f-116', name: '营业期限', fieldKey: 'businessTerm', type: 'text', required: false },
  { id: 'f-117', name: '纳税人资质', fieldKey: 'taxpayerQualification', type: 'select', options: ['一般纳税人', '小规模纳税人', '简易征收'], required: false },
  { id: 'f-118', name: '人员规模', fieldKey: 'staffSize', type: 'text', required: false },
  { id: 'f-119', name: '参保人数', fieldKey: 'insuredNumber', type: 'text', required: false },
  { id: 'f-120', name: '核准日期', fieldKey: 'approvalDate', type: 'text', required: false },
  { id: 'f-121', name: '所属地区', fieldKey: 'region', type: 'text', required: false },
  { id: 'f-122', name: '登记机关', fieldKey: 'registrationAuthority', type: 'text', required: false },
  { id: 'f-123', name: '英文名', fieldKey: 'englishName', type: 'text', required: false },
  { id: 'f-124', name: '注册地址', fieldKey: 'registeredAddress', type: 'text', required: false },
  { id: 'f-125', name: '通信地址', fieldKey: 'correspondenceAddress', type: 'text', required: false },
  { id: 'f-126', name: '经营范围', fieldKey: 'businessScope', type: 'text', required: false },
  
  // 半导体产业链专属业务字段
  { id: 'f-201', name: '产业链层级', fieldKey: 'industryChainLevel', type: 'select', options: ['上游', '中游', '下游'], required: false },
  { id: 'f-202', name: '产业链角色', fieldKey: 'industryChainRole', type: 'select', options: [
    'EDA 企业', 'IP 企业', '材料供应商', '掩膜版厂商', '硅片厂商', '零部件厂商', '设备供应商',
    '芯片设计企业', '晶圆厂（IDM）', '晶圆代工', '封测厂（IDM）', '封测代工',
    '分销代理商', '终端应用厂商'
  ], required: false },
  { id: 'f-203', name: '行业标签', fieldKey: 'industryTags', type: 'multiselect', options: [
    '半导体', '集成电路', '芯片设计', '晶圆制造', '封装测试', 'EDA', 'IP',
    '半导体材料', '半导体设备', '新能源', '汽车电子', '消费电子', '工业控制',
    '通信', '计算机', '医疗电子', '国防科技'
  ], required: false },
  { id: 'f-204', name: '上下游关系', fieldKey: 'upstreamDownstreamRelation', type: 'select', options: ['供应商', '代工', '采购商', '合作伙伴'], required: false },
];

// ============ 常量定义 ============

// 字段类型标签
export const FIELD_TYPE_LABELS: Record<string, string> = {
  text: '字符串',
  select: '下拉选择',
  multiselect: '多选',
  number: '数字',
  date: '日期'
};

// 字段分类标签和描述
export const CATEGORY_LABELS: Record<string, string> = {
  all: '全部字段',
  billing: '账单拆分字段',
  business: '工商档案字段',
  semiconductor: '半导体产业链字段'
};

export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  all: '查看和管理所有字段配置',
  billing: '账单拆分专属区分字段',
  business: '企业工商全量档案字段',
  semiconductor: '半导体产业链专属业务字段'
};

// 产业链层级标签和颜色
export const INDUSTRY_CHAIN_LEVEL_LABELS: Record<string, string> = {
  upstream: '上游',
  midstream: '中游',
  downstream: '下游'
};

export const INDUSTRY_CHAIN_LEVEL_COLORS: Record<string, { bg: string; text: string }> = {
  upstream: { bg: 'bg-[#E8EBFF]', text: 'text-[#2D3BFF]' },
  midstream: { bg: 'bg-[#E6F7F0]', text: 'text-[#00A870]' },
  downstream: { bg: 'bg-[#FFF4E8]', text: 'text-[#FF8A00]' }
};

// 产业链角色标签
export const INDUSTRY_CHAIN_ROLE_LABELS: Record<string, string> = {
  eda: 'EDA 企业',
  ip: 'IP 企业',
  material: '材料供应商',
  mask: '掩膜版厂商',
  wafer: '硅片厂商',
  component: '零部件厂商',
  equipment: '设备供应商',
  design: '芯片设计企业',
  idm: '晶圆厂（IDM）',
  wafer_foundry: '晶圆代工',
  osat: '封测厂（IDM）',
  osat_foundry: '封测代工',
  distributor: '分销代理商',
  end_user: '终端应用厂商'
};

export const UPSTREAM_ROLE_LABELS: Record<string, string> = {
  eda: 'EDA 企业',
  ip: 'IP 企业',
  material: '材料供应商',
  mask: '掩膜版厂商',
  wafer: '硅片厂商',
  component: '零部件厂商',
  equipment: '设备供应商'
};

export const MIDSTREAM_ROLE_LABELS: Record<string, string> = {
  design: '芯片设计企业',
  idm: '晶圆厂（IDM）',
  wafer_foundry: '晶圆代工',
  osat: '封测厂（IDM）',
  osat_foundry: '封测代工'
};

export const DOWNSTREAM_ROLE_LABELS: Record<string, string> = {
  distributor: '分销代理商',
  end_user: '终端应用厂商'
};

export const ALL_ROLE_LABELS: Record<string, string> = {
  ...UPSTREAM_ROLE_LABELS,
  ...MIDSTREAM_ROLE_LABELS,
  ...DOWNSTREAM_ROLE_LABELS
};

// 上下游关系标签
export const RELATION_LABELS: Record<string, string> = {
  supplier: '供应商',
  foundry: '代工',
  customer: '采购商',
  partner: '合作伙伴'
};

// ==================== 跟进进度 ====================

export const PROGRESS_STEPS = [
  'newly_acquired',
  'preliminary_intent',
  'pending_followup',
  'new_opportunity',
  'deal_closed',
  'invalid',
] as const;

export const PROGRESS_STATUS_LABELS: Record<string, string> = {
  newly_acquired: '新获取',
  preliminary_intent: '初步意向',
  pending_followup: '待跟进',
  new_opportunity: '新商机',
  deal_closed: '成交',
  invalid: '失效',
};

export const PROGRESS_STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  newly_acquired: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  preliminary_intent: { bg: 'bg-cyan-100', text: 'text-cyan-700', dot: 'bg-cyan-500' },
  pending_followup: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  new_opportunity: { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
  deal_closed: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  invalid: { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400' },
};

// ==================== 模拟用户列表 ====================

export interface MockUser {
  id: string;
  name: string;
  email: string;
  department: string;
  avatar?: string;
}

export const MOCK_USERS: MockUser[] = [
  { id: 'user-1', name: '方远', email: 'fangyuan@company.com', department: '产品部' },
  { id: 'user-2', name: '张明华', email: 'zhangmh@company.com', department: '销售部' },
  { id: 'user-3', name: '李经理', email: 'lijl@company.com', department: '客户成功部' },
  { id: 'user-4', name: '王顾问', email: 'wangbw@company.com', department: '技术部' },
  { id: 'user-5', name: '陈总监', email: 'chenzong@company.com', department: '运营部' },
  { id: 'user-6', name: '刘助理', email: 'liuzl@company.com', department: '销售部' },
  { id: 'user-7', name: '赵总', email: 'zhaoz@company.com', department: '管理层' },
  { id: 'user-8', name: '孙经理', email: 'sunm@company.com', department: '财务部' },
];

// 客户状态颜色
export const getCustomerStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-[#E6F7F0] text-[#00A870]';
    case 'inactive': return 'bg-[#EEEEEE] text-[#666666]';
    case 'pending': return 'bg-[#FFF4E8] text-[#FF8A00]';
    default: return 'bg-[#EEEEEE] text-[#666666]';
  }
};

// 获取产业链层级图标
export const getCustomerLevelIcon = (level: string) => {
  switch (level) {
    case 'upstream': return '🔺';
    case 'midstream': return '⬛';
    case 'downstream': return '🔻';
    default: return '⬛';
  }
};

// 获取产业链角色标签
export const getCustomerChainRoleLabel = (role: string) => {
  return ALL_ROLE_LABELS[role] || role;
};

// 导出字段分组
export const INITIAL_SPLIT_FIELDS = initialSplitFields.filter(f => 
  ['department', 'plant', 'location', 'quotation', 'billingDimension', 'settlementMethod'].includes(f.fieldKey || '')
);

export const BUSINESS_FIELDS = initialSplitFields.filter(f => 
  (f.fieldKey || '').startsWith('unified') || 
  (f.fieldKey || '').startsWith('phone') ||
  (f.fieldKey || '').startsWith('registration') ||
  (f.fieldKey || '').startsWith('legal') ||
  (f.fieldKey || '').startsWith('email') ||
  (f.fieldKey || '').startsWith('enterprise') ||
  (f.fieldKey || '').startsWith('registered') ||
  (f.fieldKey || '').startsWith('website') ||
  (f.fieldKey || '').startsWith('establishment') ||
  (f.fieldKey || '').startsWith('country') ||
  (f.fieldKey || '').startsWith('paid') ||
  (f.fieldKey || '').startsWith('organization') ||
  (f.fieldKey || '').startsWith('business') ||
  (f.fieldKey || '').startsWith('taxpayer') ||
  (f.fieldKey || '').startsWith('staff') ||
  (f.fieldKey || '').startsWith('insured') ||
  (f.fieldKey || '').startsWith('approval') ||
  (f.fieldKey || '').startsWith('region') ||
  (f.fieldKey || '').startsWith('english') ||
  (f.fieldKey || '').startsWith('correspondence')
);

export const SEMICONDUCTOR_FIELDS = initialSplitFields.filter(f => 
  (f.fieldKey || '').startsWith('industry') || (f.fieldKey || '').startsWith('upstream')
);

export const ALL_FIELDS = [...INITIAL_SPLIT_FIELDS, ...BUSINESS_FIELDS, ...SEMICONDUCTOR_FIELDS];


// 预置账单主体
export const initialBillingEntities: BillingEntity[] = [
  // 应用材料账单主体
  { id: 'be-1', name: 'FWD-8635', code: '8635', status: 'active', createdAt: '2024-01-01' },
  { id: 'be-2', name: 'FWD-8639&8641', code: '8639,8641', status: 'active', createdAt: '2024-01-01' },
  { id: 'be-3', name: 'FWD-8644', code: '8644', status: 'active', createdAt: '2024-01-01' },
  { id: 'be-4', name: 'TKM-8603', code: '8603', status: 'active', createdAt: '2024-01-01' },
  { id: 'be-5', name: 'TKM-8642', code: '8642', status: 'active', createdAt: '2024-01-01' },
  { id: 'be-6', name: 'RVC-35830', code: '35830', status: 'active', createdAt: '2024-01-01' },
  { id: 'be-7', name: 'FWD', code: 'FWD', status: 'active', createdAt: '2024-01-01' },
  // 飞雅贸易账单主体
  { id: 'be-8', name: '物流部', code: 'WLB', status: 'active', createdAt: '2024-01-01' },
  { id: 'be-9', name: 'Sales Operations Analyst部门', code: 'SOA', status: 'active', createdAt: '2024-01-01' },
  { id: 'be-10', name: '工程师部门', code: 'ENG', status: 'active', createdAt: '2024-01-01' },
  { id: 'be-11', name: 'NNP 实验室部门', code: 'NNP', status: 'active', createdAt: '2024-01-01' },
  { id: 'be-12', name: 'TMF部门', code: 'TMF', status: 'active', createdAt: '2024-01-01' },
  // 荏原账单主体
  { id: 'be-13', name: 'CMP部门', code: 'CMP', status: 'active', createdAt: '2024-01-01' },
  { id: 'be-14', name: 'COMP部门', code: 'COMP', status: 'active', createdAt: '2024-01-01' },
  // 苏斯贸易账单主体
  { id: 'be-15', name: '账单1', code: 'ZD1', status: 'active', createdAt: '2024-01-01' },
  { id: 'be-16', name: '账单2', code: 'ZD2', status: 'active', createdAt: '2024-01-01' },
  // 昇先创账单主体
  { id: 'be-17', name: 'CSS上海部', code: 'CSS-SH', status: 'active', createdAt: '2024-01-01' },
  { id: 'be-18', name: 'TSS德国部', code: 'TSS-DE', status: 'active', createdAt: '2024-01-01' },
  // 华力账单主体
  { id: 'be-19', name: '设备类', code: 'SB', status: 'active', createdAt: '2024-01-01' },
  { id: 'be-20', name: '备件类', code: 'BJ', status: 'active', createdAt: '2024-01-01' },
  // 岛津账单主体
  { id: 'be-21', name: '备件货', code: 'BJH', status: 'active', createdAt: '2024-01-01' },
  { id: 'be-22', name: '闲置品', code: 'XZP', status: 'active', createdAt: '2024-01-01' },
  { id: 'be-23', name: '分子泵', code: 'FZB', status: 'active', createdAt: '2024-01-01' },
];

// ============ 售前报价模块示例数据 ============

export const initialQuotes: Quote[] = [
  {
    id: 'quote-001',
    quoteNumber: 'Q2024120001',
    customerId: 'cust-001',
    customerName: '应用材料（中国）有限公司',
    title: '2024年度设备维护服务报价',
    status: 'approved',
    currency: 'CNY',
    validFrom: '2024-12-01',
    validTo: '2025-01-31',
    owner: 'user-001',
    ownerName: '系统管理员',
    totalAmount: 1680000,
    items: [
      { id: 'item-001', name: '设备预防性维护', description: '年度设备预防性维护服务，含检测和保养', quantity: 12, unit: '月', unitPrice: 50000, discount: 0, subtotal: 600000, category: '服务' },
      { id: 'item-002', name: '技术支持服务', description: '7x24小时远程技术支持', quantity: 1, unit: '年', unitPrice: 480000, discount: 10, subtotal: 432000, category: '服务' },
      { id: 'item-003', name: '备件更换', description: '年度备件更换套餐', quantity: 1, unit: '套', unitPrice: 648000, discount: 0, subtotal: 648000, category: '备件' }
    ],
    collaborators: [
      { id: 'col-001', userId: 'user-001', userName: '系统管理员', role: 'owner', joinedAt: '2024-12-01 10:00:00' },
      { id: 'col-002', userId: 'user-002', userName: '张经理', role: 'editor', joinedAt: '2024-12-01 10:30:00' },
      { id: 'col-003', userId: 'user-003', userName: '李助理', role: 'viewer', joinedAt: '2024-12-02 09:00:00' }
    ],
    history: [
      { id: 'hist-001', timestamp: '2024-12-01 10:00:00', operator: '系统管理员', operatorId: 'user-001', action: 'create', details: '创建报价单' },
      { id: 'hist-002', timestamp: '2024-12-01 11:30:00', operator: '系统管理员', operatorId: 'user-001', action: 'add_item', details: '添加3条报价明细' },
      { id: 'hist-003', timestamp: '2024-12-02 14:00:00', operator: '系统管理员', operatorId: 'user-001', action: 'submit', details: '提交审批' },
      { id: 'hist-004', timestamp: '2024-12-03 09:30:00', operator: '审批人', operatorId: 'user-004', action: 'approve', details: '审批通过' }
    ],
    remark: '迪恩士报价单 - 2024年度设备维护服务',
    createdAt: '2024-12-01 10:00:00',
    updatedAt: '2024-12-03 09:30:00',
    submittedAt: '2024-12-02 14:00:00',
    approvedAt: '2024-12-03 09:30:00',
    pdfUrl: 'https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F%E8%BF%AA%E6%81%A9%E5%A3%AB%E6%8A%A5%E4%BB%B7%E5%8D%95.pdf&nonce=00109573-0254-4255-8627-dd4f89f3e9f8&project_id=7636962356119027750&sign=42d13aaacf983ea7e320e9dcfc1032022336d0fc6b1d1f123eebac4f068e692a',
    excelUrl: 'https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F%E9%9C%8D%E5%BB%B7%E6%A0%BC%E6%8A%A5%E4%BB%B7%E5%8D%95.xlsx&nonce=6984521f-8860-4b65-a334-b22c8071065b&project_id=7636962356119027750&sign=6e0dd3b087b8a552db2dfd3e64cfbed58a0c381909f23f65fa2409eab89db33',
    h5Url: 'https://example.com/quote/Q2024120001'
  },
  {
    id: 'quote-002',
    name: '设备采购及安装服务报价',
    quoteNumber: 'Q2024120002',
    customerId: 'cust-002',
    customerName: '飞雅贸易（上海）有限公司',
    title: '设备采购及安装服务报价',
    status: 'pending_review',
    currency: 'USD',
    validFrom: '2024-12-15',
    validTo: '2025-02-28',
    owner: 'user-002',
    ownerName: '张经理',
    totalAmount: 350000,
    items: [
      { id: 'item-004', name: '离子注入机', description: '霍廷格离子注入机 - 标准配置', quantity: 1, unit: '台', unitPrice: 300000, discount: 0, subtotal: 300000, category: '设备' },
      { id: 'item-005', name: '安装调试服务', description: '设备安装、调试及培训服务', quantity: 1, unit: '次', unitPrice: 50000, discount: 0, subtotal: 50000, category: '服务' }
    ],
    collaborators: [
      { id: 'col-004', userId: 'user-002', userName: '张经理', role: 'owner', joinedAt: '2024-12-15 09:00:00' },
      { id: 'col-005', userId: 'user-001', userName: '系统管理员', role: 'viewer', joinedAt: '2024-12-15 09:15:00' }
    ],
    history: [
      { id: 'hist-005', timestamp: '2024-12-15 09:00:00', operator: '张经理', operatorId: 'user-002', action: 'create', details: '创建报价单' },
      { id: 'hist-006', timestamp: '2024-12-15 10:00:00', operator: '张经理', operatorId: 'user-002', action: 'add_item', details: '添加2条报价明细' },
      { id: 'hist-007', timestamp: '2024-12-16 11:00:00', operator: '张经理', operatorId: 'user-002', action: 'submit', details: '提交审批' }
    ],
    remark: '霍廷格报价单 - 设备采购及安装服务',
    createdAt: '2024-12-15 09:00:00',
    updatedAt: '2024-12-16 11:00:00',
    submittedAt: '2024-12-16 11:00:00'
  },
  {
    id: 'quote-003',
    name: '备件及耗材年度采购计划',
    quoteNumber: 'Q2024120003',
    customerId: 'cust-003',
    customerName: '荏原机械（上海）有限公司',
    title: '备件及耗材年度采购计划',
    status: 'draft',
    currency: 'CNY',
    validFrom: '2024-12-20',
    validTo: '2025-03-31',
    owner: 'user-003',
    ownerName: '李助理',
    totalAmount: 450000,
    items: [
      { id: 'item-006', name: 'O型密封圈套装', description: '标准O型密封圈年度套装', quantity: 10, unit: '套', unitPrice: 15000, discount: 5, subtotal: 142500, category: '备件' },
      { id: 'item-007', name: '清洗液', description: '半导体设备专用清洗液', quantity: 20, unit: '桶', unitPrice: 8000, discount: 0, subtotal: 160000, category: '耗材' },
      { id: 'item-008', name: '过滤芯', description: '高精度过滤芯', quantity: 15, unit: '个', unitPrice: 9833, discount: 0, subtotal: 147500, category: '备件' }
    ],
    collaborators: [
      { id: 'col-006', userId: 'user-003', userName: '李助理', role: 'owner', joinedAt: '2024-12-20 14:00:00' }
    ],
    history: [
      { id: 'hist-008', timestamp: '2024-12-20 14:00:00', operator: '李助理', operatorId: 'user-003', action: 'create', details: '创建报价单' },
      { id: 'hist-009', timestamp: '2024-12-20 15:30:00', operator: '李助理', operatorId: 'user-003', action: 'add_item', details: '添加3条报价明细' }
    ],
    remark: '备件及耗材年度采购计划报价',
    createdAt: '2024-12-20 14:00:00',
    updatedAt: '2024-12-20 15:30:00'
  },
  {
    id: 'quote-004',
    quoteNumber: 'Q2024120004',
    customerId: 'cust-004',
    customerName: '苏斯贸易（上海）有限公司',
    title: '技术咨询服务报价',
    status: 'sent',
    currency: 'CNY',
    validFrom: '2024-12-10',
    validTo: '2025-01-10',
    owner: 'user-001',
    ownerName: '系统管理员',
    totalAmount: 280000,
    items: [
      { id: 'item-009', name: '工艺流程优化咨询', description: '半导体设备工艺流程优化咨询服务', quantity: 1, unit: '项', unitPrice: 150000, discount: 0, subtotal: 150000, category: '咨询' },
      { id: 'item-010', name: '人员培训', description: '设备操作人员培训课程', quantity: 10, unit: '人次', unitPrice: 13000, discount: 0, subtotal: 130000, category: '培训' }
    ],
    collaborators: [
      { id: 'col-007', userId: 'user-001', userName: '系统管理员', role: 'owner', joinedAt: '2024-12-10 08:30:00' },
      { id: 'col-008', userId: 'user-005', userName: '王顾问', role: 'editor', joinedAt: '2024-12-10 09:00:00' }
    ],
    history: [
      { id: 'hist-010', timestamp: '2024-12-10 08:30:00', operator: '系统管理员', operatorId: 'user-001', action: 'create', details: '创建报价单' },
      { id: 'hist-011', timestamp: '2024-12-10 16:00:00', operator: '系统管理员', operatorId: 'user-001', action: 'add_item', details: '添加2条报价明细' },
      { id: 'hist-012', timestamp: '2024-12-11 10:00:00', operator: '系统管理员', operatorId: 'user-001', action: 'submit', details: '提交审批' },
      { id: 'hist-013', timestamp: '2024-12-11 14:00:00', operator: '审批人', operatorId: 'user-004', action: 'approve', details: '审批通过' },
      { id: 'hist-014', timestamp: '2024-12-12 09:00:00', operator: '系统管理员', operatorId: 'user-001', action: 'send', details: '发送报价给客户' }
    ],
    remark: '技术咨询服务报价单',
    createdAt: '2024-12-10 08:30:00',
    updatedAt: '2024-12-12 09:00:00',
    submittedAt: '2024-12-11 10:00:00',
    approvedAt: '2024-12-11 14:00:00',
    sentAt: '2024-12-12 09:00:00',
    pdfUrl: 'https://example.com/quote/Q2024120004.pdf',
    excelUrl: 'https://example.com/quote/Q2024120004.xlsx',
    h5Url: 'https://example.com/quote/Q2024120004'
  },
  {
    id: 'quote-005',
    name: '设备升级改造方案',
    quoteNumber: 'Q2024120005',
    customerId: 'cust-001',
    customerName: '应用材料（中国）有限公司',
    title: '设备升级改造方案',
    status: 'rejected',
    currency: 'CNY',
    validFrom: '2024-12-05',
    validTo: '2024-12-25',
    owner: 'user-002',
    ownerName: '张经理',
    totalAmount: 980000,
    items: [
      { id: 'item-011', name: '控制系统升级', description: '设备控制系统硬件及软件升级', quantity: 1, unit: '套', unitPrice: 480000, discount: 0, subtotal: 480000, category: '升级' },
      { id: 'item-012', name: '传感器更换', description: '高精度传感器组件更换', quantity: 8, unit: '个', unitPrice: 25000, discount: 10, subtotal: 180000, category: '备件' },
      { id: 'item-013', name: '机械结构优化', description: '设备机械结构优化及加固', quantity: 1, unit: '项', unitPrice: 320000, discount: 0, subtotal: 320000, category: '服务' }
    ],
    collaborators: [
      { id: 'col-009', userId: 'user-002', userName: '张经理', role: 'owner', joinedAt: '2024-12-05 11:00:00' }
    ],
    history: [
      { id: 'hist-015', timestamp: '2024-12-05 11:00:00', operator: '张经理', operatorId: 'user-002', action: 'create', details: '创建报价单' },
      { id: 'hist-016', timestamp: '2024-12-05 16:00:00', operator: '张经理', operatorId: 'user-002', action: 'add_item', details: '添加3条报价明细' },
      { id: 'hist-017', timestamp: '2024-12-06 10:00:00', operator: '张经理', operatorId: 'user-002', action: 'submit', details: '提交审批' },
      { id: 'hist-018', timestamp: '2024-12-07 14:00:00', operator: '审批人', operatorId: 'user-004', action: 'reject', details: '预算超出，需要重新评估' }
    ],
    remark: '设备升级改造方案报价',
    createdAt: '2024-12-05 11:00:00',
    updatedAt: '2024-12-07 14:00:00',
    submittedAt: '2024-12-06 10:00:00'
  }
];

// 报价单状态颜色
export const getQuoteStatusColor = (status: QuoteStatus): string => {
  const colors: Record<QuoteStatus, string> = {
    draft: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    accepted: 'bg-blue-100 text-blue-800',
    sent: 'bg-purple-100 text-purple-800',
    pending_review: 'bg-orange-100 text-orange-800',
    transferred: 'bg-cyan-100 text-cyan-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

// 预置账单规则
export const initialBillingRules: BillingRule[] = [
  // 应用材料规则 - 按优先级排序，需要同时判断Plant和Location
  {
    id: 'rule-001',
    name: '应用材料（中国）有限公司-FWD-8635',
    customerId: 'cust-001',
    customerName: '应用材料（中国）有限公司',
    priority: 1,
    conditionGroup: {
      id: 'cg-001',
      logic: 'AND',
      items: [
        { id: 'item-001-1', type: 'condition', condition: { id: 'c-001-1', fieldKey: 'plant', fieldName: 'Plant', operator: 'equals', value: '8635' } },
        { id: 'item-001-2', type: 'condition', condition: { id: 'c-001-2', fieldKey: 'location', fieldName: 'Location', operator: 'not_equals', value: '0002' } },
        { id: 'item-001-3', type: 'condition', condition: { id: 'c-001-3', fieldKey: 'location', fieldName: 'Location', operator: 'not_equals', value: '0004' } },
      ]
    },
    targetBillingEntity: 'FWD-8635',
    status: 'active',
    createdAt: '2024-01-15 10:00:00',
    createdBy: '管理员',
  },
  {
    id: 'rule-002',
    name: '应用材料（中国）有限公司-FWD-8639&8641',
    customerId: 'cust-001',
    customerName: '应用材料（中国）有限公司',
    priority: 2,
    conditionGroup: {
      id: 'cg-002',
      logic: 'AND',
      items: [
        { 
          id: 'item-002-1', 
          type: 'group', 
          group: {
            id: 'sub-cg-002',
            logic: 'OR',
            items: [
              { id: 'item-002-1-1', type: 'condition', condition: { id: 'c-002-1', fieldKey: 'plant', fieldName: 'Plant', operator: 'equals', value: '8639' } },
              { id: 'item-002-1-2', type: 'condition', condition: { id: 'c-002-2', fieldKey: 'plant', fieldName: 'Plant', operator: 'equals', value: '8641' } },
            ]
          }
        },
        { id: 'item-002-2', type: 'condition', condition: { id: 'c-002-3', fieldKey: 'location', fieldName: 'Location', operator: 'not_equals', value: '0002' } },
        { id: 'item-002-3', type: 'condition', condition: { id: 'c-002-4', fieldKey: 'location', fieldName: 'Location', operator: 'not_equals', value: '0004' } },
      ]
    },
    targetBillingEntity: 'FWD-8639&8641',
    status: 'active',
    createdAt: '2024-01-16 11:00:00',
    createdBy: '管理员',
  },
  {
    id: 'rule-003',
    name: '应用材料（中国）有限公司-FWD-8644',
    customerId: 'cust-001',
    customerName: '应用材料（中国）有限公司',
    priority: 3,
    conditionGroup: {
      id: 'cg-003',
      logic: 'AND',
      items: [
        { id: 'item-003-1', type: 'condition', condition: { id: 'c-003-1', fieldKey: 'plant', fieldName: 'Plant', operator: 'equals', value: '8644' } },
        { id: 'item-003-2', type: 'condition', condition: { id: 'c-003-2', fieldKey: 'location', fieldName: 'Location', operator: 'not_equals', value: '0002' } },
        { id: 'item-003-3', type: 'condition', condition: { id: 'c-003-3', fieldKey: 'location', fieldName: 'Location', operator: 'not_equals', value: '0004' } },
      ]
    },
    targetBillingEntity: 'FWD-8644',
    status: 'active',
    createdAt: '2024-01-17 09:30:00',
    createdBy: '管理员',
  },
  {
    id: 'rule-004',
    name: '应用材料（中国）有限公司-TKM-8603',
    customerId: 'cust-001',
    customerName: '应用材料（中国）有限公司',
    priority: 4,
    conditionGroup: {
      id: 'cg-004',
      logic: 'AND',
      items: [
        { 
          id: 'item-004-1', 
          type: 'group', 
          group: {
            id: 'sub-cg-004',
            logic: 'OR',
            items: [
              { id: 'item-004-1-1', type: 'condition', condition: { id: 'c-004-1', fieldKey: 'plant', fieldName: 'Plant', operator: 'equals', value: '8603' } },
              { id: 'item-004-1-2', type: 'condition', condition: { id: 'c-004-2', fieldKey: 'plant', fieldName: 'Plant', operator: 'equals', value: '8642' } },
            ]
          }
        },
        { id: 'item-004-2', type: 'condition', condition: { id: 'c-004-3', fieldKey: 'location', fieldName: 'Location', operator: 'not_empty', value: '' } },
      ]
    },
    targetBillingEntity: 'TKM-8603',
    status: 'active',
    createdAt: '2024-01-18 14:20:00',
    createdBy: '管理员',
  },
  {
    id: 'rule-005',
    name: '应用材料（中国）有限公司-RVC-35830',
    customerId: 'cust-001',
    customerName: '应用材料（中国）有限公司',
    priority: 5,
    conditionGroup: {
      id: 'cg-005',
      logic: 'AND',
      items: [
        { 
          id: 'item-005-1', 
          type: 'group', 
          group: {
            id: 'sub-cg-005',
            logic: 'OR',
            items: [
              { id: 'item-005-1-1', type: 'condition', condition: { id: 'c-005-1', fieldKey: 'plant', fieldName: 'Plant', operator: 'equals', value: '8635' } },
              { id: 'item-005-1-2', type: 'condition', condition: { id: 'c-005-2', fieldKey: 'plant', fieldName: 'Plant', operator: 'equals', value: '8639' } },
              { id: 'item-005-1-3', type: 'condition', condition: { id: 'c-005-3', fieldKey: 'plant', fieldName: 'Plant', operator: 'equals', value: '8641' } },
              { id: 'item-005-1-4', type: 'condition', condition: { id: 'c-005-4', fieldKey: 'plant', fieldName: 'Plant', operator: 'equals', value: '8644' } },
              { id: 'item-005-1-5', type: 'condition', condition: { id: 'c-005-5', fieldKey: 'plant', fieldName: 'Plant', operator: 'equals', value: '8646' } },
              { id: 'item-005-1-6', type: 'condition', condition: { id: 'c-005-6', fieldKey: 'plant', fieldName: 'Plant', operator: 'equals', value: '8645' } },
              { id: 'item-005-1-7', type: 'condition', condition: { id: 'c-005-7', fieldKey: 'plant', fieldName: 'Plant', operator: 'equals', value: '8655' } },
              { id: 'item-005-1-8', type: 'condition', condition: { id: 'c-005-8', fieldKey: 'plant', fieldName: 'Plant', operator: 'equals', value: '8601' } },
              { id: 'item-005-1-9', type: 'condition', condition: { id: 'c-005-9', fieldKey: 'plant', fieldName: 'Plant', operator: 'equals', value: '8661' } },
            ]
          }
        },
        { 
          id: 'item-005-2', 
          type: 'group', 
          group: {
            id: 'sub-cg-005-2',
            logic: 'OR',
            items: [
              { id: 'item-005-2-1', type: 'condition', condition: { id: 'c-005-10', fieldKey: 'location', fieldName: 'Location', operator: 'equals', value: '0002' } },
              { id: 'item-005-2-2', type: 'condition', condition: { id: 'c-005-11', fieldKey: 'location', fieldName: 'Location', operator: 'equals', value: '0004' } },
            ]
          }
        },
      ]
    },
    targetBillingEntity: 'RVC-35830',
    status: 'active',
    createdAt: '2024-01-19 16:45:00',
    createdBy: '管理员',
  },
  {
    id: 'rule-006',
    name: '应用材料（中国）有限公司-FWD',
    customerId: 'cust-001',
    customerName: '应用材料（中国）有限公司',
    priority: 6,
    conditionGroup: {
      id: 'cg-006',
      logic: 'AND',
      items: [
        { 
          id: 'item-006-1', 
          type: 'group', 
          group: {
            id: 'sub-cg-006',
            logic: 'OR',
            items: [
              { id: 'item-006-1-1', type: 'condition', condition: { id: 'c-006-1', fieldKey: 'plant', fieldName: 'Plant', operator: 'equals', value: '8646' } },
              { id: 'item-006-1-2', type: 'condition', condition: { id: 'c-006-2', fieldKey: 'plant', fieldName: 'Plant', operator: 'equals', value: '8645' } },
              { id: 'item-006-1-3', type: 'condition', condition: { id: 'c-006-3', fieldKey: 'plant', fieldName: 'Plant', operator: 'equals', value: '8655' } },
              { id: 'item-006-1-4', type: 'condition', condition: { id: 'c-006-4', fieldKey: 'plant', fieldName: 'Plant', operator: 'equals', value: '8601' } },
              { id: 'item-006-1-5', type: 'condition', condition: { id: 'c-006-5', fieldKey: 'plant', fieldName: 'Plant', operator: 'equals', value: '8661' } },
            ]
          }
        },
        { id: 'item-006-2', type: 'condition', condition: { id: 'c-006-6', fieldKey: 'location', fieldName: 'Location', operator: 'not_equals', value: '0002' } },
        { id: 'item-006-3', type: 'condition', condition: { id: 'c-006-7', fieldKey: 'location', fieldName: 'Location', operator: 'not_equals', value: '0004' } },
      ]
    },
    targetBillingEntity: 'FWD',
    status: 'active',
    createdAt: '2024-01-20 08:00:00',
    createdBy: '管理员',
  },
  {
    id: 'rule-007',
    name: '应用材料（中国）有限公司-FWD-其他',
    customerId: 'cust-001',
    customerName: '应用材料（中国）有限公司',
    priority: 7,
    conditionGroup: {
      id: 'cg-007',
      logic: 'AND',
      items: [
        { 
          id: 'item-007-1', 
          type: 'group', 
          group: {
            id: 'sub-cg-007',
            logic: 'OR',
            items: [
              { id: 'item-007-1-1', type: 'condition', condition: { id: 'c-007-1', fieldKey: 'plant', fieldName: 'Plant', operator: 'equals', value: '8634' } },
              { id: 'item-007-1-2', type: 'condition', condition: { id: 'c-007-2', fieldKey: 'plant', fieldName: 'Plant', operator: 'equals', value: '8693' } },
            ]
          }
        },
        { id: 'item-007-2', type: 'condition', condition: { id: 'c-007-3', fieldKey: 'location', fieldName: 'Location', operator: 'not_empty', value: '' } },
      ]
    },
    targetBillingEntity: 'FWD',
    status: 'active',
    createdAt: '2024-01-21 09:00:00',
    createdBy: '管理员',
  },
  // 飞雅贸易规则
  {
    id: 'rule-007',
    name: '飞雅贸易（上海）有限公司-物流部',
    customerId: 'cust-002',
    customerName: '飞雅贸易（上海）有限公司',
    conditionGroup: {
      id: 'cg-007',
      logic: 'AND',
      items: [
        { id: 'item-007-1', type: 'condition', condition: { id: 'c-007-1', fieldKey: 'department', fieldName: '客户部门', operator: 'equals', value: '物流部' } },
      ]
    },
    targetBillingEntity: '物流部',
    status: 'active',
    createdAt: '2024-02-01 10:00:00',
    createdBy: '管理员',
  },
  {
    id: 'rule-008',
    name: '飞雅贸易（上海）有限公司-Sales Operations Analyst部门',
    customerId: 'cust-002',
    customerName: '飞雅贸易（上海）有限公司',
    conditionGroup: {
      id: 'cg-008',
      logic: 'AND',
      items: [
        { id: 'item-008-1', type: 'condition', condition: { id: 'c-008-1', fieldKey: 'department', fieldName: '客户部门', operator: 'equals', value: 'Sales Operations Analyst部门' } },
      ]
    },
    targetBillingEntity: 'Sales Operations Analyst部门',
    status: 'active',
    createdAt: '2024-02-01 10:05:00',
    createdBy: '管理员',
  },
  {
    id: 'rule-009',
    name: '飞雅贸易（上海）有限公司-工程师部门',
    customerId: 'cust-002',
    customerName: '飞雅贸易（上海）有限公司',
    conditionGroup: {
      id: 'cg-009',
      logic: 'AND',
      items: [
        { id: 'item-009-1', type: 'condition', condition: { id: 'c-009-1', fieldKey: 'department', fieldName: '客户部门', operator: 'equals', value: '工程师部门' } },
      ]
    },
    targetBillingEntity: '工程师部门',
    status: 'active',
    createdAt: '2024-02-01 10:10:00',
    createdBy: '管理员',
  },
  {
    id: 'rule-010',
    name: '飞雅贸易（上海）有限公司-NNP实验室部门',
    customerId: 'cust-002',
    customerName: '飞雅贸易（上海）有限公司',
    conditionGroup: {
      id: 'cg-010',
      logic: 'AND',
      items: [
        { id: 'item-010-1', type: 'condition', condition: { id: 'c-010-1', fieldKey: 'department', fieldName: '客户部门', operator: 'equals', value: 'NNP 实验室部门' } },
      ]
    },
    targetBillingEntity: 'NNP 实验室部门',
    status: 'active',
    createdAt: '2024-02-01 10:15:00',
    createdBy: '管理员',
  },
  {
    id: 'rule-011',
    name: '飞雅贸易（上海）有限公司-TMF部门',
    customerId: 'cust-002',
    customerName: '飞雅贸易（上海）有限公司',
    conditionGroup: {
      id: 'cg-011',
      logic: 'AND',
      items: [
        { id: 'item-011-1', type: 'condition', condition: { id: 'c-011-1', fieldKey: 'department', fieldName: '客户部门', operator: 'equals', value: 'TMF部门' } },
      ]
    },
    targetBillingEntity: 'TMF部门',
    status: 'active',
    createdAt: '2024-02-01 10:20:00',
    createdBy: '管理员',
  },
  // 荏原规则
  {
    id: 'rule-012',
    name: '上海荏原精密机械有限公司-CMP部门',
    customerId: 'cust-008',
    customerName: '上海荏原精密机械有限公司',
    conditionGroup: {
      id: 'cg-012',
      logic: 'AND',
      items: [
        { id: 'item-012-1', type: 'condition', condition: { id: 'c-012-1', fieldKey: 'department', fieldName: '客户部门', operator: 'equals', value: 'CMP部门' } },
      ]
    },
    targetBillingEntity: 'CMP部门',
    status: 'active',
    createdAt: '2024-02-02 09:00:00',
    createdBy: '管理员',
  },
  {
    id: 'rule-013',
    name: '上海荏原精密机械有限公司-COMP部门',
    customerId: 'cust-008',
    customerName: '上海荏原精密机械有限公司',
    conditionGroup: {
      id: 'cg-013',
      logic: 'AND',
      items: [
        { id: 'item-013-1', type: 'condition', condition: { id: 'c-013-1', fieldKey: 'department', fieldName: '客户部门', operator: 'equals', value: 'COMP部门' } },
      ]
    },
    targetBillingEntity: 'COMP部门',
    status: 'active',
    createdAt: '2024-02-02 09:05:00',
    createdBy: '管理员',
  },
  // 苏斯贸易规则
  {
    id: 'rule-014',
    name: '苏斯贸易（上海）有限公司-账单1',
    customerId: 'cust-005',
    customerName: '苏斯贸易（上海）有限公司',
    conditionGroup: {
      id: 'cg-014',
      logic: 'AND',
      items: [
        { id: 'item-014-1', type: 'condition', condition: { id: 'c-014-1', fieldKey: 'department', fieldName: '客户部门', operator: 'equals', value: '维保库' } },
      ]
    },
    targetBillingEntity: '账单1',
    status: 'active',
    createdAt: '2024-02-03 10:00:00',
    createdBy: '管理员',
  },
  {
    id: 'rule-015',
    name: '苏斯贸易（上海）有限公司-账单2',
    customerId: 'cust-005',
    customerName: '苏斯贸易（上海）有限公司',
    conditionGroup: {
      id: 'cg-015',
      logic: 'AND',
      items: [
        { id: 'item-015-1', type: 'condition', condition: { id: 'c-015-1', fieldKey: 'department', fieldName: '客户部门', operator: 'equals', value: 'PE-保内库' } },
      ]
    },
    targetBillingEntity: '账单2',
    status: 'active',
    createdAt: '2024-02-03 10:05:00',
    createdBy: '管理员',
  },
  // 昇先创规则
  {
    id: 'rule-016',
    name: '昇先创科技（深圳）有限公司-CSS上海部',
    customerId: 'cust-006',
    customerName: '昇先创科技（深圳）有限公司',
    conditionGroup: {
      id: 'cg-016',
      logic: 'AND',
      items: [
        { id: 'item-016-1', type: 'condition', condition: { id: 'c-016-1', fieldKey: 'department', fieldName: '客户部门', operator: 'equals', value: '上海部' } },
      ]
    },
    targetBillingEntity: 'CSS上海部',
    status: 'active',
    createdAt: '2024-02-04 09:00:00',
    createdBy: '管理员',
  },
  {
    id: 'rule-017',
    name: '昇先创科技（深圳）有限公司-TSS德国部',
    customerId: 'cust-006',
    customerName: '昇先创科技（深圳）有限公司',
    conditionGroup: {
      id: 'cg-017',
      logic: 'AND',
      items: [
        { id: 'item-017-1', type: 'condition', condition: { id: 'c-017-1', fieldKey: 'department', fieldName: '客户部门', operator: 'equals', value: '德国部' } },
      ]
    },
    targetBillingEntity: 'TSS德国部',
    status: 'active',
    createdAt: '2024-02-04 09:05:00',
    createdBy: '管理员',
  },
  // 上海华力规则
  {
    id: 'rule-018',
    name: '上海华力集成电路有限公司-设备类',
    customerId: 'cust-007',
    customerName: '上海华力集成电路有限公司',
    conditionGroup: {
      id: 'cg-018',
      logic: 'AND',
      items: [
        { id: 'item-018-1', type: 'condition', condition: { id: 'c-018-1', fieldKey: 'department', fieldName: '客户部门', operator: 'equals', value: '设备' } },
      ]
    },
    targetBillingEntity: '设备类',
    status: 'active',
    createdAt: '2024-02-05 10:00:00',
    createdBy: '管理员',
  },
  {
    id: 'rule-019',
    name: '上海华力集成电路有限公司-备件类',
    customerId: 'cust-007',
    customerName: '上海华力集成电路有限公司',
    conditionGroup: {
      id: 'cg-019',
      logic: 'OR',
      items: [
        { id: 'item-019-1', type: 'condition', condition: { id: 'c-019-1', fieldKey: 'department', fieldName: '客户部门', operator: 'equals', value: '资材' } },
        { id: 'item-019-2', type: 'condition', condition: { id: 'c-019-2', fieldKey: 'department', fieldName: '客户部门', operator: 'equals', value: '循环品' } },
        { id: 'item-019-3', type: 'condition', condition: { id: 'c-019-3', fieldKey: 'department', fieldName: '客户部门', operator: 'equals', value: '返片' } },
      ]
    },
    targetBillingEntity: '备件类',
    status: 'active',
    createdAt: '2024-02-05 10:05:00',
    createdBy: '管理员',
  },
  // 西安岛津规则
  {
    id: 'rule-020',
    name: '岛津企业管理（中国）有限公司-备件货',
    customerId: 'cust-009',
    customerName: '岛津企业管理（中国）有限公司',
    conditionGroup: {
      id: 'cg-020',
      logic: 'AND',
      items: [
        { id: 'item-020-1', type: 'condition', condition: { id: 'c-020-1', fieldKey: 'department', fieldName: '客户部门', operator: 'equals', value: '备件货' } },
      ]
    },
    targetBillingEntity: '备件货',
    status: 'active',
    createdAt: '2024-02-06 09:00:00',
    createdBy: '管理员',
  },
  {
    id: 'rule-021',
    name: '岛津企业管理（中国）有限公司-闲置品',
    customerId: 'cust-009',
    customerName: '岛津企业管理（中国）有限公司',
    conditionGroup: {
      id: 'cg-021',
      logic: 'AND',
      items: [
        { id: 'item-021-1', type: 'condition', condition: { id: 'c-021-1', fieldKey: 'department', fieldName: '客户部门', operator: 'equals', value: '闲置品' } },
      ]
    },
    targetBillingEntity: '闲置品',
    status: 'active',
    createdAt: '2024-02-06 09:05:00',
    createdBy: '管理员',
  },
  {
    id: 'rule-022',
    name: '岛津企业管理（中国）有限公司-分子泵',
    customerId: 'cust-009',
    customerName: '岛津企业管理（中国）有限公司',
    conditionGroup: {
      id: 'cg-022',
      logic: 'AND',
      items: [
        { id: 'item-022-1', type: 'condition', condition: { id: 'c-022-1', fieldKey: 'department', fieldName: '客户部门', operator: 'equals', value: '分子泵' } },
      ]
    },
    targetBillingEntity: '分子泵',
    status: 'active',
    createdAt: '2024-02-06 09:10:00',
    createdBy: '管理员',
  },
];

// ==================== 审批流程配置 ====================

export const serviceProductApprovalMap: Record<string, { approver: string; isCountersign: boolean }> = {
  '货代': { approver: '张洁', isCountersign: false },
  '关务': { approver: '蒋总', isCountersign: false },
  '仓库': { approver: '吴总', isCountersign: false },
  '运输': { approver: '朱弢', isCountersign: false },
  '进出口': { approver: '张洁', isCountersign: false },
  '维修': { approver: '蒋总', isCountersign: false },
  '合同物流': { approver: '张洁/蒋总/吴总/朱弢', isCountersign: true },
};

export const initialApprovalWorkflows: ApprovalWorkflow[] = [
  {
    id: 'aw-001',
    name: '货代服务审批流程',
    serviceProduct: '货代',
    isTradeAgency: false,
    status: 'active',
    approvalNodes: [
      { level: 1, type: 'initiator', name: '发起人', approvers: [], isCountersign: false, isRequired: true, description: '申请人提交审批申请' },
      { level: 2, type: 'department_manager', name: '部门经理', approvers: [{ id: 'u-dept1', name: '部门经理', role: '部门经理' }], isCountersign: false, isRequired: true, description: '部门经理审批' },
      { level: 3, type: 'functional', name: '职能审批人', approvers: [{ id: 'u-zhangjie', name: '张洁', role: '货代职能审批人' }], isCountersign: false, isRequired: true, description: '货代-张洁' },
      { level: 4, type: 'finance', name: '财务审批（会签）', approvers: [{ id: 'u-fin1', name: '财务部', role: '财务' }, { id: 'u-center1', name: '中心总经理', role: '中心总经理' }], isCountersign: true, isRequired: true, description: '财务及中心总经理会签' },
      { level: 5, type: 'general_manager', name: '总经理', approvers: [{ id: 'u-gm1', name: '各中心负责人', role: '总经理' }], isCountersign: false, isRequired: true, description: '各中心负责人/总经理审批' },
      { level: 6, type: 'it_ops', name: 'IT运维确认', approvers: [{ id: 'u-it1', name: 'IT运维', role: 'IT运维' }], isCountersign: false, isRequired: true, description: '确认后提供客户的系统代码' },
    ],
    remark: '货代服务标准审批流程',
    createdBy: 'admin',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'aw-002',
    name: '关务服务审批流程',
    serviceProduct: '关务',
    isTradeAgency: false,
    status: 'active',
    approvalNodes: [
      { level: 1, type: 'initiator', name: '发起人', approvers: [], isCountersign: false, isRequired: true, description: '申请人提交审批申请' },
      { level: 2, type: 'department_manager', name: '部门经理', approvers: [{ id: 'u-dept1', name: '部门经理', role: '部门经理' }], isCountersign: false, isRequired: true, description: '部门经理审批' },
      { level: 3, type: 'functional', name: '职能审批人', approvers: [{ id: 'u-jiangzong', name: '蒋总', role: '关务职能审批人' }], isCountersign: false, isRequired: true, description: '关务-蒋总' },
      { level: 4, type: 'finance', name: '财务审批（会签）', approvers: [{ id: 'u-fin1', name: '财务部', role: '财务' }, { id: 'u-center1', name: '中心总经理', role: '中心总经理' }], isCountersign: true, isRequired: true, description: '财务及中心总经理会签' },
      { level: 5, type: 'general_manager', name: '总经理', approvers: [{ id: 'u-gm1', name: '各中心负责人', role: '总经理' }], isCountersign: false, isRequired: true, description: '各中心负责人/总经理审批' },
      { level: 6, type: 'it_ops', name: 'IT运维确认', approvers: [{ id: 'u-it1', name: 'IT运维', role: 'IT运维' }], isCountersign: false, isRequired: true, description: '确认后提供客户的系统代码' },
    ],
    remark: '关务服务标准审批流程',
    createdBy: 'admin',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'aw-003',
    name: '合同物流服务审批流程',
    serviceProduct: '合同物流',
    isTradeAgency: true,
    status: 'active',
    approvalNodes: [
      { level: 1, type: 'initiator', name: '发起人', approvers: [], isCountersign: false, isRequired: true, description: '申请人提交审批申请' },
      { level: 2, type: 'department_manager', name: '部门经理', approvers: [{ id: 'u-dept1', name: '部门经理', role: '部门经理' }], isCountersign: false, isRequired: true, description: '部门经理审批' },
      { level: 3, type: 'functional', name: '职能审批人', approvers: [
        { id: 'u-zhangjie', name: '张洁', role: '货代职能审批人' },
        { id: 'u-jiangzong', name: '蒋总', role: '关务职能审批人' },
        { id: 'u-wuzong', name: '吴总', role: '仓库职能审批人' },
        { id: 'u-zhutao', name: '朱弢', role: '运输职能审批人' },
        { id: 'u-baili', name: '白沥', role: '贸易代理职能审批人' },
      ], isCountersign: true, isRequired: true, description: '根据合同中涉及的服务内容选择对应审批人（会签），含贸易代理-白沥' },
      { level: 4, type: 'finance', name: '财务审批（会签）', approvers: [{ id: 'u-fin1', name: '财务部', role: '财务' }, { id: 'u-center1', name: '中心总经理', role: '中心总经理' }], isCountersign: true, isRequired: true, description: '财务及中心总经理会签' },
      { level: 5, type: 'general_manager', name: '总经理', approvers: [{ id: 'u-gm1', name: '各中心负责人', role: '总经理' }], isCountersign: false, isRequired: true, description: '各中心负责人/总经理审批' },
      { level: 6, type: 'it_ops', name: 'IT运维确认', approvers: [{ id: 'u-it1', name: 'IT运维', role: 'IT运维' }], isCountersign: false, isRequired: true, description: '确认后提供客户的系统代码' },
    ],
    remark: '合同物流涉及多服务产品，职能审批人为会签模式。因涉及贸易代理，已自动添加白沥',
    createdBy: 'admin',
    createdAt: '2024-02-01T08:00:00Z',
    updatedAt: '2024-02-01T08:00:00Z',
  },
  {
    id: 'aw-004',
    name: '仓库服务审批流程',
    serviceProduct: '仓库',
    isTradeAgency: false,
    status: 'active',
    approvalNodes: [
      { level: 1, type: 'initiator', name: '发起人', approvers: [], isCountersign: false, isRequired: true, description: '申请人提交审批申请' },
      { level: 2, type: 'department_manager', name: '部门经理', approvers: [{ id: 'u-dept1', name: '部门经理', role: '部门经理' }], isCountersign: false, isRequired: true, description: '部门经理审批' },
      { level: 3, type: 'functional', name: '职能审批人', approvers: [{ id: 'u-wuzong', name: '吴总', role: '仓库职能审批人' }], isCountersign: false, isRequired: true, description: '仓库-吴总' },
      { level: 4, type: 'finance', name: '财务审批（会签）', approvers: [{ id: 'u-fin1', name: '财务部', role: '财务' }, { id: 'u-center1', name: '中心总经理', role: '中心总经理' }], isCountersign: true, isRequired: true, description: '财务及中心总经理会签' },
      { level: 5, type: 'general_manager', name: '总经理', approvers: [{ id: 'u-gm1', name: '各中心负责人', role: '总经理' }], isCountersign: false, isRequired: true, description: '各中心负责人/总经理审批' },
      { level: 6, type: 'it_ops', name: 'IT运维确认', approvers: [{ id: 'u-it1', name: 'IT运维', role: 'IT运维' }], isCountersign: false, isRequired: true, description: '确认后提供客户的系统代码' },
    ],
    remark: '仓库服务标准审批流程',
    createdBy: 'admin',
    createdAt: '2024-01-20T08:00:00Z',
    updatedAt: '2024-01-20T08:00:00Z',
  },
  {
    id: 'aw-005',
    name: '运输服务审批流程',
    serviceProduct: '运输',
    isTradeAgency: false,
    status: 'active',
    approvalNodes: [
      { level: 1, type: 'initiator', name: '发起人', approvers: [], isCountersign: false, isRequired: true, description: '申请人提交审批申请' },
      { level: 2, type: 'department_manager', name: '部门经理', approvers: [{ id: 'u-dept1', name: '部门经理', role: '部门经理' }], isCountersign: false, isRequired: true, description: '部门经理审批' },
      { level: 3, type: 'functional', name: '职能审批人', approvers: [{ id: 'u-zhutao', name: '朱弢', role: '运输职能审批人' }], isCountersign: false, isRequired: true, description: '运输-朱弢' },
      { level: 4, type: 'finance', name: '财务审批（会签）', approvers: [{ id: 'u-fin1', name: '财务部', role: '财务' }, { id: 'u-center1', name: '中心总经理', role: '中心总经理' }], isCountersign: true, isRequired: true, description: '财务及中心总经理会签' },
      { level: 5, type: 'general_manager', name: '总经理', approvers: [{ id: 'u-gm1', name: '各中心负责人', role: '总经理' }], isCountersign: false, isRequired: true, description: '各中心负责人/总经理审批' },
      { level: 6, type: 'it_ops', name: 'IT运维确认', approvers: [{ id: 'u-it1', name: 'IT运维', role: 'IT运维' }], isCountersign: false, isRequired: true, description: '确认后提供客户的系统代码' },
    ],
    remark: '运输服务标准审批流程',
    createdBy: 'admin',
    createdAt: '2024-01-20T08:00:00Z',
    updatedAt: '2024-01-20T08:00:00Z',
  },
  {
    id: 'aw-006',
    name: '进出口服务审批流程',
    serviceProduct: '进出口',
    isTradeAgency: false,
    status: 'active',
    approvalNodes: [
      { level: 1, type: 'initiator', name: '发起人', approvers: [], isCountersign: false, isRequired: true, description: '申请人提交审批申请' },
      { level: 2, type: 'department_manager', name: '部门经理', approvers: [{ id: 'u-dept1', name: '部门经理', role: '部门经理' }], isCountersign: false, isRequired: true, description: '部门经理审批' },
      { level: 3, type: 'functional', name: '职能审批人', approvers: [{ id: 'u-zhangjie', name: '张洁', role: '进出口职能审批人' }], isCountersign: false, isRequired: true, description: '进出口-张洁' },
      { level: 4, type: 'finance', name: '财务审批（会签）', approvers: [{ id: 'u-fin1', name: '财务部', role: '财务' }, { id: 'u-center1', name: '中心总经理', role: '中心总经理' }], isCountersign: true, isRequired: true, description: '财务及中心总经理会签' },
      { level: 5, type: 'general_manager', name: '总经理', approvers: [{ id: 'u-gm1', name: '各中心负责人', role: '总经理' }], isCountersign: false, isRequired: true, description: '各中心负责人/总经理审批' },
      { level: 6, type: 'it_ops', name: 'IT运维确认', approvers: [{ id: 'u-it1', name: 'IT运维', role: 'IT运维' }], isCountersign: false, isRequired: true, description: '确认后提供客户的系统代码' },
    ],
    remark: '进出口服务标准审批流程',
    createdBy: 'admin',
    createdAt: '2024-02-05T08:00:00Z',
    updatedAt: '2024-02-05T08:00:00Z',
  },
  {
    id: 'aw-007',
    name: '维修服务审批流程',
    serviceProduct: '维修',
    isTradeAgency: false,
    status: 'active',
    approvalNodes: [
      { level: 1, type: 'initiator', name: '发起人', approvers: [], isCountersign: false, isRequired: true, description: '申请人提交审批申请' },
      { level: 2, type: 'department_manager', name: '部门经理', approvers: [{ id: 'u-dept1', name: '部门经理', role: '部门经理' }], isCountersign: false, isRequired: true, description: '部门经理审批' },
      { level: 3, type: 'functional', name: '职能审批人', approvers: [{ id: 'u-jiangzong', name: '蒋总', role: '维修职能审批人' }], isCountersign: false, isRequired: true, description: '维修-蒋总' },
      { level: 4, type: 'finance', name: '财务审批（会签）', approvers: [{ id: 'u-fin1', name: '财务部', role: '财务' }, { id: 'u-center1', name: '中心总经理', role: '中心总经理' }], isCountersign: true, isRequired: true, description: '财务及中心总经理会签' },
      { level: 5, type: 'general_manager', name: '总经理', approvers: [{ id: 'u-gm1', name: '各中心负责人', role: '总经理' }], isCountersign: false, isRequired: true, description: '各中心负责人/总经理审批' },
      { level: 6, type: 'it_ops', name: 'IT运维确认', approvers: [{ id: 'u-it1', name: 'IT运维', role: 'IT运维' }], isCountersign: false, isRequired: true, description: '确认后提供客户的系统代码' },
    ],
    remark: '维修服务标准审批流程',
    createdBy: 'admin',
    createdAt: '2024-02-10T08:00:00Z',
    updatedAt: '2024-02-10T08:00:00Z',
  },
];

// ==================== 自动审批规则 ====================

export const initialAutoApprovalRules: AutoApprovalRule[] = [
  {
    id: 'ar-001',
    name: '贸易代理自动添加白沥',
    serviceProduct: '全部',
    status: 'active',
    conditionLogic: 'AND',
    conditions: [
      { id: 'c-001', field: '是否贸易代理', operator: 'equals', value: '是', logic: 'AND' },
    ],
    actions: [
      { id: 'a-001', type: 'add_approver', target: '白沥', description: '自动添加白沥为贸易代理职能审批人' },
    ],
    successMessage: '因选择"贸易代理"，已自动将白沥加入职能审批人列表',
    failureMessage: '',
    priority: 1,
    createdBy: 'admin',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'ar-002',
    name: '低金额自动通过',
    serviceProduct: '货代',
    status: 'active',
    conditionLogic: 'AND',
    conditions: [
      { id: 'c-002', field: '月开票金额', operator: 'less_than', value: '5000', logic: 'AND' },
      { id: 'c-003', field: '月均订单数', operator: 'less_than_or_equal', value: '5', logic: 'AND' },
    ],
    actions: [
      { id: 'a-002', type: 'auto_approve', target: '', description: '自动通过审批' },
      { id: 'a-003', type: 'show_message', target: '', description: '显示提示' },
    ],
    successMessage: '该客户月开票金额低于5000元且月均订单数≤5，已自动通过审批',
    failureMessage: '该客户月开票金额或订单数不满足自动审批条件，需人工审批',
    priority: 2,
    createdBy: 'admin',
    createdAt: '2024-02-01T08:00:00Z',
    updatedAt: '2024-02-01T08:00:00Z',
  },
  {
    id: 'ar-003',
    name: '高风险客户自动拦截',
    serviceProduct: '全部',
    status: 'active',
    conditionLogic: 'AND',
    conditions: [
      { id: 'c-004', field: '信用等级', operator: 'equals', value: 'D', logic: 'AND' },
    ],
    actions: [
      { id: 'a-004', type: 'auto_reject', target: '', description: '自动拒绝审批' },
      { id: 'a-005', type: 'show_message', target: '', description: '显示警告' },
    ],
    successMessage: '',
    failureMessage: '该客户信用等级为D级，存在较高风险，审批已被自动拦截。请升级至风控主管审批',
    priority: 3,
    createdBy: 'admin',
    createdAt: '2024-02-10T08:00:00Z',
    updatedAt: '2024-02-10T08:00:00Z',
  },
];
// ==================== 示例主体数据 ====================

export const initialSigningEntities: import('./types').SigningEntity[] = [
  {
    id: 'se-1',
    name: '应用材料（中国）有限公司',
    code: 'AMTS-SE001',
    unifiedSocialCreditCode: '91310000MA1FL5XX1X',
    legalRepresentative: '张三',
    status: 'active',
    establishmentDate: '2002-03-15',
    taxId: '91310000MA1FL5XX1X',
    address: '上海市浦东新区张江高科技园区',
    contactPerson: '赵经理',
    phone: '021-58888888',
    email: 'contact@amat.com',
    industry: '半导体设备',
    registeredCapital: '5000万美元',
    businessScope: '半导体设备制造、销售及技术服务',
    settlementEntity: '应用材料结算中心',
    remark: '',
    createdAt: '2024-01-01',
  },
  {
    id: 'se-2',
    name: '金鹰国际货运代理有限公司',
    code: 'JYHY-SE001',
    unifiedSocialCreditCode: '91310000MA1FL6XX2Y',
    legalRepresentative: '李四',
    status: 'active',
    establishmentDate: '2010-06-01',
    taxId: '91310000MA1FL6XX2Y',
    address: '上海市浦东新区外高桥保税区',
    contactPerson: '钱主管',
    phone: '021-68889999',
    email: 'info@jinying-logistics.com',
    industry: '货运代理',
    registeredCapital: '2000万人民币',
    businessScope: '国际货运代理、仓储服务',
    remark: '',
    createdAt: '2024-01-15',
  },
  {
    id: 'se-3',
    name: '苏斯贸易（上海）有限公司',
    code: 'SSMY-SE001',
    unifiedSocialCreditCode: '91310000MA1FL7XX3Z',
    legalRepresentative: '王五',
    status: 'active',
    establishmentDate: '2015-09-20',
    taxId: '91310000MA1FL7XX3Z',
    address: '上海市徐汇区漕河泾开发区',
    contactPerson: '孙总监',
    phone: '021-57778888',
    email: 'contact@suss-trade.com',
    industry: '贸易',
    registeredCapital: '1000万人民币',
    businessScope: '半导体材料及设备进出口贸易',
    remark: '',
    createdAt: '2024-02-01',
  },
  {
    id: 'se-4',
    name: '昇先创科技（深圳）有限公司',
    code: 'SXC-SE001',
    unifiedSocialCreditCode: '91440300MA1FL8XX4A',
    legalRepresentative: '陈六',
    status: 'active',
    establishmentDate: '2012-04-10',
    taxId: '91440300MA1FL8XX4A',
    address: '深圳市南山区科技园',
    contactPerson: '周工',
    phone: '0755-86668888',
    email: 'sales@sxc-tech.com',
    industry: '半导体',
    registeredCapital: '3000万人民币',
    businessScope: '半导体检测设备研发与销售',
    remark: '',
    createdAt: '2024-03-01',
  },
  {
    id: 'se-5',
    name: '上海华力集成电路有限公司',
    code: 'HLJC-SE001',
    unifiedSocialCreditCode: '91310000MA1FL9XX5B',
    legalRepresentative: '刘七',
    status: 'active',
    establishmentDate: '2010-01-01',
    taxId: '91310000MA1FL9XX5B',
    address: '上海市浦东新区康桥工业区',
    contactPerson: '吴主任',
    phone: '021-58886666',
    email: 'info@hljc.com',
    industry: '集成电路制造',
    registeredCapital: '100亿人民币',
    businessScope: '集成电路芯片制造',
    remark: '',
    createdAt: '2024-03-15',
  },
  {
    id: 'se-6',
    name: 'EBARA 上海荏原精密机械有限公司',
    code: 'EBARA-SE001',
    unifiedSocialCreditCode: '91310000MA1FL0XX6C',
    legalRepresentative: '郑八',
    status: 'inactive',
    establishmentDate: '2005-11-30',
    taxId: '91310000MA1FL0XX6C',
    address: '上海市松江区',
    contactPerson: '冯经理',
    phone: '021-67779999',
    email: 'info@ebara-sh.com',
    industry: '精密机械',
    registeredCapital: '5000万人民币',
    businessScope: '精密机械加工设备制造',
    remark: '2025年起暂停合作',
    createdAt: '2024-04-01',
  },
];

export const initialServiceEntities: import('./types').ServiceEntity[] = [
  {
    id: 'svc-1',
    name: '应用材料（中国）有限公司',
    code: 'AMTS-SVC001',
    unifiedSocialCreditCode: '91310000MA1FL5XX1X',
    legalRepresentative: '张三',
    status: 'active',
    establishmentDate: '2002-03-15',
    taxId: '91310000MA1FL5XX1X',
    address: '上海市浦东新区张江高科技园区',
    contactPerson: '赵经理',
    phone: '021-58888888',
    email: 'service@amat.com',
    remark: '',
    createdAt: '2024-01-01',
  },
  {
    id: 'svc-2',
    name: '飞雅贸易（上海）有限公司（FEIS）',
    code: 'FYMY-SVC001',
    unifiedSocialCreditCode: '91310000MA1FL6XX2Y',
    legalRepresentative: '赵九',
    status: 'active',
    establishmentDate: '2018-08-08',
    taxId: '91310000MA1FL6XX2Y',
    address: '上海市静安区南京西路',
    contactPerson: '陈主管',
    phone: '021-62228888',
    email: 'service@feis-trade.com',
    remark: '',
    createdAt: '2024-01-15',
  },
  {
    id: 'svc-3',
    name: '苏斯贸易（上海）有限公司',
    code: 'SSMY-SVC001',
    unifiedSocialCreditCode: '91310000MA1FL7XX3Z',
    legalRepresentative: '王五',
    status: 'active',
    establishmentDate: '2015-09-20',
    taxId: '91310000MA1FL7XX3Z',
    address: '上海市徐汇区漕河泾开发区',
    contactPerson: '李工',
    phone: '021-57778888',
    email: 'service@suss-trade.com',
    remark: '',
    createdAt: '2024-02-01',
  },
  {
    id: 'svc-4',
    name: '昇先创科技（深圳）有限公司',
    code: 'SXC-SVC001',
    unifiedSocialCreditCode: '91440300MA1FL8XX4A',
    legalRepresentative: '陈六',
    status: 'active',
    establishmentDate: '2012-04-10',
    taxId: '91440300MA1FL8XX4A',
    address: '深圳市南山区科技园',
    contactPerson: '周工',
    phone: '0755-86668888',
    email: 'support@sxc-tech.com',
    remark: '',
    createdAt: '2024-03-01',
  },
  {
    id: 'svc-5',
    name: '上海华力集成电路有限公司',
    code: 'HLJC-SVC001',
    unifiedSocialCreditCode: '91310000MA1FL9XX5B',
    legalRepresentative: '刘七',
    status: 'active',
    establishmentDate: '2010-01-01',
    taxId: '91310000MA1FL9XX5B',
    address: '上海市浦东新区康桥工业区',
    contactPerson: '吴主任',
    phone: '021-58886666',
    email: 'service@hljc.com',
    remark: '',
    createdAt: '2024-03-15',
  },
  {
    id: 'svc-6',
    name: 'EBARA 上海荏原精密机械有限公司',
    code: 'EBARA-SVC001',
    unifiedSocialCreditCode: '91310000MA1FL0XX6C',
    legalRepresentative: '郑八',
    status: 'inactive',
    establishmentDate: '2005-11-30',
    taxId: '91310000MA1FL0XX6C',
    address: '上海市松江区',
    contactPerson: '冯经理',
    phone: '021-67779999',
    email: 'support@ebara-sh.com',
    remark: '2025年起暂停合作',
    createdAt: '2024-04-01',
  },
];

export const initialSettlementEntities: import('./types').SettlementEntity[] = [
  {
    id: 'stl-1',
    name: '应用材料结算中心',
    code: 'AMTS-STL001',
    unifiedSocialCreditCode: '91310000MA1FL5XX1X',
    status: 'active',
    taxId: '91310000MA1FL5XX1X',
    bankName: '中国银行上海分行',
    bankAccount: '1234567890123456',
    currency: 'CNY',
    remark: '主要结算账户',
    createdAt: '2024-01-01',
  },
  {
    id: 'stl-2',
    name: '飞雅贸易结算中心',
    code: 'FYMY-STL001',
    unifiedSocialCreditCode: '91310000MA1FL6XX2Y',
    status: 'active',
    taxId: '91310000MA1FL6XX2Y',
    bankName: '工商银行上海分行',
    bankAccount: '6543210987654321',
    currency: 'CNY',
    remark: '',
    createdAt: '2024-01-15',
  },
  {
    id: 'stl-3',
    name: '苏斯贸易结算中心',
    code: 'SSMY-STL001',
    unifiedSocialCreditCode: '91310000MA1FL7XX3Z',
    status: 'active',
    taxId: '91310000MA1FL7XX3Z',
    bankName: '建设银行上海分行',
    bankAccount: '1111222233334444',
    currency: 'CNY',
    remark: '',
    createdAt: '2024-02-01',
  },
  {
    id: 'stl-4',
    name: '昇先创科技结算中心',
    code: 'SXC-STL001',
    unifiedSocialCreditCode: '91440300MA1FL8XX4A',
    status: 'active',
    taxId: '91440300MA1FL8XX4A',
    bankName: '招商银行深圳分行',
    bankAccount: '5555666677778888',
    currency: 'USD',
    remark: '美元结算',
    createdAt: '2024-03-01',
  },
  {
    id: 'stl-5',
    name: '华力集成电路结算中心',
    code: 'HLJC-STL001',
    unifiedSocialCreditCode: '91310000MA1FL9XX5B',
    status: 'active',
    taxId: '91310000MA1FL9XX5B',
    bankName: '农业银行上海分行',
    bankAccount: '9999000011112222',
    currency: 'CNY',
    remark: '',
    createdAt: '2024-03-15',
  },
  {
    id: 'stl-6',
    name: 'EBARA结算中心',
    code: 'EBARA-STL001',
    unifiedSocialCreditCode: '91310000MA1FL0XX6C',
    status: 'inactive',
    taxId: '91310000MA1FL0XX6C',
    bankName: '中国银行上海分行',
    bankAccount: '3333444455556666',
    currency: 'JPY',
    remark: '日元结算，2025年起暂停',
    createdAt: '2024-04-01',
  },
];

export const initialCustomers: Customer[] = [
  {
    id: 'cust-001',
    name: '应用材料（中国）有限公司',
    customerCode: 'AMTS001',
    signingEntityIds: ['se-1'],
    serviceEntityIds: ['svc-1'],
    settlementEntityIds: ['stl-1'],
    status: 'active',
    createdBy: 'user-1',
    responsiblePersons: ['user-2'],
    collaborators: ['user-3'],
    progressStatus: 'deal_closed',
    createdAt: '2024-01-01',
    // 标签1：企业基本信息
    basicInfo: {
      unifiedSocialCreditCode: '91310000MA1FL5XX1X',
      countryRegion: '美企',
      industryCategory: '半导体',
      mainProducts: '半导体晶圆制造设备',
      industryChainFormat: '制造业',
      supplyChainRole: '设备供应商',
      crossBorderMode: '口岸',
      customerChannel: '直客',
      customerSource: '公司资源',
      customerLevel: 'A',
      potentialCompetitors: '泛林半导体、东京电子',
      relatedEnterprises: '应用材料全球各地子公司',
      addressProvince: '上海市',
      addressCity: '上海市',
      addressDistrict: '浦东新区',
      addressDetail: '张江高科技园区XX路XX号',
      intendedServiceRegions: ['上海', '北京', '深圳'],
      serviceProducts: ['货代', '关务', '仓储'],
      estimatedMonthlyVolume: '500',
      warehouseArea: '2000',
      warehouseConditions: '常温常湿',
      customerSystemCode: 'AMTS001',
      ourAdvantage: '客户关系稳固，业务量大',
      ourDisadvantage: '价格敏感度高',
    },
    // 标签2：工商资质全景信息
    businessInfo: {
      paidInCapital: '5000万美元',
      organizationCode: 'MA1FL5XX1',
      businessRegistrationNumber: '31000040029XXXX',
      taxpayerIdentificationNumber: '91310000MA1FL5XX1X',
      enterpriseType: '有限责任公司',
      businessTerm: '2002-03-15 至 2052-03-14',
      taxpayerQualification: '一般纳税人',
      staffSize: '1000-5000人',
      insuredNumber: '1250',
      approvalDate: '2023-06-20',
      region: '上海市浦东新区',
      registrationAuthority: '上海市市场监督管理局',
      englishName: 'Applied Materials (China) Co., Ltd.',
      registeredAddress: '上海市浦东新区张江高科技园区XX路XX号',
      correspondenceAddress: '上海市浦东新区张江高科技园区XX路XX号',
      businessScope: '半导体设备制造、销售、技术服务；电子产品、机械设备的批发、进出口等',
      phone: '021-58888888',
      registrationStatus: '存续',
      legalRepresentative: '张三',
      email: 'contact@amat.com',
      enterpriseScale: '大型',
      registeredCapital: '5000万美元',
      website: 'www.amat.com.cn',
      establishmentDate: '2002-03-15',
      countryRegion: '中国',
      industryTags: ['半导体', '半导体设备', '芯片设计'],
    },
    // 标签3：半导体产业链定位
    semiconductorInfo: {
      industryChainLevel: 'upstream',
      industryChainRole: 'equipment_supplier',
      industryTags: ['半导体', '半导体设备', '芯片设计', '晶圆制造'],
    },
    // 标签4：企业上下游关联关系
    relatedCompanies: [
      {
        id: 'rc-001-1',
        relatedCompanyId: 'cust-002',
        relatedCompanyName: '飞雅贸易（上海）有限公司',
        relation: 'purchaser',
        relatedCompanyLevel: 'downstream',
        createdAt: '2024-01-15',
      },
      {
        id: 'rc-001-2',
        relatedCompanyId: 'cust-005',
        relatedCompanyName: '苏斯贸易（上海）有限公司',
        relation: 'purchaser',
        relatedCompanyLevel: 'downstream',
        createdAt: '2024-01-16',
      },
    ],
    // 标签5：企业经营商品档案
    products: [
      {
        id: 'prod-001-1',
        productName: '半导体制造设备',
        productCode: 'SME-100',
        customsDeclarationElements: '半导体晶圆制造设备',
        origin: '美国',
        industryChainCategory: '半导体设备',
        relatedBillingEntityId: 'be-1',
        relatedBillingEntityName: 'FWD-8635',
        createdAt: '2024-01-01',
      },
    ],
    // 标签6：账单业务关联配置
    billingEntities: ['be-1', 'be-2', 'be-3', 'be-4', 'be-6'],
    // 标签7：操作日志
    auditLogs: [
      {
        id: 'log-001-1',
        timestamp: '2024-01-15 10:30:00',
        operator: '系统管理员',
        action: 'update',
        targetType: 'customer',
        targetId: 'cust-001',
        targetName: '应用材料（中国）有限公司',
        fieldName: 'industryChainRole',
        oldValue: '芯片设计企业',
        newValue: '设备供应商',
        details: '更新产业链角色信息',
        customerId: 'cust-001',
      },
    ],
    ruleIds: ['rule-001', 'rule-002', 'rule-003', 'rule-004', 'rule-005', 'rule-006'],
  },
  {
    id: 'cust-002',
    name: '飞雅贸易（上海）有限公司',
    customerCode: 'FEIS001',
    signingEntityIds: ['se-2'],
    serviceEntityIds: ['svc-2'],
    settlementEntityIds: ['stl-2'],
    status: 'active',
    createdBy: 'user-1',
    responsiblePersons: ['user-3'],
    collaborators: [],
    progressStatus: 'new_opportunity',
    createdAt: '2024-01-01',
    basicInfo: {
      unifiedSocialCreditCode: '91310000MA1FL6YY2Y',
      countryRegion: '台企',
      industryCategory: '半导体',
      mainProducts: '半导体设备及电子元器件贸易',
      industryChainFormat: '贸易业',
      supplyChainRole: '分销商',
      crossBorderMode: '保税仓库',
      customerChannel: '代理',
      customerSource: '电话咨询',
      customerLevel: 'B',
      potentialCompetitors: '大联大、文晔科技',
      relatedEnterprises: '飞雅全球贸易网络',
      addressProvince: '上海市',
      addressCity: '上海市',
      addressDistrict: '黄浦区',
      addressDetail: 'XX路XX号',
      intendedServiceRegions: ['上海', '苏州', '南京'],
      serviceProducts: ['货代', '运输'],
      estimatedMonthlyVolume: '200',
      warehouseArea: '800',
      warehouseConditions: '恒温恒湿（20-25°C，40-60%RH）',
      ourAdvantage: '代理渠道广泛',
      ourDisadvantage: '客户体量偏小',
    },
    businessInfo: {
      paidInCapital: '1000万人民币',
      organizationCode: 'MA1FL6YY2',
      businessRegistrationNumber: '31000040030YYYY',
      taxpayerIdentificationNumber: '91310000MA1FL6YY2Y',
      enterpriseType: '有限责任公司',
      businessTerm: '2010-08-20 至 2040-08-19',
      taxpayerQualification: '一般纳税人',
      staffSize: '100-500人',
      insuredNumber: '230',
      approvalDate: '2023-03-15',
      region: '上海市黄浦区',
      registrationAuthority: '上海市黄浦区市场监督管理局',
      englishName: 'Feiya Trading (Shanghai) Co., Ltd.',
      registeredAddress: '上海市黄浦区XX路XX号',
      correspondenceAddress: '上海市黄浦区XX路XX号',
      businessScope: '自营和代理各类商品及技术的进出口业务；半导体产品、电子元器件的销售等',
      phone: '021-58889999',
      registrationStatus: '存续',
      legalRepresentative: '李四',
      email: 'info@feiya.com',
      enterpriseScale: '中型',
      registeredCapital: '1000万人民币',
      website: 'www.feiya-trade.com',
      establishmentDate: '2010-08-20',
      countryRegion: '中国',
      industryTags: ['半导体', '分销代理', '消费电子'],
    },
    semiconductorInfo: {
      industryChainLevel: 'downstream',
      industryChainRole: 'distributor_agent',
      industryTags: ['半导体', '分销代理', '消费电子', '汽车电子'],
    },
    relatedCompanies: [],
    products: [],
    auditLogs: [],
  },
  {
    id: 'cust-003',
    name: '中芯国际集成电路制造有限公司',
    customerCode: 'SMIC001',
    status: 'active',
    createdBy: 'user-1',
    responsiblePersons: ['user-4'],
    collaborators: ['user-2'],
    progressStatus: 'pending_followup',
    createdAt: '2024-01-01',
    basicInfo: {
      unifiedSocialCreditCode: '91310000MA1FL7ZZ3Z',
      countryRegion: '中企',
      industryCategory: '半导体',
      mainProducts: '12英寸集成电路晶圆',
      industryChainFormat: '制造业',
      supplyChainRole: '生产制造商',
      crossBorderMode: '口岸',
      customerChannel: '直客',
      customerSource: '公司资源',
      customerLevel: 'K',
      potentialCompetitors: '台积电、三星、格芯',
      relatedEnterprises: '中芯国际各地晶圆厂',
      addressProvince: '上海市',
      addressCity: '上海市',
      addressDistrict: '浦东新区',
      addressDetail: '张江路18号',
      intendedServiceRegions: ['上海', '北京', '天津', '深圳'],
      serviceProducts: ['货代', '关务', '仓储', '运输'],
      estimatedMonthlyVolume: '1000',
      warehouseArea: '5000',
      warehouseConditions: '洁净室 ISO Class 5-7',
      customerSystemCode: 'SMIC001',
      ourAdvantage: '国内最大晶圆代工厂，业务规模大',
      ourDisadvantage: '先进制程受限',
    },
    businessInfo: {
      paidInCapital: '50亿美元',
      organizationCode: 'MA1FL7ZZ3',
      businessRegistrationNumber: '31000040031ZZZZ',
      taxpayerIdentificationNumber: '91310000MA1FL7ZZ3Z',
      enterpriseType: '股份有限公司',
      businessTerm: '2000-04-03 至 无固定期限',
      taxpayerQualification: '一般纳税人',
      staffSize: '10000人以上',
      insuredNumber: '15000',
      approvalDate: '2023-09-10',
      region: '上海市浦东新区',
      registrationAuthority: '上海市市场监督管理局',
      englishName: 'Semiconductor Manufacturing International Corporation',
      registeredAddress: '上海市浦东新区张江路18号',
      correspondenceAddress: '上海市浦东新区张江路18号',
      businessScope: '半导体晶圆制造、技术开发、技术咨询、技术服务；销售自产产品等',
      phone: '021-20818888',
      registrationStatus: '存续',
      legalRepresentative: '高永岗',
      email: 'ir@smics.com',
      enterpriseScale: '超大型',
      registeredCapital: '50亿美元',
      website: 'www.smics.com',
      establishmentDate: '2000-04-03',
      countryRegion: '中国',
      industryTags: ['半导体', '集成电路', '晶圆制造', '封装测试'],
    },
    semiconductorInfo: {
      industryChainLevel: 'midstream',
      industryChainRole: 'wafer_foundry',
      industryTags: ['半导体', '集成电路', '晶圆制造', '芯片设计'],
    },
    relatedCompanies: [
      {
        id: 'rc-003-1',
        relatedCompanyId: 'cust-004',
        relatedCompanyName: '荏原制作所（中国）有限公司',
        relation: 'supplier',
        relatedCompanyLevel: 'upstream',
        createdAt: '2024-02-01',
      },
      {
        id: 'rc-003-2',
        relatedCompanyId: 'cust-001',
        relatedCompanyName: '应用材料（中国）有限公司',
        relation: 'supplier',
        relatedCompanyLevel: 'upstream',
        createdAt: '2024-02-01',
      },
    ],
    products: [
      {
        id: 'prod-003-1',
        productName: '12英寸晶圆',
        productCode: ' wafer-12inch',
        customsDeclarationElements: '集成电路晶圆',
        origin: '中国',
        industryChainCategory: '硅片',
        relatedBillingEntityId: 'be-7',
        relatedBillingEntityName: '8639',
        createdAt: '2024-01-10',
      },
    ],
    auditLogs: [],
    billingEntities: ['be-7', 'be-8', 'be-9'],
    ruleIds: [],
  },
  {
    id: 'cust-005',
    name: '苏斯贸易（上海）有限公司',
    customerCode: 'SUIS001',
    signingEntityIds: ['se-3'],
    serviceEntityIds: ['svc-3'],
    settlementEntityIds: ['stl-3'],
    status: 'active',
    createdBy: 'user-2',
    responsiblePersons: ['user-5'],
    collaborators: ['user-6'],
    progressStatus: 'preliminary_intent',
    createdAt: '2024-01-01',
    basicInfo: {
      unifiedSocialCreditCode: '91310000MA1FL9BB5B',
      countryRegion: '德企',
      industryCategory: '半导体',
      mainProducts: '半导体测试设备及电子元器件',
      industryChainFormat: '贸易业',
      supplyChainRole: '分销商',
      crossBorderMode: '直通',
      customerChannel: '代理',
      customerSource: '客户推荐',
      customerLevel: 'B',
      potentialCompetitors: '艾睿电子、安富利',
      relatedEnterprises: 'SUSS MicroTec 德国总部',
      addressProvince: '上海市',
      addressCity: '上海市',
      addressDistrict: '静安区',
      addressDetail: 'XX路XX号',
      intendedServiceRegions: ['上海', '广州', '深圳'],
      serviceProducts: ['货代', '关务', '进出口'],
      estimatedMonthlyVolume: '150',
      warehouseArea: '500',
      warehouseConditions: '常温',
      ourAdvantage: '品牌代理资质齐全',
      ourDisadvantage: '地域覆盖有限',
    },
    businessInfo: {
      paidInCapital: '2000万人民币',
      organizationCode: 'MA1FL9BB5',
      businessRegistrationNumber: '31000040033BBBB',
      taxpayerIdentificationNumber: '91310000MA1FL9BB5B',
      enterpriseType: '有限责任公司',
      businessTerm: '2008-03-12 至 2048-03-11',
      taxpayerQualification: '一般纳税人',
      staffSize: '100-500人',
      insuredNumber: '180',
      approvalDate: '2023-04-20',
      region: '上海市静安区',
      registrationAuthority: '上海市静安区市场监督管理局',
      englishName: 'Suis Trading (Shanghai) Co., Ltd.',
      registeredAddress: '上海市静安区XX路XX号',
      correspondenceAddress: '上海市静安区XX路XX号',
      businessScope: '自营和代理各类商品及技术的进出口业务；电子元器件、半导体产品的销售等',
      phone: '021-50188866',
      registrationStatus: '存续',
      legalRepresentative: '王五',
      email: 'info@suis-trade.com',
      enterpriseScale: '中型',
      registeredCapital: '2000万人民币',
      website: 'www.suis-trade.com',
      establishmentDate: '2008-03-12',
      countryRegion: '中国',
      industryTags: ['半导体', '电子元器件', '工业自动化'],
    },
    semiconductorInfo: {
      industryChainLevel: 'downstream',
      industryChainRole: 'distributor_agent',
      industryTags: ['半导体', '电子元器件', '分销代理', '消费电子'],
    },
    relatedCompanies: [
      {
        id: 'rc-005-1',
        relatedCompanyId: 'cust-001',
        relatedCompanyName: '应用材料（中国）有限公司',
        relation: 'supplier',
        relatedCompanyLevel: 'upstream',
        createdAt: '2024-02-15',
      },
    ],
    products: [
      {
        id: 'prod-005-1',
        productName: '半导体测试设备',
        productCode: 'TEST-500',
        customsDeclarationElements: '集成电路测试设备',
        origin: '新加坡',
        industryChainCategory: '半导体设备',
        relatedBillingEntityId: 'be-1',
        relatedBillingEntityName: 'FWD-8635',
        createdAt: '2024-01-20',
      },
    ],
    auditLogs: [],
    billingEntities: ['be-1', 'be-2'],
    ruleIds: [],
  },
  {
    id: 'cust-006',
    name: '昇先创科技（深圳）有限公司',
    customerCode: 'SHIN001',
    signingEntityIds: ['se-4'],
    serviceEntityIds: ['svc-4'],
    settlementEntityIds: ['stl-4'],
    status: 'active',
    createdBy: 'user-1',
    responsiblePersons: ['user-2'],
    collaborators: ['user-7'],
    progressStatus: 'newly_acquired',
    createdAt: '2024-01-01',
    basicInfo: {
      unifiedSocialCreditCode: '91440300MA5DP6CC6C',
      countryRegion: '港企',
      industryCategory: '半导体',
      mainProducts: 'AI推理芯片、物联网芯片',
      industryChainFormat: '科技业',
      supplyChainRole: '品牌商',
      crossBorderMode: '保税区域',
      customerChannel: '直客',
      customerSource: '自主开拓',
      customerLevel: 'A',
      potentialCompetitors: '地平线、寒武纪',
      relatedEnterprises: '昇先创香港总部',
      addressProvince: '广东省',
      addressCity: '深圳市',
      addressDistrict: '南山区',
      addressDetail: '科技园南区XX路XX号',
      intendedServiceRegions: ['深圳', '广州', '东莞'],
      serviceProducts: ['货代', '关务'],
      estimatedMonthlyVolume: '80',
      warehouseArea: '300',
      warehouseConditions: '静电防护（EPA）',
      customerSystemCode: 'SHIN001',
      ourAdvantage: 'AI芯片赛道前景好',
      ourDisadvantage: '合作时间短，信任度待提升',
    },
    businessInfo: {
      paidInCapital: '5000万人民币',
      organizationCode: 'MA5DP6CC6',
      businessRegistrationNumber: '44030040CCCC',
      taxpayerIdentificationNumber: '91440300MA5DP6CC6C',
      enterpriseType: '有限责任公司',
      businessTerm: '2015-09-08 至 长期',
      taxpayerQualification: '一般纳税人',
      staffSize: '500-1000人',
      insuredNumber: '450',
      approvalDate: '2023-08-12',
      region: '广东省深圳市南山区',
      registrationAuthority: '深圳市市场监督管理局',
      englishName: 'Shin先创 Technology (Shenzhen) Co., Ltd.',
      registeredAddress: '深圳市南山区科技园南区XX路XX号',
      correspondenceAddress: '深圳市南山区科技园南区XX路XX号',
      businessScope: '半导体芯片设计、研发、销售；集成电路设计、技术开发、技术咨询等',
      phone: '0755-88886666',
      registrationStatus: '存续',
      legalRepresentative: '陈六',
      email: 'info@shin-tech.com',
      enterpriseScale: '中型',
      registeredCapital: '5000万人民币',
      website: 'www.shin-tech.com',
      establishmentDate: '2015-09-08',
      countryRegion: '中国',
      industryTags: ['半导体', '芯片设计', '人工智能', '物联网'],
    },
    semiconductorInfo: {
      industryChainLevel: 'midstream',
      industryChainRole: 'chip_design',
      industryTags: ['半导体', '芯片设计', '人工智能芯片', '物联网芯片'],
    },
    relatedCompanies: [
      {
        id: 'rc-006-1',
        relatedCompanyId: 'cust-003',
        relatedCompanyName: '中芯国际集成电路制造有限公司',
        relation: 'purchaser',
        relatedCompanyLevel: 'midstream',
        createdAt: '2024-03-01',
      },
      {
        id: 'rc-006-2',
        relatedCompanyId: 'cust-007',
        relatedCompanyName: '上海华力集成电路有限公司',
        relation: 'purchaser',
        relatedCompanyLevel: 'midstream',
        createdAt: '2024-03-01',
      },
    ],
    products: [
      {
        id: 'prod-006-1',
        productName: 'AI推理芯片',
        productCode: 'AI-CHIP-001',
        customsDeclarationElements: '人工智能芯片',
        origin: '中国',
        industryChainCategory: '芯片设计',
        relatedBillingEntityId: 'be-7',
        relatedBillingEntityName: '8639',
        createdAt: '2024-02-01',
      },
    ],
    auditLogs: [],
    billingEntities: ['be-7', 'be-8'],
    ruleIds: [],
  },
  {
    id: 'cust-007',
    name: '上海华力集成电路有限公司',
    customerCode: 'HLMC001',
    signingEntityIds: ['se-5'],
    serviceEntityIds: ['svc-5'],
    settlementEntityIds: ['stl-5'],
    status: 'active',
    createdBy: 'user-2',
    responsiblePersons: ['user-4'],
    collaborators: [],
    progressStatus: 'preliminary_intent',
    createdAt: '2024-01-01',
    basicInfo: {
      unifiedSocialCreditCode: '91310000MA1FL0DD7D',
      countryRegion: '中企',
      industryCategory: '半导体',
      mainProducts: '28nm/14nm工艺集成电路晶圆',
      industryChainFormat: '制造业',
      supplyChainRole: '生产制造商',
      crossBorderMode: '口岸',
      customerChannel: '直客',
      customerSource: '公司资源',
      customerLevel: 'K',
      potentialCompetitors: '台积电（南京）、联电',
      relatedEnterprises: '华虹集团旗下各子公司',
      addressProvince: '上海市',
      addressCity: '上海市',
      addressDistrict: '浦东新区',
      addressDetail: '康桥镇康桥路XX号',
      intendedServiceRegions: ['上海', '无锡', '合肥'],
      serviceProducts: ['货代', '关务', '仓储', '运输', '合同物流'],
      estimatedMonthlyVolume: '800',
      warehouseArea: '3000',
      warehouseConditions: '洁净室 ISO Class 4-6',
      customerSystemCode: 'HLMC001',
      ourAdvantage: '国内先进制程代表企业',
      ourDisadvantage: '产能紧张，交期压力大',
    },
    businessInfo: {
      paidInCapital: '40亿美元',
      organizationCode: 'MA1FL0DD7',
      businessRegistrationNumber: '31000040034DDDD',
      taxpayerIdentificationNumber: '91310000MA1FL0DD7D',
      enterpriseType: '有限责任公司',
      businessTerm: '2016-11-09 至 无固定期限',
      taxpayerQualification: '一般纳税人',
      staffSize: '5000-10000人',
      insuredNumber: '8000',
      approvalDate: '2023-10-15',
      region: '上海市浦东新区',
      registrationAuthority: '上海市市场监督管理局',
      englishName: 'Shanghai Huali Microelectronics Corporation',
      registeredAddress: '上海市浦东新区康桥镇康桥路XX号',
      correspondenceAddress: '上海市浦东新区康桥镇康桥路XX号',
      businessScope: '集成电路制造、技术开发、技术咨询、技术服务；电子产品、通信设备的销售等',
      phone: '021-50808888',
      registrationStatus: '存续',
      legalRepresentative: '张建',
      email: 'info@hlmc.com',
      enterpriseScale: '超大型',
      registeredCapital: '40亿美元',
      website: 'www.hlmc.com',
      establishmentDate: '2016-11-09',
      countryRegion: '中国',
      industryTags: ['半导体', '集成电路', '晶圆制造', '先进制程'],
    },
    semiconductorInfo: {
      industryChainLevel: 'midstream',
      industryChainRole: 'wafer_foundry',
      industryTags: ['半导体', '集成电路', '晶圆制造', '28nm制程', '14nm制程'],
    },
    relatedCompanies: [
      {
        id: 'rc-007-1',
        relatedCompanyId: 'cust-004',
        relatedCompanyName: '荏原制作所（中国）有限公司',
        relation: 'supplier',
        relatedCompanyLevel: 'upstream',
        createdAt: '2024-03-05',
      },
      {
        id: 'rc-007-2',
        relatedCompanyId: 'cust-001',
        relatedCompanyName: '应用材料（中国）有限公司',
        relation: 'supplier',
        relatedCompanyLevel: 'upstream',
        createdAt: '2024-03-05',
      },
      {
        id: 'rc-007-3',
        relatedCompanyId: 'cust-006',
        relatedCompanyName: '昇先创科技（深圳）有限公司',
        relation: 'purchaser',
        relatedCompanyLevel: 'midstream',
        createdAt: '2024-03-05',
      },
    ],
    products: [
      {
        id: 'prod-007-1',
        productName: '28nm工艺晶圆',
        productCode: 'HL-WAFER-28NM',
        customsDeclarationElements: '28纳米集成电路晶圆',
        origin: '中国',
        industryChainCategory: '晶圆制造',
        relatedBillingEntityId: 'be-7',
        relatedBillingEntityName: '8639',
        createdAt: '2024-02-15',
      },
    ],
    auditLogs: [],
    billingEntities: ['be-7', 'be-8', 'be-9', 'be-10'],
    ruleIds: ['rule-018', 'rule-019'],
  },
  // 荏原
  {
    id: 'cust-008',
    name: '上海荏原精密机械有限公司',
    customerCode: 'EBARA001',
    signingEntityIds: ['se-6'],
    serviceEntityIds: ['svc-6'],
    settlementEntityIds: ['stl-6'],
    status: 'active',
    createdBy: 'user-1',
    responsiblePersons: ['user-5'],
    collaborators: ['user-3', 'user-6'],
    progressStatus: 'new_opportunity',
    createdAt: '2024-01-05',
    basicInfo: {
      unifiedSocialCreditCode: '91310000607400XXXX',
      countryRegion: '日企',
      industryCategory: '半导体',
      mainProducts: 'CMP抛光设备、真空泵',
      industryChainFormat: '制造业',
      supplyChainRole: '设备供应商',
      crossBorderMode: '保税仓库',
      customerChannel: '直客',
      customerSource: '公司资源',
      customerLevel: 'A',
      potentialCompetitors: '应用材料、迪恩士',
      relatedEnterprises: '株式会社荏原制作所（日本总部）',
      addressProvince: '上海市',
      addressCity: '上海市',
      addressDistrict: '浦东新区',
      addressDetail: '金桥出口加工区XX路XX号',
      intendedServiceRegions: ['上海', '大连', '武汉'],
      serviceProducts: ['货代', '关务', '仓储'],
      estimatedMonthlyVolume: '300',
      warehouseArea: '1500',
      warehouseConditions: '恒温恒湿（22±2°C，50±10%RH）',
      customerSystemCode: 'EBARA001',
      ourAdvantage: '日系客户关系紧密',
      ourDisadvantage: '语言沟通成本高',
    },
    businessInfo: {
      paidInCapital: '1500万美元',
      organizationCode: '607400XX-X',
      businessRegistrationNumber: '3100004002XXXX',
      taxpayerIdentificationNumber: '91310000607400XXXX',
      enterpriseType: '有限责任公司（台港澳法人独资）',
      businessTerm: '1998-05-15 至 2048-05-14',
      taxpayerQualification: '一般纳税人',
      staffSize: '500-1000人',
      insuredNumber: '650',
      approvalDate: '1998-05-15',
      region: '上海市浦东新区',
      registrationAuthority: '上海市市场监督管理局',
      englishName: 'Shanghai Ebara Precision Machinery Co., Ltd.',
      registeredAddress: '上海市浦东新区金桥出口加工区XX路XX号',
      correspondenceAddress: '上海市浦东新区金桥出口加工区XX路XX号',
      businessScope: '设计、生产精密机械、真空泵、CMP设备及其零部件，销售公司自产产品，并提供相关的技术咨询和售后服务。',
      phone: '021-5899XXXX',
      registrationStatus: '存续',
      legalRepresentative: '本多XX',
      email: 'contact@ebara.com.cn',
      enterpriseScale: '大型',
      registeredCapital: '1500万美元',
      website: 'www.ebara.com.cn',
      establishmentDate: '1998-05-15',
      countryRegion: '中国',
      industryTags: ['精密机械', '半导体设备', 'CMP设备', '真空泵'],
    },
    semiconductorInfo: {
      industryChainLevel: 'upstream',
      industryChainRole: 'equipment_supplier',
      industryTags: ['半导体设备', 'CMP设备', '真空泵', '精密机械'],
    },
    relatedCompanies: [
      {
        id: 'rc-008-1',
        relatedCompanyId: 'cust-001',
        relatedCompanyName: '应用材料（中国）有限公司',
        relation: 'partner',
        relatedCompanyLevel: 'upstream',
        createdAt: '2024-03-01',
      },
      {
        id: 'rc-008-2',
        relatedCompanyId: 'cust-007',
        relatedCompanyName: '上海华力集成电路有限公司',
        relation: 'purchaser',
        relatedCompanyLevel: 'midstream',
        createdAt: '2024-03-01',
      },
    ],
    products: [
      {
        id: 'prod-008-1',
        productName: 'CMP抛光设备',
        productCode: 'EBARA-CMP-001',
        customsDeclarationElements: '半导体晶圆CMP抛光设备',
        origin: '日本',
        industryChainCategory: '半导体设备',
        relatedBillingEntityId: 'be-1',
        relatedBillingEntityName: 'CMP部门',
        createdAt: '2024-02-01',
      },
    ],
    auditLogs: [],
    billingEntities: ['be-11'],
    ruleIds: ['rule-012', 'rule-013'],
  },
  // 西安岛津
  {
    id: 'cust-009',
    name: '岛津企业管理（中国）有限公司',
    customerCode: 'DJQY001',
    signingEntityIds: ['se-3'],
    serviceEntityIds: ['svc-3'],
    settlementEntityIds: ['stl-3'],
    status: 'active',
    createdBy: 'user-2',
    responsiblePersons: ['user-6'],
    collaborators: [],
    progressStatus: 'pending_followup',
    createdAt: '2024-01-08',
    basicInfo: {
      unifiedSocialCreditCode: '91610000MA6TXXXXX',
      countryRegion: '日企',
      industryCategory: '医疗健康',
      mainProducts: '分析仪器、半导体检测设备',
      industryChainFormat: '制造业',
      supplyChainRole: '设备供应商',
      crossBorderMode: '普通仓库',
      customerChannel: '同行',
      customerSource: '客户推荐',
      customerLevel: 'C',
      potentialCompetitors: '安捷伦、赛默飞',
      relatedEnterprises: '株式会社岛津制作所（日本总部）',
      addressProvince: '陕西省',
      addressCity: '西安市',
      addressDistrict: '高新区',
      addressDetail: 'XX路XX号',
      intendedServiceRegions: ['西安', '成都', '武汉'],
      serviceProducts: ['货代', '关务', '运输'],
      estimatedMonthlyVolume: '50',
      warehouseArea: '400',
      warehouseConditions: '常温干燥',
      ourAdvantage: '品牌知名度高',
      ourDisadvantage: '市场竞争激烈，毛利偏低',
    },
    businessInfo: {
      paidInCapital: '800万美元',
      organizationCode: 'MA6TXXXX-X',
      businessRegistrationNumber: '6100004000XXXX',
      taxpayerIdentificationNumber: '91610000MA6TXXXXX',
      enterpriseType: '有限责任公司（外国法人独资）',
      businessTerm: '2005-10-20 至 2035-10-19',
      taxpayerQualification: '一般纳税人',
      staffSize: '200-500人',
      insuredNumber: '350',
      approvalDate: '2005-10-20',
      region: '陕西省西安市',
      registrationAuthority: '西安市市场监督管理局',
      englishName: 'Shimadzu Enterprise Management (China) Co., Ltd.',
      registeredAddress: '陕西省西安市高新区XX路XX号',
      correspondenceAddress: '陕西省西安市高新区XX路XX号',
      businessScope: '分析仪器、测量仪器、医疗设备、半导体检测设备及其零部件的销售、维修和技术服务。',
      phone: '029-8866XXXX',
      registrationStatus: '存续',
      legalRepresentative: '藤本XX',
      email: 'info@shimadzu.com.cn',
      enterpriseScale: '大型',
      registeredCapital: '800万美元',
      website: 'www.shimadzu.com.cn',
      establishmentDate: '2005-10-20',
      countryRegion: '中国',
      industryTags: ['分析仪器', '测量仪器', '医疗设备', '半导体检测'],
    },
    semiconductorInfo: {
      industryChainLevel: 'upstream',
      industryChainRole: 'equipment_supplier',
      industryTags: ['分析仪器', '检测设备', '半导体检测', '测量仪器'],
    },
    relatedCompanies: [
      {
        id: 'rc-009-1',
        relatedCompanyId: 'cust-007',
        relatedCompanyName: '上海华力集成电路有限公司',
        relation: 'purchaser',
        relatedCompanyLevel: 'midstream',
        createdAt: '2024-03-10',
      },
      {
        id: 'rc-009-2',
        relatedCompanyId: 'cust-003',
        relatedCompanyName: '中芯国际集成电路制造有限公司',
        relation: 'purchaser',
        relatedCompanyLevel: 'midstream',
        createdAt: '2024-03-10',
      },
    ],
    products: [
      {
        id: 'prod-009-1',
        productName: '半导体检测设备',
        productCode: 'SM-DET-001',
        customsDeclarationElements: '半导体晶圆检测设备',
        origin: '日本',
        industryChainCategory: '半导体设备',
        relatedBillingEntityId: 'be-12',
        relatedBillingEntityName: '备件货',
        createdAt: '2024-02-10',
      },
    ],
    auditLogs: [],
    billingEntities: ['be-12'],
    ruleIds: ['rule-020', 'rule-021', 'rule-022'],
  },
];

export const initialQuoteTemplates: QuoteTemplate[] = [
  {
    id: 'qt-001',
    name: '国际货代标准模板',
    business: 'forwarding',
    version: 'v1.2',
    itemCount: 15,
    maintainer: '张三',
    lastUpdated: '2024-01-15',
    status: 'enabled',
    isCustomerServiceVisible: true,
    remark: '适用于欧美线货代业务',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'qt-002',
    name: '关务报关模板',
    business: 'customs',
    version: 'v2.0',
    itemCount: 8,
    maintainer: '李四',
    lastUpdated: '2024-01-12',
    status: 'enabled',
    isCustomerServiceVisible: true,
    remark: '一般贸易进出口报关',
    createdAt: '2024-01-02',
    updatedAt: '2024-01-12',
  },
  {
    id: 'qt-003',
    name: '仓储服务模板',
    business: 'warehousing',
    version: 'v1.0',
    itemCount: 12,
    maintainer: '王五',
    lastUpdated: '2024-01-10',
    status: 'disabled',
    isCustomerServiceVisible: false,
    remark: '含仓储费、装卸费等',
    createdAt: '2024-01-03',
    updatedAt: '2024-01-10',
  },
  {
    id: 'qt-004',
    name: '运输配送模板',
    business: 'transportation',
    version: 'v1.5',
    itemCount: 10,
    maintainer: '赵六',
    lastUpdated: '2024-01-08',
    status: 'enabled',
    isCustomerServiceVisible: true,
    remark: '干线运输和市内配送',
    createdAt: '2024-01-04',
    updatedAt: '2024-01-08',
  },
  {
    id: 'qt-005',
    name: '一体化供应链模板',
    business: 'integrated_supply_chain',
    version: 'v3.0',
    itemCount: 25,
    maintainer: '张三',
    lastUpdated: '2024-01-05',
    status: 'enabled',
    isCustomerServiceVisible: false,
    remark: '全链路供应链服务',
    createdAt: '2024-01-05',
    updatedAt: '2024-01-05',
  },
];
