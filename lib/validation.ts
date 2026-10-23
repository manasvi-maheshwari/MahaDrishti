export function parseMultiplier(value: string | null): number {
  if (!value) return 1.0;
  
  const parsed = parseFloat(value);
  if (isNaN(parsed) || !isFinite(parsed)) {
    return 1.0;
  }
  
  // Clamp between 0.5 and 6.0
  return Math.min(Math.max(parsed, 0.5), 6.0);
}