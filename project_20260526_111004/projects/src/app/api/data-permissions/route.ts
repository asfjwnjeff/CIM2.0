import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb } from '@/db';
import { dataPermissions } from '@/db/schema-iam';
import { eq, and } from 'drizzle-orm';
import { genId } from '@/db/seed-iam';
import { getSessionUser } from '@/lib/auth';

/** GET /api/data-permissions */
export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ success: false, error: '未登录' }, { status: 401 });

    const db = await getDb();
    const all = await db.select().from(dataPermissions).all();
    const parsed = all.map(dp => ({
      ...dp,
      customerIds: dp.customerIds ? JSON.parse(dp.customerIds) : [],
    }));
    return NextResponse.json({ success: true, data: parsed });
  } catch (error) {
    console.error('GET /api/data-permissions error:', error);
    return NextResponse.json({ success: false, error: '获取数据权限失败' }, { status: 500 });
  }
}

/** POST /api/data-permissions — 创建或更新数据权限配置 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ success: false, error: '未登录' }, { status: 401 });

    const body = await request.json();
    const { dimension, targetId, targetName, customerIds } = body;
    if (!dimension || !targetId) {
      return NextResponse.json({ success: false, error: '维度和目标 ID 为必填项' }, { status: 400 });
    }

    const db = await getDb();
    const now = new Date().toISOString();

    // 查找是否已有配置
    const existing = await db
      .select()
      .from(dataPermissions)
      .where(and(eq(dataPermissions.dimension, dimension), eq(dataPermissions.targetId, targetId)))
      .limit(1);

    if (existing.length > 0) {
      await db.update(dataPermissions).set({
        targetName: targetName || null,
        customerIds: JSON.stringify(customerIds || []),
        updatedAt: now,
      }).where(eq(dataPermissions.id, existing[0].id)).run();
    } else {
      await db.insert(dataPermissions).values({
        id: genId(),
        dimension, targetId,
        targetName: targetName || null,
        customerIds: JSON.stringify(customerIds || []),
        updatedAt: now,
      }).run();
    }

    saveDb();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/data-permissions error:', error);
    return NextResponse.json({ success: false, error: '保存数据权限失败' }, { status: 500 });
  }
}

/** DELETE /api/data-permissions */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ success: false, error: '未登录' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: '缺少 ID' }, { status: 400 });

    const db = await getDb();
    await db.delete(dataPermissions).where(eq(dataPermissions.id, id)).run();

    saveDb();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/data-permissions error:', error);
    return NextResponse.json({ success: false, error: '删除数据权限失败' }, { status: 500 });
  }
}
