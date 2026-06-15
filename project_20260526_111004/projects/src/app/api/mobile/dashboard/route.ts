import { NextRequest, NextResponse } from 'next/server';

// 移动端首页聚合数据接口
// 从多个数据源聚合待审批数、待跟进数、逾期提醒数等

export async function GET(request: NextRequest) {
  try {
    // 示例数据（实际生产需从数据库查询聚合）
    const dashboard = {
      pendingApprovalCount: 3,
      todayFollowupCount: 5,
      overdueReminderCount: 2,
      unreadNotificationCount: 2,
      recentApprovals: [
        {
          id: '1',
          companyName: '应用材料(中国)有限公司',
          serviceProduct: '货代',
          status: 'in_review',
          approvalStatus: '审批中',
          updatedAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ],
    };

    return NextResponse.json({ success: true, data: dashboard });
  } catch (error) {
    console.error('[Mobile Dashboard] 获取失败:', error);
    return NextResponse.json(
      { success: false, error: '数据获取失败' },
      { status: 500 }
    );
  }
}
