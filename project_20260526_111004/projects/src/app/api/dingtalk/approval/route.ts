import { NextRequest, NextResponse } from 'next/server';

// 预留：钉钉审批实例推送接口
export async function POST(request: NextRequest) {
  return NextResponse.json({ success: true, message: '钉钉对接接口预留，待后续实现' });
}

// 预留：钉钉审批结果回调接口
export async function PUT(request: NextRequest) {
  return NextResponse.json({ success: true, message: '钉钉对接接口预留，待后续实现' });
}
