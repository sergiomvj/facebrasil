import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// MOCK: This endpoint captures news using Firecrawl/RSS/Google News.
// For now, it inserts mock data into captured_news for testing the Virtual Journalist flow.
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const mockNews = [
      {
        original_title: "ICE arrests 15 undocumented immigrants in Massachusetts",
        translated_title: "ICE prende 15 imigrantes indocumentados em Massachusetts",
        url: `https://example.com/ice-arrests-ma-${Date.now()}`,
        image_url: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800",
        source_vehicle: "Boston Globe",
        source_tier: 2,
        category: "imigração",
        sentiment: "negative",
        is_trending: true,
        published_at: new Date().toISOString()
      },
      {
        original_title: "Brazilian entrepreneur opens new bakery in Florida",
        translated_title: "Empreendedor brasileiro abre nova padaria na Flórida",
        url: `https://example.com/brazilian-bakery-fl-${Date.now()}`,
        image_url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800",
        source_vehicle: "Miami Herald",
        source_tier: 2,
        category: "economia",
        sentiment: "positive",
        is_trending: false,
        published_at: new Date().toISOString()
      }
    ]

    const { data, error } = await supabase
      .from('captured_news')
      .insert(mockNews)
      .select()

    if (error) throw error

    return NextResponse.json({ success: true, count: mockNews.length, data })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
