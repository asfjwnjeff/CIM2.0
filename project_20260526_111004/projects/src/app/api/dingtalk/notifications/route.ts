import { NextRequest, NextResponse } from 'next/server';

// 钉钉工作通知推送接口
// 当审批节点流转时，触发推送到对应审批人的钉钉

interface DdNotificationPayload {
  userIds: string[];            // DD userId 列表
  title: string;
  content: string;
  targetUrl: string;            // 点击后跳转的 CIM 移动端地址
}

export async function POST(request: NextRequest) {
  try {
    const body: DdNotificationPayload = await request.json();

    if (!body.userIds || body.userIds.length === 0) {
      return NextResponse.json(
        { success: false, error: '缺少接收人 userIds' },
        { status: 400 }
      );
    }

    // ====== Mock 模式：开发阶段打印日志，不调用真实 DD API ======
    // 实际对接钉钉时，替换以下逻辑：
    // 1. 获取 accessToken
    //    POST https://oapi.dingtalk.com/gettoken?appkey=KEY&appsecret=SECRET
    // 2. 发送工作通知（使用消息模板）
    //    POST https://oapi.dingtalk.com/topapi/message/corpconversation/asyncsend_v2
    //    Headers: { 'x-acs-dingtalk-access-token': accessToken }
    //    Body: {
    //      agent_id: AGENT_ID,
    //      userid_list: userIds.join(','),
    //      msg: {
    //        msgtype: 'markdown',
    //        markdown: { title, text: content },
    //      },
    //    }
    // 参考文档：https://open.dingtalk.com/document/orgapp/asynchronous-sending-of-enterprise-session-messages

    console.log('[DD Notification Mock] 推送工作通知:');
    console.log('  接收人:', body.userIds.join(', '));
    console.log('  标题:', body.title);
    console.log('  内容:', body.content);
    console.log('  跳转:', body.targetUrl);

    // 同时写入 CIM 站内消息
    await fetch(`${getBaseUrl(request)}/api/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'user-1', // 后续根据 DD userId 映射到 CIM userId
        type: 'approval_pending',
        title: body.title,
        summary: body.content,
        targetUrl: body.targetUrl,
      }),
    }).catch(() => {
      // 静默失败，通知系统不影响主流程
    });

    return NextResponse.json({
      success: true,
      message: `Mock: 已推送通知给 ${body.userIds.length} 人`,
      taskId: `dd-task-mock-${Date.now()}`,
    });
  } catch (error) {
    console.error('[DD Notification] 推送失败:', error);
    return NextResponse.json(
      { success: false, error: '钉钉通知推送失败' },
      { status: 500 }
    );
  }
}

/** 从请求中提取 base URL */
function getBaseUrl(request: NextRequest): string {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}
