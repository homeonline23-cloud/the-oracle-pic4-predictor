/** Save a 4-digit winning number to the neural memory bank (server API). */
export async function recordWinningNumberClient(
  number: string,
  location = 'Global',
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/record-winning-number', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ number, location }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: data.error || 'Failed to record winning number.' };
    }
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error';
    return { ok: false, error: message };
  }
}
