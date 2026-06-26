"use client";

import { useState, useEffect } from "react";
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
import { useConfirm } from "@/hooks/useConfirm";
import { toast } from "sonner";

export default function NewServiceEntityPage() {
  const router = useRouter();
  const { confirm, ConfirmDialog } = useConfirm();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    unifiedSocialCreditCode: "",
    legalRepresentative: "",
    status: "active",
    establishmentDate: "",
    taxId: "",
    address: "",
    contactPerson: "",
    phone: "",
    email: "",
    remark: "",
  });

  // 初始化时获取编码
  useEffect(() => {
    fetch("/api/code-generate?type=SVC")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.code) {
          setFormData((prev) => ({ ...prev, code: data.code }));
        }
      })
      .catch(() => {});
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClear = async () => {
    const ok = await confirm("清空内容", "确定要清空所有内容吗？", "清空", "取消", true);
    if (ok) {
      setFormData((prev) => ({
        ...prev,
        name: "",
        unifiedSocialCreditCode: "",
        legalRepresentative: "",
        establishmentDate: "",
        taxId: "",
        address: "",
        contactPerson: "",
        phone: "",
        email: "",
        remark: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      toast.error("服务主体名称不能为空");
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch("/api/service-entities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: `svc-${Date.now()}`,
          name: formData.name.trim(),
          code: formData.code || undefined,
          unifiedSocialCreditCode: formData.unifiedSocialCreditCode || undefined,
          legalRepresentative: formData.legalRepresentative || undefined,
          status: formData.status,
          establishmentDate: formData.establishmentDate || undefined,
          taxId: formData.taxId || undefined,
          address: formData.address || undefined,
          contactPerson: formData.contactPerson || undefined,
          phone: formData.phone || undefined,
          email: formData.email || undefined,
          remark: formData.remark || undefined,
        }),
      });
      const data = await resp.json();
      if (data.success) {
        toast.success("服务主体创建成功");
        router.push("/entities/service");
      } else {
        toast.error(data.error || "创建失败");
      }
    } catch {
      toast.error("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="border border-[#EBEBEB] text-[#5A5A5A] hover:bg-[#F5F5F5] px-3 py-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <div className="flex items-center gap-2 text-[13px] text-[#999999] mb-1">
            <button onClick={() => router.push("/entities")} className="hover:text-[#2D3BFF] transition-colors">主体管理</button>
            <span className="text-[#D5D5D5]">/</span>
            <button onClick={() => router.push("/entities/service")} className="hover:text-[#2D3BFF] transition-colors">服务主体</button>
            <span className="text-[#D5D5D5]">/</span>
            <span>新增</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0A0A0A]">新增服务主体</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本信息 */}
        <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
          <h2 className="text-md font-semibold text-[#0A0A0A] mb-4">基本信息</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="block text-sm font-semibold text-[#0A0A0A]">
                <span className="text-red-500">*</span> 服务主体名称
              </Label>
              <Input
                id="name" name="name" value={formData.name} onChange={handleInputChange}
                placeholder="请输入服务主体名称"
                className="border-[#D5D5D5] focus:border-[#2D3BFF] focus:shadow-[0_0_0_2px_rgba(45,59,255,0.10)]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code" className="block text-sm font-semibold text-[#0A0A0A]">
                主体代码
              </Label>
              <Input
                id="code" name="code" value={formData.code} readOnly
                className="border-[#D5D5D5] bg-[#FAFAFA] text-[#999999] cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unifiedSocialCreditCode" className="block text-sm font-semibold text-[#0A0A0A]">
                统一社会信用代码
              </Label>
              <Input
                id="unifiedSocialCreditCode" name="unifiedSocialCreditCode" value={formData.unifiedSocialCreditCode}
                onChange={handleInputChange} placeholder="请输入统一社会信用代码"
                className="border-[#D5D5D5] focus:border-[#2D3BFF] focus:shadow-[0_0_0_2px_rgba(45,59,255,0.10)]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="legalRepresentative" className="block text-sm font-semibold text-[#0A0A0A]">
                法定代表人
              </Label>
              <Input
                id="legalRepresentative" name="legalRepresentative" value={formData.legalRepresentative}
                onChange={handleInputChange} placeholder="请输入法定代表人"
                className="border-[#D5D5D5] focus:border-[#2D3BFF] focus:shadow-[0_0_0_2px_rgba(45,59,255,0.10)]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status" className="block text-sm font-semibold text-[#0A0A0A]">
                状态
              </Label>
              <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
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
              <Label htmlFor="establishmentDate" className="block text-sm font-semibold text-[#0A0A0A]">
                成立日期
              </Label>
              <Input
                id="establishmentDate" name="establishmentDate" type="date" value={formData.establishmentDate}
                onChange={handleInputChange}
                className="border-[#D5D5D5] focus:border-[#2D3BFF] focus:shadow-[0_0_0_2px_rgba(45,59,255,0.10)]"
              />
            </div>
          </div>
        </div>

        {/* 联系信息 */}
        <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
          <h2 className="text-md font-semibold text-[#0A0A0A] mb-4">联系信息</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactPerson" className="block text-sm font-semibold text-[#0A0A0A]">
                联系人
              </Label>
              <Input
                id="contactPerson" name="contactPerson" value={formData.contactPerson} onChange={handleInputChange}
                placeholder="请输入联系人"
                className="border-[#D5D5D5] focus:border-[#2D3BFF] focus:shadow-[0_0_0_2px_rgba(45,59,255,0.10)]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="block text-sm font-semibold text-[#0A0A0A]">
                联系电话
              </Label>
              <Input
                id="phone" name="phone" value={formData.phone} onChange={handleInputChange}
                placeholder="请输入联系电话"
                className="border-[#D5D5D5] focus:border-[#2D3BFF] focus:shadow-[0_0_0_2px_rgba(45,59,255,0.10)]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="block text-sm font-semibold text-[#0A0A0A]">
                电子邮箱
              </Label>
              <Input
                id="email" name="email" type="email" value={formData.email} onChange={handleInputChange}
                placeholder="请输入电子邮箱"
                className="border-[#D5D5D5] focus:border-[#2D3BFF] focus:shadow-[0_0_0_2px_rgba(45,59,255,0.10)]"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="address" className="block text-sm font-semibold text-[#0A0A0A]">
                注册地址
              </Label>
              <Input
                id="address" name="address" value={formData.address} onChange={handleInputChange}
                placeholder="请输入注册地址"
                className="border-[#D5D5D5] focus:border-[#2D3BFF] focus:shadow-[0_0_0_2px_rgba(45,59,255,0.10)]"
              />
            </div>
          </div>
        </div>

        {/* 结算信息 */}
        <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
          <h2 className="text-md font-semibold text-[#0A0A0A] mb-4">税务信息</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taxId" className="block text-sm font-semibold text-[#0A0A0A]">
                纳税人识别号
              </Label>
              <Input
                id="taxId" name="taxId" value={formData.taxId} onChange={handleInputChange}
                placeholder="请输入纳税人识别号"
                className="border-[#D5D5D5] focus:border-[#2D3BFF] focus:shadow-[0_0_0_2px_rgba(45,59,255,0.10)]"
              />
            </div>
          </div>
        </div>

        {/* 备注 */}
        <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
          <h2 className="text-md font-semibold text-[#0A0A0A] mb-4">备注信息</h2>
          <div className="space-y-2">
            <Label htmlFor="remark" className="block text-sm font-semibold text-[#0A0A0A]">
              备注
            </Label>
            <Textarea
              id="remark" name="remark" value={formData.remark} onChange={handleInputChange}
              placeholder="请输入备注信息" rows={4}
              className="border-[#D5D5D5] focus:border-[#2D3BFF] focus:shadow-[0_0_0_2px_rgba(45,59,255,0.10)]"
            />
          </div>
        </div>

        {/* 底部操作按钮 */}
        <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-[#EBEBEB] p-6">
          <div className="flex items-center gap-3">
            <Button
              type="button" variant="outline" onClick={handleClear}
              className="border border-[#EBEBEB] text-[#5A5A5A] hover:bg-[#F5F5F5]"
            >
              <X className="w-4 h-4 mr-2" />清空
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button" variant="outline" onClick={() => router.back()}
              className="border border-[#EBEBEB] text-[#5A5A5A] hover:bg-[#F5F5F5]"
            >
              取消
            </Button>
            <Button type="submit" disabled={loading} className="bg-[#2D3BFF] hover:bg-[#4338CA] text-white">
              <Save className="w-4 h-4 mr-2" />
              {loading ? "保存中..." : "保存"}
            </Button>
          </div>
        </div>
      </form>
      {ConfirmDialog}
    </div>
  );
}
