import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;

const PREDICT_MODEL = 'gemini-2.0-flash';
const CHAT_MODEL = 'gemini-2.5-flash';

/** Allow up to 60s on Vercel Pro; still helps Next.js set the limit where supported. */
export const maxDuration = 60;
export const runtime = 'nodejs';

export async function POST(req: Request) {
  if (!apiKey) {
    return NextResponse.json({ error: 'Gemini API key is not configured.' }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  try {
    const { contents, systemInstruction, tools, responseMimeType } = body as {
      contents?: unknown;
      systemInstruction?: string;
      tools?: unknown[];
      responseMimeType?: string;
    };

    if (!contents) {
      return NextResponse.json({ error: 'Missing contents.' }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const config: Record<string, unknown> = {};
    if (systemInstruction) config.systemInstruction = systemInstruction;
    if (Array.isArray(tools) && tools.length > 0) config.tools = tools;
    if (responseMimeType) config.responseMimeType = responseMimeType;

    const usePredictModel = responseMimeType === 'application/json' && !tools?.length;
    const model = usePredictModel ? PREDICT_MODEL : CHAT_MODEL;

    const result = await ai.models.generateContent({
      model,
      contents,
      ...(Object.keys(config).length ? { config } : {}),
    });

    const text = result.text ?? '';
    if (!text.trim()) {
      return NextResponse.json({ error: 'AI returned an empty response. Please try again.' }, { status: 502 });
    }
    return NextResponse.json({ text });
  } catch (error) {
    console.error('Error in Gemini API route:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate response.';
    const status =
      /timeout|deadline|timed out/i.test(message) ? 504
      : /rate|quota|429/i.test(message) ? 429
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
