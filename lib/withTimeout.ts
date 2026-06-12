/** Race any promise against a timeout (Supabase / network hangs). */
export function withTimeout<T>(
  promise: PromiseLike<T>,
  ms: number,
  label = 'Request',
): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000}s.`)), ms);
    }),
  ]);
}
