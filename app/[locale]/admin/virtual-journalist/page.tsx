import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'

export default async function VirtualJournalistDashboard() {
  const supabase = await createClient()

  // Fetch raw news
  const { data: news, error } = await supabase
    .from('captured_news')
    .select('*, news_usage(agent_id)')
    .order('published_at', { ascending: false })
    .limit(50)

  // Fetch agents
  const { data: agents } = await supabase
    .from('virtual_agents')
    .select('*')

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Virtual Journalist Dashboard</h1>
      <p className="text-gray-500 mb-8">
        Notícias capturadas pela inteligência artificial. Selecione uma fonte para reescrevê-la.
      </p>

      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Run Capture (Trigger Cron)</button>
          <button className="bg-gray-100 text-black px-4 py-2 rounded">Run Process (LLM)</button>
        </div>
        <a href="/admin/virtual-journalist/agents" className="text-blue-500 hover:underline">
          Gerenciar Agentes Virtuais &rarr;
        </a>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {news?.map((item) => (
          <div key={item.id} className="border p-6 rounded-lg bg-white shadow flex flex-col md:flex-row gap-6">
            {item.image_url && (
              <img src={item.image_url} alt="Cover" className="w-full md:w-48 h-32 object-cover rounded" />
            )}
            <div className="flex-1">
              <div className="flex justify-between">
                <span className="text-sm font-bold text-blue-600 uppercase">{item.category}</span>
                <span className="text-sm text-gray-400">{new Date(item.published_at).toLocaleDateString()}</span>
              </div>
              <h2 className="text-xl font-bold mt-2">{item.translated_title || item.original_title}</h2>
              <p className="text-sm text-gray-500 mt-1">Fonte: {item.source_vehicle} (Tier {item.source_tier})</p>
              
              <div className="mt-4 flex items-center justify-between">
                {item.news_usage && item.news_usage.length > 0 ? (
                  <span className="text-sm text-green-600 font-bold px-3 py-1 bg-green-100 rounded-full">
                    Utilizada
                  </span>
                ) : (
                  <form action="/api/vj/rewrite" method="POST" className="flex gap-2">
                    <input type="hidden" name="news_id" value={item.id} />
                    <select name="agent_id" className="border rounded p-2 text-sm" required>
                      <option value="">Selecione o agente...</option>
                      {agents?.map(a => (
                        <option key={a.id} value={a.id}>{a.name} ({a.location})</option>
                      ))}
                    </select>
                    <button type="submit" className="bg-black text-white px-4 py-2 rounded text-sm font-bold hover:bg-gray-800">
                      Reescrever
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
