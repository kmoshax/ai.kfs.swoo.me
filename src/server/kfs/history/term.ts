export function termKey(d: Date): string {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  if (m >= 10) return `${y}-fall`;
  if (m === 1) return `${y - 1}-fall`;
  if (m <= 6) return `${y}-spring`;
  return `${y}-summer`;
}

export function shouldRefetch(latest: number, now: number): boolean {
  return termKey(new Date(latest)) !== termKey(new Date(now));
}
