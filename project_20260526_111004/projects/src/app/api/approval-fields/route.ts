import { getDb } from '@/db';
import { approvalFields } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const db = await getDb();
    const data = db.select().from(approvalFields).all();
    const parsed = data.map((f: Record<string, unknown>) => ({
      ...f,
      serviceProducts: f.serviceProducts ? JSON.parse(f.serviceProducts as string) : [],
      options: f.options ? JSON.parse(f.options as string) : [],
      isRequired: f.isRequired === 1,
    }));
    return Response.json(parsed);
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const db = await getDb();
    const body = await req.json();
    const id = `af-${Date.now()}`;
    const now = new Date().toISOString();

    const record = {
      id,
      name: body.name,
      fieldKey: body.fieldKey,
      fieldType: body.fieldType ?? 'text',
      serviceProducts: JSON.stringify(body.serviceProducts ?? []),
      options: JSON.stringify(body.options ?? []),
      isRequired: body.isRequired ? 1 : 0,
      approvalPoint: body.approvalPoint ?? null,
      status: body.status ?? 'active',
      remark: body.remark ?? null,
      createdBy: body.createdBy ?? null,
      createdAt: now,
      updatedAt: now,
    };
    db.insert(approvalFields).values(record).run();
    return Response.json({ ...record, serviceProducts: body.serviceProducts, options: body.options, isRequired: body.isRequired }, { status: 201 });
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

    const STRING_FIELDS = ['name', 'fieldKey', 'fieldType', 'approvalPoint', 'status', 'remark', 'createdBy'];
    for (const field of STRING_FIELDS) {
      if (body[field] !== undefined) updateData[field] = body[field];
    }

    // JSON fields
    if (body.serviceProducts !== undefined) updateData.serviceProducts = JSON.stringify(body.serviceProducts);
    if (body.options !== undefined) updateData.options = JSON.stringify(body.options);

    // Boolean
    if (body.isRequired !== undefined) updateData.isRequired = body.isRequired ? 1 : 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db.update(approvalFields) as any).set(updateData).where(eq(approvalFields.id, body.id)).run();
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
    db.delete(approvalFields).where(eq(approvalFields.id, id)).run();
    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
