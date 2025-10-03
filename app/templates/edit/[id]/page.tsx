'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Template {
  id: string;
  category: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export default function EditTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('mercari_templates');
    if (saved) {
      const templates: Template[] = JSON.parse(saved);
      const template = templates.find(t => t.id === id);
      if (template) {
        setCategory(template.category);
        setTitle(template.title);
        setDescription(template.description);
      } else {
        alert('テンプレートが見つかりませんでした');
        router.push('/templates');
      }
    }
    setLoading(false);
  }, [id, router]);

  const handleSave = () => {
    if (!category.trim() || !title.trim() || !description.trim()) {
      alert('すべての項目を入力してください');
      return;
    }

    const saved = localStorage.getItem('mercari_templates');
    if (saved) {
      const templates: Template[] = JSON.parse(saved);
      const index = templates.findIndex(t => t.id === id);
      if (index !== -1) {
        templates[index] = {
          ...templates[index],
          category: category.trim(),
          title: title.trim(),
          description: description.trim(),
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem('mercari_templates', JSON.stringify(templates));
        alert('テンプレートを更新しました！');
        router.push('/templates');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-8 flex items-center justify-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <Link
            href="/templates"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            テンプレート管理に戻る
          </Link>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">テンプレート編集</h1>
          <p className="text-gray-600">テンプレートの内容を編集</p>
        </header>

        {/* Edit Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              カテゴリー名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="例：マグカップ、フィギュア、ゲームソフト"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              商品名にこのキーワードが含まれていると自動でテンプレートが適用されます
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              タイトルテンプレート <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例：【美品】{商品名}"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              {'{商品名}'} と入力すると、実際の商品名に置き換わります
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              説明文テンプレート <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={`例：
{商品名}です。

【商品の状態】
目立った傷や汚れはありません。
写真でご確認ください。

【発送について】
24時間以内に発送いたします。
丁寧な梱包を心がけます。`}
              rows={12}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              使える変数: {'{商品名}'}, {'{価格}'}, {'{状態}'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              保存
            </button>
            <Link
              href="/templates"
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-center"
            >
              キャンセル
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
