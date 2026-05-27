import { getDb } from '@/db';
import { quotes } from '@/db/schema';

export async function GET() {
  const db = await getDb();
  const data = db.select().from(quotes).all();
  return Response.json(data.map(q => ({
    ...q,
    items: q.items ? JSON.parse(q.items) : null,
    collaborators: q.collaborators ? JSON.parse(q.collaborators) : null,
    history: q.history ? JSON.parse(q.history) : null,
  })));
}
