// apps/workflow/app/login/page.tsx
// 登录/注册页面
//
// 这是一个客户端组件（'use client'），因为需要：
// 1. 使用 React 状态管理表单
// 2. 使用浏览器 API（fetch）
// 3. 使用路由跳转

'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// 定义表单验证规则
const authSchema = z.object({
  email: z.email('请输入有效的邮箱'),
  password: z.string().min(6, '密码至少6位'),
  name: z.string().optional(),
});

// 推导表单数据类型
// 结果：{ email: string, password: string, name?: string }
type AuthForm = z.infer<typeof authSchema>;

export default function LoginPage() {
  // 切换登录/注册模式
  const [isLogin, setIsLogin] = useState(true);

  // 登录/注册切换函数
  const onToggle = useCallback(() => {
    setIsLogin((t) => !t);
  }, []);

  // Next.js 路由，用于页面跳转
  const router = useRouter();

  // React Hook Form 配置
  const {
    register, // 注册输入字段
    handleSubmit, // 处理表单提交
    formState: { errors }, // 表单验证错误
  } = useForm<AuthForm>({ resolver: zodResolver(authSchema) });

  // 表单提交处理函数
  const onSubmit = async (data: AuthForm) => {
    // 根据当前模式选择 API 端点
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        // 登录/注册成功，跳转到首页
        router.push('/');
        // 刷新页面以更新布局中的用户状态
        router.refresh();
      } else {
        // 显示错误信息
        const { error } = await res.json();
        alert(error);
      }
    } catch (err) {
      alert('网络错误，请稍后重试');
    }
  };

  // 页面结构
  return (
    // 页面容器：全屏居中
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      {/* 登录卡片 */}
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        {/* 标题 */}
        <h1 className="text-2xl font-bold mb-6 text-center">
          {isLogin ? '登录' : '注册'}
        </h1>
        {/* 表单 */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 邮箱输入 */}
          <div>
            <input
              {...register('email')}
              type="email"
              placeholder="邮箱"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {/* 显示邮箱验证错误 */}
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
          {/* 姓名输入（仅注册模式显示） */}
          {!isLogin && (
            <div>
              <input
                {...register('name')}
                type="text"
                placeholder="用户名（可选）"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          {/* 密码输入 */}
          <div>
            <input
              {...register('password')}
              type="password"
              placeholder="密码"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
          {/* 提交按钮 */}
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isLogin ? '登录' : '注册'}
          </button>
        </form>
        {/* 切换登录/注册模式 */}
        <p className="mt-4 text-center text-sm text-gray-600">
          {isLogin ? '还没有账号？' : '已有账号？'}
          <button
            onClick={onToggle}
            className="text-blue-600 ml-1 hover:underline"
          >
            {isLogin ? '立即注册' : '去登录'}
          </button>
        </p>
      </div>
    </div>
  );
}
