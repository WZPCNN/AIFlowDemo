// apps/workflow/app/apps/page.tsx
// 应用列表页
//
// 展示用户创建的所有应用，支持创建新应用

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

// 应用数据类型
interface App {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  isPublished: boolean;
  createdAt: string;
}

export default function AppsPage() {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const router = useRouter();

  // 加载应用列表
  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    try {
      const res = await apiFetch('/api/apps');
      if (!res.ok) {
        // 如果仍然失败，说明 Refresh Token 也过期了
        // apiFetch 内部会自动跳转登录页
        return;
      }
      const data = await res.json();
      setApps(data.apps);
    } catch (err) {
      console.error('加载应用列表失败：', err);
    } finally {
      setLoading(false);
    }
  };

  // 删除应用
  const deleteApp = async (id: string) => {
    if (!confirm('确定要删除这个应用吗？')) return;

    try {
      const res = await fetch(`/api/apps/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setApps(apps.filter((app) => app.id !== id));
      }
    } catch (err) {
      console.error('删除应用失败：', err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">应用工作室</h1>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + 创建应用
          </button>
        </div>
      </header>

      {/* 应用列表 */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {apps.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">还没有创建任何应用</p>
            <button
              onClick={() => setShowCreateDialog(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg"
            >
              创建第一个应用
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apps.map((app) => (
              <AppCard
                key={app.id}
                app={app}
                onDelete={() => deleteApp(app.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* 创建应用弹窗 */}
      {showCreateDialog && (
        <CreateAppDialog
          onClose={() => setShowCreateDialog(false)}
          onCreated={fetchApps}
        />
      )}
    </div>
  );
}

// 应用卡片组件
function AppCard({ app, onDelete }: { app: App; onDelete: () => void }) {
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="text-4xl">{app.icon}</div>
        {app.isPublished && (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
            已发布
          </span>
        )}
      </div>

      <h3 className="text-lg font-bold mb-2">{app.name}</h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {app.description || '暂无描述'}
      </p>

      <div className="flex justify-between items-center">
        <Link
          href={`/apps/${app.id}`}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          编辑工作流 →
        </Link>
        <button
          onClick={onDelete}
          className="text-red-600 hover:text-red-800 text-sm"
        >
          删除
        </button>
      </div>
    </div>
  );
}

// 应用弹窗组件
function CreateAppDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });

      if (res.ok) {
        onCreated();
        onClose();
      }
    } catch (err) {
      console.error('创建应用失败：', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">创建新应用</h2>
        <form action="" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              应用名称
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="请输入应用名称"
              required
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-1"
            >
              应用描述（可选）
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="请输入应用描述"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? '创建中...' : '创建'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
