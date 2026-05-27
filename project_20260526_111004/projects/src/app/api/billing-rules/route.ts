import { getDb } from '@/db';
import { billingRules } from '@/db/schema';

export async function GET() {
  const db = await getDb();
  const data = db.select().from(billingRules).all();
  return Response.json(data.map(r => ({
    ...r,
    conditionGroup: r.conditionGroup ? JSON.parse(r.conditionGroup) : null,
  })));
}
