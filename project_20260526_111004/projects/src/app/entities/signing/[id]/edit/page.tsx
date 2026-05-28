"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { useApp } from "@/lib/store";

export default function EditSigningEntityPage() {
  const params = useParams();
  const router = useRouter();
  const { signingEntities, updateSigningEntity } = useApp();
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

  useEffect(() => {
    const entity = signingEntities.find((e) => e.id === params.id);
    if (entity) {
      setFormData({
        name: entity.name || "",
        code: entity.code || "",
        taxId: entity.taxId || "",
        address: entity.address || "",
        phone: entity.phone || "",
        email: entity.email || "",
        legalRepresentative: entity.legalRepresentative || "",
        unifiedSocialCreditCode: entity.unifiedSocialCreditCode || "",
        registrationStatus: entity.status || "active",
        industry: entity.industry || "",
        businessScope: entity.businessScope || "",
        registeredCapital: entity.registeredCapital || "",
        establishmentDate: entity.establishmentDate || "",
        settlementEntity: entity.settlementEntity || "",
        remark: entity.remark || "",
      });
    }
  }, [params.id, signingEntities]);

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

  // 提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      alert("签约主体名称不能为空");
      return;
    }
    updateSigningEntity(params.id as string, {
      name: formData.name.trim(),
      code: formData.code || undefined,
      unifiedSocialCreditCode: formData.unifiedSocialCreditCode || undefined,
      legalRepresentative: formData.legalRepresentative || undefined,
      status: formData.registrationStatus as 'active' | 'inactive',
      establishmentDate: formData.establishmentDate || undefined,
      taxId: formData.taxId || undefined,
      address: formData.address || undefined,
      phone: formData.phone || undefined,
      email: formData.email || undefined,
      industry: formData.industry || undefined,
      registeredCapital: formData.registeredCapital || undefined,
      businessScope: formData.businessScope || undefined,
      settlementEntity: formData.settlementEntity || undefined,
      remark: formData.remark || undefined,
    });
    router.push("/entities");
  };

  return (
      <div className="max-w-7xl mx-auto space-y-6">
          {/* 页面头部 */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="border border-[#EBEBEB] text-[#5A5A5A] hover:bg-[#FAFAFA] px-3 py-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[#0A0A0A]">
                编辑签约主体
              </h1>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 基本信息 */}
            <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
              <h2 className="text-lg font-semibold text-[#0A0A0A] mb-4">基本信息</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-[#0A0A0A]">
                    <span className="text-red-500">*</span> 签约主体名称
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="请输入签约主体名称"
                    className="border-[#D5D5D5] focus:border-[#2D3BFF] focus:shadow-[0_0_0_2px_rgba(45,59,255,0.10)]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code" className="text-sm font-semibold text-[#0A0A0A]">
                    主体代码
                  </Label>
                  <Input
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="请输入主体代码"
                    className="border-[#D5D5D5] focus:border-[#2D3BFF] focus:shadow-[0_0_0_2px_rgba(45,59,255,0.10)]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unifiedSocialCreditCode" className="text-sm font-semibold text-[#0A0A0A]">
                    统一社会信用代码
                  </Label>
                  <Input
                    id="unifiedSocialCreditCode"
                    name="unifiedSocialCreditCode"
                    value={formData.unifiedSocialCreditCode}
                    onChange={handleInputChange}
                    placeholder="请输入统一社会信用代码"
                    className="border-[#D5D5D5] focus:border-[#2D3BFF] focus:shadow-[0_0_0_2px_rgba(45,59,255,0.10)]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="legalRepresentative" className="text-sm font-semibold text-[#0A0A0A]">
                    法定代表人
                  </Label>
                  <Input
                    id="legalRepresentative"
                    name="legalRepresentative"
                    value={formData.legalRepresentative}
                    onChange={handleInputChange}
                    placeholder="请输入法定代表人"
                    className="border-[#D5D5D5] focus:border-[#2D3BFF] focus:shadow-[0_0_0_2px_rgba(45,59,255,0.10)]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registrationStatus" className="text-sm font-semibold text-[#0A0A0A]">
                    状态
                  </Label>
                  <Select
                    value={formData.registrationStatus}
                    onValueChange={(value) => handleSelectChange("registrationStatus", value)}
                  >
                    <SelectTrigger className="border-[#D5D5D5]">
                      <SelectValue placeholder="请选择状态" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="active">启用</SelectItem>
                      <SelectItem value="inactive">停用</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="establishmentDate" className="text-sm font-semibold text-[#0A0A0A]">
                    成立日期
                  </Label>
                  <Input
                    id="establishmentDate"
                    name="establishmentDate"
                    type="date"
                    value={formData.establishmentDate}
                    onChange={handleInputChange}
                    className="border-[#D5D5D5] focus:border-[#2D3BFF] focus:shadow-[0_0_0_2px_rgba(45,59,255,0.10)]"
                  />
                </div>
              </div>
            </div>

            {/* 联系信息 */}
            <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
              <h2 className="text-lg font-semibold text-[#0A0A0A] mb-4">联系信息</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-semibold text-[#0A0A0A]">
                    联系电话
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="请输入联系电话"
                    className="border-[#D5D5D5] focus:border-[#2D3BFF] focus:shadow-[0_0_0_2px_rgba(45,59,255,0.10)]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-[#0A0A0A]">
                    电子邮箱
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="请输入电子邮箱"
                    className="border-[#D5D5D5] focus:border-[#2D3BFF] focus:shadow-[0_0_0_2px_rgba(45,59,255,0.10)]"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="address" className="text-sm font-semibold text-[#0A0A0A]">
                    注册地址
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="请输入注册地址"
                    className="border-[#D5D5D5] focus:border-[#2D3BFF] focus:shadow-[0_0_0_2px_rgba(45,59,255,0.10)]"
                  />
                </div>
              </div>
            </div>

            {/* 经营信息 */}
            <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
              <h2 className="text-lg font-semibold text-[#0A0A0A] mb-4">经营信息</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry" className="text-sm font-semibold text-[#0A0A0A]">
                    所属行业
                  </Label>
                  <Input
                    id="industry"
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    placeholder="请输入所属行业"
                    className="border-[#D5D5D5] focus:border-[#2D3BFF] focus:shadow-[0_0_0_2px_rgba(45,59,255,0.10)]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registeredCapital" className="text-sm font-semibold text-[#0A0A0A]">
                    注册资本
                  </Label>
                  <Input
                    id="registeredCapital"
                    name="registeredCapital"
                    value={formData.registeredCapital}
                    onChange={handleInputChange}
                    placeholder="请输入注册资本"
                    className="border-[#D5D5D5] focus:border-[#2D3BFF] focus:shadow-[0_0_0_2px_rgba(45,59,255,0.10)]"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="businessScope" className="text-sm font-semibold text-[#0A0A0A]">
                    经营范围
                  </Label>
                  <Textarea
                    id="businessScope"
                    name="businessScope"
                    value={formData.businessScope}
                    onChange={handleInputChange}
                    placeholder="请输入经营范围"
                    rows={3}
                    className="border-[#D5D5D5] focus:border-[#2D3BFF] focus:shadow-[0_0_0_2px_rgba(45,59,255,0.10)]"
                  />
                </div>
              </div>
            </div>

            {/* 结算信息 */}
            <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
              <h2 className="text-lg font-semibold text-[#0A0A0A] mb-4">结算信息</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxId" className="text-sm font-semibold text-[#0A0A0A]">
                    纳税人识别号
                  </Label>
                  <Input
                    id="taxId"
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleInputChange}
                    placeholder="请输入纳税人识别号"
                    className="border-[#D5D5D5] focus:border-[#2D3BFF] focus:shadow-[0_0_0_2px_rgba(45,59,255,0.10)]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="settlementEntity" className="text-sm font-semibold text-[#0A0A0A]">
                    结算主体
                  </Label>
                  <Input
                    id="settlementEntity"
                    name="settlementEntity"
                    value={formData.settlementEntity}
                    onChange={handleInputChange}
                    placeholder="请输入结算主体"
                    className="border-[#D5D5D5] focus:border-[#2D3BFF] focus:shadow-[0_0_0_2px_rgba(45,59,255,0.10)]"
                  />
                </div>
              </div>
            </div>

            {/* 备注信息 */}
            <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
              <h2 className="text-lg font-semibold text-[#0A0A0A] mb-4">备注信息</h2>
              <div className="space-y-2">
                <Label htmlFor="remark" className="text-sm font-semibold text-[#0A0A0A]">
                  备注
                </Label>
                <Textarea
                  id="remark"
                  name="remark"
                  value={formData.remark}
                  onChange={handleInputChange}
                  placeholder="请输入备注信息"
                  rows={4}
                  className="border-[#D5D5D5] focus:border-[#2D3BFF] focus:shadow-[0_0_0_2px_rgba(45,59,255,0.10)]"
                />
              </div>
            </div>

            {/* 底部操作按钮 */}
            <div className="flex items-center justify-between bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveDraft}
                  className="border border-[#EBEBEB] text-[#5A5A5A] hover:bg-[#FAFAFA]"
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
                  className="border border-[#EBEBEB] text-[#5A5A5A] hover:bg-[#FAFAFA]"
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  className="bg-[#2D3BFF] hover:bg-[#4338CA] text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  保存
                </Button>
              </div>
            </div>
          </form>
      </div>
  );
}
