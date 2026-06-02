import { getDb, saveDb } from '@/db';
import { customers } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  const db = await getDb();
  const data = db.select().from(customers).all();
  return Response.json(data.map(c => ({
    ...c,
    basicInfo: c.basicInfo ? JSON.parse(c.basicInfo) : null,
    businessInfo: c.businessInfo ? JSON.parse(c.businessInfo) : null,
    semiconductorInfo: c.semiconductorInfo ? JSON.parse(c.semiconductorInfo) : null,
    relatedCompanies: c.relatedCompanies ? JSON.parse(c.relatedCompanies) : null,
    products: c.products ? JSON.parse(c.products) : null,
    billingEntities: c.billingEntities ? JSON.parse(c.billingEntities) : null,
    ruleIds: c.ruleIds ? JSON.parse(c.ruleIds) : null,
    auditLogs: c.auditLogs ? JSON.parse(c.auditLogs) : null,
  })));
}

export async function PUT(req: Request) {
  try {
    const db = await getDb();
    const body = await req.json();
    if (!body.id) return Response.json({ error: 'Missing id' }, { status: 400 });
    const now = new Date().toISOString();

    const updateData: Record<string, unknown> = { updatedAt: now };
    // 支持更新负责人、协同人等协同管理字段
    // 注意：这些字段需要在db schema中存在。当前customers表不支持这些字段，
    // 所以先做基础PUT支持，后续可扩展字段。
    if (body.responsiblePersons !== undefined) {
      // responsiblePersons 作为 basicInfo 的一部分持久化
      const existing = db.select().from(customers).where(eq(customers.id, body.id)).get();
      if (existing) {
        const basicInfo = existing.basicInfo ? JSON.parse(existing.basicInfo as string) : {};
        basicInfo.responsiblePersons = body.responsiblePersons;
        updateData.basicInfo = JSON.stringify(basicInfo);
      }
    }
    if (body.collaborators !== undefined) {
      const existing = db.select().from(customers).where(eq(customers.id, body.id)).get();
      if (existing) {
        const basicInfo = existing.basicInfo ? JSON.parse(existing.basicInfo as string) : {};
        basicInfo.collaborators = body.collaborators;
        updateData.basicInfo = JSON.stringify(basicInfo);
      }
    }
    if (body.name !== undefined) updateData.name = body.name;
    if (body.status !== undefined) updateData.status = body.status;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db.update(customers) as any).set(updateData).where(eq(customers.id, body.id)).run();
    saveDb();
    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
