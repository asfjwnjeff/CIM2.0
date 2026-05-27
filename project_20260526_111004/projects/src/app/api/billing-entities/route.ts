import { getDb } from '@/db';
import { billingEntities } from '@/db/schema';

export async function GET() {
  const db = await getDb();
  const data = db.select().from(billingEntities).all();
  return Response.json(data);
}
