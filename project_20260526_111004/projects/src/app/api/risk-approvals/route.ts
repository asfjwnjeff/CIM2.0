import { getDb, saveDb } from '@/db';
import { riskApprovals } from '@/db/schema';
import { eq } from 'drizzle-orm';

const JSON_FIELDS = ['approvalSteps', 'businessCustomerIds', 'invoiceInfoIds', 'dynamicFieldValues'] as const;

function parseRecord(record: Record<string, unknown>) {
  const parsed = { ...record };
  for (const f of JSON_FIELDS) {
    if (parsed[f]) {
      parsed[f] = JSON.parse(parsed[f] as string);
    } else {
      // approvalSteps, businessCustomerIds, invoiceInfoIds → []
      // dynamicFieldValues → {}
      parsed[f] = f === 'dynamicFieldValues' ? {} : [];
    }
  }
  // 字段名映射：DB 驼峰 → 前端下划线
  if (parsed['monthlyOrders'] !== undefined) {
    parsed['monthly_orders'] = parsed['monthlyOrders'];
    delete parsed['monthlyOrders'];
  }
  if (parsed['monthlyInvoiceAmount'] !== undefined) {
    parsed['monthly_invoice_amount'] = parsed['monthlyInvoiceAmount'];
    delete parsed['monthlyInvoiceAmount'];
  }
  return parsed;
}

export async function GET(req: Request) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      const record = db.select().from(riskApprovals).where(eq(riskApprovals.id, id)).get();
      if (!record) return Response.json({ error: 'Not found' }, { status: 404 });
      return Response.json(parseRecord(record as Record<string, unknown>));
    }

    const data = db.select().from(riskApprovals).all();
    return Response.json(data.map((f) => parseRecord(f as Record<string, unknown>)));
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const db = await getDb();
    const body = await req.json();
    const id = body.id || `ra-${Date.now()}`;
    const now = new Date().toISOString();

    const record = {
      id,
      companyName: body.companyName || '',
      serviceProduct: body.serviceProduct ?? null,
      isTradeAgent: body.isTradeAgent ?? '否',
      businessType: body.businessType ?? null,
      approvalStatus: body.approvalStatus ?? '草稿',
      status: body.status ?? null,
      approvalSteps: body.approvalSteps ? JSON.stringify(body.approvalSteps) : null,
      pickedApprover: body.pickedApprover ?? null,
      submitter: body.submitter ?? null,
      remark: body.remark ?? null,
      englishName: body.englishName ?? null,
      parentCompany: body.parentCompany ?? null,
      subsidiaryCompany: body.subsidiaryCompany ?? null,
      goodsType: body.goodsType ?? null,
      monthlyBusinessVolume: body.monthlyBusinessVolume ?? null,
      monthlyOrders: body.monthly_orders ?? null,
      monthlyInvoiceAmount: body.monthly_invoice_amount ?? body.monthlyInvoiceAmount ?? null,
      customsKpiRequirement: body.customsKpiRequirement ?? null,
      transportKpiRequirement: body.transportKpiRequirement ?? null,
      warehouseLeaseRequirement: body.warehouseLeaseRequirement ?? null,
      customServiceRequirement: body.customServiceRequirement ?? null,
      customRequirementDescription: body.customRequirementDescription ?? null,
      riskControlPurpose: body.riskControlPurpose ?? null,
      relationshipWithHMG: body.relationshipWithHMG ?? null,
      settlementPeriod: body.settlementPeriod ?? null,
      contactName: body.contactName ?? null,
      suggestedSystemCode: body.suggestedSystemCode ?? null,
      opportunityId: body.opportunityId ?? null,
      businessCustomerIds: body.businessCustomerIds ? JSON.stringify(body.businessCustomerIds) : null,
      invoiceInfoIds: body.invoiceInfoIds ? JSON.stringify(body.invoiceInfoIds) : null,
      dynamicFieldValues: body.dynamicFieldValues ? JSON.stringify(body.dynamicFieldValues) : null,
      submitTime: body.submitTime ?? null,
      approvedBy: body.approvedBy ?? null,
      approvedAt: body.approvedAt ?? null,
      rejectReason: body.rejectReason ?? null,
      createdAt: body.createdAt || now,
      updatedAt: now,
    };
    db.insert(riskApprovals).values(record).run();
    saveDb();
    return Response.json(parseRecord(record as Record<string, unknown>), { status: 201 });
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
    const STRING_FIELDS = [
      'companyName', 'serviceProduct', 'isTradeAgent', 'businessType',
      'approvalStatus', 'status', 'pickedApprover', 'submitter', 'remark',
      'englishName', 'parentCompany', 'subsidiaryCompany',
      'goodsType', 'monthlyBusinessVolume', 'monthlyOrders', 'monthlyInvoiceAmount',
      'customsKpiRequirement', 'transportKpiRequirement', 'warehouseLeaseRequirement',
      'customServiceRequirement', 'customRequirementDescription',
      'riskControlPurpose', 'relationshipWithHMG',
      'settlementPeriod', 'contactName', 'suggestedSystemCode', 'opportunityId',
      'submitTime', 'approvedBy', 'approvedAt', 'rejectReason',
    ];

    for (const field of STRING_FIELDS) {
      if (body[field] !== undefined) updateData[field] = body[field];
    }
    // 兼容前端发送的下划线命名
    if (body.monthly_orders !== undefined) updateData['monthlyOrders'] = body.monthly_orders;
    if (body.monthly_invoice_amount !== undefined) updateData['monthlyInvoiceAmount'] = body.monthly_invoice_amount;

    // JSON 序列化
    for (const field of JSON_FIELDS) {
      if (body[field] !== undefined) updateData[field] = JSON.stringify(body[field]);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db.update(riskApprovals) as any).set(updateData).where(eq(riskApprovals.id, body.id)).run();
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
    db.delete(riskApprovals).where(eq(riskApprovals.id, id)).run();
    saveDb();
    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
