"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, MapPin, Phone, Mail } from "lucide-react";
import { toast } from "sonner";
import { ADDRESS_USAGE_LABELS } from "@/lib/types";

function StatusBadge({ status }: { status: string }) {
  const isActive = status === "active";
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${isActive ? "bg-[#E6F7F0] text-[#0D8A5E]" : "bg-[#EBEBEB] text-[#5A5A5A]"}`}>{isActive ? "启用" : "停用"}</span>;
}

export default function AddressSiteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const serviceEntityId = params.id as string;
  const scId = params.scId as string;
  const addrId = params.addrId as string;
  const [addr, setAddr] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/address-sites/${addrId}`).then((r) => r.json()).then((data) => {
      if (data.success) setAddr(data.data);
      else { toast.error("地址站点不存在"); router.back(); }
    }).catch(() => toast.error("网络错误")).finally(() => setLoading(false));
  }, [addrId, router]);

  if (loading) return <div className="max-w-[1440px] mx-auto"><div className="animate-pulse h-48 bg-[#EBEBEB] rounded-2xl" /></div>;
  if (!addr) return null;

  const usages = (addr.usages as Array<{ usageType: string }>) || [];
  const contacts = (addr.contacts as Array<{ id: string; name: string; phone?: string; email?: string; isPrimary?: boolean }>) || [];
  const versions = (addr.versions as Array<{ id: string; version: number; changeSummary?: string; changedAt: string }>) || [];

  return (
    <div className="max-w-[1440px] mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 border border-[#EBEBEB] text-[#5A5A5A] hover:bg-[#F5F5F5] px-3 py-2 rounded-lg transition-colors"><ArrowLeft className="w-4 h-4" /></button>
        <div>
          <div className="flex items-center gap-2 text-[13px] text-[#999999]">
            <button onClick={() => router.push(`/entities/service/${serviceEntityId}`)} className="hover:text-[#2D3BFF] transition-colors">服务主体详情</button>
            <span className="text-[#D5D5D5]">/</span><span className="text-[#0A0A0A]">地址站点详情</span>
          </div>
        </div>
      </div>

      {/* 基本信息 */}
      <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-[#0A0A0A] flex items-center gap-2"><MapPin className="w-5 h-5 text-[#2D3BFF]" />{addr.name as string || "地址站点"}</h1>
            <p className="text-[13px] text-[#5A5A5A] mt-1">代码：{addr.code as string || "-"} ｜ 版本：v{addr.version as number || 1}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={addr.status as string || "active"} />
            <button onClick={() => router.push(`/entities/service/${serviceEntityId}/shipper-consignee/${scId}/address-site/${addrId}/edit`)} className="px-3 py-2 border border-[#EBEBEB] rounded-lg text-sm text-[#5A5A5A] hover:bg-[#F5F5F5]">编辑</button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 text-[13px]">
          <div><span className="text-[#999999]">省：</span>{addr.province as string || "-"}</div>
          <div><span className="text-[#999999]">市：</span>{addr.city as string || "-"}</div>
          <div><span className="text-[#999999]">区/县：</span>{addr.district as string || "-"}</div>
          <div><span className="text-[#999999]">邮政编码：</span>{addr.postalCode as string || "-"}</div>
          <div className="col-span-2"><span className="text-[#999999]">详细地址：</span>{addr.detailAddress as string || "-"}</div>
          <div><span className="text-[#999999]">门牌号：</span>{addr.doorplate as string || "-"}</div>
          <div><span className="text-[#999999]">经度：</span>{addr.longitude != null ? String(addr.longitude) : "-"}</div>
          <div><span className="text-[#999999]">纬度：</span>{addr.latitude != null ? String(addr.latitude) : "-"}</div>
          <div><span className="text-[#999999]">解析精度：</span>{addr.geoAccuracy as string || "unresolved"}</div>
          <div><span className="text-[#999999]">海关特殊监管区域：</span>{addr.specialCustomsZone ? "是" : "否"}</div>
        </div>

        {addr.specialRequirements ? <div className="mt-4 pt-4 border-t border-[#EBEBEB]"><span className="text-[13px] text-[#999999]">特殊要求：</span><span className="text-[13px] text-[#5A5A5A]">{String(addr.specialRequirements)}</span></div> : null}
      </div>

      {/* 地址用途 */}
      <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
        <h2 className="text-md font-semibold text-[#0A0A0A] mb-3">地址用途</h2>
        <div className="flex flex-wrap gap-2">
          {usages.length === 0 ? <span className="text-[13px] text-[#999999]">未设置</span> :
            usages.map((u) => <span key={u.usageType} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#E8EBFF] text-[#2D3BFF]">{ADDRESS_USAGE_LABELS[u.usageType as keyof typeof ADDRESS_USAGE_LABELS] || u.usageType}</span>)
          }
        </div>
      </div>

      {/* 联系人 */}
      <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
        <h2 className="text-md font-semibold text-[#0A0A0A] mb-3">联系人及联系方式</h2>
        {contacts.length === 0 ? <div className="text-[13px] text-[#999999]">暂无联系人</div> : (
          <div className="space-y-2">
            {contacts.map((c) => (
              <div key={c.id} className="flex items-center gap-4 p-3 border border-[#EBEBEB] rounded-lg">
                <span className="text-sm font-medium text-[#0A0A0A]">{c.name}{c.isPrimary ? "（主要负责人）" : ""}</span>
                {c.phone && <span className="text-xs text-[#5A5A5A]"><Phone className="w-3 h-3 inline mr-1" />{c.phone}</span>}
                {c.email && <span className="text-xs text-[#5A5A5A]"><Mail className="w-3 h-3 inline mr-1" />{c.email}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 版本历史 */}
      {versions.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
          <h2 className="text-md font-semibold text-[#0A0A0A] mb-3">版本历史</h2>
          <table className="w-full">
            <thead><tr className="border-b border-[#EBEBEB] bg-[#FAFAFA] h-[32px]"><th className="px-3 py-2 text-left text-[11px] font-semibold uppercase text-[#5A5A5A]">版本</th><th className="px-3 py-2 text-left text-[11px] font-semibold uppercase text-[#5A5A5A]">变更摘要</th><th className="px-3 py-2 text-left text-[11px] font-semibold uppercase text-[#5A5A5A]">时间</th></tr></thead>
            <tbody>
              {[...versions].reverse().map((v) => (
                <tr key={v.id} className="border-b border-[#EBEBEB] h-[36px] hover:bg-[#F5F5F5]">
                  <td className="px-3 py-2 text-[13px] font-mono text-[#2D3BFF]">v{v.version}</td>
                  <td className="px-3 py-2 text-[13px] text-[#5A5A5A]">{v.changeSummary || "-"}</td>
                  <td className="px-3 py-2 text-[13px] text-[#999999]">{v.changedAt?.slice(0, 16) || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
