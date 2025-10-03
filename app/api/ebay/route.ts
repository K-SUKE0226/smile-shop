import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

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

    const appId = process.env.EBAY_APP_ID;

    if (!appId) {
      // APIキーがない場合はダミーデータを返す
      return NextResponse.json({
        min: 10,
        max: 50,
        avg: 25,
        count: 15,
        currency: 'USD',
        note: 'eBay APIキーが設定されていません。ダミーデータを表示しています。'
      });
    }

    // eBay Finding APIを使用
    const apiUrl = 'https://svcs.ebay.com/services/search/FindingService/v1';
    const params = {
      'OPERATION-NAME': 'findItemsByKeywords',
      'SERVICE-VERSION': '1.0.0',
      'SECURITY-APPNAME': appId,
      'RESPONSE-DATA-FORMAT': 'JSON',
      'REST-PAYLOAD': '',
      'keywords': query,
      'paginationInput.entriesPerPage': '100',
      'sortOrder': 'PricePlusShippingLowest',
    };

    const response = await axios.get(apiUrl, {
      params,
      timeout: 10000,
    });

    const items = response.data?.findItemsByKeywordsResponse?.[0]?.searchResult?.[0]?.item || [];

    if (items.length === 0) {
      return NextResponse.json({
        min: 10,
        max: 50,
        avg: 25,
        count: 0,
        currency: 'USD',
        note: 'eBayで商品が見つかりませんでした。'
      });
    }

    // 価格情報を抽出（USD）
    const prices: number[] = items
      .map((item: any) => {
        const price = parseFloat(item.sellingStatus?.[0]?.currentPrice?.[0]?.__value__ || 0);
        return price;
      })
      .filter((price: number) => price > 0);

    if (prices.length === 0) {
      return NextResponse.json({
        min: 10,
        max: 50,
        avg: 25,
        count: 0,
        currency: 'USD',
        note: '価格情報を取得できませんでした。'
      });
    }

    // 統計情報を計算
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = Math.round((prices.reduce((a, b) => a + b, 0) / prices.length) * 100) / 100;

    return NextResponse.json({
      min: Math.round(min * 100) / 100,
      max: Math.round(max * 100) / 100,
      avg,
      count: prices.length,
      currency: 'USD',
    });
  } catch (error) {
    console.error('eBay相場取得エラー:', error);

    // エラー時はダミーデータを返す
    return NextResponse.json({
      min: 10,
      max: 50,
      avg: 25,
      count: 15,
      currency: 'USD',
      note: 'eBayへのアクセスに失敗しました。ダミーデータを表示しています。'
    });
  }
}
