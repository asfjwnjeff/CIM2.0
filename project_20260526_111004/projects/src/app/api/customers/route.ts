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

    const jsonFields = ['basicInfo','businessInfo','semiconductorInfo','relatedCompanies','products',
      'billingEntities','ruleIds','auditLogs','responsiblePersons','collaborators',
      'signingEntityIds','serviceEntityIds','settlementEntityIds','entityTypes',
      'boundCustomers','bankAccounts','blacklistInfo'];
    const parsed = filteredData.map(c => {
      const result: Record<string,unknown> = { ...c };
      for (const f of jsonFields) {
        if (typeof result[f] === 'string') {
          try { result[f] = JSON.parse(result[f] as string); } catch { /* keep as is */ }
        } else if (result[f] === null || result[f] === undefined) {
          result[f] = f === 'responsiblePersons' || f === 'collaborators' ? [] : null;
        }
      }
      return result;
    });

    return NextResponse.json({ success: true, data: parsed });
  } catch (error) {
    console.error('GET /api/customers error:', error);
    return NextResponse.json({ success: false, error: '获取客户列表失败' }, { status: 500 });
  }
}

const jsonFields = ['basicInfo','businessInfo','semiconductorInfo','relatedCompanies','products',
  'billingEntities','ruleIds','auditLogs','responsiblePersons','collaborators',
  'signingEntityIds','serviceEntityIds','settlementEntityIds','entityTypes',
  'boundCustomers','bankAccounts','blacklistInfo'];
const stringFields = ['name','customerCode','status','level','relationshipLoyalty',
  'industry','region','address','website','description','createdBy',
  'progressStatus','domesticFlag','settlementCycle','invoiceAddress',
  'settlementRelationType','settlementRelationName','sourceSystem'];

export async function PUT(request: NextRequest) {
  try {
    const db = await getDb();
    const body = await request.json();
    if (!body.id) return NextResponse.json({ success: false, error: '缺少客户 ID' }, { status: 400 });
    const now = new Date().toISOString();
    const updateData: Record<string, unknown> = { updated_at: now };

    for (const f of stringFields) {
      if (body[f] !== undefined) updateData[f] = body[f];
    }
    for (const f of jsonFields) {
      if (body[f] !== undefined) updateData[f] = JSON.stringify(body[f]);
    }

    db.update(customers).set(updateData as never).where(eq(customers.id, body.id)).run();
    saveDb();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/customers error:', error);
    return NextResponse.json({ success: false, error: '更新客户失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const body = await request.json();
    const id = body.id || `cust-${Date.now()}`;
    const now = new Date().toISOString();

    const data: Record<string, unknown> = { id, created_at: now, updated_at: now };
    for (const f of stringFields) {
      if (body[f] !== undefined) data[f] = body[f];
    }
    for (const f of jsonFields) {
      data[f] = body[f] !== undefined ? JSON.stringify(body[f]) : (f === 'responsiblePersons' || f === 'collaborators' ? '[]' : null);
    }

    db.insert(customers).values(data as never).run();
    saveDb();
    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error) {
    console.error('POST /api/customers error:', error);
    return NextResponse.json({ success: false, error: '创建客户失败' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: '缺少客户 ID' }, { status: 400 });
    db.delete(customers).where(eq(customers.id, id)).run();
    saveDb();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/customers error:', error);
    return NextResponse.json({ success: false, error: '删除客户失败' }, { status: 500 });
  }
}
