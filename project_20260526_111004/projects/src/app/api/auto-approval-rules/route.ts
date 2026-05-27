import { getDb } from '@/db';
import { autoApprovalRules } from '@/db/schema';

export async function GET() {
  const db = await getDb();
  const data = db.select().from(autoApprovalRules).all();
  return Response.json(data.map(r => ({
    ...r,
    conditions: r.conditions ? JSON.parse(r.conditions) : null,
    actions: r.actions ? JSON.parse(r.actions) : null,
  })));
}
