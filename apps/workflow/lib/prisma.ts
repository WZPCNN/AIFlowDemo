// apps/workflow/lib/prisma.ts
// Prisma Client 单例配置
// 为什么需要单例？
// Next.js 在开发环境下会频繁热重载（HOT Reload）
// 每次重载都会重新执行模块，如果没有单例
// 会创建多个 Prisma Client 实例，导致连接池耗尽
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

// 定义全局变量类型，用于存储 Prisma Client 实例
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 从环境变量读取数据库连接字符串
const connectionString = `${process.env.DATABASE_URL}`;

// 创建 PostgreSQL 驱动适配器，Prisma 7 不再内置数据库驱动，需要显式指定
const adapter = new PrismaPg({ connectionString });

// 如果全局已存在实例则复用，否则创建新的实例
// 生产环境每次请求都会创建新实例（无热重载问题）
// 开发环境复用全局实例（避免热重载导致多实例问题）
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

// 开发环境下，将实例挂载到全局对象
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
