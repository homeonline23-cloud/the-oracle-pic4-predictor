/** Read a fetch Response as JSON; never throw on HTML error pages (504/502 from Vercel). */
export async function parseApiJsonResponse<T = Record<string, unknown>>(
  response: Response,
): Promise<T> {
  const text = await response.text();
  const trimmed = text.trim();

  if (!trimmed) {
    throw new Error(`Server returned an empty response (${response.status}). Please try again.`);
  }

  if (trimmed.startsWith('<')) {
    throw new Error(
      response.status === 504 || /timeout/i.test(trimmed)
        ? 'The AI server timed out. Wait a moment and try again — Yearly grids can take up to 30 seconds.'
        : `Server error (${response.status}). The site returned an error page instead of AI data. Please refresh and try again.`,
    );
  }

  try {
    return JSON.parse(trimmed) as T;
  } catch {
    throw new Error(
      `Server returned invalid data (${response.status}). Please refresh and try again.`,
    );
  }
}
