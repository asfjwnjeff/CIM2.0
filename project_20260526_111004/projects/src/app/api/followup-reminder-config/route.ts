import { getDb, saveDb } from '@/db';
import { followupReminderConfig } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const db = await getDb();
    const data = db.select().from(followupReminderConfig).all();
    return Response.json(data);
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const db = await getDb();
    const body = await req.json();
    if (!body.id || body.days === undefined) {
      return Response.json({ error: 'Missing id or days' }, { status: 400 });
    }

    const now = new Date().toISOString();
    db.update(followupReminderConfig)
      .set({ days: body.days, updatedAt: now })
      .where(eq(followupReminderConfig.id, body.id))
      .run();
    saveDb();
    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
