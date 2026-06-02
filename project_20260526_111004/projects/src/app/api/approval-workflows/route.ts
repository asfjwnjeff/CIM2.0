import { getDb, saveDb } from '@/db';
import { approvalWorkflows } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const db = await getDb();
    const data = db.select().from(approvalWorkflows).all();
    return Response.json(data.map(w => ({
      ...w,
      approvalNodes: w.approvalNodes ? JSON.parse(w.approvalNodes) : null,
    })));
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const db = await getDb();
    const body = await req.json();
    const id = body.id || `aw-${Date.now()}`;
    const now = new Date().toISOString();

    const record = {
      id,
      name: body.name || '',
      serviceProduct: body.serviceProduct ?? null,
      isTradeAgency: !!body.isTradeAgency,
      status: body.status ?? 'active',
      approvalNodes: body.approvalNodes ? JSON.stringify(body.approvalNodes) : null,
      remark: body.remark ?? null,
      createdBy: body.createdBy ?? null,
      createdAt: now,
      updatedAt: now,
    };
    db.insert(approvalWorkflows).values(record).run();
    saveDb();
    return Response.json({ ...record, approvalNodes: body.approvalNodes, isTradeAgency: body.isTradeAgency }, { status: 201 });
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

    const updateData: Record<string, unknown> = { updatedAt: now };
    const STRING_FIELDS = ['name', 'serviceProduct', 'status', 'remark', 'createdBy'];
    for (const field of STRING_FIELDS) {
      if (body[field] !== undefined) updateData[field] = body[field];
    }
    if (body.isTradeAgency !== undefined) updateData.isTradeAgency = !!body.isTradeAgency;
    if (body.approvalNodes !== undefined) updateData.approvalNodes = JSON.stringify(body.approvalNodes);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db.update(approvalWorkflows) as any).set(updateData).where(eq(approvalWorkflows.id, body.id)).run();
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
    db.delete(approvalWorkflows).where(eq(approvalWorkflows.id, id)).run();
    saveDb();
    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
