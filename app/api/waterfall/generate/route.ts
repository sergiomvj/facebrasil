import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `Você é o Chiara, estrategista de conteúdo sênior da Facebrasil — o maior portal de notícias para a diáspora brasileira nos EUA.

Seu trabalho é transformar artigos jornalísticos em peças de conteúdo social otimizadas para cada plataforma.

Contexto da audiência:
- Brasileiros imigrantes nos EUA (FL, NY, MA, CA, TX principalmente)
- Biculturais que alternam português e inglês
- Preocupados com imigração, trabalho, cultura e comunidade
- Muito ativos em grupos do Facebook e Instagram

Regras absolutas:
1. NUNCA copie o artigo, sempre recontextualize
2. Use português do Brasil (não de Portugal)
3. Cada peça deve funcionar INDEPENDENTEMENTE do artigo original
4. Emojis devem ser estratégicos, não decorativos excessivos
5. Retorne APENAS o JSON solicitado, sem markdown, sem explicações externas`;

interface WaterfallRequest {
    title: string;
    excerpt?: string;
    content: string;
    category?: string;
    tone: string;
    angle: string;
    audience: string;
}

function buildUserPrompt(data: WaterfallRequest): string {
    const toneMap: Record<string, string> = {
        impactante: 'direto, forte, sem rodeios — cada frase deve impactar',
        acolhedor: 'caloroso, como um amigo contando novidade importante',
        informativo: 'claro, neutro, jornalístico mas acessível',
        urgente: 'senso de urgência, isso afeta VOCÊ agora',
        inspiracional: 'esperançoso, mostrando possibilidades e conquistas',
    };

    const angleMap: Record<string, string> = {
        emocional: 'foco na história humana por trás da notícia, sentimentos e impacto pessoal',
        investigativo: 'o que está por trás, o que não foi dito, as conexões menos óbvias',
        pratico: 'o que isso significa na prática para o imigrante brasileiro, passos concretos',
        cultural: 'como isso conecta com a identidade brasileira e a experiência na diáspora',
        provocador: 'uma perspectiva que vai fazer o leitor pensar diferente ou discordar',
    };

    const audienceMap: Record<string, string> = {
        diaspora: 'brasileiros que já vivem nos EUA há mais de 2 anos',
        imigrantes: 'recém-chegados e quem está planejando imigrar',
        profissionais: 'brasileiros com carreira nos EUA, foco em finanças e mercado de trabalho',
        familias: 'famílias brasileiras nos EUA, crianças bicultural topics',
    };

    return `
Artigo da Facebrasil:
TÍTULO: ${data.title}
CATEGORIA: ${data.category || 'Geral'}
RESUMO: ${data.excerpt || ''}
CONTEÚDO: ${data.content.substring(0, 3000)}

Configurações de geração:
- TOM: ${toneMap[data.tone] || data.tone}
- ÂNGULO NARRATIVO: ${angleMap[data.angle] || data.angle}
- AUDIÊNCIA ALVO: ${audienceMap[data.audience] || data.audience}

Gere o seguinte JSON (sem markdown, somente JSON puro):
{
  "instagram": {
    "carousel": {
      "slides": [
        { "number": 1, "text": "..." },
        { "number": 2, "text": "..." },
        { "number": 3, "text": "..." },
        { "number": 4, "text": "..." },
        { "number": 5, "text": "SIGA @facebrasil para mais notícias da diáspora brasileira nos EUA 🇧🇷" }
      ]
    },
    "caption": "..."
  },
  "twitter": {
    "thread": [
      { "number": 1, "text": "..." },
      { "number": 2, "text": "..." },
      { "number": 3, "text": "..." },
      { "number": 4, "text": "..." },
      { "number": 5, "text": "..." },
      { "number": 6, "text": "..." },
      { "number": 7, "text": "... 🔗 Link na bio @facebrasil" }
    ],
    "single_tweet": "..."
  },
  "facebook": {
    "story_post": "...",
    "engagement_post": "..."
  }
}

Regras por formato:
- Instagram carousel: Slide 1 é o hook visual (pergunta ou dado chocante). Slides 2-4 são 1 ponto cada (conciso, máx 2 linhas). Slide 5 é o CTA de seguir. Use linguagem bullet simplificada.
- Instagram caption: máx 150 palavras, 3-5 hashtags no final, CTA claro
- Twitter thread: tweet 1 é o hook (máx 270 chars), tweets seguintes desenvolvem. CADA tweet máx 270 chars
- Twitter single_tweet: máx 270 chars. Hot take provocador que convida ao clique
- Facebook story_post: 200-350 palavras, storytelling, termine com pergunta aberta
- Facebook engagement_post: 80-120 palavras, pergunta direta à comunidade, convite ao compartilhamento`;
}

export async function POST(req: Request) {
    try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const body: WaterfallRequest = await req.json();

        if (!body.title || !body.content) {
            return NextResponse.json({ error: 'title e content são obrigatórios' }, { status: 400 });
        }

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: buildUserPrompt(body) },
            ],
            temperature: 0.82,
            max_tokens: 3500,
            response_format: { type: 'json_object' },
        });

        const rawContent = completion.choices[0].message.content;
        if (!rawContent) {
            return NextResponse.json({ error: 'Resposta vazia da IA' }, { status: 500 });
        }

        const result = JSON.parse(rawContent);
        return NextResponse.json({ success: true, data: result });

    } catch (error: any) {
        console.error('[Waterfall API] Erro:', error);
        return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 });
    }
}
