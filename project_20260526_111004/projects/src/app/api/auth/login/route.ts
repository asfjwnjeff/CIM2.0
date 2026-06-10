import { NextRequest, NextResponse } from 'next/server';
import { signToken, setTokenCookie } from '@/lib/auth';
import { getDb } from '@/db';
import { users, userRoles, roles } from '@/db/schema-iam';
import { eq, inArray } from 'drizzle-orm';
import { verifyPassword } from '@/db/seed-iam';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: '请输入用户名和密码' },
        { status: 400 }
      );
    }

    const db = await getDb();

    const userList = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (userList.length === 0) {
      return NextResponse.json(
        { success: false, error: '用户名或密码错误' },
        { status: 401 }
      );
    }

    const user = userList[0];

    if (user.status !== 'active') {
      return NextResponse.json(
        { success: false, error: '账号已被禁用，请联系管理员' },
        { status: 403 }
      );
    }

    if (!verifyPassword(password, user.password)) {
      return NextResponse.json(
        { success: false, error: '用户名或密码错误' },
        { status: 401 }
      );
    }

    // 获取用户所有角色
    const userRoleList = await db
      .select({ roleId: userRoles.roleId })
      .from(userRoles)
      .where(eq(userRoles.userId, user.id));

    const roleIds = userRoleList.map(r => r.roleId);

    // 获取所有角色名称（使用 IN 查询，而非只查第一个）
    let roleNames: string[] = [];
    if (roleIds.length > 0) {
      const roleList = await db
        .select({ name: roles.name })
        .from(roles)
        .where(inArray(roles.id, roleIds));
      roleNames = roleList.map(r => r.name);
    }

    const token = await signToken({
      userId: user.id,
      username: user.username,
      realName: user.realName,
      roleIds,
      department: user.department || undefined,
    });

    await setTokenCookie(token);

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        realName: user.realName,
        email: user.email,
        department: user.department,
        roleIds,
        roleNames,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: '登录失败，请稍后重试' },
      { status: 500 }
    );
  }
}
