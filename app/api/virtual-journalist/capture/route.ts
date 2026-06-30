import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import FirecrawlApp from '@mendable/firecrawl-js';

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

    if (agentId) {
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
    
    // We will need OpenAI to generate a custom query if sourceQuery is empty
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    if (sourceQuery && sourceQuery.trim().length > 0) {
        finalQuery = sourceQuery.trim();
    } else if (agentId && agentProfileDescription) {
        try {
            const prompt = `Gere uma única string de busca (search query) em inglês, curta e otimizada (máximo 6 palavras), para encontrar notícias recentes no Google/Bing que interessem ao seguinte jornalista virtual.
Nome: ${agentName}
Local base: ${agentLocation}
Especialidade: ${agentProfileDescription}

Instruções:
- Se a especialidade for muito focada no local (ex: notícias locais de Miami), inclua o local e termos sobre brasileiros.
- Se a especialidade for global/negócios (ex: empresas brasileiras no exterior), ignore o local base e foque no tema (ex: "Brazilian businesses abroad").
- Retorne APENAS a string de busca, sem aspas, sem explicações.`;

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
    }
    
    // Fallback absoluto se tudo falhar
    if (!finalQuery) {
        const QUERIES = ['"Brazilians abroad"', '"Brazilian immigrants"', '"Brazilian community"'];
        finalQuery = QUERIES[Math.floor(Math.random() * QUERIES.length)];
    }

    console.log('🔥 Firecrawl search query:', finalQuery);

    let response;
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

    const responseData: any = response;
    
    if (responseData && responseData.success === false) {
      return NextResponse.json({ error: `Firecrawl API: ${responseData.error || 'Falha na busca'}` }, { status: 500 });
    }

    const items = responseData.data || responseData;

    if (Array.isArray(items)) {
      for (const item of items) {
        // Prepare data for DB
        const newsData = {
          original_title: item.title || 'Sem título',
          url: item.url,
          source_vehicle: new URL(item.url || 'https://unknown.com').hostname,
          published_at: new Date().toISOString(), // Mock as Firecrawl may not return date directly
          category: 'geral'
        };

        // Check if exists
        const { data: existing } = await supabase
          .from('captured_news')
          .select('id')
          .eq('url', newsData.url)
          .single();

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
