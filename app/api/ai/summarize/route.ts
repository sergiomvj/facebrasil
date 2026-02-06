import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const { text } = await req.json();

        if (!text) {
            return NextResponse.json({ error: 'No text provided' }, { status: 400 });
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are an expert editor for Facebrasil Magazine. Summarize the provided article content in 3 concise, engaging bullet points (using standard text, not markdown). Focus on the core value for the reader. Language: English."
                },
                {
                    role: "user",
                    content: text.substring(0, 5000) // Truncate to avoid context limits
                }
            ],
            temperature: 0.7,
            max_tokens: 150,
        });

        const summary = completion.choices[0].message.content;

        return NextResponse.json({ summary });
    } catch (error) {
        console.error('OpenAI Error:', error);
        return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
    }
}
