import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json(
        { error: '画像がアップロードされていません' },
        { status: 400 }
      );
    }

    // APIキーが設定されていない場合はダミーデータを返す
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        productName: 'サンプル商品（APIキー未設定）',
        category: 'グッズ',
        brand: '不明',
        keywords: ['sample', 'サンプル'],
      });
    }

    // 画像をBase64に変換
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');
    const mimeType = image.type;

    // OpenAI Vision APIで画像を分析
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `この商品の画像を分析して、以下の情報をJSON形式で返してください：
              - productName: 商品名（できるだけ詳細に。キャラクター名、作品名、商品タイプを含む）
              - category: カテゴリー（例：グッズ、おもちゃ、家電など）
              - brand: ブランド名やメーカー（わかる場合）
              - keywords: 検索に使えるキーワードの配列（日本語と英語両方）

              JSONのみを返してください。説明文は不要です。`,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAIからのレスポンスが空です');
    }

    // JSONを抽出（マークダウンのコードブロックを除去）
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('JSONの抽出に失敗しました');
    }

    const result = JSON.parse(jsonMatch[0]);

    return NextResponse.json(result);
  } catch (error) {
    console.error('画像分析エラー:', error);

    // エラー時もダミーデータを返す
    return NextResponse.json({
      productName: 'サンプル商品（認識エラー）',
      category: 'グッズ',
      brand: '不明',
      keywords: ['sample', 'サンプル'],
    });
  }
}
