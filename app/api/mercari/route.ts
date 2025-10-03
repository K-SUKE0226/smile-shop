import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        { error: '検索キーワードが指定されていません' },
        { status: 400 }
      );
    }

    // メルカリの検索URLを構築
    const searchUrl = `https://jp.mercari.com/search?keyword=${encodeURIComponent(query)}`;

    // メルカリのページを取得
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    const $ = cheerio.load(response.data);
    const prices: number[] = [];

    // 価格情報を抽出（メルカリのHTMLから価格を取得）
    // 注意: メルカリはSPAなので、実際にはJavaScriptでレンダリングされるため、
    // この方法では正確なデータが取得できない可能性があります
    $('[data-testid="item-cell"]').each((i, element) => {
      const priceText = $(element).find('[data-testid="price"]').text();
      const price = parseInt(priceText.replace(/[^0-9]/g, ''));
      if (price && !isNaN(price)) {
        prices.push(price);
      }
    });

    // 価格が取得できなかった場合はダミーデータを返す
    if (prices.length === 0) {
      return NextResponse.json({
        min: 500,
        max: 2000,
        avg: 1000,
        count: 10,
        note: 'メルカリからデータを取得できませんでした。ダミーデータを表示しています。'
      });
    }

    // 統計情報を計算
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

    return NextResponse.json({
      min,
      max,
      avg,
      count: prices.length,
    });
  } catch (error) {
    console.error('メルカリ相場取得エラー:', error);

    // エラー時はダミーデータを返す
    return NextResponse.json({
      min: 500,
      max: 2000,
      avg: 1000,
      count: 10,
      note: 'メルカリへのアクセスに失敗しました。ダミーデータを表示しています。'
    });
  }
}
