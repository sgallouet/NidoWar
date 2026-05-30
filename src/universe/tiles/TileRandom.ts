export function hash(x: number, y: number, seed: number): number {
  let value = x * 374761393 + y * 668265263 + seed * 2246822519;
  value = (value ^ (value >> 13)) * 1274126177;
  return Math.abs(value ^ (value >> 16));
}

export function smoothstep(edge0: number, edge1: number, value: number): number {
  const amount = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
  return amount * amount * (3 - 2 * amount);
}
