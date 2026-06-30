import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
    const blogId = blogData?.id || null; // O banco de dados pode permitir nulo, caso não exista a tabela ou registro

    // Inserir artigo como DRAFT
    const { data: articleData, error: articleError } = await supabase
      .from('articles')
      .insert({
        title,
        slug,
        content,
        status: 'DRAFT',
        author_id: session.user.id, // Forçando o editor atual como autor temporariamente, ou o autor correto se existir
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
