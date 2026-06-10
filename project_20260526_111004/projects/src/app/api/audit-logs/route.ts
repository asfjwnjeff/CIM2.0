import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { auditLogs } from '@/db/schema-iam';
import { sql, desc, eq, like, and } from 'drizzle-orm';
import { getSessionUser } from '@/lib/auth';

/** GET /api/audit-logs — SQL 层分页 + 过滤 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ success: false, error: '未登录' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));
    const action = searchParams.get('action') || '';
    const userId = searchParams.get('userId') || '';
    const offset = (page - 1) * limit;

    const db = await getDb();

    // 构建 WHERE 条件
    const conditions = [];
    if (action) conditions.push(eq(auditLogs.action, action));
    if (userId) conditions.push(eq(auditLogs.userId, userId));

    // 查询总数
    const countQuery = conditions.length > 0
      ? db.select({ count: sql<number>`count(*)` }).from(auditLogs).where(and(...conditions))
      : db.select({ count: sql<number>`count(*)` }).from(auditLogs);
    const countResult = countQuery.get();
    const total = countResult?.count || 0;

    // 分页查询
    const baseQuery = db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt));
    const query = conditions.length > 0
      ? baseQuery.where(and(...conditions)).limit(limit).offset(offset)
      : baseQuery.limit(limit).offset(offset);
    const paged = query.all();

    return NextResponse.json({
      success: true,
      data: paged,
      meta: { total, page, limit },
    });
  } catch (error) {
    console.error('GET /api/audit-logs error:', error);
    return NextResponse.json({ success: false, error: '获取审计日志失败' }, { status: 500 });
  }
}
