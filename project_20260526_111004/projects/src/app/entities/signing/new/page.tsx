"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, X } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";

export default function NewSigningEntityPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    taxId: "",
    address: "",
    phone: "",
    email: "",
    legalRepresentative: "",
    unifiedSocialCreditCode: "",
    registrationStatus: "active",
    industry: "",
    businessScope: "",
    registeredCapital: "",
    establishmentDate: "",
    settlementEntity: "",
    remark: "",
  });

  // 处理输入变化
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 暂存
  const handleSaveDraft = () => {
    alert("暂存成功！");
  };

  // 清空
  const handleClear = () => {
    if (confirm("确定要清空所有内容吗？")) {
      setFormData({
        name: "",
        code: "",
        taxId: "",
        address: "",
        phone: "",
        email: "",
        legalRepresentative: "",
        unifiedSocialCreditCode: "",
        registrationStatus: "active",
        industry: "",
        businessScope: "",
        registeredCapital: "",
        establishmentDate: "",
        settlementEntity: "",
        remark: "",
      });
    }
  };

  // 提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      alert("签约主体名称不能为空");
      return;
    }
    alert("创建成功！");
    router.push("/entities");
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#F5F5F5]">
        <div className="max-w-6xl mx-auto p-6">
          {/* 页面头部 */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="border border-[#EBEBEB] text-[#5A5A5A] hover:bg-[#F5F5F5] px-3 py-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-[#1C2550]">
                新增签约主体
              </h1>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 基本信息 */}
            <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] p-6">
              <h2 className="text-lg font-semibold text-[#1C2550] mb-4">基本信息</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm text-[#5A5A5A]">
                    <span className="text-red-500">*</span> 签约主体名称
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="请输入签约主体名称"
                    className="border-[#EBEBEB] focus-visible:ring-[#2D3BFF]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code" className="text-sm text-[#5A5A5A]">
                    主体代码
                  </Label>
                  <Input
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="请输入主体代码"
                    className="border-[#EBEBEB] focus-visible:ring-[#2D3BFF]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unifiedSocialCreditCode" className="text-sm text-[#5A5A5A]">
                    统一社会信用代码
                  </Label>
                  <Input
                    id="unifiedSocialCreditCode"
                    name="unifiedSocialCreditCode"
                    value={formData.unifiedSocialCreditCode}
                    onChange={handleInputChange}
                    placeholder="请输入统一社会信用代码"
                    className="border-[#EBEBEB] focus-visible:ring-[#2D3BFF]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="legalRepresentative" className="text-sm text-[#5A5A5A]">
                    法定代表人
                  </Label>
                  <Input
                    id="legalRepresentative"
                    name="legalRepresentative"
                    value={formData.legalRepresentative}
                    onChange={handleInputChange}
                    placeholder="请输入法定代表人"
                    className="border-[#EBEBEB] focus-visible:ring-[#2D3BFF]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registrationStatus" className="text-sm text-[#5A5A5A]">
                    状态
                  </Label>
                  <Select
                    value={formData.registrationStatus}
                    onValueChange={(value) => handleSelectChange("registrationStatus", value)}
                  >
                    <SelectTrigger className="border-[#EBEBEB]">
                      <SelectValue placeholder="请选择状态" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="active">启用</SelectItem>
                      <SelectItem value="inactive">停用</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="establishmentDate" className="text-sm text-[#5A5A5A]">
                    成立日期
                  </Label>
                  <Input
                    id="establishmentDate"
                    name="establishmentDate"
                    type="date"
                    value={formData.establishmentDate}
                    onChange={handleInputChange}
                    className="border-[#EBEBEB] focus-visible:ring-[#2D3BFF]"
                  />
                </div>
              </div>
            </div>

            {/* 联系信息 */}
            <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] p-6">
              <h2 className="text-lg font-semibold text-[#1C2550] mb-4">联系信息</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm text-[#5A5A5A]">
                    联系电话
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="请输入联系电话"
                    className="border-[#EBEBEB] focus-visible:ring-[#2D3BFF]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm text-[#5A5A5A]">
                    电子邮箱
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="请输入电子邮箱"
                    className="border-[#EBEBEB] focus-visible:ring-[#2D3BFF]"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="address" className="text-sm text-[#5A5A5A]">
                    注册地址
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="请输入注册地址"
                    className="border-[#EBEBEB] focus-visible:ring-[#2D3BFF]"
                  />
                </div>
              </div>
            </div>

            {/* 经营信息 */}
            <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] p-6">
              <h2 className="text-lg font-semibold text-[#1C2550] mb-4">经营信息</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry" className="text-sm text-[#5A5A5A]">
                    所属行业
                  </Label>
                  <Input
                    id="industry"
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    placeholder="请输入所属行业"
                    className="border-[#EBEBEB] focus-visible:ring-[#2D3BFF]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registeredCapital" className="text-sm text-[#5A5A5A]">
                    注册资本
                  </Label>
                  <Input
                    id="registeredCapital"
                    name="registeredCapital"
                    value={formData.registeredCapital}
                    onChange={handleInputChange}
                    placeholder="请输入注册资本"
                    className="border-[#EBEBEB] focus-visible:ring-[#2D3BFF]"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="businessScope" className="text-sm text-[#5A5A5A]">
                    经营范围
                  </Label>
                  <Textarea
                    id="businessScope"
                    name="businessScope"
                    value={formData.businessScope}
                    onChange={handleInputChange}
                    placeholder="请输入经营范围"
                    rows={3}
                    className="border-[#EBEBEB] focus-visible:ring-[#2D3BFF]"
                  />
                </div>
              </div>
            </div>

            {/* 结算信息 */}
            <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] p-6">
              <h2 className="text-lg font-semibold text-[#1C2550] mb-4">结算信息</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxId" className="text-sm text-[#5A5A5A]">
                    纳税人识别号
                  </Label>
                  <Input
                    id="taxId"
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleInputChange}
                    placeholder="请输入纳税人识别号"
                    className="border-[#EBEBEB] focus-visible:ring-[#2D3BFF]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="settlementEntity" className="text-sm text-[#5A5A5A]">
                    结算主体
                  </Label>
                  <Input
                    id="settlementEntity"
                    name="settlementEntity"
                    value={formData.settlementEntity}
                    onChange={handleInputChange}
                    placeholder="请输入结算主体"
                    className="border-[#EBEBEB] focus-visible:ring-[#2D3BFF]"
                  />
                </div>
              </div>
            </div>

            {/* 备注信息 */}
            <div className="bg-white rounded-xl shadow-sm border border-[#EBEBEB] p-6">
              <h2 className="text-lg font-semibold text-[#1C2550] mb-4">备注信息</h2>
              <div className="space-y-2">
                <Label htmlFor="remark" className="text-sm text-[#5A5A5A]">
                  备注
                </Label>
                <Textarea
                  id="remark"
                  name="remark"
                  value={formData.remark}
                  onChange={handleInputChange}
                  placeholder="请输入备注信息"
                  rows={4}
                  className="border-[#EBEBEB] focus-visible:ring-[#2D3BFF]"
                />
              </div>
            </div>

            {/* 底部操作按钮 */}
            <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-[#EBEBEB] p-6">
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClear}
                  className="border border-[#EBEBEB] text-[#5A5A5A] hover:bg-[#F5F5F5]"
                >
                  <X className="w-4 h-4 mr-2" />
                  清空
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveDraft}
                  className="border border-[#EBEBEB] text-[#5A5A5A] hover:bg-[#F5F5F5]"
                >
                  <Save className="w-4 h-4 mr-2" />
                  暂存
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="border border-[#EBEBEB] text-[#5A5A5A] hover:bg-[#F5F5F5]"
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  className="bg-[#2D3BFF] hover:from-[#2B45FF] hover:to-[#4B62FF] text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  保存
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
