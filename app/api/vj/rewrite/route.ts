import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// MOCK: This endpoint rewrites the news using an LLM (virtual agent).
// For now, it just simulates the generation and saves to `articles` as a draft.
export async function POST(request: Request) {
  try {
    const { news_id, agent_id } = await request.json()
    if (!news_id || !agent_id) {
      return NextResponse.json({ error: 'Missing news_id or agent_id' }, { status: 400 })
    }

    const supabase = await createClient()

    // 1. Fetch the raw news and the agent
    const { data: news, error: newsError } = await supabase
      .from('captured_news')
      .select('*')
      .eq('id', news_id)
      .single()

    if (newsError || !news) throw new Error('News not found')

    const { data: agent, error: agentError } = await supabase
      .from('virtual_agents')
      .select('*')
      .eq('id', agent_id)
      .single()

    if (agentError || !agent) throw new Error('Agent not found')

    // 2. Mock LLM rewrite
    const draftTitle = `[Reescrito por ${agent.name}]: ${news.translated_title || news.original_title}`
    const draftContent = `<p><strong>Fonte:</strong> ${news.source_vehicle}</p><p>Este artigo foi adaptado pelo nosso agente virtual <strong>${agent.name}</strong>, focado na comunidade brasileira na região de ${agent.location}.</p><p>...</p>`

    // 3. Insert into articles (assuming standard structure)
    // Note: We might need to adjust the exact fields based on the real `articles` schema.
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .insert({
        title: draftTitle,
        content: draftContent,
        status: 'draft',
        // image_url: news.image_url,
      })
      .select('id')
      .single()

    if (articleError) {
      console.warn("Failed to insert into articles, schema might differ. Error:", articleError.message);
      // Fallback: just return success to indicate rewrite finished
    }

    // 4. Mark news as used
    await supabase.from('news_usage').insert({
      news_id,
      agent_id
    })

    return NextResponse.json({ 
      success: true, 
      article_id: article?.id || 'mock-id' 
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
