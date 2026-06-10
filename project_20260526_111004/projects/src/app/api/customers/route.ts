import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb } from '@/db';
import { customers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const db = await getDb();
    const data = db.select().from(customers).all();

    // 应用数据权限过滤
    const session = await getSessionUser();
    let filteredData = data;

    if (session && !session.roleIds.includes('role-admin')) {
      filteredData = data.filter(c => {
        const resp = c.responsiblePersons ? JSON.parse(c.responsiblePersons) : [];
        const collab = c.collaborators ? JSON.parse(c.collaborators) : [];
        return resp.includes(session.userId) || collab.includes(session.userId);
      });
    }

    const parsed = filteredData.map(c => ({
      ...c,
      basicInfo: c.basicInfo ? JSON.parse(c.basicInfo) : null,
      businessInfo: c.businessInfo ? JSON.parse(c.businessInfo) : null,
      semiconductorInfo: c.semiconductorInfo ? JSON.parse(c.semiconductorInfo) : null,
      relatedCompanies: c.relatedCompanies ? JSON.parse(c.relatedCompanies) : null,
      products: c.products ? JSON.parse(c.products) : null,
      billingEntities: c.billingEntities ? JSON.parse(c.billingEntities) : null,
      ruleIds: c.ruleIds ? JSON.parse(c.ruleIds) : null,
      auditLogs: c.auditLogs ? JSON.parse(c.auditLogs) : null,
      responsiblePersons: c.responsiblePersons ? JSON.parse(c.responsiblePersons) : [],
      collaborators: c.collaborators ? JSON.parse(c.collaborators) : [],
    }));

    return NextResponse.json({ success: true, data: parsed });
  } catch (error) {
    console.error('GET /api/customers error:', error);
    return NextResponse.json({ success: false, error: '获取客户列表失败' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const db = await getDb();
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: '缺少客户 ID' }, { status: 400 });
    }
    const now = new Date().toISOString();

    const updateData: Record<string, unknown> = { updatedAt: now };
    if (body.responsiblePersons !== undefined) {
      updateData.responsiblePersons = JSON.stringify(body.responsiblePersons);
    }
    if (body.collaborators !== undefined) {
      updateData.collaborators = JSON.stringify(body.collaborators);
    }
    if (body.name !== undefined) updateData.name = body.name;
    if (body.status !== undefined) updateData.status = body.status;

    db.update(customers).set(updateData).where(eq(customers.id, body.id)).run();
    saveDb();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/customers error:', error);
    return NextResponse.json({ success: false, error: '更新客户失败' }, { status: 500 });
  }
}
