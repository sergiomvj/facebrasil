import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();
    
    // Check auth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing news ID' }, { status: 400 });
    }

    const { error } = await supabase
      .from('captured_news')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ message: 'Source deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Delete source error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
