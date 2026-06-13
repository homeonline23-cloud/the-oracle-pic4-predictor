import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const runtime = 'nodejs';
export const maxDuration = 60;

const TTS_MODEL = 'gemini-2.5-flash-preview-tts';
/** Warm, friendly female voice for Emma (USA guide). */
const EMMA_VOICE = 'Aoede';
const SINGLE_SPEAK_MAX = 480;

function cleanForSpeech(text: string): string {
  return text
    .replace(/\*\*/g, '')
    .replace(/\n+/g, ' ')
    .replace(/—/g, ', ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 500);
}

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Gemini API key is not configured.' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const text = cleanForSpeech(String(body.text ?? ''));
    if (!text) {
      return NextResponse.json({ error: 'No text to speak.' }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = text.length <= SINGLE_SPEAK_MAX
      ? `Emma (USA, warm, natural pace — read smoothly as one greeting):\n${text}`
      : `Emma (USA, warm):\n${text}`;

    const result = await ai.models.generateContent({
      model: TTS_MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: EMMA_VOICE,
            },
          },
        },
      },
    });

    const parts = result.candidates?.[0]?.content?.parts ?? [];
    const audioPart = parts.find(
      (p) => p.inlineData?.data && p.inlineData.mimeType?.startsWith('audio/'),
    );

    if (!audioPart?.inlineData?.data) {
      return NextResponse.json({ error: 'No audio returned from TTS model.' }, { status: 502 });
    }

    return NextResponse.json({
      audioBase64: audioPart.inlineData.data,
      mimeType: audioPart.inlineData.mimeType ?? 'audio/mp3',
    });
  } catch (error) {
    console.error('emma-speak:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate speech.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
