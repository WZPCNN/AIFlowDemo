// apps/workflow/app/api/apps/route.ts
// 应用列表 API
//
// GET  /api/apps - 获取应用列表
// POST /api/apps - 创建新应用

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, getToken } from '@/lib/auth';

// 获取应用列表
export async function GET() {
  try {
    // 获取当前用户 Token
    const token = await getToken('access');
    if (!token) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    // 验证 Token
    const payload = verifyToken(token, 'access');
    if (!payload) {
      return NextResponse.json({ error: '登录已过期' }, { status: 401 });
    }

    // 查询用户的应用列表
    const apps = await prisma.app.findMany({
      where: { userId: payload.userId },
      orderBy: { createAt: 'desc' },
    });

    return NextResponse.json({ apps });
  } catch (err) {
    console.error('获取应用列表失败：', err);
    return NextResponse.json({ error: '获取应用列表失败' }, { status: 500 });
  }
}

// 创建新应用
export async function POST(request: NextRequest) {
  try {
    // 验证登录
    const token = await getToken('access');
    if (!token) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const payload = verifyToken(token, 'access');
    if (!payload) {
      return NextResponse.json({ error: '登录已过期' }, { status: 401 });
    }

    // 解析请求体
    const body = await request.json();
    const { name, description } = body;

    // 创建应用
    const app = await prisma.app.create({
      data: {
        name,
        description,
        userId: payload.userId,
      },
    });

    return NextResponse.json({ app });
  } catch (err) {
    console.error('创建应用失败：', err);
    return NextResponse.json({ error: '创建应用失败' }, { status: 500 });
  }
}
