import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb } from '@/db';
import { users, userRoles, roles } from '@/db/schema-iam';
import { eq } from 'drizzle-orm';
import { hashPassword, genId } from '@/db/seed-iam';
import { getSessionUser } from '@/lib/auth';
import { writeAuditLog } from '@/lib/audit-logger';

/** GET /api/users — 获取用户列表（批量查询，无 N+1） */
export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ success: false, error: '未登录' }, { status: 401 });

    const db = await getDb();
    const allUsers = await db.select().from(users).all();
    const allRoles = await db.select().from(roles).all();
    const allUserRoles = await db.select().from(userRoles).all();

    const roleMap = new Map(allRoles.map(r => [r.id, r.name]));

    // 构建 userId → roleIds 映射
    const userRoleMap = new Map<string, string[]>();
    for (const ur of allUserRoles) {
      const list = userRoleMap.get(ur.userId) || [];
      list.push(ur.roleId);
      userRoleMap.set(ur.userId, list);
    }

    const enrichedUsers = allUsers.map(u => {
      const roleIds = userRoleMap.get(u.id) || [];
      return {
        id: u.id,
        username: u.username,
        realName: u.realName,
        email: u.email,
        phone: u.phone,
        department: u.department,
        avatar: u.avatar,
        status: u.status,
        roleIds,
        roleNames: roleIds.map(rid => roleMap.get(rid) || rid),
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      };
    });

    return NextResponse.json({ success: true, data: enrichedUsers });
  } catch (error) {
    console.error('GET /api/users error:', error);
    return NextResponse.json({ success: false, error: '获取用户列表失败' }, { status: 500 });
  }
}

/** POST /api/users — 创建用户 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ success: false, error: '未登录' }, { status: 401 });

    const body = await request.json();
    const { username, realName, email, phone, department, password, roleIds: reqRoleIds } = body;

    if (!username || !realName || !password) {
      return NextResponse.json({ success: false, error: '用户名、姓名和密码为必填项' }, { status: 400 });
    }

    const db = await getDb();

    // 检查用户名唯一性
    const existing = await db.select().from(users).where(eq(users.username, username)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ success: false, error: '用户名已存在' }, { status: 409 });
    }

    const id = genId();
    const now = new Date().toISOString();

    await db.insert(users).values({
      id, username, realName,
      email: email || null,
      phone: phone || null,
      department: department || null,
      password: hashPassword(password),
      status: 'active',
      createdAt: now,
      updatedAt: now,
    }).run();

    // 关联角色
    if (reqRoleIds && Array.isArray(reqRoleIds)) {
      for (const roleId of reqRoleIds) {
        await db.insert(userRoles).values({
          id: `${id}_${roleId}`, userId: id, roleId,
        }).run();
      }
    }

    saveDb();
    writeAuditLog({ userId: session.userId, userName: session.realName, action: 'create', resource: 'user', resourceId: id, detail: `创建用户: ${realName}(${username})` });
    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error('POST /api/users error:', error);
    return NextResponse.json({ success: false, error: '创建用户失败' }, { status: 500 });
  }
}

/** PUT /api/users — 更新用户 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ success: false, error: '未登录' }, { status: 401 });

    const body = await request.json();
    const { id, username, realName, email, phone, department, password, status, roleIds: reqRoleIds } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: '缺少用户 ID' }, { status: 400 });
    }

    const db = await getDb();
    const now = new Date().toISOString();

    const updateData: Record<string, unknown> = {
      realName,
      email: email || null,
      phone: phone || null,
      department: department || null,
      status: status || 'active',
      updatedAt: now,
    };

    if (password) {
      updateData.password = hashPassword(password);
    }

    await db.update(users).set(updateData).where(eq(users.id, id)).run();

    // 更新角色关联
    if (reqRoleIds && Array.isArray(reqRoleIds)) {
      await db.delete(userRoles).where(eq(userRoles.userId, id)).run();
      for (const roleId of reqRoleIds) {
        await db.insert(userRoles).values({
          id: `${id}_${roleId}`, userId: id, roleId,
        }).run();
      }
    }

    saveDb();
    writeAuditLog({ userId: session.userId, userName: session.realName, action: 'update', resource: 'user', resourceId: id, detail: `更新用户: ${id}` });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/users error:', error);
    return NextResponse.json({ success: false, error: '更新用户失败' }, { status: 500 });
  }
}

/** DELETE /api/users — 删除用户 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ success: false, error: '未登录' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: '缺少用户 ID' }, { status: 400 });

    const db = await getDb();
    await db.delete(userRoles).where(eq(userRoles.userId, id)).run();
    await db.delete(users).where(eq(users.id, id)).run();

    saveDb();
    writeAuditLog({ userId: session.userId, userName: session.realName, action: 'delete', resource: 'user', resourceId: id, detail: `删除用户: ${id}` });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/users error:', error);
    return NextResponse.json({ success: false, error: '删除用户失败' }, { status: 500 });
  }
}
