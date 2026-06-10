import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb } from '@/db';
import { permissions } from '@/db/schema-iam';
import { eq } from 'drizzle-orm';
import { genId } from '@/db/seed-iam';
import { getSessionUser } from '@/lib/auth';

/** GET /api/permissions */
export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ success: false, error: '未登录' }, { status: 401 });

    const db = await getDb();
    const allPermissions = await db.select().from(permissions).all();
    return NextResponse.json({ success: true, data: allPermissions });
  } catch (error) {
    console.error('GET /api/permissions error:', error);
    return NextResponse.json({ success: false, error: '获取权限列表失败' }, { status: 500 });
  }
}

/** POST /api/permissions */
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ success: false, error: '未登录' }, { status: 401 });

    const body = await request.json();
    const { name, code, type, parentId, path, sort } = body;
    if (!name || !code || !type) {
      return NextResponse.json({ success: false, error: '名称、代码和类型为必填项' }, { status: 400 });
    }

    const db = await getDb();
    const id = genId();
    const now = new Date().toISOString();

    await db.insert(permissions).values({
      id, name, code, type,
      parentId: parentId || null, path: path || null,
      sort: sort || 1, status: 'active',
      createdAt: now,
    }).run();

    saveDb();
    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error('POST /api/permissions error:', error);
    return NextResponse.json({ success: false, error: '创建权限失败' }, { status: 500 });
  }
}

/** PUT /api/permissions */
export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ success: false, error: '未登录' }, { status: 401 });

    const body = await request.json();
    const { id, name, code, type, parentId, path, sort, status } = body;
    if (!id) return NextResponse.json({ success: false, error: '缺少权限 ID' }, { status: 400 });

    const db = await getDb();
    await db.update(permissions).set({
      name, code, type,
      parentId: parentId || null, path: path || null,
      sort: sort || 1, status: status || 'active',
    }).where(eq(permissions.id, id)).run();

    saveDb();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/permissions error:', error);
    return NextResponse.json({ success: false, error: '更新权限失败' }, { status: 500 });
  }
}

/** DELETE /api/permissions */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ success: false, error: '未登录' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: '缺少权限 ID' }, { status: 400 });

    const db = await getDb();
    await db.delete(permissions).where(eq(permissions.id, id)).run();

    saveDb();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/permissions error:', error);
    return NextResponse.json({ success: false, error: '删除权限失败' }, { status: 500 });
  }
}
