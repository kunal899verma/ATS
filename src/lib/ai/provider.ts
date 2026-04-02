import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';
import { generateText as aiGenerateText, type LanguageModel } from 'ai';

// ─── Provider Setup ─────────────────────────────────────────────────────────
// All FREE tiers — no billing required

// 1. Google Gemini — 20 RPM, 1500 req/day
//    Key: https://aistudio.google.com/apikey
const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const google = googleKey ? createGoogleGenerativeAI({ apiKey: googleKey }) : null;

// 2. Groq — 30 RPM, 14400 req/day
//    Key: https://console.groq.com/keys
const groqKey = process.env.GROQ_API_KEY;
const groq = groqKey ? createGroq({ apiKey: groqKey }) : null;

// ─── Model List (priority order) ────────────────────────────────────────────
interface AIModel {
  name: string;
  instance: LanguageModel;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: Record<string, any>;
}

function getModels(): AIModel[] {
  const models: AIModel[] = [];

  if (google) {
    models.push({
      name: 'gemini-2.5-flash',
      instance: google('gemini-2.5-flash'),
      options: { google: { thinkingConfig: { thinkingBudget: 0 } } },
    });
  }

  if (groq) {
    models.push({
      name: 'llama-3.3-70b (Groq)',
      instance: groq('llama-3.3-70b-versatile'),
    });
  }

  if (google) {
    models.push({
      name: 'gemini-2.5-flash-lite',
      instance: google('gemini-2.5-flash-lite'),
    });
  }

  return models;
}

// ─── Default exports (backward compat) ──────────────────────────────────────
export const model = google
  ? google('gemini-2.5-flash')
  : groq
    ? groq('llama-3.3-70b-versatile')
    : null;

export const noThinkingOptions = {
  providerOptions: {
    google: { thinkingConfig: { thinkingBudget: 0 } },
  },
};

// ─── Smart Generate with Auto-Fallback ──────────────────────────────────────
// Tries each AI provider. On rate limit (429), auto-switches to next.

interface GenerateOptions {
  system?: string;
  prompt: string;
  maxOutputTokens?: number;
  temperature?: number;
}

export async function generateWithFallback(options: GenerateOptions): Promise<{ text: string; provider: string }> {
  const models = getModels();

  if (models.length === 0) {
    throw new Error('No AI providers configured. Add GOOGLE_GENERATIVE_AI_API_KEY or GROQ_API_KEY to .env.local');
  }

  let lastError: Error | null = null;

  for (const entry of models) {
    try {
      const { text } = await aiGenerateText({
        model: entry.instance,
        system: options.system,
        prompt: options.prompt,
        maxOutputTokens: options.maxOutputTokens ?? 4000,
        temperature: options.temperature ?? 0.7,
        maxRetries: 1,
        ...(entry.options ? { providerOptions: entry.options } : {}),
      });

      console.log(`[AI] Success with ${entry.name}`);
      return { text, provider: entry.name };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const isRateLimit = msg.includes('429') || msg.includes('quota') || msg.includes('rate') || msg.includes('RESOURCE_EXHAUSTED');

      console.warn(`[AI] ${entry.name} failed: ${isRateLimit ? 'Rate limited' : msg.slice(0, 100)}`);
      lastError = err instanceof Error ? err : new Error(msg);
      continue;
    }
  }

  throw lastError ?? new Error('All AI providers failed');
}
