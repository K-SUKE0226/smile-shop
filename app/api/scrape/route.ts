import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { urls } = await request.json();

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: 'URLが指定されていません' },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      urls.filter((url: string) => url.trim()).map(async (url: string) => {
        try {
          const response = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
          });

          if (!response.ok) {
            return { url, error: 'ページの取得に失敗しました' };
          }

          const html = await response.text();

          // タイトルを抽出
          const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
          const title = titleMatch ? titleMatch[1].replace(' - メルカリ', '').trim() : '';

          // 説明文を抽出（metaタグから）
          const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
          let description = descMatch ? descMatch[1].trim() : '';

          // もしくはog:descriptionから
          if (!description) {
            const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
            description = ogDescMatch ? ogDescMatch[1].trim() : '';
          }

          return {
            url,
            title,
            description,
          };
        } catch (error) {
          console.error(`URL解析エラー (${url}):`, error);
          return { url, error: 'URL解析に失敗しました' };
        }
      })
    );

    // エラーがないものだけをフィルタ
    const validResults = results.filter((r) => !('error' in r));

    if (validResults.length === 0) {
      return NextResponse.json(
        { error: 'すべてのURLの解析に失敗しました' },
        { status: 500 }
      );
    }

    // 複数のURLから共通パターンを学習してテンプレートを生成
    const titles = validResults.map((r) => r.title).filter((t): t is string => !!t);
    const descriptions = validResults.map((r) => r.description).filter((d): d is string => !!d);

    // タイトルのテンプレート生成
    const titleTemplate = generateTitleTemplate(titles);

    // 説明文のテンプレート生成
    const descriptionTemplate = generateDescriptionTemplate(descriptions);

    return NextResponse.json({
      results: validResults,
      template: {
        title: titleTemplate,
        description: descriptionTemplate,
      },
    });
  } catch (error) {
    console.error('スクレイピングエラー:', error);
    return NextResponse.json(
      { error: 'URLの解析に失敗しました' },
      { status: 500 }
    );
  }
}

function generateTitleTemplate(titles: string[]): string {
  if (titles.length === 0) return '【美品】{商品名}';

  // 最初のタイトルをベースにする
  const baseTitle = titles[0];

  // 【】で囲まれた部分を抽出
  const bracketMatch = baseTitle.match(/【[^】]+】/);
  const prefix = bracketMatch ? bracketMatch[0] : '【美品】';

  return `${prefix}{商品名}`;
}

function generateDescriptionTemplate(descriptions: string[]): string {
  if (descriptions.length === 0) {
    return `{商品名}です。

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
  }

  // 最初の説明文をベースにする
  let template = descriptions[0];

  // 商品名部分を{商品名}に置き換え
  // 最初の行や文の商品名らしき部分を変数化
  template = template.split('\n')[0] + 'です。\n\n' +
             descriptions[0].split('\n').slice(1).join('\n');

  return template || `{商品名}です。

【商品の状態】
目立った傷や汚れはありません。

【発送について】
24時間以内に発送いたします。

よろしくお願いいたします。`;
}
