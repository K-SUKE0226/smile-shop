'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Template {
  id: string;
  category: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export default function NewTemplatePage() {
  const router = useRouter();
  const [category, setCategory] = useState('');
  const [referenceUrls, setReferenceUrls] = useState(['', '', '']);
  const [manualMode, setManualMode] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUrlChange = (index: number, value: string) => {
    const updated = [...referenceUrls];
    updated[index] = value;
    setReferenceUrls(updated);
  };

  const handleAnalyzeUrls = async () => {
    const filledUrls = referenceUrls.filter(url => url.trim());
    if (filledUrls.length === 0) {
      alert('参考URLを最低1つ入力してください');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urls: filledUrls }),
      });

      if (!response.ok) {
        throw new Error('URLの解析に失敗しました');
      }

      const data = await response.json();

      if (data.template) {
        setTitle(data.template.title);
        setDescription(data.template.description);
        setManualMode(true); // 手動モードに切り替えて編集可能に
        alert('URLからテンプレートを生成しました！内容を確認して保存してください。');
      }
    } catch (error) {
      console.error('URL解析エラー:', error);
      alert('URLの解析に失敗しました。手動モードで入力してください。');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!category.trim()) {
      alert('カテゴリー名を入力してください');
      return;
    }

    if (!title.trim() || !description.trim()) {
      alert('タイトルと説明文を入力してください');
      return;
    }

    const newTemplate: Template = {
      id: Date.now().toString(),
      category: category.trim(),
      title: title.trim(),
      description: description.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // localStorageに保存
    const saved = localStorage.getItem('mercari_templates');
    const templates: Template[] = saved ? JSON.parse(saved) : [];
    templates.push(newTemplate);
    localStorage.setItem('mercari_templates', JSON.stringify(templates));

    alert('テンプレートを保存しました！');
    router.push('/templates');
  };

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
          <h1 className="text-4xl font-bold text-gray-800 mb-2">新規テンプレート作成</h1>
          <p className="text-gray-600">参考URLから学習、または手動で作成</p>
        </header>

        {/* Main Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
          {/* Category Input */}
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

          {/* Mode Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">作成方法</span>
            <div className="flex gap-2">
              <button
                onClick={() => setManualMode(false)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  !manualMode
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                URLから学習
              </button>
              <button
                onClick={() => setManualMode(true)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  manualMode
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                手動入力
              </button>
            </div>
          </div>

          {/* URL Mode */}
          {!manualMode && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                参考にしたいメルカリの出品ページURLを入力してください（1〜3個）
              </p>
              {referenceUrls.map((url, index) => (
                <div key={index}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    参考URL {index + 1}
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => handleUrlChange(index, e.target.value)}
                    placeholder="https://jp.mercari.com/item/..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              ))}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 複数のURLを入力すると、共通パターンを学習してテンプレートを生成します
                </p>
              </div>
              <button
                onClick={handleAnalyzeUrls}
                disabled={loading || referenceUrls.filter(url => url.trim()).length === 0}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '解析中...' : 'URLを解析してテンプレート生成'}
              </button>
            </div>
          )}

          {/* Manual Mode */}
          {manualMode && (
            <div className="space-y-4">
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
            </div>
          )}

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
