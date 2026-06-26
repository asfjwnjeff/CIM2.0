"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Eye, Pencil } from "lucide-react";

interface AddressRow {
  id: string;
  code?: string;
  name?: string;
  province?: string;
  city?: string;
  district?: string;
  detailAddress: string;
  shipperConsigneeId: string;
  serviceEntityId: string;
  status: string;
  geoAccuracy?: string;
  version: number;
  usages?: { usageType: string }[];
  contacts?: { name: string; phone?: string }[];
}

const USAGE_LABELS: Record<string, string> = {
  receiving: "收货", shipping: "发货", pickup: "提货", delivery: "送货",
  return: "退货", customs: "报关", warehousing: "仓储",
};

const GEO_LABELS: Record<string, string> = {
  precise: "精确", approximate: "近似", manual: "手动", unresolved: "未解析",
};

export default function AddressesPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<AddressRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterUsage, setFilterUsage] = useState("all");

  const loadData = async () => {
    try {
      const resp = await fetch("/api/address-sites");
      const data = await resp.json();
      if (data.success) setAddresses(data.data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const filtered = useMemo(() => {
    return addresses.filter((a) => {
      const addr = [a.province, a.city, a.district, a.detailAddress, a.name, a.code].filter(Boolean).join("");
      const matchSearch = !search || addr.includes(search);
      const matchStatus = filterStatus === "all" || a.status === filterStatus;
      const matchUsage = filterUsage === "all" || (a.usages || []).some((u) => u.usageType === filterUsage);
      return matchSearch && matchStatus && matchUsage;
    });
  }, [addresses, search, filterStatus, filterUsage]);

  const activeCount = addresses.filter((a) => a.status === "active").length;
  const unresolvedCount = addresses.filter((a) => a.geoAccuracy === "unresolved").length;

  if (loading) {
    return (
      <div className="max-w-[1440px] mx-auto space-y-6 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[#EBEBEB] rounded w-48" />
          <div className="h-64 bg-[#EBEBEB] rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0A0A0A]">地址主数据</h1>
        <p className="text-[#5A5A5A] text-[13px] mt-0.5">全局地址视图，跨客商、跨主体、跨收发货方管理所有地址站点</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-[#EBEBEB] p-4 shadow-sm">
          <div className="text-[28px] font-bold text-[#0A0A0A]">{addresses.length}</div>
          <div className="text-[12px] text-[#999999] mt-1">地址总数</div>
        </div>
        <div className="bg-white rounded-xl border border-[#EBEBEB] p-4 shadow-sm">
          <div className="text-[28px] font-bold text-[#0D8A5E]">{activeCount}</div>
          <div className="text-[12px] text-[#999999] mt-1">生效中</div>
        </div>
        <div className="bg-white rounded-xl border border-[#EBEBEB] p-4 shadow-sm">
          <div className="text-[28px] font-bold text-[#E8850C]">{unresolvedCount}</div>
          <div className="text-[12px] text-[#999999] mt-1">未解析</div>
        </div>
        <div className="bg-white rounded-xl border border-[#EBEBEB] p-4 shadow-sm">
          <div className="text-[28px] font-bold text-[#2D3BFF]">7</div>
          <div className="text-[12px] text-[#999999] mt-1">地址用途类型</div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-[260px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索地址关键词、站点名称、编码..."
              className="w-full pl-9 pr-4 py-2 h-[38px] border border-[#D5D5D5] rounded-lg text-sm focus:outline-none focus:border-[#2D3BFF] focus:shadow-[0_0_0_2px_rgba(45,59,255,0.10)]"
            />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 h-[38px] border border-[#D5D5D5] rounded-lg text-sm bg-white focus:outline-none focus:border-[#2D3BFF]">
            <option value="all">全部状态</option>
            <option value="active">生效</option>
            <option value="inactive">停用</option>
          </select>
          <select value={filterUsage} onChange={(e) => setFilterUsage(e.target.value)}
            className="px-3 py-2 h-[38px] border border-[#D5D5D5] rounded-lg text-sm bg-white focus:outline-none focus:border-[#2D3BFF]">
            <option value="all">全部用途</option>
            {Object.entries(USAGE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#EBEBEB] bg-[#FAFAFA] h-[36px]">
                <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase text-[#5A5A5A]">编码/名称</th>
                <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase text-[#5A5A5A]">地址</th>
                <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase text-[#5A5A5A]">用途</th>
                <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase text-[#5A5A5A]">联系人</th>
                <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase text-[#5A5A5A]">解析</th>
                <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase text-[#5A5A5A]">版本</th>
                <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase text-[#5A5A5A]">状态</th>
                <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase text-[#5A5A5A] w-[120px]">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center text-[#999999] py-12 text-sm">暂无地址数据</td></tr>
              ) : (
                filtered.map((addr) => {
                  const addrStr = [addr.province, addr.city, addr.district, addr.detailAddress].filter(Boolean).join("");
                  const usageStr = (addr.usages || []).map((u) => USAGE_LABELS[u.usageType] || u.usageType).join("、") || "-";
                  const contact = addr.contacts?.[0];
                  return (
                    <tr key={addr.id} className="border-b border-[#EBEBEB] h-[44px] hover:bg-[#F5F5F5] transition-colors">
                      <td className="px-3 py-3">
                        <div className="text-[13px] font-medium text-[#0A0A0A]">{addr.name || "未命名"}</div>
                        <div className="text-[11px] text-[#999999] font-mono">{addr.code || "-"}</div>
                      </td>
                      <td className="px-3 py-3 text-[13px] text-[#5A5A5A] max-w-[260px] truncate" title={addrStr}>{addrStr || "-"}</td>
                      <td className="px-3 py-3 text-[12px] text-[#5A5A5A]">{usageStr}</td>
                      <td className="px-3 py-3 text-[13px] text-[#5A5A5A]">{contact ? `${contact.name} ${contact.phone || ""}` : "-"}</td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          addr.geoAccuracy === "precise" ? "bg-[#E6F7F0] text-[#0D8A5E]" :
                          addr.geoAccuracy === "approximate" ? "bg-[#FFF4E8] text-[#E8850C]" :
                          "bg-[#EBEBEB] text-[#5A5A5A]"
                        }`}>{GEO_LABELS[addr.geoAccuracy || "unresolved"] || "未解析"}</span>
                      </td>
                      <td className="px-3 py-3 text-[13px] text-[#5A5A5A] font-mono">v{addr.version}</td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          addr.status === "active" ? "bg-[#E6F7F0] text-[#0D8A5E]" : "bg-[#EBEBEB] text-[#5A5A5A]"
                        }`}>{addr.status === "active" ? "生效" : "停用"}</span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/entities/service/${addr.serviceEntityId}/shipper-consignee/${addr.shipperConsigneeId}/address-site/${addr.id}`)}
                            className="text-[#2D3BFF] text-[13px] hover:underline"
                          ><Eye className="w-3.5 h-3.5 inline mr-0.5" />查看</button>
                          <button
                            onClick={() => router.push(`/entities/service/${addr.serviceEntityId}/shipper-consignee/${addr.shipperConsigneeId}/address-site/${addr.id}/edit`)}
                            className="text-[#5A5A5A] text-[13px] hover:text-[#2D3BFF]"
                          ><Pencil className="w-3.5 h-3.5 inline mr-0.5" />编辑</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
