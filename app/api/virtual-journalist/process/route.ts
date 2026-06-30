import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

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
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const body = await req.json().catch(() => ({}));
    const { agentId } = body;

    let agentProfile = '';
    if (agentId) {
      const { data: agentData } = await supabase
        .from('virtual_agents')
        .select('name, profile_description, location, writing_style')
        .eq('id', agentId)
        .single();
      if (agentData) {
        agentProfile = `O jornalista virtual atual é ${agentData.name} da região de ${agentData.location}. Especialidade: ${agentData.profile_description}. Estilo: ${agentData.writing_style}. O título traduzido deve usar um tom que combine com o interesse deste jornalista.`;
      }
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
      const prompt = `Analise a seguinte manchete de notícia:
"${news.original_title}"

${agentProfile}

Forneça um JSON válido com:
{
  "translated_title": "A tradução fiel da manchete para Português do Brasil, adaptada para o público alvo do jornalista se aplicável",
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
