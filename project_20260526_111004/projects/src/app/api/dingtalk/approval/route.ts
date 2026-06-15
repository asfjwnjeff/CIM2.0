import { NextRequest, NextResponse } from 'next/server';

// 钉钉审批实例推送接口 — 当 DD 原生审批流转时回调 CIM
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // DD 审批实例回调的典型字段：
    // {
    //   processInstanceId: string,    // DD 审批实例 ID
    //   businessId: string,           // 业务 ID（CIM 审批 ID）
    //   type: 'start' | 'finish',     // 事件类型
    //   result: 'agree' | 'refuse',   // 审批结果
    //   remark: string,               // 审批意见
    //   operateTime: string,
    //   operator: { userId, name },
    // }

    const { processInstanceId, businessId, type, result, remark } = body;

    if (!businessId) {
      return NextResponse.json(
        { success: false, error: '缺少 businessId' },
        { status: 400 }
      );
    }

    console.log('[DD Approval Callback] 收到审批回调:');
    console.log('  DD实例ID:', processInstanceId);
    console.log('  CIM审批ID:', businessId);
    console.log('  事件类型:', type);
    console.log('  审批结果:', result);

    // ====== 处理逻辑 ======
    if (type === 'finish') {
      if (result === 'agree') {
        // 通过：同步更新 CIM 中对应审批的状态
        console.log(`  → 审批 ${businessId} 已通过，同步到 CIM`);
        // 实际需调用 CIM 内部 API 或直接操作 store/db
      } else if (result === 'refuse') {
        // 驳回
        console.log(`  → 审批 ${businessId} 已驳回，理由: ${remark}`);
      }
    }

    if (type === 'start') {
      console.log(`  → DD 审批实例 ${processInstanceId} 已发起`);
    }

    return NextResponse.json({ success: true, message: '已处理' });
  } catch (error) {
    console.error('[DD Approval Callback] 处理失败:', error);
    return NextResponse.json(
      { success: false, error: '回调处理失败' },
      { status: 500 }
    );
  }
}

// 钉钉审批结果回调接口 — 审批完成后的结果通知
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { processInstanceId, result, remark } = body;

    console.log('[DD Approval Result] 审批结果:', {
      processInstanceId,
      result,
      remark,
    });

    return NextResponse.json({ success: true, message: '已记录' });
  } catch (error) {
    console.error('[DD Approval Result] 处理失败:', error);
    return NextResponse.json(
      { success: false, error: '结果记录失败' },
      { status: 500 }
    );
  }
}
