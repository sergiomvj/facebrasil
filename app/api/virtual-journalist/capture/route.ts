import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import FirecrawlApp from '@mendable/firecrawl-js';
import OpenAI from 'openai';

const QUERIES = [
  '"Brazilians abroad" OR "Brazilians in USA" OR "Brazilian community"',
  '"Brazilian businesses abroad" OR "Brazilian companies in USA" OR "Brazilian entrepreneurs international"',
  '"Brazilian immigrants" OR "Brazilian diaspora"',
  '"Brazilians in Florida" OR "Brazilians in Orlando" OR "Brazilians in Miami"',
  '"Brazilians in Massachusetts" OR "Brazilians in Boston"',
  '"Brazilians in New York" OR "Brazilians in New Jersey"',
  '"Brazilians in California" OR "Brazilians in Los Angeles"',
  '"notícias brasileiros no exterior" OR "comunidade brasileira nos EUA"',
];

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    
    // Check auth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.FIRECRAWL_API_KEY) {
      return NextResponse.json({ error: 'FIRECRAWL_API_KEY is missing' }, { status: 500 });
    }
    
    const body = await req.json().catch(() => ({}));
    const { agentId, sourceQuery } = body;

    let agentLocation = '';
    let agentName = '';
    let agentProfileDescription = '';

    if (agentId && agentId !== 'generic') {
      const { data: agentData } = await supabase
        .from('virtual_agents')
        .select('name, location, profile_description')
        .eq('id', agentId)
        .single();
      if (agentData) {
        agentLocation = agentData.location || '';
        agentName = agentData.name || '';
        agentProfileDescription = agentData.profile_description || '';
      }
    }

    const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });
    const capturedResults: any[] = [];

    let finalQuery = '';
    
    // We will use OpenAI to generate a custom query
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    try {
        const prompt = `Você deve gerar uma única string de busca (search query) em inglês, curta e otimizada (máximo 6 palavras), para ser usada no Google/Firecrawl.
O objetivo é encontrar notícias recentes que interessem ao seguinte jornalista virtual:
Nome: ${agentName || 'Não especificado'}
Local base: ${agentLocation || 'Exterior'}
Especialidade: ${agentProfileDescription || 'Fatos e notícias sobre brasileiros, comunidade e empresas brasileiras no exterior'}

Assunto Específico Solicitado pelo Usuário: ${sourceQuery && sourceQuery.trim().length > 0 ? `"${sourceQuery}"` : 'NENHUM'}

Instruções cruciais:
1. Se houver um "Assunto Específico Solicitado" (ex: "Padarias"), a busca DEVE focar nesse assunto, MAS sempre dentro do contexto de brasileiros no exterior, imigrantes brasileiros, ou empresas brasileiras na região do agente. Exemplo gerado: "Brazilian bakeries in USA" ou "Brazilian bakeries in ${agentLocation}".
2. Se o assunto específico for "NENHUM", a busca deve ser estritamente baseada neste foco padrão: qualquer menção sobre brasileiros no exterior, negócios de empresas brasileiras no exterior, notícias sobre brasileiro no exterior ou notícias e fatos relevantes sobre as regiões mais densamente ocupadas por brasileiros.
3. Retorne APENAS a string de busca final, sem aspas, sem pontuação, sem explicações.`;

        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "gpt-4o-mini",
        });
        
        finalQuery = completion.choices[0]?.message?.content?.trim() || '';
        // Remove aspas se o modelo adicionar
        finalQuery = finalQuery.replace(/^["']|["']$/g, '');
    } catch (error) {
        console.error('Error generating query with OpenAI, falling back...', error);
    }
    
    // Fallback absoluto se tudo falhar
    if (!finalQuery) {
        if (sourceQuery && sourceQuery.trim().length > 0) {
            finalQuery = `Brazilian ${sourceQuery} abroad`;
        } else {
            const QUERIES = ['"Brazilians abroad"', '"Brazilian immigrants"', '"Brazilian community"'];
            finalQuery = QUERIES[Math.floor(Math.random() * QUERIES.length)];
        }
    }

    console.log('🔥 Firecrawl search query:', finalQuery);

    let response: any;
    try {
      response = await firecrawl.search(finalQuery, {
        limit: 5,
        scrapeOptions: {
          formats: ['markdown'],
          onlyMainContent: true
        }
      });
    } catch (firecrawlError: any) {
      console.error('Firecrawl API Error:', firecrawlError);
      return NextResponse.json({ error: `Erro no Firecrawl: ${firecrawlError.message || JSON.stringify(firecrawlError)}` }, { status: 500 });
    }

    if (response && response.success === false) {
      return NextResponse.json({ error: `Firecrawl API: ${response.error || 'Falha na busca'}` }, { status: 500 });
    }

    let items: any[] = [];
    if (response && typeof response === 'object') {
        if ('web' in response && Array.isArray(response.web)) {
            items = response.web;
        } else {
            try {
                // Tenta acessar .data (pode lançar erro no getter em novas versões do SDK)
                items = response.data || response;
            } catch (e) {
                items = response;
            }
        }
    } else {
        items = response;
    }

    // Tradução em massa dos títulos
    let translatedTitles: Record<string, string> = {};
    if (Array.isArray(items) && items.length > 0) {
      try {
        const titlesToTranslate = items
          .map(item => item.title || (item.metadata && item.metadata.title) || '')
          .filter(t => t.trim().length > 0);
          
        if (titlesToTranslate.length > 0) {
          const translationPrompt = `Traduza os seguintes títulos de notícias para o português do Brasil. Retorne os resultados no formato JSON, onde a chave é o título original (exatamente como foi enviado) e o valor é a tradução em português. Não adicione mais nenhum texto.\n\nTítulos:\n${titlesToTranslate.join('\n')}`;
          
          const translationCompletion = await openai.chat.completions.create({
            messages: [{ role: "user", content: translationPrompt }],
            model: "gpt-4o-mini",
            response_format: { type: "json_object" }
          });
          
          translatedTitles = JSON.parse(translationCompletion.choices[0]?.message?.content || '{}');
        }
      } catch (e) {
        console.error('Error translating titles:', e);
      }
    }

    if (Array.isArray(items)) {
      for (const item of items) {
        // Extrai URL e Título com mais segurança
        const itemUrl = item.url || (item.metadata && item.metadata.sourceURL) || '';
        if (!itemUrl) continue; // Pula se não houver URL
        
        const originalTitle = item.title || (item.metadata && item.metadata.title) || 'Sem título';
        const translatedTitle = translatedTitles[originalTitle] || null;

        // Prepare data for DB
        const newsData = {
          original_title: originalTitle,
          translated_title: translatedTitle,
          url: itemUrl,
          source_vehicle: new URL(itemUrl).hostname,
          published_at: new Date().toISOString(), // Mock as Firecrawl may not return date directly
          category: 'geral'
        };

        // Check if exists
        const { data: existing } = await supabase
          .from('captured_news')
          .select('id')
          .eq('url', newsData.url)
          .maybeSingle(); // Usa maybeSingle para não logar erro se não existir

        if (!existing) {
          const { data: inserted, error: insertError } = await supabase
            .from('captured_news')
            .insert(newsData)
            .select()
            .single();
            
          if (!insertError && inserted) {
            capturedResults.push(inserted);
          }
        }
      }
    }

    return NextResponse.json({ 
      message: 'Capture process completed',
      capturedCount: capturedResults.length,
      results: capturedResults 
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('Capture error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
