import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb } from '@/db';
import { roles, rolePermissions, userRoles } from '@/db/schema-iam';
import { eq } from 'drizzle-orm';
import { genId } from '@/db/seed-iam';
import { getSessionUser } from '@/lib/auth';
import { writeAuditLog } from '@/lib/audit-logger';

/** GET /api/roles */
export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ success: false, error: '未登录' }, { status: 401 });

    const db = await getDb();
    const allRoles = await db.select().from(roles).all();

    // 为每个角色获取权限 ID
    const enriched = await Promise.all(
      allRoles.map(async (r) => {
        const rpList = await db
          .select({ permissionId: rolePermissions.permissionId })
          .from(rolePermissions)
          .where(eq(rolePermissions.roleId, r.id))
          .all();
        return {
          ...r,
          permissionIds: rpList.map(rp => rp.permissionId),
        };
      })
    );

    return NextResponse.json({ success: true, data: enriched });
  } catch (error) {
    console.error('GET /api/roles error:', error);
    return NextResponse.json({ success: false, error: '获取角色列表失败' }, { status: 500 });
  }
}

/** POST /api/roles */
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ success: false, error: '未登录' }, { status: 401 });

    const body = await request.json();
    const { name, code, description, permissionIds } = body;
    if (!name || !code) {
      return NextResponse.json({ success: false, error: '角色名称和代码为必填项' }, { status: 400 });
    }

    const db = await getDb();
    const id = genId();
    const now = new Date().toISOString();

    await db.insert(roles).values({
      id, name, code, description: description || null,
      status: 'active', createdAt: now, updatedAt: now,
    }).run();

    if (permissionIds && Array.isArray(permissionIds)) {
      for (const permId of permissionIds) {
        await db.insert(rolePermissions).values({
          id: `${id}_${permId}`, roleId: id, permissionId: permId,
        }).run();
      }
    }

    saveDb();
    writeAuditLog({ userId: session.userId, userName: session.realName, action: 'create', resource: 'role', resourceId: id, detail: `创建角色: ${name}(${code})` });
    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error('POST /api/roles error:', error);
    return NextResponse.json({ success: false, error: '创建角色失败' }, { status: 500 });
  }
}

/** PUT /api/roles */
export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ success: false, error: '未登录' }, { status: 401 });

    const body = await request.json();
    const { id, name, code, description, status, permissionIds } = body;
    if (!id) return NextResponse.json({ success: false, error: '缺少角色 ID' }, { status: 400 });

    const db = await getDb();
    const now = new Date().toISOString();

    await db.update(roles).set({
      name, code, description: description || null,
      status: status || 'active', updatedAt: now,
    }).where(eq(roles.id, id)).run();

    if (permissionIds && Array.isArray(permissionIds)) {
      await db.delete(rolePermissions).where(eq(rolePermissions.roleId, id)).run();
      for (const permId of permissionIds) {
        await db.insert(rolePermissions).values({
          id: `${id}_${permId}`, roleId: id, permissionId: permId,
        }).run();
      }
    }

    saveDb();
    writeAuditLog({ userId: session.userId, userName: session.realName, action: 'update', resource: 'role', resourceId: id, detail: `更新角色权限: ${id}` });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/roles error:', error);
    return NextResponse.json({ success: false, error: '更新角色失败' }, { status: 500 });
  }
}

/** DELETE /api/roles */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ success: false, error: '未登录' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: '缺少角色 ID' }, { status: 400 });

    const db = await getDb();

    // 检查是否有关联用户
    const linkedUsers = await db.select().from(userRoles).where(eq(userRoles.roleId, id)).all();
    if (linkedUsers.length > 0) {
      return NextResponse.json({
        success: false,
        error: `该角色下还有 ${linkedUsers.length} 个关联用户，请先移除用户后再删除角色`,
      }, { status: 409 });
    }

    await db.delete(rolePermissions).where(eq(rolePermissions.roleId, id)).run();
    await db.delete(roles).where(eq(roles.id, id)).run();

    saveDb();
    writeAuditLog({ userId: session.userId, userName: session.realName, action: 'delete', resource: 'role', resourceId: id, detail: `删除角色: ${id}` });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/roles error:', error);
    return NextResponse.json({ success: false, error: '删除角色失败' }, { status: 500 });
  }
}
