export function uuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // Fallback: not RFC4122, but stable enough for local-only MVP
  return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

