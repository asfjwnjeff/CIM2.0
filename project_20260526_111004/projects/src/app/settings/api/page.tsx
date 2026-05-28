'use client';

import { useState } from 'react';

interface SystemConfig {
  id: string;
  systemName: string;
  systemCode: string;
  baseUrl: string;
  apiKey: string;
  apiSecret: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSyncTime: string;
  description: string;
}

interface ApiEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  direction: 'inbound' | 'outbound';
  targetSystem?: string;
  sourceSystem?: string;
  flowStage?: string;
  status: 'active' | 'inactive';
  callCount: number;
  avgResponseTime: number;
}

interface FlowLog {
  id: string;
  flowStage: string;
  direction: 'inbound' | 'outbound';
  sourceSystem: string;
  targetSystem: string;
  endpoint: string;
  requestTime: string;
  responseTime: number;
  statusCode: number;
  status: 'success' | 'error';
  message: string;
}

const mockSystemConfigs: SystemConfig[] = [
  {
    id: 'sys-cpq',
    systemName: 'CPQ 系统',
    systemCode: 'CPQ',
    baseUrl: 'https://cpq.example.com/api/v1',
    apiKey: 'cpq_key_xxxxx',
    apiSecret: '********',
    status: 'connected',
    lastSyncTime: '2024-01-15 14:30:00',
    description: 'CPQ报价系统，调用CIM系统进行账单主体匹配',
  },
  {
    id: 'sys-cos',
    systemName: 'COS 系统',
    systemCode: 'COS',
    baseUrl: 'https://cos.example.com/api/v2',
    apiKey: 'cos_key_xxxxx',
    apiSecret: '********',
    status: 'connected',
    lastSyncTime: '2024-01-15 14:28:00',
    description: 'COS订单系统，存储订单和账单区分字段',
  },
];

const mockEndpoints: ApiEndpoint[] = [
  // ========== 对外提供的接口（别人调CIM）==========
  {
    id: 'ep-001',
    name: '获取字段配置信息',
    method: 'GET',
    path: '/api/v1/fields/{customerId}',
    description: 'COS系统调用，获取客户的账单区分字段配置列表',
    direction: 'inbound',
    sourceSystem: 'COS',
    flowStage: '订单创建',
    status: 'active',
    callCount: 1567,
    avgResponseTime: 28,
  },
  {
    id: 'ep-002',
    name: '账单主体匹配',
    method: 'POST',
    path: '/api/v1/billing-entity/match',
    description: 'CPQ系统调用，根据账单区分字段匹配对应的账单主体',
    direction: 'inbound',
    sourceSystem: 'CPQ',
    flowStage: '主体匹配',
    status: 'active',
    callCount: 8956,
    avgResponseTime: 45,
  },
  {
    id: 'ep-003',
    name: '获取拆分规则',
    method: 'GET',
    path: '/api/v1/rules/{customerId}',
    description: 'CPQ系统调用，获取指定客户的账单拆分规则列表',
    direction: 'inbound',
    sourceSystem: 'CPQ',
    flowStage: '主体匹配',
    status: 'active',
    callCount: 2345,
    avgResponseTime: 32,
  },
  // ========== 调用外部系统的接口（CIM调别人）==========
  {
    id: 'ep-004',
    name: '获取字段清单',
    method: 'GET',
    path: '/cos/api/v1/field-list',
    description: 'CIM调用COS，获取字段清单用于配置字段',
    direction: 'outbound',
    targetSystem: 'COS',
    flowStage: '规则配置',
    status: 'active',
    callCount: 452,
    avgResponseTime: 85,
  },
];

const mockFlowLogs: FlowLog[] = [
  // ========== 规则配置阶段（CIM调COS获取字段清单）==========
  {
    id: 'log-001',
    flowStage: '规则配置',
    direction: 'outbound',
    sourceSystem: 'CIM',
    targetSystem: 'COS',
    endpoint: '/cos/api/v1/field-list',
    requestTime: '2024-01-15 09:00:00',
    responseTime: 85,
    statusCode: 200,
    status: 'success',
    message: '成功获取字段清单：客户部门、Plant、Location等15个字段',
  },
  // ========== 订单创建阶段（COS调CIM获取字段配置）==========
  {
    id: 'log-002',
    flowStage: '订单创建',
    direction: 'inbound',
    sourceSystem: 'COS',
    targetSystem: 'CIM',
    endpoint: '/api/v1/fields/CUST001',
    requestTime: '2024-01-15 14:27:00',
    responseTime: 28,
    statusCode: 200,
    status: 'success',
    message: '成功获取客户应用材料的字段配置：客户部门、Plant、Location',
  },
  // ========== 主体匹配阶段（CPQ调CIM匹配账单主体）==========
  {
    id: 'log-003',
    flowStage: '主体匹配',
    direction: 'inbound',
    sourceSystem: 'CPQ',
    targetSystem: 'CIM',
    endpoint: '/api/v1/billing-entity/match',
    requestTime: '2024-01-15 14:30:25',
    responseTime: 45,
    statusCode: 200,
    status: 'success',
    message: '成功匹配账单主体：8641-上海华力微电子有限公司',
  },
  {
    id: 'log-004',
    flowStage: '主体匹配',
    direction: 'inbound',
    sourceSystem: 'CPQ',
    targetSystem: 'CIM',
    endpoint: '/api/v1/rules/CUST001',
    requestTime: '2024-01-15 14:30:00',
    responseTime: 32,
    statusCode: 200,
    status: 'success',
    message: '成功获取客户应用材料的拆分规则列表，共6条',
  },
  {
    id: 'log-005',
    flowStage: '主体匹配',
    direction: 'inbound',
    sourceSystem: 'CPQ',
    targetSystem: 'CIM',
    endpoint: '/api/v1/billing-entity/match',
    requestTime: '2024-01-15 14:25:00',
    responseTime: 256,
    statusCode: 200,
    status: 'success',
    message: '成功匹配账单主体：8635-应用材料中国有限公司',
  },
  {
    id: 'log-006',
    flowStage: '规则配置',
    direction: 'outbound',
    sourceSystem: 'CIM',
    targetSystem: 'COS',
    endpoint: '/cos/api/v1/field-list',
    requestTime: '2024-01-15 14:15:00',
    responseTime: 89,
    statusCode: 500,
    status: 'error',
    message: '获取字段清单失败：接口超时',
  },
];

const flowStages = [
  {
    id: 'stage-1',
    name: '规则配置',
    description: '客服维护账单拆分规则，CIM从COS获取字段清单',
    participants: ['客服', 'CIM', 'COS'],
    color: '#3B82F6',
  },
  {
    id: 'stage-2',
    name: '订单创建',
    description: '客服在COS创建订单，COS调用CIM获取字段配置',
    participants: ['客服', 'COS', 'CIM'],
    color: '#8B5CF6',
  },
  {
    id: 'stage-3',
    name: '数据同步',
    description: 'CPQ系统从COS系统拉取订单和业务数据',
    participants: ['CPQ', 'COS'],
    color: '#10B981',
  },
  {
    id: 'stage-4',
    name: '主体匹配',
    description: 'CPQ系统调用CIM系统进行账单主体匹配',
    participants: ['CPQ', 'CIM'],
    color: '#F59E0B',
  },
  {
    id: 'stage-5',
    name: '账单生成',
    description: 'CPQ系统根据匹配结果进行计费和账单生成',
    participants: ['CPQ'],
    color: '#EF4444',
  },
];

export default function ApiManagementPage() {
  const [systemConfigs] = useState<SystemConfig[]>(mockSystemConfigs);
  const [endpoints] = useState<ApiEndpoint[]>(mockEndpoints);
  const [flowLogs] = useState<FlowLog[]>(mockFlowLogs);
  const [activeTab, setActiveTab] = useState<'flow' | 'interfaces' | 'logs'>('flow');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSystem, setEditingSystem] = useState<SystemConfig | null>(null);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-[#E8FCEF] text-[#22C55E]';
      case 'disconnected':
        return 'bg-[#FEE2E2] text-[#EF4444]';
      case 'error':
        return 'bg-[#FEF3C7] text-[#F59E0B]';
      default:
        return 'bg-[#F1F5F9] text-[#5A5A5A]';
    }
  };

  const getMethodStyle = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-[#E8FCEF] text-[#22C55E]';
      case 'POST':
        return 'bg-[#E8EBFF] text-[#2D3BFF]';
      case 'PUT':
        return 'bg-[#FEF3C7] text-[#F59E0B]';
      case 'DELETE':
        return 'bg-[#FEE2E2] text-[#EF4444]';
      default:
        return 'bg-[#F1F5F9] text-[#5A5A5A]';
    }
  };

  const getDirectionStyle = (direction: string) => {
    return direction === 'inbound' 
      ? 'bg-[#E8FCEF] text-[#22C55E]' 
      : 'bg-[#E8EBFF] text-[#2D3BFF]';
  };

  const getDirectionLabel = (direction: string) => {
    return direction === 'inbound' ? '接收' : '发起';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A0A0A]">接口管理</h1>
          <p className="text-sm text-[#5A5A5A] mt-1">管理系统与COS、CPQ系统的接口配置和调用监控</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 border border-[#EBEBEB] rounded-lg text-sm font-medium text-[#5A5A5A] hover:bg-[#F5F5F5] transition-colors">
            测试连接
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[#5A5A5A]">CIM 系统（本系统）</span>
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-[#E8FCEF] text-[#22C55E]">
              运行中
            </span>
          </div>
          <div className="text-lg font-bold text-[#0A0A0A]">CIM 客户信息管理系统</div>
          <div className="text-xs text-[#5A5A5A] mt-2">提供账单拆分规则配置和账单主体匹配服务</div>
        </div>
        {systemConfigs.map((system) => (
          <div key={system.id} className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-[#5A5A5A]">{system.systemCode} 系统</span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusStyle(system.status)}`}>
                {system.status === 'connected' ? '已连接' : system.status === 'error' ? '异常' : '未连接'}
              </span>
            </div>
            <div className="text-lg font-bold text-[#0A0A0A]">{system.systemName}</div>
            <div className="text-xs text-[#5A5A5A] mt-2">{system.description}</div>
            <div className="text-xs text-[#999999] mt-2">最后同步：{system.lastSyncTime}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB]">
        <div className="flex border-b border-[#EBEBEB]">
          <button
            onClick={() => setActiveTab('flow')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'flow'
                ? 'text-[#2D3BFF] border-b-2 border-[#2D3BFF]'
                : 'text-[#5A5A5A] hover:text-[#0A0A0A]'
            }`}
          >
            业务流程
          </button>
          <button
            onClick={() => setActiveTab('interfaces')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'interfaces'
                ? 'text-[#2D3BFF] border-b-2 border-[#2D3BFF]'
                : 'text-[#5A5A5A] hover:text-[#0A0A0A]'
            }`}
          >
            接口列表
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'logs'
                ? 'text-[#2D3BFF] border-b-2 border-[#2D3BFF]'
                : 'text-[#5A5A5A] hover:text-[#0A0A0A]'
            }`}
          >
            调用日志
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'flow' && (
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="bg-[#F5F5F5] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[#0A0A0A] mb-4">业务流程时序图</h3>
                <div className="relative">
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#2D3BFF] text-white font-bold text-sm">
                        客服
                      </div>
                      <div className="text-xs text-[#5A5A5A] mt-1">操作人员</div>
                    </div>
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#0D8A5E] text-white font-bold text-sm">
                        COS
                      </div>
                      <div className="text-xs text-[#5A5A5A] mt-1">订单系统</div>
                    </div>
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#2D3BFF] text-white font-bold text-sm">
                        CIM
                      </div>
                      <div className="text-xs text-[#5A5A5A] mt-1">本系统</div>
                    </div>
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#E8850C] text-white font-bold text-sm">
                        CPQ
                      </div>
                      <div className="text-xs text-[#5A5A5A] mt-1">报价系统</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {flowStages.map((stage, index) => (
                      <div
                        key={stage.id}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedStage === stage.id
                            ? 'border-[#2D3BFF] bg-white shadow-md'
                            : 'border-transparent bg-white/50 hover:bg-white hover:shadow-sm'
                        }`}
                        onClick={() => setSelectedStage(selectedStage === stage.id ? null : stage.id)}
                      >
                        <div className="flex items-center">
                          <div
                            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                            style={{ backgroundColor: stage.color }}
                          >
                            {index + 1}
                          </div>
                          <div className="ml-3 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-[#0A0A0A]">{stage.name}</span>
                              <span className="text-xs text-[#5A5A5A]">{stage.participants.join(' → ')}</span>
                            </div>
                            <div className="text-xs text-[#5A5A5A] mt-1">{stage.description}</div>
                          </div>
                        </div>
                        {selectedStage === stage.id && (
                          <div className="mt-3 pt-3 border-t border-[#EBEBEB]">
                            <div className="text-xs text-[#5A5A5A]">
                              {stage.id === 'stage-1' && (
                                <div className="space-y-1">
                                  <div>• 操作1：客服在CIM系统维护账单拆分规则</div>
                                  <div>• 操作2：CIM调用COS获取字段清单</div>
                                  <div>• 接口：GET /cos/api/v1/field-list</div>
                                  <div>• 操作3：规则和字段配置持久化存储在CIM系统</div>
                                </div>
                              )}
                              {stage.id === 'stage-2' && (
                                <div className="space-y-1">
                                  <div>• 操作1：客服在COS系统创建订单</div>
                                  <div>• 操作2：COS调用CIM获取字段配置</div>
                                  <div>• 接口：GET /api/v1/fields/{'{customerId}'}</div>
                                  <div>• 操作3：客服根据字段配置录入账单区分字段</div>
                                  <div>• 数据：订单基础信息 + 账单区分字段</div>
                                </div>
                              )}
                              {stage.id === 'stage-3' && (
                                <div className="space-y-1">
                                  <div>• 说明：CPQ系统直接从COS系统拉取数据</div>
                                  <div>• 数据：订单信息 + 业务数据 + 账单区分字段</div>
                                  <div>• 注意：此阶段CIM系统不参与</div>
                                </div>
                              )}
                              {stage.id === 'stage-4' && (
                                <div className="space-y-1">
                                  <div>• 调用方：CPQ系统</div>
                                  <div>• 接口1：GET /api/v1/rules/{'{customerId}'}（获取规则）</div>
                                  <div>• 接口2：POST /api/v1/billing-entity/match（匹配主体）</div>
                                  <div>• 逻辑：CIM系统按配置规则执行匹配计算</div>
                                  <div>• 返回：匹配的账单主体结果</div>
                                </div>
                              )}
                              {stage.id === 'stage-5' && (
                                <div className="space-y-1">
                                  <div>• 说明：CPQ系统内部处理</div>
                                  <div>• 步骤1：根据账单主体进行计费、拆分费用</div>
                                  <div>• 步骤2：按账单主体生成对应账单</div>
                                  <div>• 注意：此阶段CIM系统不参与</div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg border border-[#EBEBEB] p-4">
                  <h4 className="text-sm font-semibold text-[#0A0A0A] mb-3 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-[#22C55E] mr-2"></span>
                    对外提供的接口（别人调CIM）
                  </h4>
                  <div className="space-y-2">
                    {endpoints.filter(ep => ep.direction === 'inbound').map(ep => (
                      <div key={ep.id} className="flex items-center justify-between p-2 bg-[#F5F5F5] rounded">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${getMethodStyle(ep.method)}`}>
                            {ep.method}
                          </span>
                          <span className="text-sm text-[#0A0A0A]">{ep.name}</span>
                        </div>
                        <span className="text-xs text-[#22C55E]">← {ep.sourceSystem}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-[#EBEBEB] p-4">
                  <h4 className="text-sm font-semibold text-[#0A0A0A] mb-3 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-[#2D3BFF] mr-2"></span>
                    调用外部系统的接口（CIM调别人）
                  </h4>
                  <div className="space-y-2">
                    {endpoints.filter(ep => ep.direction === 'outbound').map(ep => (
                      <div key={ep.id} className="flex items-center justify-between p-2 bg-[#F5F5F5] rounded">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${getMethodStyle(ep.method)}`}>
                            {ep.method}
                          </span>
                          <span className="text-sm text-[#0A0A0A]">{ep.name}</span>
                        </div>
                        <span className="text-xs text-[#2D3BFF]">→ {ep.targetSystem}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'interfaces' && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-[#F5F5F5] rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-[#0A0A0A]">{endpoints.length}</div>
                  <div className="text-xs text-[#5A5A5A]">接口总数</div>
                </div>
                <div className="bg-[#E8FCEF] rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-[#22C55E]">
                    {endpoints.filter(ep => ep.direction === 'inbound').length}
                  </div>
                  <div className="text-xs text-[#22C55E]">对外提供</div>
                </div>
                <div className="bg-[#E8EBFF] rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-[#2D3BFF]">
                    {endpoints.filter(ep => ep.direction === 'outbound').length}
                  </div>
                  <div className="text-xs text-[#2D3BFF]">调用外部</div>
                </div>
                <div className="bg-[#E8FCEF] rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-[#22C55E]">
                    {endpoints.filter(ep => ep.status === 'active').length}
                  </div>
                  <div className="text-xs text-[#22C55E]">运行中</div>
                </div>
              </div>

              <div className="overflow-hidden border border-[#EBEBEB] rounded-lg">
                <table className="min-w-full divide-y divide-[#EBEBEB]">
                  <thead className="bg-[#F5F5F5]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider whitespace-nowrap">方向</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider whitespace-nowrap">方法</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider whitespace-nowrap">接口名称</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider whitespace-nowrap">路径</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider whitespace-nowrap">关联系统</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider whitespace-nowrap">调用次数</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider whitespace-nowrap">平均响应</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider whitespace-nowrap">状态</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[#EBEBEB]">
                    {endpoints.map((ep) => (
                      <tr key={ep.id} className="hover:bg-[#F5F5F5] transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${getDirectionStyle(ep.direction)}`}>
                            {getDirectionLabel(ep.direction)}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${getMethodStyle(ep.method)}`}>
                            {ep.method}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-[#0A0A0A]">{ep.name}</div>
                          <div className="text-xs text-[#5A5A5A]">{ep.description}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <code className="text-xs bg-[#F1F5F9] px-2 py-1 rounded text-[#0A0A0A]">{ep.path}</code>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-[#5A5A5A]">
                          {ep.direction === 'inbound' ? (
                            <span className="text-[#22C55E]">← {ep.sourceSystem}</span>
                          ) : (
                            <span className="text-[#2D3BFF]">→ {ep.targetSystem}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-[#0A0A0A]">{ep.callCount.toLocaleString()}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-[#5A5A5A]">{ep.avgResponseTime}ms</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${ep.status === 'active' ? 'bg-[#E8FCEF] text-[#22C55E]' : 'bg-[#F1F5F9] text-[#5A5A5A]'}`}>
                            {ep.status === 'active' ? '运行中' : '已停用'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <select className="px-3 py-2 border border-[#EBEBEB] rounded-lg text-sm text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/20">
                  <option value="all">全部流程阶段</option>
                  <option value="match">账单主体匹配</option>
                  <option value="sync">数据同步</option>
                  <option value="rule">规则查询</option>
                </select>
                <select className="px-3 py-2 border border-[#EBEBEB] rounded-lg text-sm text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/20">
                  <option value="all">全部状态</option>
                  <option value="success">成功</option>
                  <option value="error">失败</option>
                </select>
              </div>

              <div className="overflow-hidden border border-[#EBEBEB] rounded-lg">
                <table className="min-w-full divide-y divide-[#EBEBEB]">
                  <thead className="bg-[#F5F5F5]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider whitespace-nowrap">请求时间</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider whitespace-nowrap">流程阶段</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider whitespace-nowrap">方向</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider whitespace-nowrap">来源 → 目标</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider whitespace-nowrap">接口</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider whitespace-nowrap">状态码</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider whitespace-nowrap">耗时</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider whitespace-nowrap">状态</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider whitespace-nowrap">消息</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[#EBEBEB]">
                    {flowLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#F5F5F5] transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-[#0A0A0A]">{log.requestTime}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded bg-[#F1F5F9] text-[#5A5A5A]">{log.flowStage}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${getDirectionStyle(log.direction)}`}>
                            {log.direction === 'inbound' ? '接收' : '发起'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-[#5A5A5A]">{log.sourceSystem} → {log.targetSystem}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <code className="text-xs bg-[#F1F5F9] px-2 py-1 rounded text-[#0A0A0A]">{log.endpoint}</code>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <span className={log.statusCode === 200 ? 'text-[#22C55E]' : 'text-[#EF4444]'}>{log.statusCode}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-[#5A5A5A]">{log.responseTime}ms</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${log.status === 'success' ? 'bg-[#E8FCEF] text-[#22C55E]' : 'bg-[#FEE2E2] text-[#EF4444]'}`}>
                            {log.status === 'success' ? '成功' : '失败'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#5A5A5A] max-w-xs truncate">{log.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-[500px] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-[#EBEBEB]">
              <h3 className="text-lg font-semibold text-[#0A0A0A]">{editingSystem ? '编辑系统配置' : '新增系统配置'}</h3>
              <button onClick={() => setShowEditModal(false)} className="text-[#5A5A5A] hover:text-[#0A0A0A]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0A0A0A] mb-1">系统名称</label>
                <input type="text" className="w-full px-3 py-2 border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/20" placeholder="请输入系统名称" defaultValue={editingSystem?.systemName} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0A0A0A] mb-1">系统代码</label>
                <input type="text" className="w-full px-3 py-2 border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/20" placeholder="如：CPQ、COS" defaultValue={editingSystem?.systemCode} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0A0A0A] mb-1">Base URL</label>
                <input type="text" className="w-full px-3 py-2 border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/20" placeholder="https://api.example.com" defaultValue={editingSystem?.baseUrl} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0A0A0A] mb-1">API Key</label>
                <input type="text" className="w-full px-3 py-2 border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/20" placeholder="请输入API Key" defaultValue={editingSystem?.apiKey} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0A0A0A] mb-1">API Secret</label>
                <input type="password" className="w-full px-3 py-2 border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/20" placeholder="请输入API Secret" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0A0A0A] mb-1">描述</label>
                <textarea className="w-full px-3 py-2 border border-[#EBEBEB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3BFF]/20" rows={3} placeholder="请输入系统描述" defaultValue={editingSystem?.description} />
              </div>
            </div>
            <div className="flex justify-end space-x-3 p-4 border-t border-[#EBEBEB]">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 border border-[#EBEBEB] rounded-lg text-sm font-medium text-[#5A5A5A] hover:bg-[#F5F5F5]">取消</button>
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 bg-[#2D3BFF] text-white rounded-lg text-sm font-medium hover:shadow-lg">保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
