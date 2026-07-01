import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';
import FirecrawlApp from '@mendable/firecrawl-js';

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

    const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });

    const { newsId, agentId, size = 'medium' } = await req.json();

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

    // Fetch the agent if not 'me'
    let agent = null;
    if (agentId !== 'me') {
      const { data, error: agentError } = await supabase
        .from('virtual_agents')
        .select('*')
        .eq('id', agentId)
        .single();

      if (agentError || !data) {
        return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
      }
      agent = data;
    }

    // Attempt to scrape full content with Firecrawl
    let scrapedContent = '';
    try {
      if (news.url) {
        const scrapeResult = await firecrawl.scrapeUrl(news.url, { formats: ['markdown'] }) as any;
        if (scrapeResult && (scrapeResult.success === undefined || scrapeResult.success) && scrapeResult.markdown) {
          scrapedContent = scrapeResult.markdown;
        } else if (scrapeResult && scrapeResult.data && scrapeResult.data.markdown) {
          scrapedContent = scrapeResult.data.markdown;
        }
      }
    } catch (err) {
      console.error('Firecrawl scrape error:', err);
      // Fallback to title only if scraping fails
    }

    const sizeInstructions = {
      'small': 'O artigo deve ser curto e direto (cerca de 2 a 3 parágrafos curtos).',
      'medium': 'O artigo deve ter um tamanho médio (cerca de 4 a 6 parágrafos).',
      'large': 'O artigo deve ser longo e detalhado, aprofundando o assunto (cerca de 8 a 10 parágrafos).'
    };

    const sizePrompt = sizeInstructions[size as keyof typeof sizeInstructions] || sizeInstructions['medium'];

    let profileContext = '';
    if (agent) {
      profileContext = `
Seu perfil:
Nome: ${agent.name}
Localização: ${agent.location || 'EUA'}
Especialidade: ${agent.profile_description || 'Assuntos gerais da comunidade'}
Estilo de escrita: ${agent.writing_style || 'Jornalístico, empático e informativo'}
`;
    } else {
      profileContext = `
Seu perfil: Você é um repórter sênior da revista, focado em trazer informações precisas e relevantes.
Estilo de escrita: Jornalístico, profissional e objetivo.
`;
    }

    const prompt = `Você é um jornalista trabalhando para uma revista voltada para a comunidade brasileira nos EUA.
    ${profileContext}

Reescreva a seguinte notícia, adaptando o texto e a linguagem para o seu perfil e focando no impacto para a comunidade brasileira:
Manchete Original: ${news.original_title}
Contexto Traduzido: ${news.translated_title || ''}
Fonte original: ${news.source_vehicle}

${scrapedContent ? `Conteúdo Original Extraído:\n${scrapedContent.substring(0, 5000)}` : ''}

Diretriz de Tamanho: ${sizePrompt}

Forneça um JSON válido com a seguinte estrutura:
{
  "title": "Novo título impactante",
  "content": "Conteúdo HTML do artigo, devidamente formatado (apenas as tags internas como <p>, <h2>, <strong>, etc., sem envolver em <html> ou <body>)"
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
        
        // Append signature if it's a virtual agent
        if (agent) {
          content += `\n\n<p><em>— Escrito por ${agent.name}, ${agent.profile_description || 'Especialista Facebrasil'}.</em></p>`;
        }
      } catch (e) {
        console.error("Failed to parse JSON for rewrite", e);
      }
    }

    return NextResponse.json({ 
      title, 
      content,
      original_url: news.url,
      sourceUsed: false 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Rewrite error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
