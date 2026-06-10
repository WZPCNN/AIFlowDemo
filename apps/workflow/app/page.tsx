// apps/workflow/app/page.tsx
// 首页（落地页）
//
// 这是用户访问网站时看到的第一个页面
// 展示产品特性，引导用户开始使用

import Link from 'next/link';

export default function Home() {
  return (
    // 页面容器
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          {/* Logo */}
          <h1 className="text-2xl font-bold text-gray-900">🐧 AI 工作流</h1>
          {/* 导航按钮 */}
          <div className="space-x-4">
            <Link
              href="/workflow"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              创建工作流
            </Link>
            <Link
              href="/knowledge"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              知识库
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              登录
            </Link>
          </div>
        </div>
      </header>

      {/* 主要内容区 */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* 英雄区域 */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            可视化 AI 工作流编排平台
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            拖拽式节点编辑器，集成大语言模型、知识库检索、HTTP 请求等功能，让 AI
            应用开发变得简单
          </p>
          <Link
            href="/workflow"
            className="inline-block px-8 py-3 mb-16 bg-blue-600 text-white rounded-lg text-lg hover:bg-blue-700 transition-colors"
          >
            开始创建 →
          </Link>

          {/* 特性展示 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon="🐧"
              title="大模型集成"
              description="支持 Ollama 本地模型，可配置提示词、温度、最大 Token 等参数"
            />
            <FeatureCard
              icon="📕"
              title="知识库 RAG"
              description="文档上传、文本分块、向量检索，实现语义搜索增强生成"
            />
            <FeatureCard
              icon="🔀"
              title="条件分支"
              description="支持条件判断，实现复杂业务逻辑的动态路由"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

// 特性卡片组件
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
