"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, X } from "lucide-react";
import { useConfirm } from "@/hooks/useConfirm";
import { toast } from "sonner";

export default function NewShipperConsigneePage() {
  const router = useRouter();
  const params = useParams();
  const serviceEntityId = params.id as string;
  const { confirm, ConfirmDialog } = useConfirm();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "", code: "", type: "both",
    unifiedSocialCreditCode: "", contactPerson: "", phone: "",
    email: "", remark: "",
  });

  useEffect(() => {
    fetch("/api/code-generate?type=SHC")
      .then((r) => r.json())
      .then((data) => { if (data.success && data.code) setFormData((p) => ({ ...p, code: data.code })); })
      .catch(() => {});
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) { toast.error("收发货方名称不能为空"); return; }
    setLoading(true);
    try {
      const resp = await fetch("/api/shipper-consignees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: `shc-${Date.now()}`, serviceEntityId, ...formData, name: formData.name.trim() }),
      });
      const data = await resp.json();
      if (data.success) {
        toast.success("收发货方创建成功");
        router.push(`/entities/service/${serviceEntityId}`);
      } else { toast.error(data.error || "创建失败"); }
    } catch { toast.error("网络错误"); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => router.back()} className="border border-[#EBEBEB] text-[#5A5A5A] hover:bg-[#F5F5F5] px-3 py-2">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <div className="flex items-center gap-2 text-[13px] text-[#999999] mb-1">
            <button onClick={() => router.push(`/entities/service/${serviceEntityId}`)} className="hover:text-[#2D3BFF] transition-colors">服务主体详情</button>
            <span className="text-[#D5D5D5]">/</span>
            <span>新增收发货方</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0A0A0A]">新增收发货方</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
          <h2 className="text-md font-semibold text-[#0A0A0A] mb-4">基本信息</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="block text-sm font-semibold text-[#0A0A0A]"><span className="text-red-500">*</span> 收发货方名称</Label>
              <Input name="name" value={formData.name} onChange={handleInputChange} placeholder="请输入收发货方名称" className="border-[#D5D5D5] focus:border-[#2D3BFF]" />
            </div>
            <div className="space-y-2">
              <Label className="block text-sm font-semibold text-[#0A0A0A]">收发货方代码</Label>
              <Input value={formData.code} readOnly className="border-[#D5D5D5] bg-[#FAFAFA] text-[#999999] cursor-not-allowed" />
            </div>
            <div className="space-y-2">
              <Label className="block text-sm font-semibold text-[#0A0A0A]">收发货方类型</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData((p) => ({ ...p, type: v }))}>
                <SelectTrigger className="border-[#D5D5D5]"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="shipper">发货方</SelectItem>
                  <SelectItem value="consignee">收货方</SelectItem>
                  <SelectItem value="both">收发货方（兼具）</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="block text-sm font-semibold text-[#0A0A0A]">统一社会信用代码</Label>
              <Input name="unifiedSocialCreditCode" value={formData.unifiedSocialCreditCode} onChange={handleInputChange} placeholder="请输入" className="border-[#D5D5D5] focus:border-[#2D3BFF]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
          <h2 className="text-md font-semibold text-[#0A0A0A] mb-4">联系信息</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="block text-sm font-semibold text-[#0A0A0A]">联系人</Label><Input name="contactPerson" value={formData.contactPerson} onChange={handleInputChange} placeholder="请输入联系人" className="border-[#D5D5D5] focus:border-[#2D3BFF]" /></div>
            <div className="space-y-2"><Label className="block text-sm font-semibold text-[#0A0A0A]">联系电话</Label><Input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="请输入联系电话" className="border-[#D5D5D5] focus:border-[#2D3BFF]" /></div>
            <div className="space-y-2 col-span-2"><Label className="block text-sm font-semibold text-[#0A0A0A]">邮箱</Label><Input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="请输入邮箱" className="border-[#D5D5D5] focus:border-[#2D3BFF]" /></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
          <h2 className="text-md font-semibold text-[#0A0A0A] mb-4">备注</h2>
          <div className="space-y-2"><Label className="block text-sm font-semibold text-[#0A0A0A]">备注</Label><Textarea name="remark" value={formData.remark} onChange={handleInputChange} rows={3} className="border-[#D5D5D5] focus:border-[#2D3BFF]" /></div>
        </div>

        <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-[#EBEBEB] p-6">
          <Button type="button" variant="outline" onClick={() => router.back()} className="border border-[#EBEBEB] text-[#5A5A5A] hover:bg-[#F5F5F5]"><X className="w-4 h-4 mr-2" />取消</Button>
          <Button type="submit" disabled={loading} className="bg-[#2D3BFF] hover:bg-[#4338CA] text-white"><Save className="w-4 h-4 mr-2" />{loading ? "保存中..." : "保存"}</Button>
        </div>
      </form>
      {ConfirmDialog}
    </div>
  );
}
