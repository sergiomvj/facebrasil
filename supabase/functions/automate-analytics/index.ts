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
    let updatedCount = 0;

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: articles, error: artError } = await supabase
        .from('articles')
        .select('id, title, published_at, views, disable_view_simulation')
        .gte('published_at', sevenDaysAgo)
        .eq('status', 'PUBLISHED');

    if (artError) throw artError;

    if (articles) {
      for (const article of articles) {
        const pubDate = new Date(article.published_at);
        const ageInHours = (now.getTime() - pubDate.getTime()) / (1000 * 60 * 60);
        let shouldIncrement = false;

        if (ageInHours < 24) {
          shouldIncrement = true;
        } else if (currentMinute % 15 >= 0 && currentMinute % 15 <= 2) {
          shouldIncrement = true;
        }

        if (shouldIncrement && !article.disable_view_simulation) {
          const { error: updErr } = await supabase.rpc('increment_article_views', { p_article_id: article.id });
          if (updErr) {
            await supabase.from('articles').update({ views: (article.views || 0) + 1 }).eq('id', article.id);
          }
          updatedCount++;
        }
      }
    }

    if (currentMinute % 15 >= 0 && currentMinute % 15 <= 2) {
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
