import { getDb, saveDb } from '@/db';
import { contacts } from '@/db/schema';
import { eq } from 'drizzle-orm';

function parseRecord(record: Record<string, unknown>) {
  const parsed = { ...record };
  // isKeyDecisionMaker is stored as integer, convert to boolean
  if (parsed['is_key_decision_maker'] !== undefined) {
    parsed['isKeyDecisionMaker'] = parsed['is_key_decision_maker'] === 1;
  }
  // snake_case → camelCase mapping for all fields
  const keyMap: Record<string, string> = {
    customer_id: 'customerId',
    english_name: 'englishName',
    is_key_decision_maker: 'isKeyDecisionMaker',
    zip_code: 'zipCode',
    family_situation: 'familySituation',
    created_at: 'createdAt',
    updated_at: 'updatedAt',
  };
  for (const [dbKey, camelKey] of Object.entries(keyMap)) {
    if (parsed[dbKey] !== undefined) {
      parsed[camelKey] = parsed[dbKey];
      if (dbKey !== camelKey) delete parsed[dbKey];
    }
  }
  return parsed;
}

export async function GET(req: Request) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const customerId = searchParams.get('customerId');

    if (id) {
      const record = db.select().from(contacts).where(eq(contacts.id, id)).get();
      if (!record) return Response.json({ error: 'Not found' }, { status: 404 });
      return Response.json(parseRecord(record as Record<string, unknown>));
    }

    let data = db.select().from(contacts).all();
    if (customerId) {
      data = data.filter((c: Record<string, unknown>) => c.customer_id === customerId);
    }
    return Response.json(data.map((c) => parseRecord(c as Record<string, unknown>)));
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const db = await getDb();
    const body = await req.json();

    // 校验必填项
    if (!body.name || !body.customerId || !body.department || !body.position || !body.gender || body.isKeyDecisionMaker === undefined) {
      return Response.json({
        error: '缺少必填字段 (name, customerId, department, position, gender, isKeyDecisionMaker)',
      }, { status: 400 });
    }

    const id = body.id || `ct-${Date.now()}`;
    const now = new Date().toISOString();

    db.insert(contacts).values({
      id,
      customerId: body.customerId,
      name: body.name,
      englishName: body.englishName ?? null,
      phone: body.phone ?? null,
      isKeyDecisionMaker: body.isKeyDecisionMaker ? true : false,
      email: body.email ?? null,
      wechat: body.wechat ?? null,
      address: body.address ?? null,
      department: body.department,
      position: body.position,
      gender: body.gender,
      birthday: body.birthday ?? null,
      age: body.age ?? null,
      hobbies: body.hobbies ?? null,
      hometown: body.hometown ?? null,
      familySituation: body.familySituation ?? null,
      zipCode: body.zipCode ?? null,
      created_at: body.createdAt || now,
      updated_at: now,
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
    const updates: Record<string, unknown> = { updated_at: now };

    const STRING_FIELDS = [
      'customerId', 'name', 'englishName', 'phone', 'email',
      'wechat', 'address', 'department', 'position', 'gender',
      'birthday', 'hobbies', 'hometown', 'familySituation', 'zipCode',
    ];
    const NUM_FIELDS = ['age'];
    const BOOL_FIELDS = ['isKeyDecisionMaker'];

    for (const f of STRING_FIELDS) {
      if (body[f] !== undefined) {
        // Convert camelCase to snake_case for DB
        const dbKey = f.replace(/([A-Z])/g, '_$1').toLowerCase();
        updates[dbKey] = body[f];
      }
    }
    for (const f of NUM_FIELDS) {
      if (body[f] !== undefined) {
        const dbKey = f.replace(/([A-Z])/g, '_$1').toLowerCase();
        updates[dbKey] = body[f];
      }
    }
    for (const f of BOOL_FIELDS) {
      if (body[f] !== undefined) {
        const dbKey = f.replace(/([A-Z])/g, '_$1').toLowerCase();
        updates[dbKey] = body[f] ? 1 : 0;
      }
    }

    db.update(contacts).set(updates).where(eq(contacts.id, body.id)).run();
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

    db.delete(contacts).where(eq(contacts.id, id)).run();
    saveDb();
    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
