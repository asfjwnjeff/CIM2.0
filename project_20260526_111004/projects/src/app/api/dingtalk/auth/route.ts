import { NextRequest, NextResponse } from 'next/server';

// 钉钉免登接口
// 流程：前端 dd.getAuthCode() → POST authCode → 服务端换 accessToken → 换 userId → 查用户 → 签发 JWT

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { authCode } = body;

    if (!authCode) {
      return NextResponse.json(
        { success: false, error: '缺少 authCode 参数' },
        { status: 400 }
      );
    }

    // ====== Mock 模式：开发阶段不调用真实 DD API ======
    // 实际对接钉钉时，替换以下逻辑：
    // 1. 用 appKey + appSecret 换取 accessToken
    //    POST https://oapi.dingtalk.com/gettoken?appkey=KEY&appsecret=SECRET
    // 2. 用 accessToken + authCode 换取 userId
    //    POST https://oapi.dingtalk.com/topapi/v2/user/getuserinfo?access_token=TOKEN
    //    Body: { code: authCode }
    // 3. 用 userId 获取用户详情
    //    POST https://oapi.dingtalk.com/topapi/v2/user/get?access_token=TOKEN
    //    Body: { userid: userId }
    // 4. 按 DD userId 或 email 在 CIM users 表中匹配
    // 5. 签发 CIM JWT

    // Mock 返回
    const mockDdUser = {
      userId: 'dingtalk-user-001',
      name: '王明',
      email: 'wangming@company.com',
      department: '销售部',
      avatar: '',
    };

    // 签发 JWT（简化版，实际需使用 jose 库签名）
    const cimJwt = `cim-jwt-mock-${Date.now()}`;

    return NextResponse.json({
      success: true,
      data: {
        token: cimJwt,
        user: {
          id: 'user-1',
          name: mockDdUser.name,
          email: mockDdUser.email,
          department: mockDdUser.department,
          role: 'user',
          ddUserId: mockDdUser.userId,
        },
      },
    });
  } catch (error) {
    console.error('[DD Auth] 免登失败:', error);
    return NextResponse.json(
      { success: false, error: '钉钉免登失败' },
      { status: 500 }
    );
  }
}
