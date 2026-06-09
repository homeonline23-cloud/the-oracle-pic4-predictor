/** Stale or broken Supabase session cookies (safe to clear and re-login). */
export function isInvalidRefreshTokenError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const e = error as { code?: string; message?: string; status?: number };
  if (e.code === 'refresh_token_not_found') return true;
  const msg = typeof e.message === 'string' ? e.message.toLowerCase() : '';
  return msg.includes('refresh token') || msg.includes('invalid refresh');
}
