import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check auth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OPENAI_API_KEY is missing' }, { status: 500 });
    }

    const { newsId, agentId } = await req.json();

    if (!newsId || !agentId) {
      return NextResponse.json({ error: 'newsId and agentId are required' }, { status: 400 });
    }

    // Fetch the news
    const { data: news, error: newsError } = await supabase
      .from('captured_news')
      .select('*')
      .eq('id', newsId)
      .single();

    if (newsError || !news) {
      return NextResponse.json({ error: 'News not found' }, { status: 404 });
    }

    // Fetch the agent
    const { data: agent, error: agentError } = await supabase
      .from('virtual_agents')
      .select('*')
      .eq('id', agentId)
      .single();

    if (agentError || !agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const prompt = `Você é um jornalista trabalhando para uma revista voltada para a comunidade brasileira nos EUA.
    
Seu perfil:
Nome: ${agent.name}
Localização: ${agent.location || 'EUA'}
Estilo de escrita: ${agent.writing_style || 'Jornalístico, empático e informativo'}

Reescreva a seguinte notícia, adaptando o texto e a linguagem para o seu perfil e focando no impacto para a comunidade brasileira:
Manchete Original: ${news.original_title}
Contexto Traduzido (se houver): ${news.translated_title || ''}
Fonte: ${news.source_vehicle}

Forneça um JSON válido com a seguinte estrutura:
{
  "title": "Novo título impactante",
  "content": "Conteúdo HTML do artigo, com no mínimo 3 parágrafos e tags <p>, <h2> e <strong> para formatação"
}`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o",
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0]?.message?.content;
    let title = "Erro ao gerar";
    let content = "Não foi possível gerar o artigo.";

    if (responseContent) {
      try {
        const parsed = JSON.parse(responseContent);
        title = parsed.title;
        content = parsed.content;
        
        // Mark as used
        await supabase.from('news_usage').insert({
          news_id: newsId,
          agent_id: agentId,
          used_by_user_id: session.user.id
        });

      } catch (e) {
        console.error("Failed to parse JSON for rewrite", e);
      }
    }

    return NextResponse.json({ 
      title, 
      content,
      original_url: news.url,
      sourceUsed: true 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Rewrite error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
