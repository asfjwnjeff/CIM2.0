import { NextRequest, NextResponse } from 'next/server';

// 消息通知存储（内存中，后续迁移到 SQLite）
// 注：实际生产环境需从数据库读取，此处为快速原型

interface NotificationItem {
  id: string;
  userId: string;
  type: string;
  title: string;
  summary: string;
  targetUrl?: string;
  isRead: boolean;
  createdAt: string;
}

// 示例通知数据
let notifications: NotificationItem[] = [
  {
    id: 'n1',
    userId: 'user-1',
    type: 'approval_pending',
    title: '新的审批待办',
    summary: '应用材料(中国)有限公司 的货代服务审批需要您处理',
    targetUrl: '/mobile/approvals/1',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'n2',
    userId: 'user-1',
    type: 'approval_result',
    title: '审批已通过',
    summary: '飞雅贸易(上海)有限公司 的仓库服务审批已通过',
    targetUrl: '/mobile/approvals/2',
    isRead: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'n3',
    userId: 'user-1',
    type: 'followup_reminder',
    title: '跟进提醒',
    summary: '荏原机械(中国)有限公司 已有 5 天未跟进',
    targetUrl: '/mobile/followups',
    isRead: true,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'n4',
    userId: 'user-1',
    type: 'system',
    title: '系统通知',
    summary: 'CIM 移动端已上线，请在钉钉工作台体验新功能',
    targetUrl: '/mobile',
    isRead: false,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
];

// GET /api/notifications — 获取通知列表
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || 'user-1';
  const type = searchParams.get('type');
  const unreadOnly = searchParams.get('unreadOnly') === 'true';

  let filtered = notifications.filter((n) => n.userId === userId);

  if (type && type !== 'all') {
    filtered = filtered.filter((n) => n.type === type);
  }

  if (unreadOnly) {
    filtered = filtered.filter((n) => !n.isRead);
  }

  // 按时间倒序
  filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return NextResponse.json({ success: true, data: filtered });
}

// POST /api/notifications — 创建通知（供审批流转时调用）
export async function POST(request: NextRequest) {
  const body = await request.json();
  const newNotification: NotificationItem = {
    id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    userId: body.userId || 'user-1',
    type: body.type || 'system',
    title: body.title || '',
    summary: body.summary || '',
    targetUrl: body.targetUrl || '',
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  notifications = [newNotification, ...notifications];

  return NextResponse.json({ success: true, data: newNotification });
}

// PUT /api/notifications — 批量标记已读
export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { ids, markAllRead, userId } = body;

  if (markAllRead) {
    const uid = userId || 'user-1';
    notifications = notifications.map((n) =>
      n.userId === uid ? { ...n, isRead: true } : n
    );
    return NextResponse.json({ success: true, message: '全部已读' });
  }

  if (Array.isArray(ids)) {
    notifications = notifications.map((n) =>
      ids.includes(n.id) ? { ...n, isRead: true } : n
    );
    return NextResponse.json({ success: true, message: '标记成功' });
  }

  return NextResponse.json({ success: false, error: '缺少参数' }, { status: 400 });
}

// DELETE /api/notifications?id=xxx — 删除通知
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (id) {
    notifications = notifications.filter((n) => n.id !== id);
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ success: false, error: '缺少 id 参数' }, { status: 400 });
}
