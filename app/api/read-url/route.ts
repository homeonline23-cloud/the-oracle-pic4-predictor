import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 30;

const MAX_BYTES = 500_000;
const MAX_TEXT_CHARS = 12_000;

function isBlockedHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (h === 'localhost' || h.endsWith('.local')) return true;
  if (h === '127.0.0.1' || h === '0.0.0.0' || h.startsWith('192.168.') || h.startsWith('10.')) {
    return true;
  }
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true;
  return false;
}

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Fetch public web page text for Emma (http/https only, no private hosts). */
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { url?: string };
    const raw = body.url?.trim();
    if (!raw) {
      return NextResponse.json({ error: 'Missing url.' }, { status: 400 });
    }

    let parsed: URL;
    try {
      parsed = new URL(raw);
    } catch {
      return NextResponse.json({ error: 'Invalid URL.' }, { status: 400 });
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return NextResponse.json({ error: 'Only http and https links are supported.' }, { status: 400 });
    }

    if (isBlockedHost(parsed.hostname)) {
      return NextResponse.json({ error: 'That link cannot be read from here.' }, { status: 400 });
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);

    let res: Response;
    try {
      res = await fetch(parsed.toString(), {
        signal: controller.signal,
        headers: {
          Accept: 'text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.8',
          'User-Agent': 'TheOraclePic4-Emma/1.0 (link reader for owner training)',
        },
        redirect: 'follow',
      });
    } finally {
      clearTimeout(timer);
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: `Could not read page (HTTP ${res.status}).` },
        { status: 502 },
      );
    }

    const contentType = res.headers.get('content-type') ?? '';
    const buffer = await res.arrayBuffer();
    if (buffer.byteLength > MAX_BYTES) {
      return NextResponse.json({ error: 'Page is too large to read.' }, { status: 413 });
    }

    const rawText = new TextDecoder('utf-8', { fatal: false }).decode(buffer);
    let text = rawText;
    if (contentType.includes('html') || rawText.includes('<html')) {
      text = htmlToText(rawText);
    }

    if (text.length > MAX_TEXT_CHARS) {
      text = `${text.slice(0, MAX_TEXT_CHARS)}… [truncated]`;
    }

    return NextResponse.json({
      url: parsed.toString(),
      title: parsed.hostname,
      text: text || '(No readable text on this page.)',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to read URL.';
    const status = /abort|timeout/i.test(message) ? 504 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
