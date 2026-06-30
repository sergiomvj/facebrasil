import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import FirecrawlApp from '@mendable/firecrawl-js';

const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });

const QUERIES = [
  '"Brazilians in USA" OR "Brazilian immigrants"',
  '"ICE arrests Brazilian" OR "Brazilian deported"',
  '"Brazilian detained" OR "Brazilian missing USA"',
  '"Brazilian arrested USA" OR "Brazilian crime"',
  '"Brazilian community USA" OR "Brazilian diaspora"',
];

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check auth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.FIRECRAWL_API_KEY) {
      return NextResponse.json({ error: 'FIRECRAWL_API_KEY is missing' }, { status: 500 });
    }

    const capturedResults: any[] = [];

    // Run one query as a sample for the endpoint to avoid timeout
    // In a real cron, this would process all queries or use background workers
    const query = QUERIES[Math.floor(Math.random() * QUERIES.length)];

    const response = await firecrawl.search(query, {
      limit: 5,
      lang: 'en',
      country: 'us',
      scrapeOptions: {
        formats: ['markdown'],
        onlyMainContent: true
      }
    });

    if (response.success && response.data) {
      for (const item of response.data) {
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
