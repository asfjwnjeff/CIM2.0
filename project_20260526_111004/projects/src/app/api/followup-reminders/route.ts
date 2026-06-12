import { getDb } from '@/db';
import { customers, followups, followupReminderConfig } from '@/db/schema';

export async function GET(req: Request) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    // 获取配置
    const configs = db.select().from(followupReminderConfig).all();
    const levelDays: Record<string, number> = {};
    for (const c of configs) {
      levelDays[c.level as string] = c.days as number;
    }

    // 获取所有活跃客户
    const allCustomers = db.select().from(customers).all();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reminders: Array<{
      customerId: string; customerName: string; level: string;
      lastFollowUpDate: string | null; overdueDays: number;
      responsiblePersons: string[]; collaborators: string[];
    }> = [];

    for (const c of allCustomers) {
      // 只处理 active 状态
      if (c.status !== 'active') continue;

      // 获取客户等级
      let level = 'D'; // 默认
      try {
        const bi = c.basicInfo ? JSON.parse(c.basicInfo as string) : null;
        if (bi?.customerLevel && levelDays[bi.customerLevel]) {
          level = bi.customerLevel;
        }
      } catch { /* ignore parse errors */ }

      const thresholdDays = levelDays[level] || 60;

      // 查找最近一次跟进
      const custFollowups = db.select().from(followups)
        .all()
        .filter((f: Record<string, unknown>) => f.customerId === c.id && f.followUpDate)
        .sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
          new Date((b as Record<string,unknown>).followUpDate as string).getTime() - new Date((a as Record<string,unknown>).followUpDate as string).getTime()
        );

      let lastDate: Date | null = null;
      if (custFollowups.length > 0) {
        lastDate = new Date((custFollowups[0] as Record<string,unknown>).followUpDate as string);
      } else {
        // 无跟进记录，使用 updatedAt
        if (c.updatedAt) {
          lastDate = new Date(c.updatedAt as string);
        } else if (c.createdAt) {
          lastDate = new Date(c.createdAt as string);
        }
      }

      if (!lastDate) continue;

      lastDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays >= thresholdDays) {
        let respPersons: string[] = [];
        let collabs: string[] = [];
        try {
          respPersons = c.responsiblePersons ? JSON.parse(c.responsiblePersons as string) : [];
        } catch { /* ignore */ }
        try {
          collabs = c.collaborators ? JSON.parse(c.collaborators as string) : [];
        } catch { /* ignore */ }

        // 如果传了 userId，过滤只返回该用户相关的
        if (userId) {
          const allPersons = [...respPersons, ...collabs];
          if (!allPersons.includes(userId)) continue;
        }

        reminders.push({
          customerId: c.id,
          customerName: c.name,
          level,
          lastFollowUpDate: custFollowups.length > 0 ? ((custFollowups[0] as Record<string,unknown>).followUpDate as string) : null,
          overdueDays: diffDays - thresholdDays,
          responsiblePersons: respPersons,
          collaborators: collabs,
        });
      }
    }

    // 按逾期天数降序排列
    reminders.sort((a, b) => b.overdueDays - a.overdueDays);

    return Response.json(reminders);
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
