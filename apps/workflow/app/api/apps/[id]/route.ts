// apps/workflow/app/api/apps/[id]/route.ts
// 应用详情 API
//
// GET    /api/apps/[id] - 获取应用详情
// PUT    /api/apps/[id] - 更新应用
// DELETE /api/apps/[id] - 删除应用

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, getToken } from '@/lib/auth';

// 获取应用详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const token = await getToken('access');
    if (!token) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const payload = verifyToken(token, 'access');
    if (!payload) {
      return NextResponse.json({ error: '登录已过期' }, { status: 401 });
    }

    const app = await prisma.app.findUnique({
      where: { id },
      include: {
        workflows: true,
      },
    });

    if (!app || app.userId !== payload.userId) {
      return NextResponse.json({ error: '应用不存在' }, { status: 404 });
    }

    return NextResponse.json({ app });
  } catch (err) {
    console.error('获取应用详情失败：', err);
    return NextResponse.json({ error: '获取应用详情失败' }, { status: 500 });
  }
}

// 更新应用
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const token = await getToken('access');
    if (!token) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const payload = verifyToken(token, 'access');
    if (!payload) {
      return NextResponse.json({ error: '登录已过期' }, { status: 401 });
    }

    const body = await request.json();

    // 检查应用所有权
    const existingApp = await prisma.app.findUnique({
      where: { id },
    });

    if (!existingApp || existingApp.userId !== payload.userId) {
      return NextResponse.json({ error: '应用不存在' }, { status: 404 });
    }

    const app = await prisma.app.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ app });
  } catch (err) {
    console.error('更新应用失败：', err);
    return NextResponse.json({ error: '更新应用失败' }, { status: 500 });
  }
}

// 删除应用
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const token = await getToken('access');
    if (!token) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const payload = verifyToken(token, 'access');
    if (!payload) {
      return NextResponse.json({ error: '登录已过期' }, { status: 401 });
    }

    // 检查应用所有权
    const existingApp = await prisma.app.findUnique({
      where: { id },
    });

    if (!existingApp || existingApp.userId !== payload.userId) {
      return NextResponse.json({ error: '应用不存在' }, { status: 404 });
    }

    await prisma.app.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('删除应用失败：', err);
    return NextResponse.json({ error: '删除应用失败' }, { status: 500 });
  }
}
