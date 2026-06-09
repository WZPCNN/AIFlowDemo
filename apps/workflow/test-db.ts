// apps/workflow/test-db.ts
// 数据库连接测试

import { prisma } from './lib/prisma';

(async function main() {
  try {
    // 尝试查询数据库版本
    const res = await prisma.$queryRaw`SELECT version()`;
    console.log('☑️ 数据库连接成功');
    console.log('PostgreSQL 版本：', res);
    // 尝试创建一条用户记录
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: 'hashed_pwd',
        name: '测试用户',
      },
    });
    console.log('☑️ 创建用户成功：', user);
    // 查询所有用户
    const users = await prisma.user.findMany();
    console.log('☑️ 查询成功，当前用户：', users);
    // 清理测试数据
    await prisma.user.delete({ where: { id: user.id } });
    console.log('☑️ 清理测试数据完成');
  } catch (err) {
    console.log('❎ 数据库操作失败：', err);
  } finally {
    // 断开数据库连接
    await prisma.$disconnect();
  }
})();
