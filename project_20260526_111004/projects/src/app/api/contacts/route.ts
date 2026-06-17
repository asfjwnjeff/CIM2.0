import { getDb, saveDb } from '@/db';
import { contacts } from '@/db/schema';
import { eq } from 'drizzle-orm';

function parseRecord(record: Record<string, unknown>) {
  const parsed = { ...record };
  // Drizzle mode:'boolean' 可能返回 0/1（取决于驱动），统一转为 boolean
  if (typeof parsed['isKeyDecisionMaker'] === 'number') {
    parsed['isKeyDecisionMaker'] = parsed['isKeyDecisionMaker'] === 1;
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

    const data = db.select().from(contacts).all();
    // Drizzle 返回 camelCase 键名
    const filtered = customerId
      ? data.filter((c: Record<string, unknown>) => c.customerId === customerId)
      : data;
    return Response.json(filtered.map((c) => parseRecord(c as Record<string, unknown>)));
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
    const updates: Record<string, unknown> = { updatedAt: now };

    // Drizzle .set() 接收 JavaScript 属性名（camelCase），内部映射到数据库列名
    const FIELDS = [
      'customerId', 'name', 'englishName', 'phone', 'email',
      'wechat', 'address', 'department', 'position', 'gender',
      'birthday', 'hobbies', 'hometown', 'familySituation', 'zipCode',
      'age', 'isKeyDecisionMaker',
    ];

    for (const f of FIELDS) {
      if (body[f] !== undefined) {
        updates[f] = body[f];
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
