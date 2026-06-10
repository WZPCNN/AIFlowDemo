// apps/workflow/lib/utils.ts
// 通用工具函数

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合并 Tailwind CSS 类名
 *
 * 使用示例：
 *   cn('px-4 py-2', 'bg-blue-500', className)
 *   自动处理冲突的类名（如 px-4 和 px-6）
 *
 * @param inputs 类名列表
 * @returns 合并后的类名字符串
 */
export function cn(...inputs: ClassValue[]) {
  // clsx：条件性地组合类名
  // twMerge：智能合并 Tailwind 类名（处理冲突）
  return twMerge(clsx(inputs));
}

/**
 * 延迟函数
 *
 * @param ms 毫秒数
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 格式化日期
 *
 * @param date 日期对象或字符串
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | string): string {
  // 如果传入的是字符串则转换为 Date 对象
  const d = typeof date === 'string' ? new Date(date) : date;
  // 使用中文本地化格式输出：年-月-日 时:分
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric', // 完整年份（如 2026）
    month: 'long', // 完整月份（如 6月）
    day: 'numeric', // 日期数字
    hour: '2-digit', // 小时（两位数）
    minute: '2-digit', // 分钟（两位数）
  });
}
