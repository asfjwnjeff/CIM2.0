import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { addressSites, addressUsages, addressContacts, addressVersions } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = await getDb();
    const { id } = await params;

    const addr = db.select().from(addressSites).where(eq(addressSites.id, id)).get();
    if (!addr) {
      return NextResponse.json({ success: false, error: '地址站点不存在' }, { status: 404 });
    }

    const usages = db.select().from(addressUsages).where(eq(addressUsages.addressSiteId, id)).all();
    const contacts = db.select().from(addressContacts).where(eq(addressContacts.addressSiteId, id)).all();
    const versions = db.select().from(addressVersions).where(eq(addressVersions.addressSiteId, id)).all();

    const parseRow = (row: Record<string, unknown>) => {
      const result: Record<string, unknown> = { ...row };
      for (const [key, val] of Object.entries(result)) {
        if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
          try { result[key] = JSON.parse(val as string); } catch { /* keep */ }
        }
      }
      return result;
    };

    return NextResponse.json({
      success: true,
      data: {
        ...parseRow(addr as Record<string, unknown>),
        usages: usages.map((u) => parseRow(u as Record<string, unknown>)),
        contacts: contacts.map((c) => parseRow(c as Record<string, unknown>)),
        versions: versions.map((v) => parseRow(v as Record<string, unknown>)),
      },
    });
  } catch (error) {
    console.error('GET /api/address-sites/[id] error:', error);
    return NextResponse.json({ success: false, error: '获取地址站点详情失败' }, { status: 500 });
  }
}
