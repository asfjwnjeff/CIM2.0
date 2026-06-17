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

    // 动态 JSON 解析：遍历所有字段，尝试解析字符串为 JSON
    const parsed = filteredData.map(c => {
      const result: Record<string,unknown> = { ...c };
      for (const [key, val] of Object.entries(result)) {
        if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
          try { result[key] = JSON.parse(val as string); } catch { /* 保持原值 */ }
        }
      }
      // 数组字段默认值
      if (!result.responsiblePersons) result.responsiblePersons = [];
      if (!result.collaborators) result.collaborators = [];
      return result;
    });

    return NextResponse.json({ success: true, data: parsed });
  } catch (error) {
    console.error('GET /api/customers error:', error);
    return NextResponse.json({ success: false, error: '获取客户列表失败' }, { status: 500 });
  }
}

function buildDbData(body: Record<string, unknown>, isInsert: boolean): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  if (isInsert) {
    data.id = body.id || `cust-${Date.now()}`;
    data.created_at = new Date().toISOString();
  }
  data.updated_at = new Date().toISOString();

  for (const [key, value] of Object.entries(body)) {
    if (value === undefined) continue;
    if (key === 'id' && isInsert) continue; // insert 时 id 已设置
    if (typeof value === 'object') {
      data[key] = JSON.stringify(value);
    } else {
      data[key] = value;
    }
  }
  return data;
}

export async function PUT(request: NextRequest) {
  try {
    const db = await getDb();
    const body = await request.json();
    if (!body.id) return NextResponse.json({ success: false, error: '缺少客户 ID' }, { status: 400 });
    const updateData = buildDbData(body, false);
    db.update(customers).set(updateData as never).where(eq(customers.id, body.id as string)).run();
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
    const data = buildDbData(body, true);
    db.insert(customers).values(data as never).run();
    saveDb();
    return NextResponse.json({ success: true, id: data.id }, { status: 201 });
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
