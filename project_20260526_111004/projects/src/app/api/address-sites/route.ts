import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb } from '@/db';
import { addressSites, addressUsages, addressContacts, addressVersions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

function buildDbData(body: Record<string, unknown>, isInsert: boolean): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  if (isInsert) {
    data.id = body.id || `ads-${Date.now()}`;
    data.created_at = new Date().toISOString();
  }
  data.updated_at = new Date().toISOString();
  for (const [key, value] of Object.entries(body)) {
    if (value === undefined) continue;
    if (key === 'id' && isInsert) continue;
    // 跳过聚合字段
    if (key === 'usages' || key === 'contacts' || key === 'versions') continue;
    if (typeof value === 'object') {
      data[key] = JSON.stringify(value);
    } else {
      data[key] = value;
    }
  }
  return data;
}

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const shipperConsigneeId = searchParams.get('shipperConsigneeId');
    const serviceEntityId = searchParams.get('serviceEntityId');

    let data;
    if (shipperConsigneeId) {
      data = db.select().from(addressSites).where(eq(addressSites.shipperConsigneeId, shipperConsigneeId)).all();
    } else if (serviceEntityId) {
      data = db.select().from(addressSites).where(eq(addressSites.serviceEntityId, serviceEntityId)).all();
    } else {
      data = db.select().from(addressSites).all();
    }

    const parsed = data.map((addr) => {
      const result: Record<string, unknown> = { ...addr };
      for (const [key, val] of Object.entries(result)) {
        if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
          try { result[key] = JSON.parse(val as string); } catch { /* keep */ }
        }
      }
      // 附加用途、联系人、版本历史
      const usages = db.select().from(addressUsages).where(eq(addressUsages.addressSiteId, addr.id)).all();
      const contacts = db.select().from(addressContacts).where(eq(addressContacts.addressSiteId, addr.id)).all();
      const versions = db.select().from(addressVersions).where(eq(addressVersions.addressSiteId, addr.id)).all();
      result.usages = usages;
      result.contacts = contacts;
      result.versions = versions;
      return result;
    });

    return NextResponse.json({ success: true, data: parsed });
  } catch (error) {
    console.error('GET /api/address-sites error:', error);
    return NextResponse.json({ success: false, error: '获取地址站点列表失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const body = await request.json();
    if (!body.detailAddress?.trim()) return NextResponse.json({ success: false, error: '详细地址不能为空' }, { status: 400 });
    if (!body.shipperConsigneeId) return NextResponse.json({ success: false, error: '所属收发货方不能为空' }, { status: 400 });

    // 提取子实体
    const { usages, contacts: addrContacts, ...siteData } = body;

    // 插入地址站点
    const data = buildDbData(siteData, true);
    data.version = 1;
    db.insert(addressSites).values(data as never).run();

    // 插入地址用途
    if (Array.isArray(usages)) {
      for (const u of usages) {
        db.insert(addressUsages).values({
          id: `aus-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          addressSiteId: data.id as string,
          usageType: u.usageType || u,
          createdAt: new Date().toISOString(),
        }).run();
      }
    }

    // 插入地址联系人
    if (Array.isArray(addrContacts)) {
      for (const c of addrContacts) {
        db.insert(addressContacts).values({
          id: `adc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          addressSiteId: data.id as string,
          name: c.name || '',
          phone: c.phone || null,
          email: c.email || null,
          isPrimary: !!c.isPrimary,
          remark: c.remark || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }).run();
      }
    }

    saveDb();
    return NextResponse.json({ success: true, id: data.id }, { status: 201 });
  } catch (error) {
    console.error('POST /api/address-sites error:', error);
    return NextResponse.json({ success: false, error: '创建地址站点失败' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const db = await getDb();
    const body = await request.json();
    if (!body.id) return NextResponse.json({ success: false, error: '缺少地址站点 ID' }, { status: 400 });

    const addrId = body.id as string;

    // 获取修改前的快照
    const oldRow = db.select().from(addressSites).where(eq(addressSites.id, addrId)).get();
    if (!oldRow) return NextResponse.json({ success: false, error: '地址站点不存在' }, { status: 404 });

    const oldVersion = oldRow.version || 1; // For version detection, get the snapshot
    const oldSnapshot: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(oldRow as Record<string, unknown>)) {
      if (v !== undefined && v !== null) oldSnapshot[k] = v;
    }
    const oldSnapshotStr = JSON.stringify(oldSnapshot);

    // 更新地址站点
    const { usages, contacts: addrContacts, versions: _v, ...siteData } = body;
    const updateData = buildDbData(siteData, false);
    updateData.version = oldVersion + 1;
    db.update(addressSites).set(updateData as never).where(eq(addressSites.id, addrId)).run();

    // 生成变更摘要
    const changes: string[] = [];
    for (const [key, newVal] of Object.entries(updateData)) {
      if (key === 'updated_at' || key === 'version') continue;
      const oldVal = oldSnapshot[key];
      if (String(oldVal) !== String(newVal)) {
        const label = key.replace(/_/g, '');
        changes.push(`${label}: ${oldVal ?? '(空)'} → ${newVal ?? '(空)'}`);
      }
    }

    // 插入版本快照
    db.insert(addressVersions).values({
      id: `adv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      addressSiteId: addrId,
      version: oldVersion + 1,
      snapshot: oldSnapshotStr,
      changedBy: body.changedBy || null,
      changedAt: new Date().toISOString(),
      changeSummary: changes.join('; ') || '字段更新',
    }).run();

    // 更新用途（先删后插）
    if (Array.isArray(usages)) {
      db.delete(addressUsages).where(eq(addressUsages.addressSiteId, addrId)).run();
      for (const u of usages) {
        db.insert(addressUsages).values({
          id: `aus-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          addressSiteId: addrId,
          usageType: u.usageType || u,
          createdAt: new Date().toISOString(),
        }).run();
      }
    }

    // 更新联系人（先删后插）
    if (Array.isArray(addrContacts)) {
      db.delete(addressContacts).where(eq(addressContacts.addressSiteId, addrId)).run();
      for (const c of addrContacts) {
        db.insert(addressContacts).values({
          id: `adc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          addressSiteId: addrId,
          name: c.name || '',
          phone: c.phone || null,
          email: c.email || null,
          isPrimary: !!c.isPrimary,
          remark: c.remark || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }).run();
      }
    }

    saveDb();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/address-sites error:', error);
    return NextResponse.json({ success: false, error: '更新地址站点失败' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: '缺少地址站点 ID' }, { status: 400 });

    db.delete(addressUsages).where(eq(addressUsages.addressSiteId, id)).run();
    db.delete(addressContacts).where(eq(addressContacts.addressSiteId, id)).run();
    db.delete(addressVersions).where(eq(addressVersions.addressSiteId, id)).run();
    db.delete(addressSites).where(eq(addressSites.id, id)).run();
    saveDb();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/address-sites error:', error);
    return NextResponse.json({ success: false, error: '删除地址站点失败' }, { status: 500 });
  }
}
