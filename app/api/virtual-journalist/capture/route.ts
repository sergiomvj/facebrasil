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

    if (agentId) {
      const { data: agentData } = await supabase
        .from('virtual_agents')
        .select('name, location')
        .eq('id', agentId)
        .single();
      if (agentData) {
        agentLocation = agentData.location || '';
        agentName = agentData.name || '';
      }
    }

    const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });
    const capturedResults: any[] = [];

    // Construct query
    let finalQuery = '';
    if (sourceQuery && sourceQuery.trim().length > 0) {
        finalQuery = sourceQuery.trim();
        // optionally append location if we want to force it
        if (agentLocation) {
            finalQuery += ` ${agentLocation}`;
        }
    } else {
        const randomBase = QUERIES[Math.floor(Math.random() * QUERIES.length)];
        finalQuery = agentLocation ? `${randomBase} AND ${agentLocation}` : randomBase;
    }

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
