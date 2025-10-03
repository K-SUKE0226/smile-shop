'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Template {
  id: string;
  category: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showPreview, setShowPreview] = useState<string | null>(null);

  useEffect(() => {
    // localStorageからテンプレートを読み込む
    const saved = localStorage.getItem('mercari_templates');
    if (saved) {
      setTemplates(JSON.parse(saved));
    }
  }, []);

  const handleDelete = (id: string) => {
    if (!confirm('このテンプレートを削除してもよろしいですか？')) {
      return;
    }
    const updated = templates.filter(t => t.id !== id);
    setTemplates(updated);
    localStorage.setItem('mercari_templates', JSON.stringify(updated));
  };

  const previewTemplate = templates.find(t => t.id === showPreview);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            戻る
          </Link>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">テンプレート管理</h1>
          <p className="text-gray-600">メルカリ出品テンプレートを管理</p>
        </header>

        {/* New Template Button */}
        <div className="mb-6">
          <Link
            href="/templates/new"
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            ＋ 新規作成
          </Link>
        </div>

        {/* Templates List */}
        {templates.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <p className="text-gray-500 text-lg">まだテンプレートがありません</p>
            <p className="text-gray-400 text-sm mt-2">「新規作成」から最初のテンプレートを作りましょう</p>
          </div>
        ) : (
          <div className="space-y-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {template.category}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      最終更新: {new Date(template.updatedAt).toLocaleDateString('ja-JP')}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setShowPreview(showPreview === template.id ? null : template.id)}
                        className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                      >
                        {showPreview === template.id ? '閉じる' : 'プレビュー'}
                      </button>
                      <Link
                        href={`/templates/edit/${template.id}`}
                        className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                      >
                        編集
                      </Link>
                      <button
                        onClick={() => handleDelete(template.id)}
                        className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                {showPreview === template.id && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        タイトル
                      </label>
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <p className="text-gray-800">{template.title}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        説明文
                      </label>
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <p className="text-gray-800 whitespace-pre-line text-sm">
                          {template.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Preview Modal */}
        {previewTemplate && showPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {previewTemplate.category}
                </h2>
                <button
                  onClick={() => setShowPreview(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    タイトル
                  </label>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <p className="text-gray-800">{previewTemplate.title}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    説明文
                  </label>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <p className="text-gray-800 whitespace-pre-line text-sm">
                      {previewTemplate.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
