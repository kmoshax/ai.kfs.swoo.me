export function newSid(): string {
  return crypto.randomUUID().replace(/-/g, "");
}
