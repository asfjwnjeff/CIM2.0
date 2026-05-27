import { getDb } from '@/db';
import { approvalWorkflows } from '@/db/schema';

export async function GET() {
  const db = await getDb();
  const data = db.select().from(approvalWorkflows).all();
  return Response.json(data.map(w => ({
    ...w,
    approvalNodes: w.approvalNodes ? JSON.parse(w.approvalNodes) : null,
  })));
}
