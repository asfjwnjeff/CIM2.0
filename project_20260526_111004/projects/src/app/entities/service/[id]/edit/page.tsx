"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

export default function EditServiceEntityPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    name: "", code: "", unifiedSocialCreditCode: "", legalRepresentative: "",
    status: "active", establishmentDate: "", taxId: "", address: "",
    contactPerson: "", phone: "", email: "", remark: "",
  });

  useEffect(() => {
    fetch(`/api/service-entities/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          const d = data.data;
          setFormData({
            name: d.name || "", code: d.code || "",
            unifiedSocialCreditCode: d.unifiedSocialCreditCode || "",
            legalRepresentative: d.legalRepresentative || "",
            status: d.status || "active",
            establishmentDate: d.establishmentDate || "",
            taxId: d.taxId || "", address: d.address || "",
            contactPerson: d.contactPerson || "", phone: d.phone || "",
            email: d.email || "", remark: d.remark || "",
          });
        } else {
          toast.error("服务主体不存在");
          router.push("/entities/service");
        }
      })
      .catch(() => { toast.error("网络错误"); })
      .finally(() => setFetching(false));
  }, [id, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) { toast.error("服务主体名称不能为空"); return; }
    setLoading(true);
    try {
      const resp = await fetch("/api/service-entities", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...formData, name: formData.name.trim() }),
      });
      const data = await resp.json();
      if (data.success) {
        toast.success("服务主体更新成功");
        router.push(`/entities/service/${id}`);
      } else {
        toast.error(data.error || "更新失败");
      }
    } catch { toast.error("网络错误"); }
    finally { setLoading(false); }
  };

  if (fetching) {
    return (
      <div className="max-w-[1440px] mx-auto space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[#EBEBEB] rounded w-48" />
          <div className="h-48 bg-[#EBEBEB] rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => router.back()} className="border border-[#EBEBEB] text-[#5A5A5A] hover:bg-[#F5F5F5] px-3 py-2">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <div className="flex items-center gap-2 text-[13px] text-[#999999] mb-1">
            <button onClick={() => router.push("/entities/service")} className="hover:text-[#2D3BFF] transition-colors">服务主体</button>
            <span className="text-[#D5D5D5]">/</span>
            <button onClick={() => router.push(`/entities/service/${id}`)} className="hover:text-[#2D3BFF] transition-colors">{formData.name}</button>
            <span className="text-[#D5D5D5]">/</span>
            <span>编辑</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0A0A0A]">编辑服务主体</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
          <h2 className="text-md font-semibold text-[#0A0A0A] mb-4">基本信息</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="block text-sm font-semibold text-[#0A0A0A]"><span className="text-red-500">*</span> 服务主体名称</Label>
              <Input name="name" value={formData.name} onChange={handleInputChange} className="border-[#D5D5D5] focus:border-[#2D3BFF]" />
            </div>
            <div className="space-y-2">
              <Label className="block text-sm font-semibold text-[#0A0A0A]">主体代码</Label>
              <Input value={formData.code} readOnly className="border-[#D5D5D5] bg-[#FAFAFA] text-[#999999] cursor-not-allowed" />
            </div>
            <div className="space-y-2">
              <Label className="block text-sm font-semibold text-[#0A0A0A]">统一社会信用代码</Label>
              <Input name="unifiedSocialCreditCode" value={formData.unifiedSocialCreditCode} onChange={handleInputChange} className="border-[#D5D5D5] focus:border-[#2D3BFF]" />
            </div>
            <div className="space-y-2">
              <Label className="block text-sm font-semibold text-[#0A0A0A]">法定代表人</Label>
              <Input name="legalRepresentative" value={formData.legalRepresentative} onChange={handleInputChange} className="border-[#D5D5D5] focus:border-[#2D3BFF]" />
            </div>
            <div className="space-y-2">
              <Label className="block text-sm font-semibold text-[#0A0A0A]">状态</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData((p) => ({ ...p, status: v }))}>
                <SelectTrigger className="border-[#D5D5D5]"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white"><SelectItem value="active">启用</SelectItem><SelectItem value="inactive">停用</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="block text-sm font-semibold text-[#0A0A0A]">成立日期</Label>
              <Input name="establishmentDate" type="date" value={formData.establishmentDate} onChange={handleInputChange} className="border-[#D5D5D5] focus:border-[#2D3BFF]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
          <h2 className="text-md font-semibold text-[#0A0A0A] mb-4">联系信息</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="block text-sm font-semibold text-[#0A0A0A]">联系人</Label><Input name="contactPerson" value={formData.contactPerson} onChange={handleInputChange} className="border-[#D5D5D5] focus:border-[#2D3BFF]" /></div>
            <div className="space-y-2"><Label className="block text-sm font-semibold text-[#0A0A0A]">联系电话</Label><Input name="phone" value={formData.phone} onChange={handleInputChange} className="border-[#D5D5D5] focus:border-[#2D3BFF]" /></div>
            <div className="space-y-2"><Label className="block text-sm font-semibold text-[#0A0A0A]">邮箱</Label><Input name="email" type="email" value={formData.email} onChange={handleInputChange} className="border-[#D5D5D5] focus:border-[#2D3BFF]" /></div>
            <div className="space-y-2 col-span-2"><Label className="block text-sm font-semibold text-[#0A0A0A]">注册地址</Label><Input name="address" value={formData.address} onChange={handleInputChange} className="border-[#D5D5D5] focus:border-[#2D3BFF]" /></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
          <h2 className="text-md font-semibold text-[#0A0A0A] mb-4">税务信息</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="block text-sm font-semibold text-[#0A0A0A]">纳税人识别号</Label><Input name="taxId" value={formData.taxId} onChange={handleInputChange} className="border-[#D5D5D5] focus:border-[#2D3BFF]" /></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
          <h2 className="text-md font-semibold text-[#0A0A0A] mb-4">备注</h2>
          <div className="space-y-2"><Label className="block text-sm font-semibold text-[#0A0A0A]">备注</Label><Textarea name="remark" value={formData.remark} onChange={handleInputChange} rows={4} className="border-[#D5D5D5] focus:border-[#2D3BFF]" /></div>
        </div>

        <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-[#EBEBEB] p-6">
          <div />
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()} className="border border-[#EBEBEB] text-[#5A5A5A] hover:bg-[#F5F5F5]">取消</Button>
            <Button type="submit" disabled={loading} className="bg-[#2D3BFF] hover:bg-[#4338CA] text-white"><Save className="w-4 h-4 mr-2" />{loading ? "保存中..." : "保存"}</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
