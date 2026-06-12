import { getDb, saveDb } from '@/db';
import { followups } from '@/db/schema';
import { eq } from 'drizzle-orm';

const JSON_FIELDS = ['keyPoints', 'actionItems', 'decisions', 'attachments'] as const;

function parseRecord(record: Record<string, unknown>) {
  const parsed = { ...record };
  for (const f of JSON_FIELDS) {
    if (parsed[f]) {
      try { parsed[f] = JSON.parse(parsed[f] as string); } catch { parsed[f] = []; }
    } else {
      parsed[f] = [];
    }
  }
  if (parsed['collaborators']) {
    try { parsed['collaborators'] = JSON.parse(parsed['collaborators'] as string); } catch { parsed['collaborators'] = null; }
  }
  return parsed;
}

export async function GET(req: Request) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      const record = db.select().from(followups).where(eq(followups.id, id)).get();
      if (!record) return Response.json({ error: 'Not found' }, { status: 404 });
      return Response.json(parseRecord(record as Record<string, unknown>));
    }

    const data = db.select().from(followups).all();
    return Response.json(data.map((f) => parseRecord(f as Record<string, unknown>)));
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const db = await getDb();
    const body = await req.json();
    const id = body.id || `fu-${Date.now()}`;
    const now = new Date().toISOString();

    const record = {
      id,
      customerId: body.customerId ?? null,
      customerName: body.customerName ?? null,
      contactId: body.contactId ?? null,
      contactName: body.contactName ?? null,
      opportunityId: body.opportunityId ?? null,
      opportunityName: body.opportunityName ?? null,
      type: body.type ?? null,
      method: body.method ?? null,
      content: body.content ?? null,
      followUpDate: body.followUpDate ?? null,
      status: body.status ?? 'draft',
      owner: body.owner ?? null,
      collaborators: body.collaborators ? JSON.stringify(body.collaborators) : null,
      nextFollowUpDate: body.nextFollowUpDate ?? null,
      recordingUrl: body.recordingUrl ?? null,
      transcript: body.transcript ?? null,
      meetingSummary: body.meetingSummary ?? null,
      keyPoints: body.keyPoints ? JSON.stringify(body.keyPoints) : null,
      actionItems: body.actionItems ? JSON.stringify(body.actionItems) : null,
      decisions: body.decisions ? JSON.stringify(body.decisions) : null,
      attachments: body.attachments ? JSON.stringify(body.attachments) : null,
      createdAt: body.createdAt || now,
      updatedAt: now,
    };

    db.insert(followups).values(record).run();
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

    const STRING_FIELDS = ['customerId', 'customerName', 'contactId', 'contactName',
      'opportunityId', 'opportunityName', 'type', 'method', 'content', 'followUpDate',
      'status', 'owner', 'nextFollowUpDate', 'recordingUrl', 'transcript', 'meetingSummary'];
    for (const f of STRING_FIELDS) {
      if (body[f] !== undefined) updates[f] = body[f];
    }
    for (const f of JSON_FIELDS) {
      if (body[f] !== undefined) updates[f] = JSON.stringify(body[f]);
    }
    if (body['collaborators'] !== undefined) {
      updates['collaborators'] = JSON.stringify(body['collaborators']);
    }

    db.update(followups).set(updates).where(eq(followups.id, body.id)).run();
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

    db.delete(followups).where(eq(followups.id, id)).run();
    saveDb();
    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
