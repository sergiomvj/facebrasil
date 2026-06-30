import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization');
  if (Deno.env.get('CRON_SECRET') && authHeader !== `Bearer ${Deno.env.get('CRON_SECRET')}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
      status: 401, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? "";
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date();
    const currentMinute = now.getMinutes();
    const currentHour = now.getHours();
    let updatedCount = 0;

    // Fases de decaimento
    const phase2Date = new Date('2026-07-05T00:00:00-03:00');
    const phase3Date = new Date('2026-07-12T00:00:00-03:00');
    const phase4Date = new Date('2026-07-19T00:00:00-03:00');

    let articleIntervalHours = 1; // Atual: ~60 mins
    let adsIntervalHours = 2;     // Atual: ~120 mins

    if (now >= phase4Date) {
      articleIntervalHours = 6;  // ~360 mins
      adsIntervalHours = 10;     // ~600 mins
    } else if (now >= phase3Date) {
      articleIntervalHours = 4;  // ~240 mins
      adsIntervalHours = 8;      // ~480 mins
    } else if (now >= phase2Date) {
      articleIntervalHours = 2;  // ~120 mins
      adsIntervalHours = 4;      // ~240 mins
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: articles, error: artError } = await supabase
        .from('articles')
        .select('id, title, published_at, views')
        .gte('published_at', sevenDaysAgo)
        .eq('status', 'PUBLISHED');

    if (artError) throw artError;

    if (articles) {
      for (const article of articles) {
        const pubDate = new Date(article.published_at);
        const ageInHours = (now.getTime() - pubDate.getTime()) / (1000 * 60 * 60);
        let shouldIncrement = false;

        // Artigos de 0 a 7 dias (frequência dinâmica baseada na data)
        if (currentHour % articleIntervalHours === 0 && currentMinute >= 0 && currentMinute <= 2) {
          shouldIncrement = true;
        }

        if (shouldIncrement) {
          const { error: updErr } = await supabase.rpc('increment_article_views', { p_article_id: article.id });
          if (updErr) {
            await supabase.from('articles').update({ views: (article.views || 0) + 1 }).eq('id', article.id);
          }
          updatedCount++;
        }
      }
    }

    // Anúncios (frequência dinâmica baseada na data)
    if (currentHour % adsIntervalHours === 0 && currentMinute >= 0 && currentMinute <= 2) {
      const { data: ads, error: adsError } = await supabase
          .from('ads')
          .select('id, views')
          .eq('is_active', true);

      if (!adsError && ads) {
        for (const ad of ads) {
          await supabase.from('ads').update({ views: (ad.views || 0) + 1 }).eq('id', ad.id);
          updatedCount++;
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      count: updatedCount,
      time: now.toISOString()
    }), { 
      headers: { 'Content-Type': 'application/json' } 
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
});
