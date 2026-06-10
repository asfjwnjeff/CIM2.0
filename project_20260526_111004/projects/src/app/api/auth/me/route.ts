import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getDb } from '@/db';
import { users } from '@/db/schema-iam';
import { userRoles, roles } from '@/db/schema-iam';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { success: false, error: '未登录' },
        { status: 401 }
      );
    }

    const db = await getDb();

    const userList = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (userList.length === 0) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      );
    }

    const user = userList[0];

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        realName: user.realName,
        email: user.email,
        department: user.department,
        avatar: user.avatar,
        status: user.status,
        roleIds: session.roleIds,
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
    return NextResponse.json(
      { success: false, error: '获取用户信息失败' },
      { status: 500 }
    );
  }
}
