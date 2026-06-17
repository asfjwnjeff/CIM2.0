import { getDb, saveDb } from '@/db';
import { quotes } from '@/db/schema';
import { eq } from 'drizzle-orm';

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

export async function POST(req: Request) {
  try {
    const db = await getDb();
    const body = await req.json();
    const id = body.id || `qt-${Date.now()}`;
    const now = new Date().toISOString();
    db.insert(quotes).values({
      id,
      quoteNumber: body.quoteNumber || null,
      customerId: body.customerId || null,
      customerName: body.customerName || null,
      title: body.title || null,
      status: body.status || 'draft',
      currency: body.currency || 'CNY',
      validFrom: body.validFrom || null,
      validTo: body.validTo || null,
      owner: body.owner || null,
      ownerName: body.ownerName || null,
      totalAmount: body.totalAmount ?? 0,
      items: body.items ? JSON.stringify(body.items) : null,
      collaborators: body.collaborators ? JSON.stringify(body.collaborators) : null,
      history: body.history ? JSON.stringify(body.history) : null,
      remark: body.remark || null,
      createdAt: body.createdAt || now,
      updatedAt: now,
      submittedAt: body.submittedAt || null,
    }).run();
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
    const now = new Date().toISOString();
    const updates: Record<string, unknown> = { updatedAt: now };
    const stringFields = ['quoteNumber','customerId','customerName','title','status','currency',
      'validFrom','validTo','owner','ownerName','remark','submittedAt'];
    for (const f of stringFields) {
      if (body[f] !== undefined) updates[f] = body[f];
    }
    if (body.totalAmount !== undefined) updates.totalAmount = body.totalAmount;
    if (body.items !== undefined) updates.items = JSON.stringify(body.items);
    if (body.collaborators !== undefined) updates.collaborators = JSON.stringify(body.collaborators);
    if (body.history !== undefined) updates.history = JSON.stringify(body.history);
    db.update(quotes).set(updates).where(eq(quotes.id, body.id)).run();
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
    db.delete(quotes).where(eq(quotes.id, id)).run();
    saveDb();
    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
