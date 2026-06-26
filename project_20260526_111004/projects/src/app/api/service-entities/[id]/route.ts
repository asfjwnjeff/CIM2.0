import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { serviceEntities, shipperConsignees, addressSites, addressUsages, addressContacts, addressVersions } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = await getDb();
    const { id } = await params;

    // 查询服务主体
    const entity = db.select().from(serviceEntities).where(eq(serviceEntities.id, id)).get();
    if (!entity) {
      return NextResponse.json({ success: false, error: '服务主体不存在' }, { status: 404 });
    }

    // 查询其下收发货方
    const scList = db.select().from(shipperConsignees).where(eq(shipperConsignees.serviceEntityId, id)).all();

    // 查每个收发货方下的地址站点
    const scWithAddresses = scList.map((sc) => {
      const addrList = db.select().from(addressSites).where(eq(addressSites.shipperConsigneeId, sc.id)).all();
      const addrWithDetails = addrList.map((addr) => {
        const usages = db.select().from(addressUsages).where(eq(addressUsages.addressSiteId, addr.id)).all();
        const contacts = db.select().from(addressContacts).where(eq(addressContacts.addressSiteId, addr.id)).all();
        const versions = db.select().from(addressVersions).where(eq(addressVersions.addressSiteId, addr.id)).all();
        return { ...addr, usages, contacts, versions };
      });
      return { ...sc, addressSites: addrWithDetails };
    });

    // JSON 解析
    const parseRow = (row: Record<string, unknown>) => {
      const result: Record<string, unknown> = { ...row };
      for (const [key, val] of Object.entries(result)) {
        if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
          try { result[key] = JSON.parse(val as string); } catch { /* keep */ }
        }
      }
      return result;
    };

    return NextResponse.json({
      success: true,
      data: {
        ...parseRow(entity as Record<string, unknown>),
        shipperConsignees: scWithAddresses.map((sc) => ({
          ...parseRow(sc as Record<string, unknown>),
          addressSites: sc.addressSites.map((addr) => ({
            ...parseRow(addr as Record<string, unknown>),
            usages: addr.usages.map((u) => parseRow(u as Record<string, unknown>)),
            contacts: addr.contacts.map((c) => parseRow(c as Record<string, unknown>)),
            versions: addr.versions.map((v) => parseRow(v as Record<string, unknown>)),
          })),
        })),
      },
    });
  } catch (error) {
    console.error('GET /api/service-entities/[id] error:', error);
    return NextResponse.json({ success: false, error: '获取服务主体详情失败' }, { status: 500 });
  }
}
