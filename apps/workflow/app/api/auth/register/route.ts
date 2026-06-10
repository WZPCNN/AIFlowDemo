// apps/workflow/app/api/auth/register/route.ts
// 用户注册 API
//
// 请求方法：POST
// 请求体：{ email: string, password: string, name?: string }
// 响应：{ success: boolean, user: { id, email, name } }

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { hashPassword } from '@/lib/password';
import { generateTokens, setAuthCookies } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 使用 Zod 定义请求体验证规则
// Zod 是一个 TypeScript 优先的数据验证库
const registerSchema = z.object({
  // 邮箱验证：必须是有效邮箱格式
  email: z.email('请输入有效的邮箱地址'),

  // 密码验证：至少 6 位
  password: z.string().min(6, '密码至少6位字符'),

  // 用户名：可选，字符串
  name: z.string().optional(),
});

// 定义 POST 请求处理器
// Next.js App Router 中，API 路由通过导出 HTTP 方法函数实现
export async function POST(request: NextRequest) {
  try {
    // 1. 解析请求体
    const body = await request.json();

    // 2. 验证输入数据
    // parse 方法会在验证失败时抛出 ZodError
    const { email, password, name } = registerSchema.parse(body);

    // 3. 检查邮箱是否已存在
    // findUnique 用于查询唯一字段（带 @unique 的字段）
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // 返回 400 错误，但不暴露具体信息（防止枚举攻击）
      return NextResponse.json(
        { error: '该邮箱已注册，请登录' },
        { status: 400 },
      );
    }

    // 4. 密码加密
    // 永远不要存储明文密码！
    const hashedPassword = await hashPassword(password);

    // 5. 创建用户记录
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword, // 存储哈希值
        name,
      },
    });

    // 6. 生成双 Token（Access + Refresh）
    const { accessToken, refreshToken } = generateTokens(user.id, user.email);

    // 7. 设置双 Cookie
    await setAuthCookies(accessToken, refreshToken);

    // 8. 返回成功响应（不包含密码！）
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (err) {
    // 处理 Zod 验证错误
    if (err instanceof z.ZodError) {
      // 返回第一个错误信息
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    // 处理其他错误（不要暴露内部错误信息）
    console.log('注册失败！', err);
    return NextResponse.json(
      { error: '注册失败，请稍后再试！' },
      { status: 500 },
    );
  }
}
