// apps/workflow/app/api/auth/login/route.ts
// 用户登录 API
//
// 请求方法：POST
// 请求体：{ email: string, password: string }
// 响应：{ success: boolean, user: { id, email, name } }

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyPassword } from '@/lib/password';
import { generateTokens, setAuthCookies } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 登录请求体验证规则
const loginSchema = z.object({
  email: z.email('请输入有效的邮箱'),
  password: z.string().min(6, '请输入密码'),
});

export async function POST(request: NextRequest) {
  try {
    // 1. 解析并验证请求体
    const body = await request.json();
    // 校验
    const { email, password } = loginSchema.parse(body);

    // 2. 查询用户
    const user = await prisma.user.findUnique({ where: { email } });

    // 3. 用户不存在
    // 注意：不要告诉用户是"邮箱不存在"还是"密码错误"
    // 防止攻击者枚举有效邮箱
    if (!user) {
      return NextResponse.json({ error: '邮箱或密码错误' }, { status: 400 });
    }

    // 4. 验证密码
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: '邮箱或密码错误' }, { status: 400 });
    }

    // 5. 生成双 Token 并设置 Cookie
    const { accessToken, refreshToken } = generateTokens(user.id, user.email);
    await setAuthCookies(accessToken, refreshToken);

    // 6. 返回用户信息
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    console.error('登陆失败：', err);
    NextResponse.json({ error: '登陆失败，请稍后重试！' }, { status: 500 });
  }
}
