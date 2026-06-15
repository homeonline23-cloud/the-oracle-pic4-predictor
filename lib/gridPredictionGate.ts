/** Require past winning numbers in Enter 4 Digits before AI predictions. */

export function getValidPastWinningInputs(inputs: string[]): string[] {
  return inputs.map((v) => v.trim()).filter((v) => /^\d{4}$/.test(v));
}

/** Minimum past draws members should enter before Predictor runs. */
export function minPastWinningInputsRequired(maxPredictions: number): number {
  if (maxPredictions >= 10) return 2;
  if (maxPredictions >= 5) return 2;
  return 1;
}

export function validatePastWinningNumbersBeforePredict(
  inputs: string[],
  maxPredictions: number,
): { ok: true; filled: string[] } | { ok: false; filled: string[]; message: string } {
  const filled = getValidPastWinningInputs(inputs);
  const required = minPastWinningInputsRequired(maxPredictions);

  if (filled.length >= required) {
    return { ok: true, filled };
  }

  const need = required - filled.length;
  const message =
    required === 1
      ? 'Enter at least one past winning number (4 digits) in Enter 4 Digits above the grids first — then AI can read the patterns.'
      : `Enter at least ${required} past winning numbers (4 digits each) in Enter 4 Digits first — ${need} more to go — then AI can see repeats across the grids.`;

  return { ok: false, filled, message };
}

export function isEmmaPredictionRequest(text: string): boolean {
  const t = text.toLowerCase().trim();
  if (!t) return false;
  if (/\b(memorize|remember|store|teach|training)\b/.test(t) && !/\b(predict|pick|tonight|draw)\b/.test(t)) {
    return false;
  }
  return (
    /\bpredict/.test(t) ||
    /\bpick\b/.test(t) ||
    /what.*tonight/.test(t) ||
    /winning number/.test(t) ||
    /pic\s*4/.test(t) ||
    /numbers? for tonight/.test(t) ||
    /what will (win|draw)/.test(t)
  );
}

export function emmaPastNumbersRequiredMessage(pathname: string): string {
  const yearly = pathname.startsWith('/yearly');
  const premium = pathname.startsWith('/premium');
  const count = yearly || premium ? 2 : 1;
  const label = yearly ? 'Yearly' : premium ? 'Premium' : 'Basic';
  return (
    `Friend — before I predict, enter ${count === 1 ? 'a' : count} past winning number${count > 1 ? 's' : ''} ` +
    `(4 digits each) in **Enter 4 Digits** on your ${label} grids. ` +
    `Then I can scan repeats and pattern families — not guesses from the blue sky. ` +
    `Mark cells too if you can; that helps even more.`
  );
}

export function minPastWinningInputsForPath(pathname: string): number {
  if (pathname.startsWith('/yearly') || pathname.startsWith('/premium')) return 2;
  if (pathname.startsWith('/basic')) return 1;
  return 1;
}
