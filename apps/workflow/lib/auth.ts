// apps/workflow/lib/auth.ts
// JWT 双 Token 方案：
// - Access Token：短期有效（15分钟），用于 API 认证
// - Refresh Token：长期有效（1天），用于换取新的 Access Token
// - 无感续签：Access Token 过期前，自动用 Refresh Token 换取新的 Access Token

// JWT（JSON Web Token）结构：
// header.payload.signature
// 示例：eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiIxMjMifQ.SflKxwRJSMeKKF2QT4fwpMe...
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// 从环境变量读取 JWT 密钥
// 生产环境应使用强随机字符串（至少32位）
const JWT_SECRET = process.env.JWT_SECRET!;

// Cookie 名称
const ACCESS_TOKEN_NAME = 'access';
const REFRESH_TOKEN_NAME = 'refresh';

// Token 有效期（单位：秒）
const ACCESS_TOKEN_MAX_AGE = 60 * 15; // 15分钟
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24; // 1天

// JWT Payload 类型定义
export interface JWTPayload {
  userId: string; // 用户唯一标识符
  email: string; // 用户邮箱（方便前端展示）
  type: 'access' | 'refresh'; // Token 类型
}

/**
 * 生成双 Token （Access Token + Refresh Token）
 *
 * @param userId 用户唯一标识符
 * @param email 用户邮箱
 * @returns { accessToken, refreshToken } 双 Token 对象
 */
export function generateTokens(
  userId: string,
  email: string,
): {
  accessToken: string;
  refreshToken: string;
} {
  // Access Token：短期有效，用于 API 认证
  const accessToken = jwt.sign({ userId, email, type: 'access' }, JWT_SECRET, {
    expiresIn: '15m',
  });

  // Refresh Token：长期有效，用于续签 Access Token
  const refreshToken = jwt.sign(
    { userId, email, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: '1d' },
  );

  return { accessToken, refreshToken };
}

/**
 * 验证 Access 或 Refresh Token
 *
 * @param token JWT 字符串
 * @param type token类型（'access' | 'refresh'）
 * @returns 解码后的 Payload，无效或类型不符则返回null
 */
export function verifyToken(
  token: string,
  type: 'access' | 'refresh',
): Omit<JWTPayload, 'type'> | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    if (decoded.type !== type) throw new Error('无效的token类型');
    return { userId: decoded.userId, email: decoded.email };
  } catch (err) {
    return null;
  }
}

/**
 * 设置双认证 Cookie（Access + Refresh）
 *
 * @param accessToken Access Token 字符串
 * @param refreshToken Refresh Token 字符串
 */
export async function setAuthCookies(
  accessToken: string,
  refreshToken: string,
): Promise<void> {
  const cookieStore = await cookies();

  // Access Token：全站可用，短期
  cookieStore.set(ACCESS_TOKEN_NAME, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: ACCESS_TOKEN_MAX_AGE,
    path: '/',
  });

  // Refresh Token：只在刷新接口使用，长期
  cookieStore.set(REFRESH_TOKEN_NAME, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: REFRESH_TOKEN_MAX_AGE,
    path: '/api/auth/refresh',
  });
}

/**
 * 清除双认证 Cookie（登出用）
 */
export async function removeAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_NAME);
  cookieStore.delete(REFRESH_TOKEN_NAME);
}

/**
 * 获取当前请求的 Token (Access | Refresh)
 *
 * @param type token类型（'access' | 'refresh'）
 * @returns Token 字符串，未登录则返回 undefined
 */
export async function getToken(
  type: 'access' | 'refresh',
): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(type)?.value;
}

// ==================== 兼容旧 API 的快捷方法 ====================

/**
 * 验证请求中的 Access Token（兼容旧版 oldVerifyToken）
 *
 * @param request NextRequest 对象
 * @returns Payload 或 null
 */
export async function oldVerifyToken(
  request?: Request,
): Promise<Omit<JWTPayload, 'type'> | null> {
  // 如果传入了 request，从请求头中读取（用于 API 路由）
  if (request) {
    // 优先从 Cookie 读取
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      const match = cookieHeader.match(
        new RegExp(`${ACCESS_TOKEN_NAME}=([^;]+)`),
      );
      if (match) {
        return verifyToken(match[1], 'access');
      }
    }
    return null;
  }

  // 否则从当前请求的 Cookie 读取（Server Component / Server Action）
  const token = await getToken('access');
  if (!token) return null;
  return verifyToken(token, 'access');
}
