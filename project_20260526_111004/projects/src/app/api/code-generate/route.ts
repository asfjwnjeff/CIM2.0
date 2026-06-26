import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb } from '@/db';
import { codeSequences } from '@/db/schema';
import { eq } from 'drizzle-orm';

const VALID_TYPES = ['SVC', 'SHC', 'ADS'] as const;

function formatCode(prefix: string, seq: number): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `${prefix}-${dateStr}-${String(seq).padStart(3, '0')}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    if (!type || !VALID_TYPES.includes(type as typeof VALID_TYPES[number])) {
      return NextResponse.json({ success: false, error: '无效的编码类型，支持: SVC, SHC, ADS' }, { status: 400 });
    }

    const db = await getDb();

    // 查询当前序号
    let row = db.select().from(codeSequences).where(eq(codeSequences.id, type)).get();

    if (!row) {
      // 首次使用，初始化
      db.insert(codeSequences).values({
        id: type,
        currentSeq: 0,
        updatedAt: new Date().toISOString(),
      }).run();
      row = { id: type, currentSeq: 0, updatedAt: new Date().toISOString() };
    }

    // 跨日重置序号
    const today = new Date().toISOString().slice(0, 10);
    const lastDate = row.updatedAt ? row.updatedAt.slice(0, 10) : '';
    let nextSeq = lastDate === today ? (row.currentSeq ?? 0) + 1 : 1;

    // 原子更新
    db.update(codeSequences)
      .set({ currentSeq: nextSeq, updatedAt: new Date().toISOString() })
      .where(eq(codeSequences.id, type))
      .run();
    saveDb();

    const code = formatCode(type, nextSeq);
    return NextResponse.json({ success: true, code });
  } catch (error) {
    console.error('GET /api/code-generate error:', error);
    return NextResponse.json({ success: false, error: '生成编码失败' }, { status: 500 });
  }
}
