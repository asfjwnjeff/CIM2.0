import { getDb, saveDb } from '@/db';
import { billingEntities } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  const db = await getDb();
  const data = db.select().from(billingEntities).all();
  return Response.json(data);
}

export async function POST(req: Request) {
  try {
    const db = await getDb();
    const body = await req.json();
    const id = body.id || `be-${Date.now()}`;
    const now = new Date().toISOString();
    db.insert(billingEntities).values({
      id,
      name: body.name || '',
      code: body.code || null,
      status: body.status || 'active',
      createdAt: body.createdAt || now,
    } as never).run();
    saveDb();
    return Response.json({ success: true, id }, { status: 201 });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const db = await getDb();
    const body = await req.json();
    if (!body.id) return Response.json({ error: 'Missing id' }, { status: 400 });
    const updates: Record<string, unknown> = {};
    const fields = ['name', 'code', 'status', 'createdAt'];
    for (const f of fields) {
      if (body[f] !== undefined) updates[f] = body[f];
    }
    db.update(billingEntities).set(updates).where(eq(billingEntities.id, body.id)).run();
    saveDb();
    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return Response.json({ error: 'Missing id' }, { status: 400 });
    db.delete(billingEntities).where(eq(billingEntities.id, id)).run();
    saveDb();
    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
