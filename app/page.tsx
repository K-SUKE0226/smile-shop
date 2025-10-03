'use client';

import { useState } from 'react';

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    productName: string;
    mercari: { min: number; max: number; avg: number; count: number };
    zenplus: { min: number; max: number; avg: number; count: number };
    ebay: { min: number; max: number; avg: number; count: number; currency: string };
  } | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!image) return;

    setLoading(true);
    try {
      // 1. 画像認識
      const formData = new FormData();
      formData.append('image', image);

      const analyzeResponse = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!analyzeResponse.ok) {
        throw new Error('画像認識に失敗しました');
      }

      const analyzeData = await analyzeResponse.json();
      console.log('認識結果:', analyzeData);

      // 2. 相場取得（並列実行）
      const searchQuery = analyzeData.productName || analyzeData.keywords?.[0] || '商品';

      const [mercariData, zenplusData, ebayData] = await Promise.all([
        fetch(`/api/mercari?q=${encodeURIComponent(searchQuery)}`).then(res => res.json()),
        fetch(`/api/zenplus?q=${encodeURIComponent(searchQuery)}`).then(res => res.json()),
        fetch(`/api/ebay?q=${encodeURIComponent(searchQuery)}`).then(res => res.json()),
      ]);

      setResults({
        productName: analyzeData.productName || '商品名不明',
        mercari: mercariData,
        zenplus: zenplusData,
        ebay: ebayData,
      });
    } catch (error) {
      console.error('エラー:', error);
      alert('処理中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">スマイルショップ</h1>
          <p className="text-gray-600">商品写真から相場をチェック</p>
        </header>

        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6">
          <div className="mb-6">
            <label className="block mb-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-500 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto rounded" />
                ) : (
                  <div>
                    <svg className="mx-auto h-16 w-16 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="mt-3 text-base font-medium text-gray-700">📸 写真を撮る</p>
                    <p className="mt-1 text-xs text-gray-500">またはギャラリーから選択</p>
                  </div>
                )}
              </div>
            </label>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!image || loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '分析中...' : '相場を調べる'}
          </button>
        </div>

        {results && (
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{results.productName}</h2>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="bg-red-50 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-3 flex items-center">
                  <span className="mr-2">🇯🇵</span> メルカリ
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="flex justify-between">
                    <span className="text-gray-600">最安値:</span>
                    <span className="font-semibold">¥{results.mercari.min.toLocaleString()}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-600">最高値:</span>
                    <span className="font-semibold">¥{results.mercari.max.toLocaleString()}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-600">平均:</span>
                    <span className="font-semibold text-red-600">¥{results.mercari.avg.toLocaleString()}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-600">出品数:</span>
                    <span className="font-semibold">{results.mercari.count}件</span>
                  </p>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-3 flex items-center">
                  <span className="mr-2">🌏</span> ZenPlus
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="flex justify-between">
                    <span className="text-gray-600">最安値:</span>
                    <span className="font-semibold">¥{results.zenplus.min.toLocaleString()}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-600">最高値:</span>
                    <span className="font-semibold">¥{results.zenplus.max.toLocaleString()}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-600">平均:</span>
                    <span className="font-semibold text-green-600">¥{results.zenplus.avg.toLocaleString()}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-600">出品数:</span>
                    <span className="font-semibold">{results.zenplus.count}件</span>
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                  <span className="mr-2">🌐</span> eBay
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="flex justify-between">
                    <span className="text-gray-600">最安値:</span>
                    <span className="font-semibold">${results.ebay.min}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-600">最高値:</span>
                    <span className="font-semibold">${results.ebay.max}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-600">平均:</span>
                    <span className="font-semibold text-blue-600">${results.ebay.avg}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-600">出品数:</span>
                    <span className="font-semibold">{results.ebay.count}件</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
