import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    
    // Check auth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OPENAI_API_KEY is missing' }, { status: 500 });
    }

    // Fetch un-processed news
    const { data: unProcessedNews, error } = await supabase
      .from('captured_news')
      .select('*')
      .is('translated_title', null)
      .limit(5);

    if (error) throw error;
    if (!unProcessedNews || unProcessedNews.length === 0) {
      return NextResponse.json({ message: 'No news to process' }, { status: 200 });
    }

    const processedIds = [];

    for (const news of unProcessedNews) {
      const prompt = `Analise a seguinte manchete de notícia sobre brasileiros nos EUA:
"${news.original_title}"

Forneça um JSON válido com:
{
  "translated_title": "A tradução fiel da manchete para Português do Brasil",
  "sentiment": "positive, negative, ou neutral",
  "category": "imigração, policial, comunidade, política, esportes, economia, ou cultura"
}`;

      const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
      });

      const responseContent = completion.choices[0]?.message?.content;
      if (responseContent) {
        try {
          const parsed = JSON.parse(responseContent);
          
          await supabase
            .from('captured_news')
            .update({
              translated_title: parsed.translated_title,
              sentiment: parsed.sentiment,
              category: parsed.category
            })
            .eq('id', news.id);

          processedIds.push(news.id);
        } catch (e) {
          console.error("Failed to parse JSON for news id", news.id);
        }
      }
    }

    return NextResponse.json({ 
      message: 'Process completed',
      processedCount: processedIds.length,
      processedIds
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('Process error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
