// thin dom glue for the home page live bits. every failure stays silent and hides the widget.
import { accounts } from "../../data/accounts";
import { isFresh, recall, remember } from "./cache";
import { parseGithub, parseLanyard, parseLichess, parseLooking, pickClosing } from "./parse";

async function fetchJson(url: string, init?: RequestInit): Promise<unknown> {
  try {
    const res = await fetch(url, { ...init, signal: AbortSignal.timeout(8000) });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

export function mount() {
  const $ = (sel: string) => document.querySelector<HTMLElement>(sel);
  const $$ = (sel: string) => document.querySelectorAll<HTMLElement>(sel);
  const show = (el: HTMLElement | null, on: boolean) => el && (el.hidden = !on);
  const link = (text: string, href: string) => Object.assign(document.createElement("a"), { textContent: text, href });
  // fills "[prefix] a, b, c" with each item as a link
  const setLinks = (el: HTMLElement | null, prefix: string, items: [string, string][]) => {
    const parts: (string | Node)[] = [prefix];
    items.forEach(([text, href], i) => parts.push(...(i ? [", "] : []), link(text, href)));
    el?.querySelector("[data-live-text]")?.replaceChildren(...parts);
  };

  // discord status and spotify record: re-rendered on every poll, so stale data never lingers
  const art = $('img[data-live="album-art"]') as HTMLImageElement | null;
  function renderDiscord(data: ReturnType<typeof parseLanyard>) {
    const online = data !== null && data.status !== "offline";
    const spotify = online ? data.spotify : null;

    const discord = $('[data-live="discord"]');
    show(discord, online);
    show($('[data-live="offline"]'), !online);
    if (online && discord) {
      discord.dataset.status = data.status;
      const text = discord.querySelector("[data-live-text]");
      if (text) text.textContent = data.status === "dnd" ? "do not disturb" : data.status;
    }

    const record = $('[data-live="record"]');
    if (record) record.dataset.state = spotify ? "playing" : "stopped";
    const np = $('[data-live="np"]');
    if (np) {
      const text = spotify ? `${spotify.album}, ${spotify.artist}` : "";
      np.replaceChildren(spotify?.trackId ? link(text, `https://open.spotify.com/track/${spotify.trackId}`) : text);
    }
    show(np, spotify !== null);

    if (art && spotify?.artUrl) {
      art.alt = `album art for ${spotify.album}`;
      // only on a new track; shown once loaded so it eases in whole, not row by row
      if (art.getAttribute("src") !== spotify.artUrl) {
        art.hidden = true;
        art.onload = () => (art.hidden = false);
        art.src = spotify.artUrl;
      }
    } else if (art) {
      art.hidden = true;
      art.removeAttribute("src");
    }
  }

  let polling = false;
  async function pollDiscord() {
    if (polling) return;
    polling = true;
    const json = await fetchJson(`https://api.lanyard.rest/v1/users/${accounts.discordId}`);
    const data = parseLanyard(json);
    if (data) remember("lanyard", json);
    renderDiscord(data);
    polling = false;
  }
  if (accounts.discordId) {
    // the last answer shows at once; with none, nothing shows until the first, so "offline" never flashes first
    const last = parseLanyard(recall("lanyard"));
    if (last) renderDiscord(last);
    pollDiscord();
    setInterval(() => !document.hidden && pollDiscord(), 30_000);
    document.addEventListener("visibilitychange", () => !document.hidden && pollDiscord());
  }

  // github and lichess: the last answer shows at once and is refetched at most every 10 minutes,
  // which keeps github under its 60 requests an hour. offline or rate limited keeps the last answer.
  function live<T>(key: string, url: string, parse: (json: unknown) => T | null, render: (data: T | null) => void) {
    render(parse(recall(key)));
    if (isFresh(key, 10 * 60_000)) return;
    fetchJson(url).then((json) => {
      const data = parse(json);
      if (!data) return;
      remember(key, json);
      render(data);
    });
  }

  // github: hidden unless there is an answer
  const githubLi = $('li[data-live="github"]');
  if (githubLi && accounts.github) {
    live("github", `https://api.github.com/users/${accounts.github}/events/public?per_page=30`, parseGithub, (repos) => {
      if (repos) setLinks(githubLi, "pushed to ", repos.map((r) => [r.split("/").pop()!, `https://github.com/${r}`]));
      show(githubLi, repos !== null);
    });
  }

  // lichess always shows (placeholder or cached ratings); an answer only touches it when the numbers changed
  const lichessLi = $('li[data-live="lichess"]');
  const lichessText = lichessLi?.querySelector("[data-live-text]");
  if (lichessLi && lichessText && accounts.lichess) {
    const lichess = `https://lichess.org/@/${accounts.lichess}`;
    live("lichess", `https://lichess.org/api/user/${accounts.lichess}`, parseLichess, (ratings) => {
      if (!ratings) return; // keep what is shown
      const before = lichessText.innerHTML;
      setLinks(lichessLi, "lichess ", ratings.map((r) => [`${r.perf} ${r.rating}`, r.perf === "rapid" ? `${lichess}/perf/rapid` : lichess]));
      try {
        localStorage.setItem("lichess", lichessText.innerHTML); // read by the inline script before first paint
      } catch {}
      if (lichessText.innerHTML !== before) lichessText.animate?.([{ opacity: 0.25 }, { opacity: 1 }], { duration: 400, easing: "ease-out" });
    });
  }

  // "looking" switch, then the closing line which depends on it. the last answer shows at once;
  // the fetch only redraws when the answer changed.
  const closing = $("[data-closing]");
  let lines: string[] = [];
  try {
    const parsed = JSON.parse(closing?.dataset.lines ?? "[]");
    if (Array.isArray(parsed)) lines = parsed.filter((l) => typeof l === "string");
  } catch {}
  function applyLooking(looking: ReturnType<typeof parseLooking>) {
    if (looking) {
      document.body.dataset.looking = looking.looking ? "on" : "off";
      $$("[data-looking-phrase]").forEach((el) => (el.textContent = looking.phrase));
      $$("[data-looking-only]").forEach((el) => (el.hidden = !looking.looking));
    }
    if (closing) {
      closing.textContent = pickClosing(lines, looking);
      closing.dataset.ready = ""; // css eases it in
    }
  }
  const lastLooking = parseLooking(recall("looking"));
  if (lastLooking) applyLooking(lastLooking);
  fetchJson("/looking.json", { cache: "no-cache" }).then((json) => {
    const current = parseLooking(json);
    if (current) remember("looking", json);
    const looking = current ?? lastLooking;
    if (!lastLooking || JSON.stringify(looking) !== JSON.stringify(lastLooking)) applyLooking(looking);
  });
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => mount());
  else mount();
}
