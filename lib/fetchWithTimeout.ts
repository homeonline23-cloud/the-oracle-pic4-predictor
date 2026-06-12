/** Fetch with an abort timeout so UI spinners cannot hang indefinitely. */
export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<Response> {
  const { timeoutMs = 90000, ...fetchInit } = init;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { ...fetchInit, signal: controller.signal });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(
        'The AI request timed out. Try again with fewer grids filled, or wait a moment and retry.',
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
