// apps/workflow/app/api/auth/refresh/route.ts
// Token 刷新 API（无感续签核心）
//
// 当 Access Token 过期时，前端调用此接口
// 用 Refresh Token 换取新的双 Token

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, generateTokens, setAuthCookies } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // 1. 从 Cookie 获取 Refresh Token
    const refreshToken = request.cookies.get('refresh')?.value;
    if (!refreshToken) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    // 2. 验证 Refresh Token
    const decoded = verifyToken(refreshToken, 'refresh');
    if (!decoded) {
      return NextResponse.json(
        { error: '登录信息已过期，请重新登录' },
        { status: 401 },
      );
    }

    // 3. 生成新的双 Token
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      decoded.userId,
      decoded.email,
    );

    // 4. 设置新的 Cookie
    await setAuthCookies(accessToken, newRefreshToken);

    // 5. 返回成功
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('刷新 Token 失败：', err);
    return NextResponse.json(
      { error: '刷新失败，请重新登录' },
      { status: 500 },
    );
  }
}
