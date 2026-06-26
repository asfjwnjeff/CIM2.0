"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useConfirm } from "@/hooks/useConfirm";
import { toast } from "sonner";
import { ArrowLeft, Plus, Pencil, Trash2, MapPin, ChevronRight } from "lucide-react";

interface ServiceEntity {
  id: string; name: string; code?: string; unifiedSocialCreditCode?: string;
  legalRepresentative?: string; status: string; establishmentDate?: string;
  taxId?: string; address?: string; contactPerson?: string; phone?: string;
  email?: string; remark?: string; createdAt: string; updatedAt?: string;
}
interface ShipperConsignee {
  id: string; serviceEntityId: string; name: string; code?: string;
  type: string; unifiedSocialCreditCode?: string; contactPerson?: string;
  phone?: string; email?: string; status: string; remark?: string;
  createdAt: string; updatedAt?: string;
  addressSites?: AddressSite[];
}
interface AddressSite {
  id: string; name?: string; code?: string; province?: string; city?: string;
  district?: string; detailAddress: string; status: string; version: number;
  usages?: { id: string; usageType: string }[];
  contacts?: { id: string; name: string; phone?: string }[];
}

function StatusBadge({ status }: { status: string }) {
  const isActive = status === "active";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
      isActive ? "bg-[#E6F7F0] text-[#0D8A5E]" : "bg-[#EBEBEB] text-[#5A5A5A]"
    }`}>
      {isActive ? "启用" : "停用"}
    </span>
  );
}

const USAGE_LABELS: Record<string, string> = {
  receiving: "收货", shipping: "发货", pickup: "提货", delivery: "送货",
  return: "退货", customs: "报关", warehousing: "仓储",
};

export default function ServiceEntityDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { confirm, ConfirmDialog } = useConfirm();
  const [entity, setEntity] = useState<ServiceEntity | null>(null);
  const [shipperConsignees, setShipperConsignees] = useState<ShipperConsignee[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSc, setExpandedSc] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const resp = await fetch(`/api/service-entities/${id}`);
      const data = await resp.json();
      if (data.success) {
        setEntity(data.data);
        setShipperConsignees(data.data.shipperConsignees || []);
      } else {
        toast.error(data.error || "加载失败");
        router.push("/entities/service");
      }
    } catch {
      toast.error("网络错误");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDeleteSc = async (scId: string, name: string) => {
    const ok = await confirm("删除收发货方", `确定要删除收发货方"${name}"及其所有地址吗？`, "删除", "取消", true);
    if (!ok) return;
    try {
      const resp = await fetch(`/api/shipper-consignees?id=${scId}`, { method: "DELETE" });
      const data = await resp.json();
      if (data.success) {
        toast.success("收发货方已删除");
        loadData();
      } else {
        toast.error(data.error || "删除失败");
      }
    } catch {
      toast.error("网络错误");
    }
  };

  const handleDeleteAddr = async (addrId: string) => {
    const ok = await confirm("删除地址站点", "确定要删除该地址站点吗？", "删除", "取消", true);
    if (!ok) return;
    try {
      const resp = await fetch(`/api/address-sites?id=${addrId}`, { method: "DELETE" });
      const data = await resp.json();
      if (data.success) {
        toast.success("地址站点已删除");
        loadData();
      } else {
        toast.error(data.error || "删除失败");
      }
    } catch {
      toast.error("网络错误");
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1440px] mx-auto space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[#EBEBEB] rounded w-48" />
          <div className="h-48 bg-[#EBEBEB] rounded-2xl" />
          <div className="h-48 bg-[#EBEBEB] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!entity) return null;

  return (
    <div className="max-w-[1440px] mx-auto space-y-6">
      {/* 面包屑 */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/entities/service")}
          className="inline-flex items-center gap-1.5 border border-[#EBEBEB] text-[#5A5A5A] hover:bg-[#F5F5F5] px-3 py-2 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 text-[13px] text-[#999999]">
          <button onClick={() => router.push("/entities")} className="hover:text-[#2D3BFF] transition-colors">主体管理</button>
          <span className="text-[#D5D5D5]">/</span>
          <button onClick={() => router.push("/entities/service")} className="hover:text-[#2D3BFF] transition-colors">服务主体</button>
          <span className="text-[#D5D5D5]">/</span>
          <span className="text-[#0A0A0A]">{entity.name}</span>
        </div>
      </div>

      {/* 服务主体基本信息卡片 */}
      <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-[#0A0A0A]">{entity.name}</h1>
            <p className="text-[13px] text-[#5A5A5A] mt-1">
              主体代码：{entity.code || "-"} ｜ 统一社会信用代码：{entity.unifiedSocialCreditCode || "-"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={entity.status} />
            <button
              onClick={() => router.push(`/entities/service/${id}/edit`)}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#EBEBEB] rounded-lg text-sm text-[#5A5A5A] hover:bg-[#F5F5F5] transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />编辑
            </button>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 text-[13px]">
          <div><span className="text-[#999999]">法定代表人：</span>{entity.legalRepresentative || "-"}</div>
          <div><span className="text-[#999999]">联系人：</span>{entity.contactPerson || "-"}</div>
          <div><span className="text-[#999999]">联系电话：</span>{entity.phone || "-"}</div>
          <div><span className="text-[#999999]">邮箱：</span>{entity.email || "-"}</div>
          <div><span className="text-[#999999]">成立日期：</span>{entity.establishmentDate || "-"}</div>
          <div><span className="text-[#999999]">纳税人识别号：</span>{entity.taxId || "-"}</div>
          <div className="col-span-2"><span className="text-[#999999]">注册地址：</span>{entity.address || "-"}</div>
        </div>
        {entity.remark && (
          <div className="mt-4 pt-4 border-t border-[#EBEBEB]">
            <span className="text-[13px] text-[#999999]">备注：</span>
            <span className="text-[13px] text-[#5A5A5A]">{entity.remark}</span>
          </div>
        )}
      </div>

      {/* 收发货方 & 地址站点 */}
      <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-md font-semibold text-[#0A0A0A]">收发货方与地址站点</h2>
          <button
            onClick={() => router.push(`/entities/service/${id}/shipper-consignee/new`)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#2D3BFF] text-white rounded-lg text-sm font-medium hover:bg-[#4338CA] transition-colors"
          >
            <Plus className="w-4 h-4" />新增收发货方
          </button>
        </div>

        {shipperConsignees.length === 0 ? (
          <div className="text-center py-12 text-[#999999] text-sm">
            暂无收发货方，请点击「新增收发货方」添加
          </div>
        ) : (
          <div className="space-y-3">
            {shipperConsignees.map((sc) => {
              const isExpanded = expandedSc === sc.id;
              const addrCount = sc.addressSites?.length || 0;
              return (
                <div key={sc.id} className="border border-[#EBEBEB] rounded-xl overflow-hidden">
                  {/* 收发货方头部 */}
                  <div
                    className="flex items-center justify-between px-4 py-3 bg-[#FAFAFA] cursor-pointer hover:bg-[#F5F5F5] transition-colors"
                    onClick={() => setExpandedSc(isExpanded ? null : sc.id)}
                  >
                    <div className="flex items-center gap-3">
                      <ChevronRight className={`w-4 h-4 text-[#999999] transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                      <div>
                        <span className="text-sm font-medium text-[#0A0A0A]">{sc.name}</span>
                        <span className="ml-2 text-xs text-[#999999]">{sc.code || ""}</span>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        sc.type === "shipper" ? "bg-[#E8F4FF] text-[#2D3BFF]" :
                        sc.type === "consignee" ? "bg-[#E6F7F0] text-[#0D8A5E]" :
                        "bg-[#F5F5F5] text-[#5A5A5A]"
                      }`}>
                        {sc.type === "shipper" ? "发货方" : sc.type === "consignee" ? "收货方" : "收发货方"}
                      </span>
                      <span className="text-xs text-[#999999]">{addrCount} 个地址站点</span>
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => router.push(`/entities/service/${id}/shipper-consignee/${sc.id}/address-site/new`)}
                        className="text-xs text-[#2D3BFF] hover:underline"
                      >
                        <MapPin className="w-3 h-3 inline mr-0.5" />新增地址
                      </button>
                      <button
                        onClick={() => router.push(`/entities/service/${id}/shipper-consignee/${sc.id}/edit`)}
                        className="text-xs text-[#5A5A5A] hover:text-[#2D3BFF]"
                      >
                        <Pencil className="w-3 h-3 inline mr-0.5" />编辑
                      </button>
                      <button
                        onClick={() => handleDeleteSc(sc.id, sc.name)}
                        className="text-xs text-[#D63031] hover:underline"
                      >
                        <Trash2 className="w-3 h-3 inline mr-0.5" />删除
                      </button>
                    </div>
                  </div>

                  {/* 地址站点列表 */}
                  {isExpanded && (
                    <div className="border-t border-[#EBEBEB]">
                      {addrCount === 0 ? (
                        <div className="text-center py-6 text-[#999999] text-xs">
                          暂无地址站点，请点击「新增地址」添加
                        </div>
                      ) : (
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-[#EBEBEB] bg-white h-[32px]">
                              <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase text-[#5A5A5A]">站点名称</th>
                              <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase text-[#5A5A5A]">地址</th>
                              <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase text-[#5A5A5A]">用途</th>
                              <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase text-[#5A5A5A]">联系人</th>
                              <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase text-[#5A5A5A]">状态</th>
                              <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase text-[#5A5A5A] w-[120px]">操作</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sc.addressSites?.map((addr) => (
                              <tr key={addr.id} className="border-b border-[#EBEBEB] h-[40px] hover:bg-[#F5F5F5] transition-colors">
                                <td className="px-4 py-2 text-[13px] font-medium text-[#0A0A0A]">{addr.name || "-"}</td>
                                <td className="px-4 py-2 text-[13px] text-[#5A5A5A] max-w-[240px] truncate">
                                  {[addr.province, addr.city, addr.district, addr.detailAddress].filter(Boolean).join("") || "-"}
                                </td>
                                <td className="px-4 py-2 text-[13px] text-[#5A5A5A]">
                                  {addr.usages?.map((u) => USAGE_LABELS[u.usageType] || u.usageType).join("、") || "-"}
                                </td>
                                <td className="px-4 py-2 text-[13px] text-[#5A5A5A]">
                                  {addr.contacts?.[0]?.name || "-"}
                                </td>
                                <td className="px-4 py-2"><StatusBadge status={addr.status} /></td>
                                <td className="px-4 py-2">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => router.push(`/entities/service/${id}/shipper-consignee/${sc.id}/address-site/${addr.id}`)}
                                      className="text-[#2D3BFF] text-xs hover:underline"
                                    >查看</button>
                                    <button
                                      onClick={() => router.push(`/entities/service/${id}/shipper-consignee/${sc.id}/address-site/${addr.id}/edit`)}
                                      className="text-[#5A5A5A] text-xs hover:text-[#2D3BFF]"
                                    >编辑</button>
                                    <button onClick={() => handleDeleteAddr(addr.id)} className="text-[#D63031] text-xs hover:underline">删除</button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {ConfirmDialog}
    </div>
  );
}
