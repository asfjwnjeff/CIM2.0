import { getDb } from '@/db';
import { splitFields } from '@/db/schema';

export async function GET() {
  const db = await getDb();
  const data = db.select().from(splitFields).all();
  return Response.json(data.map(f => ({
    ...f,
    options: f.options ? JSON.parse(f.options) : null,
  })));
}
