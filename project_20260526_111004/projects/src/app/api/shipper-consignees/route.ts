import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb } from '@/db';
import { shipperConsignees, addressSites, addressUsages, addressContacts, addressVersions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

function buildDbData(body: Record<string, unknown>, isInsert: boolean): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  if (isInsert) {
    data.id = body.id || `shc-${Date.now()}`;
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

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const serviceEntityId = searchParams.get('serviceEntityId');

    const data = serviceEntityId
      ? db.select().from(shipperConsignees).where(eq(shipperConsignees.serviceEntityId, serviceEntityId)).all()
      : db.select().from(shipperConsignees).all();

    const parsed = data.map((sc) => {
      const result: Record<string, unknown> = { ...sc };
      for (const [key, val] of Object.entries(result)) {
        if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
          try { result[key] = JSON.parse(val as string); } catch { /* keep */ }
        }
      }
      return result;
    });

    return NextResponse.json({ success: true, data: parsed });
  } catch (error) {
    console.error('GET /api/shipper-consignees error:', error);
    return NextResponse.json({ success: false, error: '获取收发货方列表失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const body = await request.json();
    if (!body.name?.trim()) return NextResponse.json({ success: false, error: '收发货方名称不能为空' }, { status: 400 });
    if (!body.serviceEntityId) return NextResponse.json({ success: false, error: '所属服务主体不能为空' }, { status: 400 });
    const data = buildDbData(body, true);
    db.insert(shipperConsignees).values(data as never).run();
    saveDb();
    return NextResponse.json({ success: true, id: data.id }, { status: 201 });
  } catch (error) {
    console.error('POST /api/shipper-consignees error:', error);
    return NextResponse.json({ success: false, error: '创建收发货方失败' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const db = await getDb();
    const body = await request.json();
    if (!body.id) return NextResponse.json({ success: false, error: '缺少收发货方 ID' }, { status: 400 });
    const updateData = buildDbData(body, false);
    db.update(shipperConsignees).set(updateData as never).where(eq(shipperConsignees.id, body.id as string)).run();
    saveDb();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/shipper-consignees error:', error);
    return NextResponse.json({ success: false, error: '更新收发货方失败' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: '缺少收发货方 ID' }, { status: 400 });

    // 级联删除地址站点
    const addrRows = db.select({ id: addressSites.id }).from(addressSites).where(eq(addressSites.shipperConsigneeId, id)).all();
    for (const addr of addrRows) {
      db.delete(addressUsages).where(eq(addressUsages.addressSiteId, addr.id)).run();
      db.delete(addressContacts).where(eq(addressContacts.addressSiteId, addr.id)).run();
      db.delete(addressVersions).where(eq(addressVersions.addressSiteId, addr.id)).run();
      db.delete(addressSites).where(eq(addressSites.id, addr.id)).run();
    }
    db.delete(shipperConsignees).where(eq(shipperConsignees.id, id)).run();
    saveDb();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/shipper-consignees error:', error);
    return NextResponse.json({ success: false, error: '删除收发货方失败' }, { status: 500 });
  }
}
