import { getDb } from '@/db';
import { customers } from '@/db/schema';

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
