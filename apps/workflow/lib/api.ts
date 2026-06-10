// apps/workflow/lib/api.ts
// 前端 API 请求封装（支持无感续签）
//
// 使用方式：
//   import { apiFetch } from '@/lib/api'
//   const res = await apiFetch('/api/apps')

/**
 * 带无感续签的 fetch 封装
 *
 * 原理：
 * 1. 正常发送请求（携带 Access Token Cookie）
 * 2. 如果返回 401（Access Token 过期）
 * 3. 自动调用 /api/auth/refresh 换取新 Token
 * 4. 重试原请求
 * 5. 如果刷新也失败，跳转登录页
 */
export async function apiFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  // 第一次请求
  let res = await fetch(url, {
    ...options,
    credentials: 'include', // 自动携带 Cookie
  });

  // Access Token 过期，尝试刷新
  if (res.status === 401) {
    console.log('[Auth] Access Token 过期，尝试刷新...');

    const refreshRes = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (refreshRes.ok) {
      // 刷新成功，重试原请求
      console.log('[Auth] 刷新成功，重试请求...');
      res = await fetch(url, {
        ...options,
        credentials: 'include',
      });
    } else {
      // Refresh Token 也过期，跳转登录
      console.log('[Auth] Refresh Token 过期，跳转登录...');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('登录已过期');
    }
  }

  return res;
}

/**
 * 便捷方法：GET 请求
 */
export async function apiGet(url: string): Promise<Response> {
  return apiFetch(url, { method: 'GET' });
}

/**
 * 便捷方法：POST 请求
 */
export async function apiPost(url: string, body: unknown): Promise<Response> {
  return apiFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
