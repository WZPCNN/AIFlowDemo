// apps/workflow/lib/password.ts
// 密码加密和验证工具
// 安全原则：
// 1. 永远不要存储明文密码
// 2. 使用 bcrypt 进行单向哈希（无法逆向解密）
// 3. 使用盐值（salt）防止彩虹表攻击
// 4. 盐值轮数越高越安全，但计算也越慢（12轮是平衡选择）

import bcrypt from 'bcryptjs';

// 盐值轮数（cost factor）
// 数值越高，哈希计算越慢，越难暴力破解
// 10轮：约100ms
// 12轮：约300ms（推荐）
// 14轮：约1s
const SALT_ROUNDS = 12;

/**
 * 对明文密码进行哈希加密
 * 
 * 示例：
 * const hashedPassword = await hashPassword('user123');
 * 返回：$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiAYMyzJ/I2y
 * @param password 明文密码
 * @returns 哈希后的密码字符串
 */
export async function hashPassword(password: string): Promise<string> {
  // bcrypt.hash 内部会：
  // 1. 生成随机盐值
  // 2. 将密码和盐值拼接
  // 3. 执行多轮哈希计算
  // 4. 返回格式：$2a$12$[22字符盐值][31字符哈希]
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * 验证明文密码是否与哈希密码匹配
 * 
 * 示例：
 * const isValid = await verifyPassword('user123', hashedPassword);
 * 返回 true 或 false
 * 
 * @param password 明文密码
 * @param hash 哈希密码（数据库存储）
 * @returns 布尔值，是否匹配
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // bcrypt.compare 内部会：
  // 1. 从 hash 中提取盐值
  // 2. 用同样的盐值对输入密码进行哈希
  // 3. 比较两个哈希是否相同
  return bcrypt.compare(password, hash);
}