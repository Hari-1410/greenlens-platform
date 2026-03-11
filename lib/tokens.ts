export const TOKEN_RATE = 0.1; // 1 token = ₹0.10

export function calcTokens(score: number): number {
  if (score >= 80) return 20;
  if (score >= 60) return 12;
  if (score >= 40) return 5;
  return 0;
}

export function tokensToMoney(tokens: number): number {
  return tokens * TOKEN_RATE;
}

export function carbonFromScore(score: number, price: number): number {
  // Simple estimate: higher score = less carbon per ₹ spent
  const factor = score / 100;
  return parseFloat((price * 0.002 * factor).toFixed(3));
}
