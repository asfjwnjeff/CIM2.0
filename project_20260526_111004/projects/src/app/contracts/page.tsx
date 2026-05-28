'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

// Mock data for contracts
const mockContracts = [
  {
    id: 'HT20240001',
    name: '应用材料采购框架合同',
    customerName: '应用材料',
    amount: '¥5,000,000',
    signer: '张三',
    status: 'draft',
    createdAt: '2024-01-20',
  },
  {
    id: 'HT20240002',
    name: '荏原年度服务协议',
    customerName: '荏原',
    amount: '¥2,000,000',
    signer: '李四',
    status: 'pending',
    createdAt: '2024-01-19',
  },
  {
    id: 'HT20240003',
    name: '飞雅贸易设备采购合同',
    customerName: '飞雅贸易',
    amount: '¥3,500,000',
    signer: '王五',
    status: 'signing',
    createdAt: '2024-01-18',
  },
  {
    id: 'HT20230015',
    name: '昇先创框架合同',
    customerName: '昇先创',
    amount: '¥10,000,000',
    signer: '赵六',
    status: 'active',
    createdAt: '2023-12-15',
  },
];

export default function ContractsPage() {
  const [activeTab, setActiveTab] = useState('all');

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#F3F4F6]';
      case 'pending':
        return 'bg-[#FEF7E0] text-[#B45309] hover:bg-[#FEF7E0]';
      case 'signing':
        return 'bg-[#E8EBFF] text-[#2D3BFF] hover:bg-[#E8EBFF]';
      case 'active':
        return 'bg-[#E6F4EA] text-[#0D904F] hover:bg-[#E6F4EA]';
      case 'archived':
        return 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#F3F4F6]';
      default:
        return 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#F3F4F6]';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft':
        return '草稿';
      case 'pending':
        return '审批中';
      case 'signing':
        return '待签署';
      case 'active':
        return '已生效';
      case 'archived':
        return '已归档';
      default:
        return '草稿';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-[#999999] mb-1">
            <span>首页</span>
            <span>/</span>
            <span>合同签署</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0A0A0A]">📄 合同签署</h1>
        </div>
        <Button 
          className="bg-[#2D3BFF] hover:from-[#2B45FF] hover:to-[#4B62FF] text-white"
        >
          + 新建合同
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-[#EBEBEB]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#5A5A5A] mb-1">待签署</p>
                <p className="text-2xl font-bold text-[#0A0A0A]">3</p>
              </div>
              <div className="w-10 h-10 bg-[#E8EBFF] rounded-lg flex items-center justify-center">
                <span className="text-lg">📝</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#EBEBEB]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#5A5A5A] mb-1">审批中</p>
                <p className="text-2xl font-bold text-[#0A0A0A]">1</p>
              </div>
              <div className="w-10 h-10 bg-[#FEF7E0] rounded-lg flex items-center justify-center">
                <span className="text-lg">⏳</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#EBEBEB]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#5A5A5A] mb-1">已生效</p>
                <p className="text-2xl font-bold text-[#0A0A0A]">12</p>
              </div>
              <div className="w-10 h-10 bg-[#E6F4EA] rounded-lg flex items-center justify-center">
                <span className="text-lg">✅</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#EBEBEB]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#5A5A5A] mb-1">本月新增</p>
                <p className="text-2xl font-bold text-[#0A0A0A]">5</p>
              </div>
              <div className="w-10 h-10 bg-[#FFF7ED] rounded-lg flex items-center justify-center">
                <span className="text-lg">📈</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full border-b border-[#EBEBEB] bg-transparent p-0 h-auto gap-0">
          <TabsTrigger 
            value="all"
            className="px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-[#2D3BFF] data-[state=active]:text-[#2D3BFF] data-[state=active]:bg-transparent hover:bg-transparent text-[#5A5A5A] font-medium"
          >
            全部(21)
          </TabsTrigger>
          <TabsTrigger 
            value="draft"
            className="px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-[#2D3BFF] data-[state=active]:text-[#2D3BFF] data-[state=active]:bg-transparent hover:bg-transparent text-[#5A5A5A] font-medium"
          >
            草稿(4)
          </TabsTrigger>
          <TabsTrigger 
            value="pending"
            className="px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-[#2D3BFF] data-[state=active]:text-[#2D3BFF] data-[state=active]:bg-transparent hover:bg-transparent text-[#5A5A5A] font-medium"
          >
            审批中(2)
          </TabsTrigger>
          <TabsTrigger 
            value="signing"
            className="px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-[#2D3BFF] data-[state=active]:text-[#2D3BFF] data-[state=active]:bg-transparent hover:bg-transparent text-[#5A5A5A] font-medium"
          >
            待签署(3)
          </TabsTrigger>
          <TabsTrigger 
            value="active"
            className="px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-[#2D3BFF] data-[state=active]:text-[#2D3BFF] data-[state=active]:bg-transparent hover:bg-transparent text-[#5A5A5A] font-medium"
          >
            已生效(12)
          </TabsTrigger>
          <TabsTrigger 
            value="archived"
            className="px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-[#2D3BFF] data-[state=active]:text-[#2D3BFF] data-[state=active]:bg-transparent hover:bg-transparent text-[#5A5A5A] font-medium"
          >
            已归档(5)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <Card className="border-[#EBEBEB]">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F8FAFC] hover:bg-[#F8FAFC]">
                    <TableHead className="font-semibold text-[#4B5563]">合同编号</TableHead>
                    <TableHead className="font-semibold text-[#4B5563]">合同名称</TableHead>
                    <TableHead className="font-semibold text-[#4B5563]">客户名称</TableHead>
                    <TableHead className="font-semibold text-[#4B5563]">合同金额</TableHead>
                    <TableHead className="font-semibold text-[#4B5563]">创建人</TableHead>
                    <TableHead className="font-semibold text-[#4B5563]">状态</TableHead>
                    <TableHead className="font-semibold text-[#4B5563]">创建时间</TableHead>
                    <TableHead className="font-semibold text-[#4B5563]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockContracts.map((contract) => (
                    <TableRow key={contract.id} className="hover:bg-[#F8FAFF]">
                      <TableCell className="font-semibold text-[#0A0A0A]">{contract.id}</TableCell>
                      <TableCell className="text-[#0A0A0A]">{contract.name}</TableCell>
                      <TableCell className="text-[#0A0A0A]">{contract.customerName}</TableCell>
                      <TableCell className="font-semibold text-[#0D904F]">{contract.amount}</TableCell>
                      <TableCell className="text-[#0A0A0A]">{contract.signer}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeClass(contract.status)}>
                          {getStatusText(contract.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[#5A5A5A]">{contract.createdAt}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">查看</Button>
                          <Button variant="ghost" size="sm">编辑</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Template Buttons */}
          <div className="flex items-center gap-2 mt-4">
            <Button variant="outline" size="sm">合同模板管理</Button>
            <Button variant="outline" size="sm">签署流程配置</Button>
            <Button variant="outline" size="sm">归档规则设置</Button>
          </div>
        </TabsContent>

        {['draft', 'pending', 'signing', 'active', 'archived'].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-6">
            <Card className="border-[#EBEBEB]">
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">📄</div>
                <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">
                  {tab === 'draft' ? '草稿' : 
                   tab === 'pending' ? '审批中' :
                   tab === 'signing' ? '待签署' :
                   tab === 'active' ? '已生效' : '已归档'}
                </h3>
                <p className="text-[#5A5A5A]">此功能开发中...</p>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
