import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import {
    ADMIN_HELP_FALLBACK_ENTRY,
    type HelpDocEntry,
} from '@/lib/help/admin-help';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

function buildSystemPrompt(entry: HelpDocEntry, route: string) {
    return `Voce e o Leon, agente virtual de ajuda contextual do painel administrativo da Nova Facebrasil.

Regras obrigatorias:
- responda apenas sobre a pagina atual do usuario
- a pagina atual e "${entry.label}" na rota "${route}"
- se o usuario perguntar sobre outro modulo, explique com gentileza que a ajuda atual cobre apenas "${entry.label}" e peca para ele navegar ate a tela desejada
- nunca invente campos, botoes ou fluxos que nao estejam sustentados pelo contexto fornecido
- ofereca instrucoes objetivas, operacionais e em portugues do Brasil
- se a documentacao nao for suficiente, diga isso com transparencia e responda usando apenas o que o contexto permite inferir
- nao mude de assunto para outros menus do admin

Contexto oficial da pagina atual:
- Resumo: ${entry.summary}
- Objetivo: ${entry.purpose}
- Elementos principais: ${entry.elements.join('; ')}
- Uso pratico: ${entry.uses.join('; ')}
- Palavras-chave: ${entry.keywords.join(', ')}
`;
}

export async function POST(req: Request) {
    try {
        const { message, history, route, helpEntry } = await req.json();

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        const activeEntry: HelpDocEntry = helpEntry ?? ADMIN_HELP_FALLBACK_ENTRY;
        const activeRoute = typeof route === 'string' ? route : activeEntry.route;

        const apiMessages = [
            { role: 'system' as const, content: buildSystemPrompt(activeEntry, activeRoute) },
            ...((history || []) as Array<{ role: 'user' | 'assistant'; content: string }>).map((msg) => ({
                role: msg.role,
                content: msg.content,
            })),
            { role: 'user' as const, content: message },
        ];

        const response = await openai.chat.completions.create({
            model: process.env.OPENAI_HELP_MODEL || 'gpt-4o',
            messages: apiMessages,
            temperature: 0.3,
            max_tokens: 500,
        });

        const reply =
            response.choices[0]?.message?.content ||
            'Desculpe, nao consegui processar a resposta agora.';

        return NextResponse.json({ reply });
    } catch (error) {
        console.error('Error in Leon chatbot API:', error);
        return NextResponse.json(
            { error: 'An error occurred during your request.' },
            { status: 500 }
        );
    }
}
