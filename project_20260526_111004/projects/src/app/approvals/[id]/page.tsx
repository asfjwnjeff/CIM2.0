'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useApp } from '@/lib/store';
import { RuleTriggeredApprover } from '@/lib/types';
import ApprovalFlowVisual from '@/components/ApprovalFlowVisual';
import ApprovalReport, { ReportItem } from '@/components/ApprovalReport';

// 常量定义（与新增页面一致）
const SERVICE_PRODUCTS = ['货代', '关务', '仓库', '运输', '进出口', '维修', '合同物流', '一体化供应链', '其他'];
const BUSINESS_TYPES = ['保税', '口岸完税', '免税', '试单', '其他'];
const MONTHLY_VOLUMES = ['0-50', '51-100', '101-500', '500以上'];
const CUSTOM_SERVICE_OPTIONS = ['信息系统', '运输', '仓库', '财务', '仅涉及标准服务内容'];
const RISK_PURPOSES = ['业务可行性评审', '仅增加结算单位', '仅增加境外收发货人'];
const HMG_RELATIONS = ['客户', '供应商', '最终用户', '结算单位', '内部用户'];

const SERVICE_APPROVERS: Record<string, { approvers: string[]; isPickOne?: boolean }> = {
  '货代': { approvers: ['张洁'] },
  '关务': { approvers: ['蒋总'] },
  '仓库': { approvers: ['吴总'] },
  '运输': { approvers: ['朱弢'] },
  '进出口': { approvers: ['张洁'] },
  '维修': { approvers: ['蒋总'] },
  '合同物流': { approvers: ['张洁', '蒋总', '吴总', '朱弢'], isPickOne: true },
  '一体化供应链': { approvers: ['张洁'] },
  '其他': { approvers: ['张洁'] },
};

const mockBusinessCustomers = [
  { id: 'bc1', name: '应用材料(中国)有限公司' },
  { id: 'bc2', name: '飞雅贸易(上海)有限公司' },
  { id: 'bc3', name: '荏原机械(中国)有限公司' },
  { id: 'bc4', name: '昇先创国际贸易(上海)有限公司' },
  { id: 'bc5', name: '上海华力集成电路制造有限公司' },
  { id: 'bc6', name: '苏斯贸易(上海)有限公司' },
  { id: 'bc7', name: '武汉光库科技有限公司' },
  { id: 'bc8', name: '江苏鑫华半导体科技股份有限公司' },
  { id: 'bc9', name: '上海裘瑞经贸有限公司' },
  { id: 'bc10', name: '中芯国际集成电路制造有限公司' },
  { id: 'bc11', name: '长江存储科技有限责任公司' },
];

const mockInvoiceInfos = [
  { id: 'inv1', title: '8635 - 应用材料(中国)有限公司', taxNumber: '91310000607239088X' },
  { id: 'inv2', title: '8639 - 飞雅贸易(上海)有限公司', taxNumber: '91310000607239089Y' },
  { id: 'inv3', title: '8641 - 荏原机械(中国)有限公司', taxNumber: '91310000607239090Z' },
  { id: 'inv4', title: '8644 - 昇先创国际贸易(上海)有限公司', taxNumber: '91310000607239091A' },
  { id: 'inv5', title: '8603 - 上海华力集成电路制造有限公司', taxNumber: '91310000607239092B' },
  { id: 'inv6', title: '8612 - 武汉光库科技有限公司', taxNumber: '914201007713589677' },
  { id: 'inv7', title: '8625 - 江苏鑫华半导体科技股份有限公司', taxNumber: '91320301MA1MCPLL8F' },
  { id: 'inv8', title: '8630 - 上海裘瑞经贸有限公司', taxNumber: '91310118738523211W' },
  { id: 'inv9', title: '8648 - 中芯国际集成电路制造有限公司', taxNumber: '91310000MA1FL5N06M' },
  { id: 'inv10', title: '8655 - 长江存储科技有限责任公司', taxNumber: '91420100MA4KN4K47W' },
];

const mockOpportunities = [
  { id: 'opp1', title: '应用材料-货代服务', customer: '应用材料(中国)有限公司', serviceProduct: '货代' },
  { id: 'opp2', title: '飞雅贸易-仓储服务', customer: '飞雅贸易(上海)有限公司', serviceProduct: '仓库' },
  { id: 'opp3', title: '荏原机械-运输服务', customer: '荏原机械(中国)有限公司', serviceProduct: '运输' },
  { id: 'opp4', title: '昇先创-进出口服务', customer: '昇先创国际贸易(上海)有限公司', serviceProduct: '进出口' },
  { id: 'opp5', title: '上海华力-合同物流', customer: '上海华力集成电路制造有限公司', serviceProduct: '合同物流' },
  { id: 'opp6', title: '武汉光库-归类服务', customer: '武汉光库科技有限公司', serviceProduct: '关务' },
  { id: 'opp7', title: '江苏鑫华-仓储业务', customer: '江苏鑫华半导体科技股份有限公司', serviceProduct: '一体化供应链' },
  { id: 'opp8', title: '上海裘瑞-贸易代理', customer: '上海裘瑞经贸有限公司', serviceProduct: '货代' },
  { id: 'opp9', title: '中芯国际-维修服务', customer: '中芯国际集成电路制造有限公司', serviceProduct: '维修' },
  { id: 'opp10', title: '长江存储-运输服务', customer: '长江存储科技有限责任公司', serviceProduct: '运输' },
];

// 5条示例数据
const mockApprovals = [
  {
    // ID 1: 货代 - 否 - 草稿（发起人current）
    id: '1',
    isTradeAgent: '否',
    serviceProduct: '货代',
    businessType: '保税',
    goodsType: '半导体设备',
    monthlyBusinessVolume: '101-500',
    monthlyInvoiceAmount: '约50万/月',
    customsKpiRequirement: '通关时效≤24小时，单证准确率≥99.5%',
    transportKpiRequirement: '运输时效≤48小时，货损率≤0.1%',
    warehouseLeaseRequirement: '需常温仓库2000㎡，位于浦东机场附近',
    customServiceRequirement: '信息系统',
    customRequirementDescription: '需要对接客户ERP系统，实现订单自动推送和状态回传',
    companyName: '应用材料(中国)有限公司',
    englishName: 'Applied Materials China Co., Ltd.',
    parentCompany: 'Applied Materials, Inc.',
    subsidiaryCompany: '',
    riskControlPurpose: '业务可行性评审',
    relationshipWithHMG: '客户',
    businessCustomerIds: ['bc1'],
    suggestedSystemCode: 'AMC-2026-001',
    opportunityId: 'opp1',
    invoiceInfoIds: ['inv1'],
    settlementPeriod: '月结30天',
    contactName: '李总',
    approvalSteps: [
      { id: 'init', name: '发起审批', role: '申请人', status: 'current', approver: '王明', level: 1 },
      { id: 'mgmt', name: '部门经理审批', role: '部门经理', status: 'pending', approver: '陈总', level: 2 },
      { id: 'func', name: '职能审批', role: '货代职能审批人', status: 'pending', approver: '张洁', level: 3 },
      { id: 'fin', name: '财务审批', role: '财务部+中心总经理（会签）', status: 'pending', approver: '赵总监、中心总经理', level: 4 },
      { id: 'gm', name: '总经理审批', role: '各中心负责人', status: 'pending', approver: '各中心负责人', level: 5 },
      { id: 'it', name: 'IT运维确认', role: 'IT运维', status: 'pending', approver: 'IT运维', level: 6 },
    ],
  },
  {
    // ID 2: 仓库 - 否 - 审批中（走到节点3职能审批）
    id: '2',
    isTradeAgent: '否',
    serviceProduct: '仓库',
    businessType: '口岸完税',
    goodsType: '电子元器件',
    monthlyBusinessVolume: '51-100',
    monthlyInvoiceAmount: '约30万/月',
    customsKpiRequirement: '无特殊要求',
    transportKpiRequirement: '无特殊要求',
    warehouseLeaseRequirement: '需恒温恒湿仓库500㎡，位于外高桥保税区',
    customServiceRequirement: '仓储',
    customRequirementDescription: '需要VMI库存管理服务，支持按需出库',
    companyName: '飞雅贸易(上海)有限公司',
    englishName: 'Fiya Trading (Shanghai) Co., Ltd.',
    parentCompany: '',
    subsidiaryCompany: '飞雅贸易深圳分公司',
    riskControlPurpose: '仅增加结算单位',
    relationshipWithHMG: '客户',
    businessCustomerIds: ['bc2'],
    suggestedSystemCode: 'FYC-2026-002',
    opportunityId: 'opp2',
    invoiceInfoIds: ['inv2'],
    settlementPeriod: '月结45天',
    contactName: '王经理',
    approvalSteps: [
      { id: 'init', name: '发起审批', role: '申请人', status: 'completed', approver: '王明', level: 1 },
      { id: 'mgmt', name: '部门经理审批', role: '部门经理', status: 'completed', approver: '陈总', level: 2 },
      { id: 'func', name: '职能审批', role: '仓储职能审批人', status: 'current', approver: '吴总', level: 3 },
      { id: 'fin', name: '财务审批', role: '财务部+中心总经理（会签）', status: 'pending', approver: '赵总监、中心总经理', level: 4 },
      { id: 'gm', name: '总经理审批', role: '各中心负责人', status: 'pending', approver: '各中心负责人', level: 5 },
      { id: 'it', name: 'IT运维确认', role: 'IT运维', status: 'pending', approver: 'IT运维', level: 6 },
    ],
  },
  {
    // ID 3: 运输 - 是 - 审批中（走到节点4财务审批，贸易代理触发白沥追加）
    id: '3',
    isTradeAgent: '是',
    serviceProduct: '运输',
    businessType: '免税',
    goodsType: '精密仪器',
    monthlyBusinessVolume: '0-50',
    monthlyInvoiceAmount: '约15万/月',
    customsKpiRequirement: '通关时效≤12小时，需AEO认证通道',
    transportKpiRequirement: '运输时效≤24小时，需全程GPS跟踪，货损率≤0.05%',
    warehouseLeaseRequirement: '需临时中转仓300㎡，位于虹桥机场附近',
    customServiceRequirement: '运输',
    customRequirementDescription: '需要专车运输服务，配备防震设备和温控系统',
    companyName: '荏原机械(中国)有限公司',
    englishName: 'Ebara Machinery China Co., Ltd.',
    parentCompany: '荏原制作所',
    subsidiaryCompany: '',
    riskControlPurpose: '业务可行性评审',
    relationshipWithHMG: '客户',
    businessCustomerIds: ['bc3'],
    suggestedSystemCode: 'YBJ-2026-003',
    opportunityId: 'opp3',
    invoiceInfoIds: ['inv3'],
    settlementPeriod: '月结60天',
    contactName: '张总监',
    approvalSteps: [
      { id: 'init', name: '发起审批', role: '申请人', status: 'completed', approver: '刘芳', level: 1 },
      { id: 'mgmt', name: '部门经理审批', role: '部门经理', status: 'completed', approver: '陈总', level: 2 },
      { id: 'func', name: '职能审批', role: '运输职能审批人', status: 'completed', approver: '朱弢', level: 3 },
      { id: 'fin', name: '财务审批', role: '财务部+中心总经理（会签）', status: 'current', approver: '赵总监、中心总经理', level: 4 },
      { id: 'gm', name: '总经理审批', role: '各中心负责人', status: 'pending', approver: '各中心负责人', level: 5 },
      { id: 'it', name: 'IT运维确认', role: 'IT运维', status: 'pending', approver: 'IT运维', level: 6 },
    ],
  },
  {
    // ID 4: 进出口 - 否 - 审批中（走到节点5总经理）
    id: '4',
    isTradeAgent: '否',
    serviceProduct: '进出口',
    businessType: '试单',
    goodsType: '化工原料',
    monthlyBusinessVolume: '500以上',
    monthlyInvoiceAmount: '约100万/月',
    customsKpiRequirement: '通关时效≤6小时，需危化品通关资质',
    transportKpiRequirement: '运输需危化品运输资质，全程温控监测',
    warehouseLeaseRequirement: '需危化品专用仓库1000㎡，甲类资质',
    customServiceRequirement: '仅涉及标准服务内容',
    customRequirementDescription: '无特殊定制化需求',
    companyName: '昇先创国际贸易(上海)有限公司',
    englishName: 'Sunson International Trading Co., Ltd.',
    parentCompany: '',
    subsidiaryCompany: '',
    riskControlPurpose: '仅增加境外收发货人',
    relationshipWithHMG: '供应商',
    businessCustomerIds: ['bc4', 'bc6'],
    suggestedSystemCode: 'SXC-2026-004',
    opportunityId: 'opp4',
    invoiceInfoIds: ['inv4'],
    settlementPeriod: '月结30天',
    contactName: '陈主管',
    approvalSteps: [
      { id: 'init', name: '发起审批', role: '申请人', status: 'completed', approver: '李强', level: 1 },
      { id: 'mgmt', name: '部门经理审批', role: '部门经理', status: 'completed', approver: '陈总', level: 2 },
      { id: 'func', name: '职能审批', role: '进出口职能审批人', status: 'completed', approver: '张洁', level: 3 },
      { id: 'fin', name: '财务审批', role: '财务部+中心总经理（会签）', status: 'completed', approver: '赵总监、中心总经理', level: 4 },
      { id: 'gm', name: '总经理审批', role: '各中心负责人', status: 'current', approver: '各中心负责人', level: 5 },
      { id: 'it', name: 'IT运维确认', role: 'IT运维', status: 'pending', approver: 'IT运维', level: 6 },
    ],
  },
  {
    // ID 5: 合同物流 - 否 - 审批中（走到节点3职能审批，四选一选了蒋总）
    id: '5',
    isTradeAgent: '否',
    serviceProduct: '合同物流',
    businessType: '保税',
    goodsType: '集成电路芯片',
    monthlyBusinessVolume: '101-500',
    monthlyInvoiceAmount: '约80万/月',
    customsKpiRequirement: '通关时效≤4小时，需无纸化通关',
    transportKpiRequirement: '运输时效≤12小时，需恒温运输',
    warehouseLeaseRequirement: '需洁净仓库3000㎡，无尘环境',
    customServiceRequirement: '信息系统',
    customRequirementDescription: '需要WMS/TMS系统对接，实现库存和运输全程可视化',
    companyName: '上海华力集成电路制造有限公司',
    englishName: 'Shanghai Huahong Grace Semiconductor Co., Ltd.',
    parentCompany: '华虹集团',
    subsidiaryCompany: '',
    riskControlPurpose: '业务可行性评审',
    relationshipWithHMG: '客户',
    businessCustomerIds: ['bc5'],
    suggestedSystemCode: 'HHL-2026-005',
    opportunityId: 'opp5',
    invoiceInfoIds: ['inv5'],
    settlementPeriod: '月结15天',
    contactName: '赵副总',
    approvalSteps: [
      { id: 'init', name: '发起审批', role: '申请人', status: 'completed', approver: '周华', level: 1 },
      { id: 'mgmt', name: '部门经理审批', role: '部门经理', status: 'completed', approver: '陈总', level: 2 },
      { id: 'func', name: '职能审批', role: '合同物流职能审批人（四选一）', status: 'current', approver: '蒋总', approvers: ['张洁', '蒋总', '吴总', '朱弢'], level: 3 },
      { id: 'fin', name: '财务审批', role: '财务部+中心总经理（会签）', status: 'pending', approver: '赵总监、中心总经理', level: 4 },
      { id: 'gm', name: '总经理审批', role: '各中心负责人', status: 'pending', approver: '各中心负责人', level: 5 },
      { id: 'it', name: 'IT运维确认', role: 'IT运维', status: 'pending', approver: 'IT运维', level: 6 },
    ],
  },
  {
    // ID 6: 关务 - 否 - 审批完成（全部6个节点绿色✓）
    id: '6',
    isTradeAgent: '否',
    serviceProduct: '关务',
    businessType: '保税',
    goodsType: '光电子元器件、光模块',
    monthlyBusinessVolume: '0-50',
    monthlyInvoiceAmount: '约5万/月',
    customsKpiRequirement: '两周内完成1200个物料的归类梳理',
    transportKpiRequirement: '合同不涉及',
    warehouseLeaseRequirement: '暂时不涉及',
    customServiceRequirement: '仅涉及标准服务内容',
    customRequirementDescription: '暂时不涉及',
    companyName: '武汉光库科技有限公司',
    englishName: 'Wuhan Fiber Resources Co., Ltd.',
    parentCompany: '',
    subsidiaryCompany: '',
    riskControlPurpose: '业务可行性评审',
    relationshipWithHMG: '客户',
    businessCustomerIds: ['bc7'],
    suggestedSystemCode: 'WHGK-2026-006',
    opportunityId: 'opp6',
    invoiceInfoIds: ['inv6'],
    settlementPeriod: '月结60天',
    contactName: '高燕',
    approvalSteps: [
      { id: 'init', name: '发起审批', role: '申请人', status: 'completed', approver: '王健', level: 1 },
      { id: 'mgmt', name: '部门经理审批', role: '部门经理', status: 'completed', approver: '陈总', level: 2 },
      { id: 'func', name: '职能审批', role: '关务职能审批人', status: 'completed', approver: '蒋总', level: 3 },
      { id: 'fin', name: '财务审批', role: '财务部+中心总经理（会签）', status: 'completed', approver: '赵总监、中心总经理', level: 4 },
      { id: 'gm', name: '总经理审批', role: '各中心负责人', status: 'completed', approver: '各中心负责人', level: 5 },
      { id: 'it', name: 'IT运维确认', role: 'IT运维', status: 'completed', approver: 'IT运维', level: 6 },
    ],
  },
  {
    // ID 7: 一体化供应链 - 是 - 审批完成（含贸易代理白沥追加）
    id: '7',
    isTradeAgent: '是',
    serviceProduct: '一体化供应链',
    businessType: '保税',
    goodsType: '多晶硅',
    monthlyBusinessVolume: '51-100',
    monthlyInvoiceAmount: '约8万/月',
    customsKpiRequirement: '标准通关流程',
    transportKpiRequirement: '标准运输流程',
    warehouseLeaseRequirement: '临港600平常温库区存储，一周2次进出库操作',
    customServiceRequirement: '仅涉及标准服务内容',
    customRequirementDescription: '标准服务即可满足需求',
    companyName: '江苏鑫华半导体科技股份有限公司',
    englishName: 'Jiangsu Xinhua Semiconductor Technology Co., Ltd.',
    parentCompany: '',
    subsidiaryCompany: '',
    riskControlPurpose: '业务可行性评审',
    relationshipWithHMG: '客户',
    businessCustomerIds: ['bc8'],
    suggestedSystemCode: 'XHBDT-2026-007',
    opportunityId: 'opp7',
    invoiceInfoIds: ['inv7'],
    settlementPeriod: '月结30天',
    contactName: '张正阳',
    approvalSteps: [
      { id: 'init', name: '发起审批', role: '申请人', status: 'completed', approver: '倪萍', level: 1 },
      { id: 'mgmt', name: '部门经理审批', role: '部门经理', status: 'completed', approver: '陈总', level: 2 },
      { id: 'func', name: '职能审批', role: '一体化供应链职能审批人', status: 'completed', approver: '张洁', level: 3 },
      { id: 'fin', name: '财务审批', role: '财务部+中心总经理（会签）', status: 'completed', approver: '赵总监、中心总经理', level: 4 },
      { id: 'gm', name: '总经理审批', role: '各中心负责人', status: 'completed', approver: '各中心负责人', level: 5 },
      { id: 'it', name: 'IT运维确认', role: 'IT运维', status: 'completed', approver: 'IT运维', level: 6 },
    ],
  },
  {
    // ID 8: 货代 - 是 - 已拒绝（财务审批节点被拒绝）
    id: '8',
    isTradeAgent: '是',
    serviceProduct: '货代',
    businessType: '口岸完税',
    goodsType: '文具',
    monthlyBusinessVolume: '0-50',
    monthlyInvoiceAmount: '约12万/月',
    customsKpiRequirement: '无特殊要求',
    transportKpiRequirement: '无特殊要求',
    warehouseLeaseRequirement: '无',
    customServiceRequirement: '仅涉及标准服务内容',
    customRequirementDescription: '无',
    companyName: '上海裘瑞经贸有限公司',
    englishName: 'Shanghai Qurui Trading Co., Ltd.',
    parentCompany: '',
    subsidiaryCompany: '',
    riskControlPurpose: '仅增加结算单位',
    relationshipWithHMG: '客户',
    businessCustomerIds: ['bc9'],
    suggestedSystemCode: 'QRJM-2026-008',
    opportunityId: 'opp8',
    invoiceInfoIds: ['inv8'],
    settlementPeriod: '月结60天',
    contactName: '丁慧',
    approvalSteps: [
      { id: 'init', name: '发起审批', role: '申请人', status: 'completed', approver: '夏赟帆', level: 1 },
      { id: 'mgmt', name: '部门经理审批', role: '部门经理', status: 'completed', approver: '陈总', level: 2 },
      { id: 'func', name: '职能审批', role: '货代职能审批人', status: 'completed', approver: '张洁', level: 3 },
      { id: 'fin', name: '财务审批', role: '财务部+中心总经理（会签）', status: 'completed', approver: '赵总监、中心总经理', rejected: true, level: 4 },
      { id: 'gm', name: '总经理审批', role: '各中心负责人', status: 'pending', approver: '各中心负责人', level: 5 },
      { id: 'it', name: 'IT运维确认', role: 'IT运维', status: 'pending', approver: 'IT运维', level: 6 },
    ],
  },
  {
    // ID 9: 维修 - 否 - 草稿（发起人current，刚创建）
    id: '9',
    isTradeAgent: '否',
    serviceProduct: '维修',
    businessType: '保税',
    goodsType: '晶圆/芯片',
    monthlyBusinessVolume: '101-500',
    monthlyInvoiceAmount: '约500万/月',
    customsKpiRequirement: '需AEO高级认证，48小时内完成报关',
    transportKpiRequirement: '每日一班固定班次，需全程RFID追踪',
    warehouseLeaseRequirement: '需要洁净仓库5000平米，含自动化分拣系统',
    customServiceRequirement: '信息系统',
    customRequirementDescription: '需对接SAP系统，实现WMS/TMS全链路数据同步，支持VMI库存管理',
    companyName: '中芯国际集成电路制造有限公司',
    englishName: 'SMIC Co., Ltd.',
    parentCompany: '',
    subsidiaryCompany: '',
    riskControlPurpose: '业务可行性评审',
    relationshipWithHMG: '客户',
    businessCustomerIds: ['bc10'],
    suggestedSystemCode: 'SMIC-2026-009',
    opportunityId: 'opp9',
    invoiceInfoIds: ['inv9'],
    settlementPeriod: '月结30天',
    contactName: '王总监',
    approvalSteps: [
      { id: 'init', name: '发起审批', role: '申请人', status: 'current', approver: '张明', level: 1 },
      { id: 'mgmt', name: '部门经理审批', role: '部门经理', status: 'pending', approver: '陈总', level: 2 },
      { id: 'func', name: '职能审批', role: '维修职能审批人', status: 'pending', approver: '蒋总', level: 3 },
      { id: 'fin', name: '财务审批', role: '财务部+中心总经理（会签）', status: 'pending', approver: '赵总监、中心总经理', level: 4 },
      { id: 'gm', name: '总经理审批', role: '各中心负责人', status: 'pending', approver: '各中心负责人', level: 5 },
      { id: 'it', name: 'IT运维确认', role: 'IT运维', status: 'pending', approver: 'IT运维', level: 6 },
    ],
  },
  {
    // ID 10: 运输 - 是 - 已拒绝（职能审批节点被拒绝）
    id: '10',
    isTradeAgent: '是',
    serviceProduct: '运输',
    businessType: '保税',
    goodsType: '存储芯片/模组',
    monthlyBusinessVolume: '51-100',
    monthlyInvoiceAmount: '约300万/月',
    customsKpiRequirement: '24小时内完成报关',
    transportKpiRequirement: '每周3班固定班次，需恒温运输',
    warehouseLeaseRequirement: '需要恒温恒湿仓库2000平米',
    customServiceRequirement: '仓储',
    customRequirementDescription: '需要专业半导体材料存储，温湿度实时监控',
    companyName: '长江存储科技有限责任公司',
    englishName: 'Yangtze Memory Technologies Co., Ltd.',
    parentCompany: '',
    subsidiaryCompany: '',
    riskControlPurpose: '业务可行性评审',
    relationshipWithHMG: '客户',
    businessCustomerIds: ['bc11'],
    suggestedSystemCode: 'YMTC-2026-010',
    opportunityId: 'opp10',
    invoiceInfoIds: ['inv10'],
    settlementPeriod: '月结45天',
    contactName: '陈经理',
    approvalSteps: [
      { id: 'init', name: '发起审批', role: '申请人', status: 'completed', approver: '李华', level: 1 },
      { id: 'mgmt', name: '部门经理审批', role: '部门经理', status: 'completed', approver: '陈总', level: 2 },
      { id: 'func', name: '职能审批', role: '运输职能审批人', status: 'completed', approver: '朱弢', rejected: true, level: 3 },
      { id: 'fin', name: '财务审批', role: '财务部+中心总经理（会签）', status: 'pending', approver: '赵总监、中心总经理', level: 4 },
      { id: 'gm', name: '总经理审批', role: '各中心负责人', status: 'pending', approver: '各中心负责人', level: 5 },
      { id: 'it', name: 'IT运维确认', role: 'IT运维', status: 'pending', approver: 'IT运维', level: 6 },
    ],
  },
];

const STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
  draft: { label: '草稿', bg: 'bg-[#EBEBEB]', text: 'text-[#999]' },
  pending: { label: '待审批', bg: 'bg-[#FEFCE8]', text: 'text-[#CA8A04]' },
  in_review: { label: '审批中', bg: 'bg-[#E8F4FF]', text: 'text-[#2D3BFF]' },
  approved: { label: '已通过', bg: 'bg-[#F0FDF4]', text: 'text-[#16A34A]' },
  rejected: { label: '已拒绝', bg: 'bg-[#FEF2F2]', text: 'text-[#DC2626]' },
};

export default function ApprovalDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { approvalWorkflows, riskApprovals, updateRiskApproval } = useApp();
  const approval = riskApprovals.find((a) => a.id === id) || riskApprovals[0];
  if (!approval) {
    return <div className="max-w-7xl mx-auto p-12 text-center"><h2 className="text-lg font-semibold text-[#0A0A0A] mb-2">审批数据加载中...</h2><p className="text-[#999]">正在从数据库加载审批记录</p></div>;
  }
  const [activeTab, setActiveTab] = useState<'detail' | 'report'>('detail');

  const matchedWorkflow = useMemo(() => {
    if (!approval.serviceProduct) return null;
    return approvalWorkflows.find(
      w => w.status === 'active' && w.serviceProduct === approval.serviceProduct
    ) || null;
  }, [approvalWorkflows, approval.serviceProduct]);

  const ruleTriggeredApprovers: RuleTriggeredApprover[] = useMemo(() => {
    const result: RuleTriggeredApprover[] = [];
    if (approval.isTradeAgent === '是') {
      result.push({
        approver: { id: 'baili', name: '白沥', role: '贸易代理职能审批人' },
        reason: '涉及贸易代理',
        ruleId: 'rule-trade-agent',
      });
    }
    return result;
  }, [approval.isTradeAgent]);

  const handleSubmitApproval = () => {
    const steps = (approval.approvalSteps || []).map((s: Record<string, unknown>) => {
      if (s.level === 1 && s.status === 'current') return { ...s, status: 'completed' };
      if (s.level === 2 && s.status === 'pending') return { ...s, status: 'current' };
      return s;
    });
    updateRiskApproval(approval.id, { approvalSteps: steps, approvalStatus: '审批中', status: 'in_review' });
    router.push('/approvals');
  };

  const handleRevokeApproval = () => {
    const steps = (approval.approvalSteps || []).map((s: Record<string, unknown>) => {
      if (s.level === 1) return { ...s, status: 'current' };
      return { ...s, status: 'pending', rejected: false };
    });
    updateRiskApproval(approval.id, { approvalSteps: steps, approvalStatus: '草稿', status: 'draft' });
    router.push('/approvals');
  };

  const progressData = useMemo((): { currentNodeIndex: number; completedNodes: number[]; rejectedNodes: number[] } => {
    const steps = approval.approvalSteps || [];
    if (steps.length === 0) return { currentNodeIndex: -1, completedNodes: [], rejectedNodes: [] };
    const currentStep = steps.find(s => s.status === 'current');
    const completedLevels = steps
      .filter(s => s.status === 'completed' && (s as Record<string, unknown>).rejected !== true)
      .map(s => s.level)
      .filter((l): l is number => l !== undefined);
    const rejectedLevels = steps
      .filter(s => (s as Record<string, unknown>).rejected === true)
      .map(s => s.level)
      .filter((l): l is number => l !== undefined);
    return {
      currentNodeIndex: Number(currentStep?.level ?? -1),
      completedNodes: completedLevels,
      rejectedNodes: rejectedLevels,
    };
  }, [approval.approvalSteps]);

  const derivedStatus = useMemo(() => {
    const steps = approval.approvalSteps || [];
    if (steps.length === 0) return 'draft';
    const anyRejected = steps.some(s => (s as Record<string, unknown>).rejected === true);
    if (anyRejected) return 'rejected';
    const allCompleted = steps.every(s => s.status === 'completed');
    if (allCompleted) return 'approved';
    const initiatorStep = steps.find(s => s.level === 1);
    if (initiatorStep?.status === 'current') return 'draft';
    const hasCurrent = steps.some(s => s.status === 'current');
    if (hasCurrent) return 'in_review';
    return 'pending';
  }, [approval.approvalSteps]);

  const statusInfo = STATUS_MAP[derivedStatus] || STATUS_MAP.draft;

  const reportItems = useMemo(() => {
    const dv = (approval as any).dynamicFieldValues as Record<string, string> || {};
    const capital = dv.registered_capital || '';
    const capitalNum = parseInt(capital.replace(/[^0-9]/g, ''));
    const si = dv.social_insurance_count || '';
    const siNum = parseInt(si.replace(/[^0-9]/g, ''));
    const shipping = dv.shipping_country || '';
    const onTime = dv.on_time_rate || '';
    const onTimeNum = parseFloat(onTime.replace('%', ''));

    return [
    { approvalPoint: '业务可行性审核', fieldName: '风险控制目的', fieldKey: 'risk_purpose', fieldValue: approval.riskControlPurpose || '未填写', condition: '业务可行性评审/仅增加结算单位', result: 'pass' as const, suggestion: '风控目的明确' },
    { approvalPoint: '业务可行性审核', fieldName: '与HMG关系', fieldKey: 'hmg_relation', fieldValue: approval.relationshipWithHMG || '未填写', condition: '非"内部用户"即合规', result: 'pass' as const },
    { approvalPoint: '业务可行性审核', fieldName: '服务产品', fieldKey: 'service_product', fieldValue: approval.serviceProduct || '', condition: '已匹配审批流模板', result: 'pass' as const },
    { approvalPoint: '业务可行性审核', fieldName: '货物类型', fieldKey: 'goods_type', fieldValue: approval.goodsType || '未填写', condition: '已填写', result: 'pass' as const },
    { approvalPoint: '业务可行性审核', fieldName: '月均业务量', fieldKey: 'monthly_volume', fieldValue: approval.monthlyBusinessVolume || '未填写', condition: (approval.monthlyBusinessVolume || '') === '500以上' ? '超高业务量提醒' : '正常范围', result: (approval.monthlyBusinessVolume || '') === '500以上' ? 'warn' as const : 'pass' as const },
    { approvalPoint: '贸易合规审核', fieldName: '贸易代理', fieldKey: 'is_trade_agent', fieldValue: approval.isTradeAgent || '', condition: '涉及贸易代理需追加审批', result: approval.isTradeAgent === '是' ? 'warn' as const : 'pass' as const, suggestion: approval.isTradeAgent === '是' ? '已触发白沥审批追加' : undefined },
    { approvalPoint: 'KPI能力审核', fieldName: '通关KPI', fieldKey: 'customs_kpi', fieldValue: (approval.customsKpiRequirement || '').substring(0, 20) + '...', condition: '通关时效要求评估', result: 'pass' as const },
    { approvalPoint: 'KPI能力审核', fieldName: '运输KPI', fieldKey: 'transport_kpi', fieldValue: (approval.transportKpiRequirement || '').substring(0, 20) + '...', condition: '运输时效/货损率评估', result: (approval.transportKpiRequirement || '').includes('危化品') ? 'warn' as const : 'pass' as const, suggestion: (approval.transportKpiRequirement || '').includes('危化品') ? '危化品运输需专项资质，请确认' : undefined },
    { approvalPoint: '资源能力审核', fieldName: '仓库要求', fieldKey: 'warehouse', fieldValue: (approval.warehouseLeaseRequirement || '').substring(0, 20) + '...', condition: '仓储面积和条件评估', result: 'pass' as const },
    // 动态字段：企业规模
    ...(capital ? [{ approvalPoint: '企业规模审核', fieldName: '注册资本', fieldKey: 'registered_capital', fieldValue: capital + '万', condition: '≥ 100万为正常', result: (!isNaN(capitalNum) && capitalNum < 100 ? 'warn' : 'pass') as 'pass' | 'warn', suggestion: !isNaN(capitalNum) && capitalNum < 100 ? '注册资本不足100万，建议人工审核' : undefined }] : []),
    ...(si ? [{ approvalPoint: '企业规模审核', fieldName: '社保人数', fieldKey: 'social_insurance_count', fieldValue: si + '人', condition: '≥ 10人为正常', result: (!isNaN(siNum) && siNum < 10 ? 'warn' : 'pass') as 'pass' | 'warn', suggestion: !isNaN(siNum) && siNum < 10 ? '社保人数不足10人，建议人工审核' : undefined }] : []),
    // 动态字段：出货地区
    ...(shipping ? [{ approvalPoint: '贸易合规审核', fieldName: '出货国家/地区', fieldKey: 'shipping_country', fieldValue: shipping, condition: '非战争地区为正常', result: (shipping === '以色列' || shipping === '伊朗' ? 'warn' : 'pass') as 'pass' | 'warn', suggestion: shipping === '以色列' || shipping === '伊朗' ? `${shipping}为战争地区，建议人工审核` : undefined }] : []),
    // 动态字段：运输及时率
    ...(onTime ? [{ approvalPoint: 'KPI能力审核', fieldName: '运输及时率', fieldKey: 'on_time_rate', fieldValue: onTime + '%', condition: '≤ 99%为正常（作为供应商，>99%过严）', result: (!isNaN(onTimeNum) && onTimeNum > 99 ? 'warn' : 'pass') as 'pass' | 'warn', suggestion: !isNaN(onTimeNum) && onTimeNum > 99 ? `客户要求的运输及时率${onTime}%过于严苛，CIM作为供应商可能无法达到` : undefined }] : []),
    ...(derivedStatus === 'rejected' ? [{ approvalPoint: '财务确认', fieldName: '财务审批', fieldKey: 'finance', fieldValue: '已拒绝', condition: '财务确认节点被拒绝', result: 'reject' as const, suggestion: '请重新提交审批' }] : []),
  ];}, [approval]);

  const passCount = reportItems.filter(i => i.result === 'pass').length;
  const warnCount = reportItems.filter(i => i.result === 'warn').length;
  const rejectCount = reportItems.filter(i => i.result === 'reject').length;

  const flowChanges = useMemo(() => {
    const changes: string[] = [];
    const steps = approval.approvalSteps || [];
    if (steps.length === 0) return '暂无审批流数据';
    const completed = steps.filter(s => s.status === 'completed').length;
    const total = steps.length;
    changes.push(`${completed}/${total} 节点已完成`);
    if (approval.isTradeAgent === '是') changes.push('追加审批人：白沥（贸易代理）');
    if (derivedStatus === 'rejected') {
      const rejectedStep = steps.find(s => (s as Record<string, unknown>).rejected === true);
      if (rejectedStep) changes.push(`${rejectedStep.name}节点已拒绝`);
    }
    return changes.join('；');
  }, [approval, derivedStatus]);

  const getSelectedNames = (ids: string[], list: { id: string; name?: string; title?: string }[]) => {
    return ids.map((itemId: string) => list.find((item) => item.id === itemId)?.name || list.find((item) => item.id === itemId)?.title || itemId);
  };

  const opportunityTitle = mockOpportunities.find((o) => o.id === approval.opportunityId)?.title || approval.opportunityId;

  return (
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 顶部导航 */}
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => router.push('/approvals')} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#0A0A0A]">风控审批详情</h1>
            <p className="text-[#5A5A5A] mt-1">查看客户风险控制审批申请详情和审批流程</p>
          </div>
          <div className="flex-1" />
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}>{statusInfo.label}</span>
          {(derivedStatus === 'draft' || derivedStatus === 'rejected') && (
            <>
              <button onClick={handleSubmitApproval} className="px-5 py-2 bg-[#0D8A5E] text-white rounded-lg hover:shadow-lg hover:shadow-[#0D8A5E]/20 transition-all text-sm font-medium">发起审批</button>
              <button onClick={() => router.push(`/approvals/${id}/edit`)} className="px-5 py-2 bg-[#2D3BFF] text-white rounded-lg hover:shadow-lg hover:shadow-[#2D3BFF]/20 transition-all text-sm font-medium">编辑</button>
            </>
          )}
          {derivedStatus === 'in_review' && (
            <>
              <button onClick={handleRevokeApproval} className="px-5 py-2 border border-[#E8850C] text-[#E8850C] rounded-lg hover:bg-[#FFF9EB] transition-all text-sm font-medium">撤销审批</button>
              <button disabled className="px-5 py-2 bg-[#D5D5D5] text-[#999] rounded-lg cursor-not-allowed text-sm font-medium">编辑</button>
            </>
          )}
          {derivedStatus === 'pending' && (
            <>
              <button onClick={handleRevokeApproval} className="px-5 py-2 border border-[#E8850C] text-[#E8850C] rounded-lg hover:bg-[#FFF9EB] transition-all text-sm font-medium">撤销审批</button>
              <button disabled className="px-5 py-2 bg-[#D5D5D5] text-[#999] rounded-lg cursor-not-allowed text-sm font-medium">编辑</button>
            </>
          )}
          {derivedStatus === 'approved' && (
            <button disabled className="px-5 py-2 bg-[#D5D5D5] text-[#999] rounded-lg cursor-not-allowed text-sm font-medium">编辑</button>
          )}
        </div>

        <div className="mt-6">
          <div className="grid grid-cols-12 gap-6">
            {/* 左侧主区域 */}
            <div className="col-span-7 space-y-6">
              {/* 公司信息 */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-sm font-semibold text-[#0A0A0A] mb-4 pb-3 border-b border-[#EBEBEB]">公司信息</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">公司全称 <span className="text-red-500">*</span></label><div className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3 text-sm text-[#0A0A0A]">{approval.companyName}</div></div>
                  <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">英文名称</label><div className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3 text-sm text-[#0A0A0A]">{approval.englishName || '-'}</div></div>
                  <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">集团（母）公司名称</label><div className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3 text-sm text-[#0A0A0A]">{approval.parentCompany || '-'}</div></div>
                  <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">分（子）公司名称</label><div className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3 text-sm text-[#0A0A0A]">{approval.subsidiaryCompany || '-'}</div></div>
                </div>
              </div>

              {/* 风控信息 */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-sm font-semibold text-[#0A0A0A] mb-4 pb-3 border-b border-[#EBEBEB]">风控信息</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">风险控制目的 <span className="text-red-500">*</span></label><div className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3 text-sm text-[#0A0A0A]">{approval.riskControlPurpose}</div></div>
                  <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">此公司与HMG的关系 <span className="text-red-500">*</span></label><div className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3 text-sm text-[#0A0A0A]">{approval.relationshipWithHMG}</div></div>
                </div>
              </div>

              {/* 关联信息 */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-sm font-semibold text-[#0A0A0A] mb-4 pb-3 border-b border-[#EBEBEB]">关联信息</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">业务主客户 <span className="text-red-500">*</span></label>
                    <div className="flex flex-wrap gap-2">
                      {getSelectedNames(approval.businessCustomerIds || [], mockBusinessCustomers.map((c) => ({ id: c.id, name: c.name }))).map((name, i) => (
                        <span key={i} className="inline-flex items-center px-3 py-1.5 bg-[#E8F4FF] text-[#2D3BFF] rounded-lg text-sm">{name}</span>
                      ))}
                    </div>
                  </div>
                  <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">建议系统代码 <span className="text-red-500">*</span></label><div className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3 text-sm text-[#0A0A0A]">{approval.suggestedSystemCode}</div></div>
                  <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">商机 <span className="text-red-500">*</span></label><div className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3 text-sm text-[#2D3BFF]">{opportunityTitle}</div></div>
                  <div>
                    <label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">客户开票信息 <span className="text-red-500">*</span></label>
                    <div className="flex flex-wrap gap-2">
                      {getSelectedNames(approval.invoiceInfoIds || [], mockInvoiceInfos.map((inv) => ({ id: inv.id, name: inv.title }))).map((name, i) => (
                        <span key={i} className="inline-flex items-center px-3 py-1.5 bg-[#FFF7ED] text-[#EA580C] rounded-lg text-sm">{name}</span>
                      ))}
                    </div>
                  </div>
                  <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">结算账期 <span className="text-red-500">*</span></label><div className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3 text-sm text-[#0A0A0A]">{approval.settlementPeriod}</div></div>
                  <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">联系人 <span className="text-red-500">*</span></label><div className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3 text-sm text-[#0A0A0A]">{approval.contactName}</div></div>
                </div>
              </div>

              {/* 业务信息 */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-sm font-semibold text-[#0A0A0A] mb-4 pb-3 border-b border-[#EBEBEB]">业务信息</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">是否涉及贸易代理 <span className="text-red-500">*</span></label><div className={`w-full rounded-xl px-4 py-3 text-sm font-medium ${approval.isTradeAgent === '是' ? 'bg-[#FEFCE8] text-[#CA8A04]' : 'bg-[#F5F5F5] text-[#0A0A0A]'}`}>{approval.isTradeAgent}</div></div>
                  <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">服务产品 <span className="text-red-500">*</span></label><div className="w-full bg-[#E8F4FF] text-[#2D3BFF] rounded-xl px-4 py-3 text-sm font-medium">{approval.serviceProduct}</div></div>
                  <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">业务类型 <span className="text-red-500">*</span></label><div className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3 text-sm text-[#0A0A0A]">{approval.businessType}</div></div>
                  <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">货物类型 <span className="text-red-500">*</span></label><div className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3 text-sm text-[#0A0A0A]">{approval.goodsType}</div></div>
                  <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">月均业务量 <span className="text-red-500">*</span></label><div className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3 text-sm text-[#0A0A0A]">{approval.monthlyBusinessVolume}</div></div>
                  <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">每月开票金额 <span className="text-red-500">*</span></label><div className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3 text-sm text-[#0A0A0A]">{approval.monthlyInvoiceAmount}</div></div>
                </div>
                <div className="mt-4 space-y-4">
                  <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">通关KPI要求 <span className="text-red-500">*</span></label><div className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3 text-sm text-[#0A0A0A] whitespace-pre-wrap">{approval.customsKpiRequirement}</div></div>
                  <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">运输KPI要求 <span className="text-red-500">*</span></label><div className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3 text-sm text-[#0A0A0A] whitespace-pre-wrap">{approval.transportKpiRequirement}</div></div>
                  <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">仓库租赁要求 <span className="text-red-500">*</span></label><div className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3 text-sm text-[#0A0A0A] whitespace-pre-wrap">{approval.warehouseLeaseRequirement}</div></div>
                  <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">定制化服务需求 <span className="text-red-500">*</span></label><div className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3 text-sm text-[#0A0A0A]">{approval.customServiceRequirement}</div></div>
                  <div><label className="block text-sm font-medium text-[#5A5A5A] mb-1.5">定制化需求描述 <span className="text-red-500">*</span></label><div className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3 text-sm text-[#0A0A0A] whitespace-pre-wrap">{approval.customRequirementDescription}</div></div>
                </div>
              </div>

              {/* 合规审核 — 只读动态字段 */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#EBEBEB]">
                  <div className="w-1 h-4 bg-[#0D8A5E] rounded-full" />
                  <h3 className="text-sm font-semibold text-[#0A0A0A]">合规审核</h3>
                  <span className="text-[10px] text-[#999]">审批辅助报告数据来源</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-[#F0F1FF] border border-[#C7CAFF]">
                    <span className="text-xs text-[#5A5A5A]">月订单数</span>
                    <span className="text-xs font-medium text-[#2D3BFF]">21-50单</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-[#F0F1FF] border border-[#C7CAFF]">
                    <span className="text-xs text-[#5A5A5A]">月开票额</span>
                    <span className="text-xs font-medium text-[#2D3BFF]">50-100万</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-[#F0F1FF] border border-[#C7CAFF]">
                    <span className="text-xs text-[#5A5A5A]">出货国家/地区</span>
                    <span className="text-xs font-medium text-[#2D3BFF]">中国</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-[#F0F1FF] border border-[#C7CAFF]">
                    <span className="text-xs text-[#5A5A5A]">注册资本</span>
                    <span className="text-xs font-medium text-[#2D3BFF]">5000万</span>
                  </div>
                  {approval.isTradeAgent === '是' && (
                    <div className="col-span-2 flex justify-between items-center p-2.5 rounded-lg bg-[#FFF9EB] border border-[#E8850C]">
                      <span className="text-xs text-[#5A5A5A]">是否贸易代理</span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="text-xs font-medium text-[#E8850C]">是 — 触发追加审批人（白沥）</span>
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-[#F0F1FF] border border-[#C7CAFF]">
                    <span className="text-xs text-[#5A5A5A]">社保人数</span>
                    <span className="text-xs font-medium text-[#2D3BFF]">200人</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-[#F0F1FF] border border-[#C7CAFF]">
                    <span className="text-xs text-[#5A5A5A]">运输及时率</span>
                    <span className="text-xs font-medium text-[#2D3BFF]">98%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧审批流 + 报告 */}
            <div className="col-span-5 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-6">
                {/* Tab 切换 */}
                <div className="flex gap-1 mb-4 bg-[#F5F5F5] rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('detail')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                      activeTab === 'detail' ? 'bg-white text-[#0A0A0A] shadow-sm' : 'text-[#999] hover:text-[#5A5A5A]'
                    }`}
                  >
                    审批流程
                  </button>
                  <button
                    onClick={() => setActiveTab('report')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                      activeTab === 'report' ? 'bg-white text-[#0A0A0A] shadow-sm' : 'text-[#999] hover:text-[#5A5A5A]'
                    }`}
                  >
                    审批辅助报告
                  </button>
                </div>

                {activeTab === 'detail' ? (
                  <>
                    <ApprovalFlowVisual
                      workflow={matchedWorkflow}
                      ruleTriggeredApprovers={ruleTriggeredApprovers}
                      mode="progress"
                      progress={{
                        currentNodeIndex: progressData.currentNodeIndex,
                        completedNodes: progressData.completedNodes,
                        rejectedNodes: progressData.rejectedNodes,
                      }}
                    />

                    <div className="mt-4 p-3 bg-[#F5F5F5] rounded-xl">
                      <p className="text-xs text-[#999]">注意: 风控审批中填写的所有字段均不受角色权限限制，所有审批人均可查看全部字段内容。</p>
                    </div>
                  </>
                ) : (
                  <ApprovalReport
                    reportId={`CIM-AR-${approval.id.padStart(4, '0')}`}
                    customerName={approval.companyName || ''}
                    serviceProduct={approval.serviceProduct || ''}
                    generatedAt={new Date().toISOString()}
                    items={reportItems as ReportItem[]}
                    flowChanges={flowChanges}
                    passCount={passCount}
                    warnCount={warnCount}
                    rejectCount={rejectCount}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
