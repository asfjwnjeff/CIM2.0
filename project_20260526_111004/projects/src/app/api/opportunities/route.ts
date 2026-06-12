import { getDb, saveDb } from '@/db';
import { opportunities } from '@/db/schema';
import { eq } from 'drizzle-orm';

const JSON_FIELDS = ['serviceProducts', 'contacts'] as const;

function parseRecord(record: Record<string, unknown>) {
  const parsed = { ...record };
  for (const f of JSON_FIELDS) {
    if (parsed[f]) {
      try { parsed[f] = JSON.parse(parsed[f] as string); } catch { parsed[f] = []; }
    } else {
      parsed[f] = [];
    }
  }
  return parsed;
}

export async function GET(req: Request) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      const record = db.select().from(opportunities).where(eq(opportunities.id, id)).get();
      if (!record) return Response.json({ error: 'Not found' }, { status: 404 });
      return Response.json(parseRecord(record as Record<string, unknown>));
    }

    const data = db.select().from(opportunities).all();
    return Response.json(data.map((f) => parseRecord(f as Record<string, unknown>)));
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const db = await getDb();
    const body = await req.json();
    const id = body.id || `opp-${Date.now()}`;
    const now = new Date().toISOString();

    const record = {
      id,
      customerId: body.customerId || '',
      customerName: body.customerName ?? null,
      name: body.name || '',
      title: body.title ?? null,
      opportunityNumber: body.opportunityNumber ?? null,
      amount: body.amount ?? null,
      estimatedMonthlyAmount: body.estimatedMonthlyAmount ?? null,
      currency: body.currency ?? 'CNY',
      stage: body.stage ?? 'demand_confirmation',
      status: body.status ?? 'draft',
      probability: body.probability ?? null,
      expectedCloseDate: body.expectedCloseDate ?? null,
      serviceProducts: body.serviceProducts ? JSON.stringify(body.serviceProducts) : null,
      serviceProduct: body.serviceProduct ?? null,
      contacts: body.contacts ? JSON.stringify(body.contacts) : null,
      owner: body.owner ?? null,
      ownerName: body.ownerName ?? null,
      description: body.description ?? null,
      createdAt: body.createdAt || now,
      updatedAt: now,
    };

    db.insert(opportunities).values(record).run();
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

    const STRING_FIELDS = ['customerId', 'customerName', 'name', 'title', 'opportunityNumber',
      'currency', 'stage', 'status', 'serviceProduct', 'owner', 'ownerName', 'description'];
    for (const f of STRING_FIELDS) {
      if (body[f] !== undefined) updates[f] = body[f];
    }
    const NUMERIC_FIELDS = ['amount', 'estimatedMonthlyAmount', 'probability'];
    for (const f of NUMERIC_FIELDS) {
      if (body[f] !== undefined) updates[f] = body[f];
    }
    const DATE_FIELDS = ['expectedCloseDate'];
    for (const f of DATE_FIELDS) {
      if (body[f] !== undefined) updates[f] = body[f];
    }
    for (const f of JSON_FIELDS) {
      if (body[f] !== undefined) updates[f] = JSON.stringify(body[f]);
    }

    db.update(opportunities).set(updates).where(eq(opportunities.id, body.id)).run();
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

    db.delete(opportunities).where(eq(opportunities.id, id)).run();
    saveDb();
    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
