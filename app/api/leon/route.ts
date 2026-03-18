import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize the OpenAI client securely
// Ensure you have OPENAI_API_KEY in your .env.local
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = `Você é o Leon, o assistente virtual de suporte do sistema Facebrasil. 
Seu papel é ajudar de forma amigável, clara e didática qualquer usuário (editor, admin) que estiver com dificuldades usando o painel administrativo. 
Você não faz alterações no sistema, você apenas fornece instruções passo a passo. 
Se você não souber a resposta exata de como algo funciona, sugira procurar o botão "Ajuda" para abrir o manual HTML do sistema, ou indique entrar em contato pelo "Suporte Dev" com a Chiara Garcia no menu lateral.

Aqui está um resumo de algumas das seções principais:
- Artigos: Onde se cria e edita notícias, publicações.
- Agendador IA: Ferramenta de inteligência artificial que programa conteúdos automaticamente.
- TV Facebrasil: Gerenciamento de vídeos e mídias da TV.
- Mídia: Biblioteca geral de imagens e envios.
- Gamificação / XP: Sistema de pontuação dos leitores.
- Autores, Categorias, Configurações: Rotinas básicas de CRUD e ajustes finos.

Mantenha suas respostas diretas e no idioma português do Brasil.`;

export async function POST(req: Request) {
    try {
        const { message, history } = await req.json();

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // Prepare conversation format
        const apiMessages = [
            { role: 'system', content: systemPrompt },
            ...(history || []).map((msg: any) => ({
                role: msg.role,
                content: msg.content
            })),
            { role: 'user', content: message }
        ];

        const response = await openai.chat.completions.create({
            model: 'gpt-4o', // Or gpt-3.5-turbo / gpt-4o-mini depending on priority
            messages: apiMessages,
            temperature: 0.7,
            max_tokens: 500,
        });

        const reply = response.choices[0]?.message?.content || 'Desculpe, não consegui processar a resposta agora.';

        return NextResponse.json({ reply });
    } catch (error: any) {
        console.error('Error in Leon chatbot API:', error);
        return NextResponse.json(
            { error: 'An error occurred during your request.' },
            { status: 500 }
        );
    }
}
