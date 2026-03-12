export const TOKEN_RATE = 0.1; // 1 token = ₹0.10

/**
 * Maps eco sustainability score to token reward.
 * Finer-grained tiers so tokens feel earned, not flat.
 *   90–100 → 20  (top-tier certified)
 *   80–89  → 15  (high eco score)
 *   60–79  → 10  (mid-range eco)
 *   40–59  →  5  (borderline eco)
 *   < 40   →  0  (not eco)
 */
export function calcTokens(score: number): number {
  if (score >= 90) return 20;
  if (score >= 80) return 15;
  if (score >= 60) return 10;
  if (score >= 40) return 5;
  return 0;
}

export function tokensToMoney(tokens: number): number {
  return tokens * TOKEN_RATE;
}

export function carbonFromScore(score: number, price: number): number {
  const factor = score / 100;
  return parseFloat((price * 0.002 * factor).toFixed(3));
}