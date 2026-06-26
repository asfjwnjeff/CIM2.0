import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb } from '@/db';
import { serviceEntities, shipperConsignees, addressSites, addressUsages, addressContacts, addressVersions } from '@/db/schema';
import { eq } from 'drizzle-orm';

function buildDbData(body: Record<string, unknown>, isInsert: boolean): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  if (isInsert) {
    data.id = body.id || `svc-${Date.now()}`;
    data.created_at = new Date().toISOString();
  }
  data.updated_at = new Date().toISOString();
  for (const [key, value] of Object.entries(body)) {
    if (value === undefined) continue;
    if (key === 'id' && isInsert) continue;
    if (typeof value === 'object') {
      data[key] = JSON.stringify(value);
    } else {
      data[key] = value;
    }
  }
  return data;
}

export async function GET() {
  try {
    const db = await getDb();
    const data = db.select().from(serviceEntities).all();
    const parsed = data.map((e) => {
      const result: Record<string, unknown> = { ...e };
      for (const [key, val] of Object.entries(result)) {
        if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
          try { result[key] = JSON.parse(val as string); } catch { /* keep original */ }
        }
      }
      return result;
    });
    return NextResponse.json({ success: true, data: parsed });
  } catch (error) {
    console.error('GET /api/service-entities error:', error);
    return NextResponse.json({ success: false, error: '获取服务主体列表失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const body = await request.json();
    if (!body.name?.trim()) {
      return NextResponse.json({ success: false, error: '服务主体名称不能为空' }, { status: 400 });
    }
    const data = buildDbData(body, true);
    db.insert(serviceEntities).values(data as never).run();
    saveDb();
    return NextResponse.json({ success: true, id: data.id }, { status: 201 });
  } catch (error) {
    console.error('POST /api/service-entities error:', error);
    return NextResponse.json({ success: false, error: '创建服务主体失败' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const db = await getDb();
    const body = await request.json();
    if (!body.id) return NextResponse.json({ success: false, error: '缺少服务主体 ID' }, { status: 400 });
    const updateData = buildDbData(body, false);
    db.update(serviceEntities).set(updateData as never).where(eq(serviceEntities.id, body.id as string)).run();
    saveDb();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/service-entities error:', error);
    return NextResponse.json({ success: false, error: '更新服务主体失败' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: '缺少服务主体 ID' }, { status: 400 });

    // 级联删除：查找该服务主体下所有收发货方
    const scRows = db.select({ id: shipperConsignees.id }).from(shipperConsignees).where(eq(shipperConsignees.serviceEntityId, id)).all();
    for (const sc of scRows) {
      // 删除收发货方下的地址站点及其关联数据
      const addrRows = db.select({ id: addressSites.id }).from(addressSites).where(eq(addressSites.shipperConsigneeId, sc.id)).all();
      for (const addr of addrRows) {
        db.delete(addressUsages).where(eq(addressUsages.addressSiteId, addr.id)).run();
        db.delete(addressContacts).where(eq(addressContacts.addressSiteId, addr.id)).run();
        db.delete(addressVersions).where(eq(addressVersions.addressSiteId, addr.id)).run();
        db.delete(addressSites).where(eq(addressSites.id, addr.id)).run();
      }
      db.delete(shipperConsignees).where(eq(shipperConsignees.id, sc.id)).run();
    }
    db.delete(serviceEntities).where(eq(serviceEntities.id, id)).run();
    saveDb();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/service-entities error:', error);
    return NextResponse.json({ success: false, error: '删除服务主体失败' }, { status: 500 });
  }
}
