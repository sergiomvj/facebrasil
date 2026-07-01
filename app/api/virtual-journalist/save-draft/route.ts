import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    
    // Check auth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { newsId, agentId, title, content } = await req.json();

    if (!newsId || !agentId || !title || !content) {
      return NextResponse.json({ error: 'Faltam parâmetros obrigatórios' }, { status: 400 });
    }

    // Slug generation (basic fallback)
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 100) + '-' + Date.now();

    // Tenta buscar o primeiro blog_id (se necessário pelo schema)
    const { data: blogData } = await supabase.from('blogs').select('id').limit(1).single();
    let finalAuthorId = session.user.id;

    if (agentId !== 'me') {
      // Garante que o Agente Virtual exista na tabela profiles como um autor
      const { data: agentData } = await supabaseAdmin.from('virtual_agents').select('*').eq('id', agentId).single();
      if (agentData) {
        finalAuthorId = agentId;
        const { data: profileData } = await supabaseAdmin.from('profiles').select('id').eq('id', agentId).single();
        if (!profileData) {
          await supabaseAdmin.from('profiles').insert({
            id: agentId,
            name: agentData.name,
            role: 'EDITOR',
            avatar_url: null,
            email: null,
            updated_at: new Date().toISOString()
          });
        }
      }
    }

    // Inserir artigo como DRAFT
    const { data: articleData, error: articleError } = await supabase
      .from('articles')
      .insert({
        title,
        slug,
        content,
        status: 'DRAFT',
        author_id: finalAuthorId, // Usa o agentId ou o editor atual
        blog_id: blogId, 
        seo_applied: false
      })
      .select('id')
      .single();

    if (articleError) {
      console.error('Save Draft article error:', articleError);
      return NextResponse.json({ error: 'Erro ao criar artigo draft' }, { status: 500 });
    }

    // Registrar o uso da fonte
    const { error: usageError } = await supabase
      .from('news_usage')
      .insert({
        news_id: newsId,
        agent_id: agentId,
        used_by_user_id: session.user.id
      });

    if (usageError) {
        console.error('Save Draft usage error:', usageError);
        // Mesmo com erro de usage, o draft foi salvo, então retornamos sucesso.
    }

    return NextResponse.json({ 
      success: true, 
      articleId: articleData?.id
    }, { status: 200 });

  } catch (error: any) {
    console.error('Save Draft unexpected error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
