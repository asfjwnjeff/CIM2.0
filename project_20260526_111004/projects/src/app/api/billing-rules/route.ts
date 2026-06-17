import { getDb, saveDb } from '@/db';
import { billingRules } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  const db = await getDb();
  const data = db.select().from(billingRules).all();
  return Response.json(data.map(r => ({
    ...r,
    conditionGroup: r.conditionGroup ? JSON.parse(r.conditionGroup) : null,
  })));
}

export async function POST(req: Request) {
  try {
    const db = await getDb();
    const body = await req.json();
    const id = body.id || `rule-${Date.now()}`;
    const now = new Date().toISOString();
    db.insert(billingRules).values({
      id,
      name: body.name || '',
      customerId: body.customerId || null,
      customerName: body.customerName || null,
      priority: body.priority ?? 99,
      conditionGroup: body.conditionGroup ? JSON.stringify(body.conditionGroup) : null,
      targetBillingEntity: body.targetBillingEntity || null,
      status: body.status || 'active',
      createdAt: body.createdAt || now,
      createdBy: body.createdBy || null,
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
    const updates: Record<string, unknown> = {};
    const stringFields = ['name', 'customerId', 'customerName', 'targetBillingEntity', 'status', 'createdBy'];
    for (const f of stringFields) {
      if (body[f] !== undefined) updates[f] = body[f];
    }
    if (body.priority !== undefined) updates.priority = body.priority;
    if (body.conditionGroup !== undefined) updates.conditionGroup = JSON.stringify(body.conditionGroup);
    db.update(billingRules).set(updates).where(eq(billingRules.id, body.id)).run();
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
    db.delete(billingRules).where(eq(billingRules.id, id)).run();
    saveDb();
    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
