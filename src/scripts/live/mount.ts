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
  const setText = (el: HTMLElement | null, text: string) => {
    const target = el?.querySelector<HTMLElement>("[data-live-text]");
    if (target) target.textContent = text;
  };

  // discord status and spotify record: re-rendered on every poll, so stale data never lingers
  const art = $('img[data-live="album-art"]') as HTMLImageElement | null;
  function renderDiscord(data: ReturnType<typeof parseLanyard>) {
    const online = data !== null && data.status !== "offline";
    const spotify = online ? data.spotify : null;

    show($('li[data-live="discord"]'), online);
    show($('li[data-live="offline"]'), !online);
    if (online) setText($('li[data-live="discord"]'), `discord: ${data.status === "dnd" ? "busy" : data.status}`);

    const record = $('[data-live="record"]');
    if (record) record.dataset.state = spotify ? "playing" : "stopped";
    const np = $('[data-live="np"]');
    if (np) np.textContent = spotify ? `${spotify.album}, ${spotify.artist}` : "";
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
  async function once(account: string, key: string, url: string, parse: (json: unknown) => string | null) {
    const li = $(`li[data-live="${key}"]`);
    const text = account ? parse(await fetchJson(url)) : null;
    if (text) setText(li, text);
    show(li, text !== null);
  }
  once(accounts.lichess, "lichess", `https://lichess.org/api/user/${accounts.lichess}`, parseLichess);
  once(
    accounts.github,
    "github",
    `https://api.github.com/users/${accounts.github}/events/public?per_page=30`,
    parseGithub,
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
