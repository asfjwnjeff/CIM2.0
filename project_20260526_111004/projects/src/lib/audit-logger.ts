import { getDb, saveDb } from '@/db';
import { auditLogs } from '@/db/schema-iam';
import { genId } from '@/db/seed-iam';

/**
 * 写入审计日志
 */
export async function writeAuditLog(params: {
  userId: string;
  userName?: string;
  action: string;
  resource?: string;
  resourceId?: string;
  detail?: string;
  ip?: string;
}) {
  try {
    const db = await getDb();
    await db.insert(auditLogs).values({
      id: genId(),
      userId: params.userId,
      userName: params.userName || null,
      action: params.action,
      resource: params.resource || null,
      resourceId: params.resourceId || null,
      detail: params.detail || null,
      ip: params.ip || null,
      createdAt: new Date().toISOString(),
    }).run();
    saveDb();
  } catch {
    // 审计日志写入失败不应阻塞主流程
    console.error('[AuditLog] 写入失败:', params.action, params.resource);
  }
}
