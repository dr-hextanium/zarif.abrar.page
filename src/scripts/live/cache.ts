// last answer from each live api, kept in this browser so a refresh shows it at once
// and skips the fetch while it is fresh. storage can be blocked: every miss reads as empty.
type Entry = { t: number; data: unknown };

function local(): Storage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

function read(key: string, store: Storage | undefined): Entry | null {
  try {
    const entry = JSON.parse(store?.getItem(`cache:${key}`) ?? "null");
    return entry && typeof entry.t === "number" ? entry : null;
  } catch {
    return null;
  }
}

export const recall = (key: string, store = local()) => read(key, store)?.data ?? null;

export const isFresh = (key: string, ttlMs: number, now = Date.now(), store = local()) => {
  const entry = read(key, store);
  return entry !== null && now - entry.t <= ttlMs;
};

export function remember(key: string, data: unknown, now = Date.now(), store = local()) {
  try {
    store?.setItem(`cache:${key}`, JSON.stringify({ t: now, data }));
  } catch {}
}
