'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

// Mock data for entities
const mockEntities = [
  {
    id: '1',
    name: '上海华力微电子有限公司',
    taxId: '91310000MA1FL00001',
    address: '上海市浦东新区张江高科技园区',
    phone: '021-12345678',
    status: 'active',
  },
  {
    id: '2',
    name: '应用材料（中国）有限公司',
    taxId: '91310000MA1FL00002',
    address: '北京市朝阳区建国门外大街',
    phone: '010-12345678',
    status: 'active',
  },
];

export default function EntitiesPage() {
  const [activeTab, setActiveTab] = useState('signing');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-[#999999] mb-1">
            <span>首页</span>
            <span>/</span>
            <span>主体管理</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1E2340]">🏢 主体管理</h1>
        </div>
        <Button 
          className="bg-[#2D3BFF] hover:from-[#2B45FF] hover:to-[#4B62FF] text-white"
        >
          + 新增主体
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="signing" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full border-b border-[#EBEBEB] bg-transparent p-0 h-auto gap-0">
          <TabsTrigger 
            value="signing"
            className="px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-[#2D3BFF] data-[state=active]:text-[#2D3BFF] data-[state=active]:bg-transparent hover:bg-transparent text-[#5A5A5A] font-medium"
          >
            签约主体(2)
          </TabsTrigger>
          <TabsTrigger 
            value="service"
            className="px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-[#2D3BFF] data-[state=active]:text-[#2D3BFF] data-[state=active]:bg-transparent hover:bg-transparent text-[#5A5A5A] font-medium"
          >
            服务主体(3)
          </TabsTrigger>
          <TabsTrigger 
            value="settlement"
            className="px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-[#2D3BFF] data-[state=active]:text-[#2D3BFF] data-[state=active]:bg-transparent hover:bg-transparent text-[#5A5A5A] font-medium"
          >
            结算主体(5)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="signing" className="mt-6 space-y-4">
          {/* Search */}
          <div className="flex items-center gap-4">
            <Input 
              placeholder="搜索主体名称、税号"
              className="w-80"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button variant="ghost" size="sm">高级筛选</Button>
          </div>

          {/* Table */}
          <Card className="border-[#EBEBEB]">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F8FAFC] hover:bg-[#F8FAFC]">
                    <TableHead className="font-semibold text-[#4B5563]">主体名称</TableHead>
                    <TableHead className="font-semibold text-[#4B5563]">税号</TableHead>
                    <TableHead className="font-semibold text-[#4B5563]">地址</TableHead>
                    <TableHead className="font-semibold text-[#4B5563]">联系电话</TableHead>
                    <TableHead className="font-semibold text-[#4B5563]">状态</TableHead>
                    <TableHead className="font-semibold text-[#4B5563]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockEntities.map((entity) => (
                    <TableRow key={entity.id} className="hover:bg-[#F8FAFF]">
                      <TableCell className="font-semibold text-[#1E2340]">{entity.name}</TableCell>
                      <TableCell className="text-[#5A5A5A] font-mono text-sm">{entity.taxId}</TableCell>
                      <TableCell className="text-[#1E2340]">{entity.address}</TableCell>
                      <TableCell className="text-[#5A5A5A]">{entity.phone}</TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            entity.status === 'active'
                              ? 'bg-[#E6F4EA] text-[#0D904F] hover:bg-[#E6F4EA]'
                              : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#F3F4F6]'
                          }
                        >
                          {entity.status === 'active' ? '启用' : '停用'}
                        </Badge>
                      </TableCell>
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
        </TabsContent>

        <TabsContent value="service" className="mt-6">
          <Card className="border-[#EBEBEB]">
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-4">🏢</div>
              <h3 className="text-lg font-medium text-[#1E2340] mb-2">服务主体</h3>
              <p className="text-[#5A5A5A]">此功能开发中...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settlement" className="mt-6">
          <Card className="border-[#EBEBEB]">
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-lg font-medium text-[#1E2340] mb-2">结算主体</h3>
              <p className="text-[#5A5A5A]">此功能开发中...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
