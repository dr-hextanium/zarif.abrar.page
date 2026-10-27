// pure parsers: untrusted json in, a small checked value or null out

type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj | null => (v && typeof v === "object" ? (v as Obj) : null);
const str = (v: unknown) => (typeof v === "string" ? v : null);

export type Status = "online" | "idle" | "dnd" | "offline";
export type Spotify = { song: string; artist: string; album: string; artUrl: string | null; trackId: string | null };

export function parseLanyard(json: unknown): { status: Status; spotify: Spotify | null } | null {
  const root = obj(json);
  const data = obj(root?.data);
  if (!root || root.success !== true || !data) return null;
  const status = data.discord_status;
  if (status !== "online" && status !== "idle" && status !== "dnd" && status !== "offline") return null;

  let spotify: Spotify | null = null;
  const s = obj(data.spotify);
  if (data.listening_to_spotify === true && s) {
    const song = str(s.song);
    const artist = str(s.artist);
    const album = str(s.album);
    const art = str(s.album_art_url);
    if (song && artist && album) {
      spotify = { song, artist, album, artUrl: art?.startsWith("https://") ? art : null, trackId: str(s.track_id) };
    }
  }
  return { status, spotify };
}

export function parseLichess(json: unknown): { perf: string; rating: number }[] | null {
  const perfs = obj(obj(json)?.perfs);
  const ratings = [];
  for (const key of ["rapid", "puzzle"]) {
    const perf = obj(perfs?.[key]);
    // lichess returns a default provisional rating for modes never played
    if (perf?.games === 0 || perf?.prov === true || typeof perf?.rating !== "number") continue;
    ratings.push({ perf: key, rating: perf.rating });
  }
  return ratings.length ? ratings : null;
}

// full "owner/repo" names, newest first, top 3. the public events feed only lists public repos.
export function parseGithub(json: unknown): string[] | null {
  if (!Array.isArray(json)) return null;
  const repos = new Set<string>(); // events come newest first
  for (const e of json) {
    const name = str(obj(obj(e)?.repo)?.name);
    if (obj(e)?.type === "PushEvent" && name) repos.add(name);
  }
  return repos.size ? [...repos].slice(0, 3) : null;
}

export function parseLooking(json: unknown): { looking: boolean; phrase: string } | null {
  const j = obj(json);
  if (!j || typeof j.looking !== "boolean" || typeof j.phrase !== "string" || !j.phrase.trim()) return null;
  return { looking: j.looking, phrase: j.phrase };
}

export function pickClosing(
  lines: string[],
  looking: { looking: boolean; phrase: string } | null,
  random: () => number = Math.random,
): string {
  if (looking?.looking) return `i'm looking for ${looking.phrase}. write to me.`;
  return lines[Math.floor(random() * lines.length)] ?? "";
}
