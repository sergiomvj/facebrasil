// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message, articleContent, articleTitle, history, feature } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Mensagem é obrigatória' }, { status: 400 });
    }

    // Construir o prompt baseado no contexto
    let systemPrompt = `Você é o Assistente IA do Facebrasil, um portal de notícias e informações para brasileiros nos Estados Unidos.

Suas características:
- Você é especializado em assuntos relacionados à vida nos EUA, imigração, trabalho, saúde, educação e cultura brasileira na América
- Você responde em português do Brasil de forma clara e amigável
- Você é útil, preciso e sempre mantém um tom acolhedor
- Quando não souber algo, admite honestamente
- Você prioriza informações práticas e aplicáveis à realidade de imigrantes brasileiros
`;

    // Adicionar contexto do artigo se disponível
    if (articleContent && articleTitle) {
      systemPrompt += `\n\nContexto atual - O usuário está lendo o artigo "${articleTitle}".\nConteúdo do artigo: ${articleContent.substring(0, 3000)}...\n`;
    }

    // Adicionar instruções específicas por feature
    if (feature === 'summarize') {
      systemPrompt += `\n\nTarefa: Resuma o artigo em 3 pontos principais, destacando as informações mais relevantes para brasileiros nos EUA. Use bullets e seja conciso.`;
    } else if (feature === 'explain') {
      systemPrompt += `\n\nTarefa: Explique como este conteúdo se aplica à realidade de brasileiros imigrantes nos EUA. Dê exemplos práticos e situações do dia a dia.`;
    } else if (feature === 'translate') {
      systemPrompt += `\n\nTarefa: Traduza os conceitos mais importantes para português, mantendo termos técnicos em inglês quando apropriado. Explique o significado de termos específicos dos EUA.`;
    }

    // Construir mensagens para a API
    const messages = [
      { role: 'system', content: systemPrompt },
    ];

    // Adicionar histórico de conversa se existir
    if (history && history.length > 0) {
      history.forEach((msg: any) => {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      });
    }

    // Adicionar mensagem atual do usuário
    messages.push({
      role: 'user',
      content: message
    });

    // Chamar OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content || 'Desculpe, não consegui gerar uma resposta.';

    return NextResponse.json({
      success: true,
      response,
      tokens: completion.usage?.total_tokens
    });

  } catch (error) {
    console.error('[AI Chat] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao processar solicitação',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
