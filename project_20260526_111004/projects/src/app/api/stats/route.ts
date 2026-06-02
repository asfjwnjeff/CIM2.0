import { getDb } from '@/db';
import { customers, billingEntities, billingRules, quotes, splitFields, approvalWorkflows, autoApprovalRules, approvalFields, riskApprovals } from '@/db/schema';

export async function GET() {
  const db = await getDb();
  return Response.json({
    customers: db.select().from(customers).all().length,
    billingEntities: db.select().from(billingEntities).all().length,
    billingRules: db.select().from(billingRules).all().length,
    quotes: db.select().from(quotes).all().length,
    splitFields: db.select().from(splitFields).all().length,
    approvalWorkflows: db.select().from(approvalWorkflows).all().length,
    autoApprovalRules: db.select().from(autoApprovalRules).all().length,
    approvalFields: db.select().from(approvalFields).all().length,
    riskApprovals: db.select().from(riskApprovals).all().length,
  });
}
