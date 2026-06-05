export const AVAILABLE_MODELS = [
    { id: 'gpt-4o', name: 'IA Padrão (GPT-4o)', provider: 'openai' },
    { id: 'google/gemma-4-31b-it:free', name: 'Gemma 4 31B (Free via OpenRouter)', provider: 'openrouter' },
    { id: 'xiaomi/mimo-v2-flash', name: 'MiMo V2 Flash (via OpenRouter)', provider: 'openrouter' },
    { id: 'meta-llama/llama-4-scout:free', name: 'Llama 4 Scout (Free via OpenRouter)', provider: 'openrouter' },
] as const;
