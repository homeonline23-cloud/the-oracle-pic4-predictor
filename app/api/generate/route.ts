import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
  if (!apiKey) {
    return NextResponse.json({ error: 'Gemini API key is not configured.' }, { status: 500 });
  }

  try {
    const { contents, systemInstruction, tools, responseMimeType } = await req.json();
    const ai = new GoogleGenAI({ apiKey });

    // Build config object only with provided fields, otherwise the SDK rejects undefined values.
    const config: Record<string, unknown> = {};
    if (systemInstruction) config.systemInstruction = systemInstruction;
    if (Array.isArray(tools) && tools.length > 0) config.tools = tools;
    if (responseMimeType) config.responseMimeType = responseMimeType;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      ...(Object.keys(config).length ? { config } : {}),
    });

    const text = result.text ?? '';
    return NextResponse.json({ text });
  } catch (error) {
    console.error('Error in Gemini API route:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate response.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
