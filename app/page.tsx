'use client';

import { useState } from 'react';

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [productName, setProductName] = useState<string>('');
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [showTemplate, setShowTemplate] = useState<boolean>(false);
  const [results, setResults] = useState<{
    productName: string;
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

  const handleSubmit = () => {
    if (!productName.trim()) {
      alert('商品名または特徴を入力してください');
      return;
    }

    const searchQuery = productName.trim();

    setResults({
      productName: searchQuery,
    });
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

          {imagePreview && (
            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                商品名または特徴を入力
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="例：鬼滅の刃 マグカップ"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />

              <button
                onClick={() => setShowHelp(!showHelp)}
                className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 underline"
              >
                商品名が分からない？
              </button>

              {showHelp && (
                <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                  <p className="font-semibold text-blue-900 mb-2">📱 スマホの場合：</p>
                  <p className="text-blue-800">写真を長押し → Googleで画像検索</p>
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!productName.trim()}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            検索サイトを表示
          </button>
        </div>

        {results && (
          <>
            {/* 出品テンプレート */}
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">📝 出品テンプレート</h2>
                <button
                  onClick={() => setShowTemplate(!showTemplate)}
                  className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                >
                  {showTemplate ? '閉じる' : '表示する'}
                </button>
              </div>

              {showTemplate && (
                <div className="space-y-6">
                  {/* タイトル案 */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      タイトル案（メルカリ向け）
                    </label>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-gray-800">【美品】{results.productName}</p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`【美品】${results.productName}`);
                          alert('コピーしました！');
                        }}
                        className="mt-2 text-xs text-indigo-600 hover:text-indigo-800"
                      >
                        📋 コピー
                      </button>
                    </div>
                  </div>

                  {/* 説明文案 */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      説明文テンプレート
                    </label>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-gray-800 whitespace-pre-line text-sm">
                        {`${results.productName}です。

【商品の状態】
目立った傷や汚れはありません。
写真でご確認ください。

【発送について】
24時間以内に発送いたします。
丁寧な梱包を心がけます。

【注意事項】
自宅保管品のため、神経質な方はご遠慮ください。
即購入OKです！

よろしくお願いいたします。`}
                      </p>
                      <button
                        onClick={() => {
                          const template = `${results.productName}です。

【商品の状態】
目立った傷や汚れはありません。
写真でご確認ください。

【発送について】
24時間以内に発送いたします。
丁寧な梱包を心がけます。

【注意事項】
自宅保管品のため、神経質な方はご遠慮ください。
即購入OKです！

よろしくお願いいたします。`;
                          navigator.clipboard.writeText(template);
                          alert('コピーしました！');
                        }}
                        className="mt-2 text-xs text-indigo-600 hover:text-indigo-800"
                      >
                        📋 コピー
                      </button>
                    </div>
                  </div>

                  {/* 価格目安 */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      💰 価格の目安
                    </label>
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <p className="text-sm text-yellow-800">
                        まずは各サイトで相場を確認してから価格を決めましょう。<br />
                        相場より少し高めに設定して、値下げ交渉の余地を残すのがコツです。
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 検索リンク */}
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{results.productName}</h2>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <a
                href={`https://jp.mercari.com/search?keyword=${encodeURIComponent(results.productName)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-red-50 rounded-lg p-6 hover:bg-red-100 transition-colors border-2 border-red-200 hover:border-red-400"
              >
                <h3 className="font-semibold text-red-800 mb-2 flex items-center justify-between">
                  <span>
                    <span className="mr-2">🛍️</span> メルカリ
                  </span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </h3>
                <p className="text-sm text-red-700">タップして相場を確認</p>
              </a>

              <a
                href={`https://auctions.yahoo.co.jp/search/search?p=${encodeURIComponent(results.productName)}&va=${encodeURIComponent(results.productName)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-purple-50 rounded-lg p-6 hover:bg-purple-100 transition-colors border-2 border-purple-200 hover:border-purple-400"
              >
                <h3 className="font-semibold text-purple-800 mb-2 flex items-center justify-between">
                  <span>
                    <span className="mr-2">🔨</span> ヤフオク!
                  </span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </h3>
                <p className="text-sm text-purple-700">タップして相場を確認</p>
              </a>

              <a
                href={`https://fril.jp/search/${encodeURIComponent(results.productName)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-50 rounded-lg p-6 hover:bg-blue-100 transition-colors border-2 border-blue-200 hover:border-blue-400"
              >
                <h3 className="font-semibold text-blue-800 mb-2 flex items-center justify-between">
                  <span>
                    <span className="mr-2">🏪</span> ラクマ
                  </span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </h3>
                <p className="text-sm text-blue-700">タップして相場を確認</p>
              </a>

              <a
                href={`https://zenplus.jp/search?q=${encodeURIComponent(results.productName)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-50 rounded-lg p-6 hover:bg-green-100 transition-colors border-2 border-green-200 hover:border-green-400"
              >
                <h3 className="font-semibold text-green-800 mb-2 flex items-center justify-between">
                  <span>
                    <span className="mr-2">🌏</span> ZenPlus
                  </span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </h3>
                <p className="text-sm text-green-700">タップして相場を確認</p>
              </a>
            </div>
          </div>
          </>
        )}
      </div>
    </div>
  );
}
