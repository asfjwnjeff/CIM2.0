"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Search, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ADDRESS_USAGE_LABELS, type AddressUsageType } from "@/lib/types";

interface ContactRow { id: string; name: string; phone: string; email: string; isPrimary: boolean; remark: string; }

export default function NewAddressSitePage() {
  const router = useRouter();
  const params = useParams();
  const serviceEntityId = params.id as string;
  const scId = params.scId as string;
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [formData, setFormData] = useState({
    code: "", name: "", province: "", city: "", district: "", detailAddress: "",
    doorplate: "", postalCode: "", longitude: "", latitude: "", geoAccuracy: "unresolved",
    specialCustomsZone: false, specialRequirements: "",
  });
  const [usages, setUsages] = useState<AddressUsageType[]>([]);
  const [contacts, setContacts] = useState<ContactRow[]>([]);

  useEffect(() => {
    fetch("/api/code-generate?type=ADS").then((r) => r.json()).then((d) => { if (d.success) setFormData((p) => ({ ...p, code: d.code })); }).catch(() => {});
  }, []);

  // 地址解析
  const handleResolve = async () => {
    if (!formData.detailAddress.trim()) { toast.error("请先输入详细地址"); return; }
    setResolving(true);
    try {
      const resp = await fetch("/api/address-resolve", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: formData.detailAddress, city: formData.city }),
      });
      const data = await resp.json();
      if (data.success && data.data) {
        const r = data.data;
        setFormData((p) => ({ ...p, province: r.province || "", city: r.city || p.city, district: r.district || "",
          longitude: r.longitude ? String(r.longitude) : "", latitude: r.latitude ? String(r.latitude) : "",
          geoAccuracy: r.accuracy || "unresolved" }));
        toast.success(r.accuracy === "unresolved" ? "地址解析失败，请手动填写" : "地址解析完成");
      } else { toast.error(data.error || "解析失败"); }
    } catch { toast.error("解析服务异常"); }
    finally { setResolving(false); }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const toggleUsage = (type: AddressUsageType) => {
    setUsages((p) => p.includes(type) ? p.filter((t) => t !== type) : [...p, type]);
  };

  const addContact = () => {
    setContacts((p) => [...p, { id: `tmp-${Date.now()}`, name: "", phone: "", email: "", isPrimary: p.length === 0, remark: "" }]);
  };
  const removeContact = (idx: number) => setContacts((p) => p.filter((_, i) => i !== idx));
  const updateContact = (idx: number, field: keyof ContactRow, value: string | boolean) => {
    setContacts((p) => p.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.detailAddress.trim()) { toast.error("详细地址不能为空"); return; }
    setLoading(true);
    try {
      const resp = await fetch("/api/address-sites", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: `ads-${Date.now()}`, shipperConsigneeId: scId, serviceEntityId,
          code: formData.code, name: formData.name || undefined,
          province: formData.province || undefined, city: formData.city || undefined,
          district: formData.district || undefined, detailAddress: formData.detailAddress.trim(),
          doorplate: formData.doorplate || undefined, postalCode: formData.postalCode || undefined,
          longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
          latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
          geoAccuracy: formData.geoAccuracy, specialCustomsZone: formData.specialCustomsZone,
          specialRequirements: formData.specialRequirements || undefined,
          usages: usages.map((u) => ({ usageType: u })),
          contacts: contacts.filter((c) => c.name.trim()).map((c) => ({ name: c.name, phone: c.phone, email: c.email, isPrimary: c.isPrimary, remark: c.remark })),
        }),
      });
      const data = await resp.json();
      if (data.success) { toast.success("地址站点创建成功"); router.push(`/entities/service/${serviceEntityId}`); }
      else { toast.error(data.error || "创建失败"); }
    } catch { toast.error("网络错误"); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => router.back()} className="border border-[#EBEBEB] text-[#5A5A5A] hover:bg-[#F5F5F5] px-3 py-2"><ArrowLeft className="w-4 h-4" /></Button>
        <div>
          <div className="flex items-center gap-2 text-[13px] text-[#999999] mb-1">
            <button onClick={() => router.push(`/entities/service/${serviceEntityId}`)} className="hover:text-[#2D3BFF] transition-colors">服务主体详情</button>
            <span className="text-[#D5D5D5]">/</span><span>新增地址站点</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0A0A0A]">新增地址站点</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本信息 */}
        <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
          <h2 className="text-md font-semibold text-[#0A0A0A] mb-4">基本信息</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="block text-sm font-semibold text-[#0A0A0A]">站点名称</Label>
              <Input name="name" value={formData.name} onChange={handleInputChange} placeholder="如：上海浦东仓库" className="border-[#D5D5D5] focus:border-[#2D3BFF]" />
            </div>
            <div className="space-y-2">
              <Label className="block text-sm font-semibold text-[#0A0A0A]">地址站点代码</Label>
              <Input value={formData.code} readOnly className="border-[#D5D5D5] bg-[#FAFAFA] text-[#999999] cursor-not-allowed" />
            </div>
          </div>
        </div>

        {/* 地址定位 */}
        <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
          <h2 className="text-md font-semibold text-[#0A0A0A] mb-4">地址定位</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="space-y-2"><Label className="block text-sm font-semibold text-[#0A0A0A]">省</Label><Input name="province" value={formData.province} onChange={handleInputChange} placeholder="解析自动填充" className="border-[#D5D5D5] bg-[#FAFAFA] focus:border-[#2D3BFF]" /></div>
            <div className="space-y-2"><Label className="block text-sm font-semibold text-[#0A0A0A]">市</Label><Input name="city" value={formData.city} onChange={handleInputChange} placeholder="解析自动填充" className="border-[#D5D5D5] bg-[#FAFAFA] focus:border-[#2D3BFF]" /></div>
            <div className="space-y-2"><Label className="block text-sm font-semibold text-[#0A0A0A]">区/县</Label><Input name="district" value={formData.district} onChange={handleInputChange} placeholder="解析自动填充" className="border-[#D5D5D5] bg-[#FAFAFA] focus:border-[#2D3BFF]" /></div>
          </div>
          <div className="space-y-2 mb-4">
            <Label className="block text-sm font-semibold text-[#0A0A0A]"><span className="text-red-500">*</span> 详细地址</Label>
            <div className="flex gap-2">
              <Input name="detailAddress" value={formData.detailAddress} onChange={handleInputChange} onBlur={() => { if (formData.detailAddress.trim() && !formData.province) handleResolve(); }} placeholder="请输入完整详细地址（如：浦东新区张江路18号）" className="flex-1 border-[#D5D5D5] focus:border-[#2D3BFF]" />
              <Button type="button" variant="outline" onClick={handleResolve} disabled={resolving} className="border-[#D5D5D5] text-[#2D3BFF] whitespace-nowrap">
                <Search className="w-4 h-4 mr-1" />{resolving ? "解析中..." : "地址解析"}
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="block text-sm font-semibold text-[#0A0A0A]">门牌号</Label><Input name="doorplate" value={formData.doorplate} onChange={handleInputChange} placeholder="手工录入" className="border-[#D5D5D5] focus:border-[#2D3BFF]" /></div>
            <div className="space-y-2"><Label className="block text-sm font-semibold text-[#0A0A0A]">邮政编码</Label><Input name="postalCode" value={formData.postalCode} onChange={handleInputChange} placeholder="手工录入" className="border-[#D5D5D5] focus:border-[#2D3BFF]" /></div>
            <div className="space-y-2"><Label className="block text-sm font-semibold text-[#0A0A0A]">经度</Label><Input value={formData.longitude} readOnly className="border-[#D5D5D5] bg-[#FAFAFA] text-[#999999] cursor-not-allowed" /></div>
            <div className="space-y-2"><Label className="block text-sm font-semibold text-[#0A0A0A]">纬度</Label><Input value={formData.latitude} readOnly className="border-[#D5D5D5] bg-[#FAFAFA] text-[#999999] cursor-not-allowed" /></div>
          </div>
        </div>

        {/* 地址用途 */}
        <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
          <h2 className="text-md font-semibold text-[#0A0A0A] mb-4">地址用途（可多选）</h2>
          <div className="flex flex-wrap gap-3">
            {(Object.entries(ADDRESS_USAGE_LABELS) as [AddressUsageType, string][]).map(([key, label]) => (
              <label key={key} className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${
                usages.includes(key) ? "bg-[#E8EBFF] border-[#2D3BFF] text-[#2D3BFF]" : "border-[#D5D5D5] text-[#5A5A5A] hover:border-[#2D3BFF]"
              }`}>
                <input type="checkbox" checked={usages.includes(key)} onChange={() => toggleUsage(key)} className="sr-only" />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* 联系人 */}
        <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-md font-semibold text-[#0A0A0A]">联系人及联系方式</h2>
            <Button type="button" variant="outline" size="sm" onClick={addContact} className="text-[#2D3BFF] border-[#D5D5D5]">
              <Plus className="w-3.5 h-3.5 mr-1" />新增联系人
            </Button>
          </div>
          {contacts.length === 0 ? (
            <div className="text-center py-6 text-[#999999] text-xs">暂未添加联系人</div>
          ) : (
            <div className="space-y-3">
              {contacts.map((c, idx) => (
                <div key={c.id} className="grid grid-cols-6 gap-3 items-start p-3 border border-[#EBEBEB] rounded-lg bg-[#FAFAFA]">
                  <Input placeholder="姓名" value={c.name} onChange={(e) => updateContact(idx, "name", e.target.value)} className="border-[#D5D5D5] h-[38px] text-sm" />
                  <Input placeholder="电话" value={c.phone} onChange={(e) => updateContact(idx, "phone", e.target.value)} className="border-[#D5D5D5] h-[38px] text-sm" />
                  <Input placeholder="邮箱" value={c.email} onChange={(e) => updateContact(idx, "email", e.target.value)} className="border-[#D5D5D5] h-[38px] text-sm" />
                  <label className="flex items-center gap-1.5 text-xs text-[#5A5A5A] cursor-pointer">
                    <input type="checkbox" checked={c.isPrimary} onChange={(e) => updateContact(idx, "isPrimary", e.target.checked)} />主要负责人
                  </label>
                  <Input placeholder="备注" value={c.remark} onChange={(e) => updateContact(idx, "remark", e.target.value)} className="border-[#D5D5D5] h-[38px] text-sm" />
                  <button type="button" onClick={() => removeContact(idx)} className="text-[#D63031] hover:underline text-xs self-center"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 作业属性 */}
        <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
          <h2 className="text-md font-semibold text-[#0A0A0A] mb-4">作业属性</h2>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" name="specialCustomsZone" checked={formData.specialCustomsZone} onChange={handleInputChange} className="w-4 h-4 rounded border-[#D5D5D5] text-[#2D3BFF]" />
              海关特殊监管区域
            </label>
          </div>
          <div className="space-y-2 mt-4">
            <Label className="block text-sm font-semibold text-[#0A0A0A]">特殊要求</Label>
            <Textarea name="specialRequirements" value={formData.specialRequirements} onChange={handleInputChange} placeholder="运输、仓储、关务等方面的特殊要求" rows={3} className="border-[#D5D5D5] focus:border-[#2D3BFF]" />
          </div>
        </div>

        <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-[#EBEBEB] p-6">
          <div /><div className="flex items-center gap-3"><Button type="button" variant="outline" onClick={() => router.back()} className="border border-[#EBEBEB] text-[#5A5A5A] hover:bg-[#F5F5F5]">取消</Button><Button type="submit" disabled={loading} className="bg-[#2D3BFF] hover:bg-[#4338CA] text-white"><Save className="w-4 h-4 mr-2" />{loading ? "保存中..." : "保存"}</Button></div>
        </div>
      </form>
    </div>
  );
}
