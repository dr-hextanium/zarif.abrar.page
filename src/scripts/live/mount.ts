// thin dom glue for the home page live bits. every failure stays silent and hides the widget.
import { accounts } from "../../data/accounts";
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
      art.src = spotify.artUrl;
      art.alt = `album art for ${spotify.album}`;
      art.hidden = false;
    } else if (art) {
      art.hidden = true;
      art.removeAttribute("src");
    }
  }

  let polling = false;
  async function pollDiscord() {
    if (polling) return;
    polling = true;
    renderDiscord(parseLanyard(await fetchJson(`https://api.lanyard.rest/v1/users/${accounts.discordId}`)));
    polling = false;
  }
  if (accounts.discordId) {
    renderDiscord(null);
    pollDiscord();
    setInterval(() => !document.hidden && pollDiscord(), 30_000);
    document.addEventListener("visibilitychange", () => !document.hidden && pollDiscord());
  }

  // lichess and github: one fetch per page load, hidden unless it works
  async function once<T>(account: string, key: string, url: string, parse: (json: unknown) => T | null, render: (li: HTMLElement | null, data: T) => void) {
    const li = $(`li[data-live="${key}"]`);
    if (!li) return; // only the home page has these
    const data = account ? parse(await fetchJson(url)) : null;
    if (data) render(li, data);
    show(li, data !== null);
  }
  const lichess = `https://lichess.org/@/${accounts.lichess}`;
  once(accounts.lichess, "lichess", `https://lichess.org/api/user/${accounts.lichess}`, parseLichess, (li, ratings) =>
    setLinks(li, "lichess ", ratings.map((r) => [`${r.perf} ${r.rating}`, r.perf === "rapid" ? `${lichess}/perf/rapid` : lichess])),
  );
  once(accounts.github, "github", `https://api.github.com/users/${accounts.github}/events/public?per_page=30`, parseGithub, (li, repos) =>
    setLinks(li, "pushed to ", repos.map((r) => [r.split("/").pop()!, `https://github.com/${r}`])),
  );

  // "looking" switch, then the closing line which depends on it
  (async () => {
    const looking = parseLooking(await fetchJson("/looking.json", { cache: "no-cache" }));
    if (looking) {
      document.body.dataset.looking = looking.looking ? "on" : "off";
      $$("[data-looking-phrase]").forEach((el) => (el.textContent = looking.phrase));
      $$("[data-looking-only]").forEach((el) => (el.hidden = !looking.looking));
    }
    const closing = $("[data-closing]");
    if (closing) {
      let lines: string[] = [];
      try {
        const parsed = JSON.parse(closing.dataset.lines ?? "[]");
        if (Array.isArray(parsed)) lines = parsed.filter((l) => typeof l === "string");
      } catch {}
      closing.textContent = pickClosing(lines, looking);
    }
  })();
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => mount());
  else mount();
}
