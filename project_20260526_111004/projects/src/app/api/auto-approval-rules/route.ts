import { getDb, saveDb } from '@/db';
import { autoApprovalRules } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const db = await getDb();
    const data = db.select().from(autoApprovalRules).all();
    return Response.json(data.map(r => ({
      ...r,
      conditions: r.conditions ? JSON.parse(r.conditions) : null,
      actions: r.actions ? JSON.parse(r.actions) : null,
    })));
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const db = await getDb();
    const body = await req.json();
    const id = body.id || `ar-${Date.now()}`;
    const now = new Date().toISOString();

    const record = {
      id,
      name: body.name || '',
      serviceProduct: body.serviceProduct ?? null,
      status: body.status ?? 'active',
      conditionLogic: body.conditionLogic ?? 'AND',
      conditions: body.conditions ? JSON.stringify(body.conditions) : null,
      actions: body.actions ? JSON.stringify(body.actions) : null,
      successMessage: body.successMessage ?? null,
      failureMessage: body.failureMessage ?? null,
      priority: body.priority ?? 99,
      remark: body.remark ?? null,
      isSystem: !!body.isSystem,
      createdBy: body.createdBy ?? null,
      createdAt: now,
      updatedAt: now,
    };
    db.insert(autoApprovalRules).values(record).run();
    saveDb();
    return Response.json(
      { ...record, conditions: body.conditions, actions: body.actions, isSystem: body.isSystem },
      { status: 201 }
    );
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
    const STRING_FIELDS = ['name', 'serviceProduct', 'status', 'conditionLogic', 'successMessage', 'failureMessage', 'remark', 'createdBy'];
    for (const field of STRING_FIELDS) {
      if (body[field] !== undefined) updateData[field] = body[field];
    }
    if (body.conditions !== undefined) updateData.conditions = JSON.stringify(body.conditions);
    if (body.actions !== undefined) updateData.actions = JSON.stringify(body.actions);
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.isSystem !== undefined) updateData.isSystem = !!body.isSystem;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db.update(autoApprovalRules) as any).set(updateData).where(eq(autoApprovalRules.id, body.id)).run();
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
    db.delete(autoApprovalRules).where(eq(autoApprovalRules.id, id)).run();
    saveDb();
    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
