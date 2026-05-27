import { getDb } from '@/db';
import { customers, billingEntities, billingRules, quotes } from '@/db/schema';

export async function GET() {
  const db = await getDb();
  return Response.json({
    customers: db.select().from(customers).all().length,
    billingEntities: db.select().from(billingEntities).all().length,
    billingRules: db.select().from(billingRules).all().length,
    quotes: db.select().from(quotes).all().length,
  });
}
