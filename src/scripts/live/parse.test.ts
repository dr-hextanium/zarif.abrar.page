/// <reference types="bun" />
import { expect, test } from "bun:test";
import { parseGithub, parseLanyard, parseLichess, parseLooking, pickClosing } from "./parse";

const spotify = { song: "s", artist: "a", album: "b", album_art_url: "https://i.scdn.co/x.jpg" };
const lanyard = (data: object) => ({ success: true, data });

test("lanyard: playing needs the flag and the spotify object", () => {
  const on = parseLanyard(lanyard({ discord_status: "idle", listening_to_spotify: true, spotify }));
  expect(on).toEqual({
    status: "idle",
    spotify: { song: "s", artist: "a", album: "b", artUrl: "https://i.scdn.co/x.jpg" },
  });
  expect(parseLanyard(lanyard({ discord_status: "online", listening_to_spotify: false, spotify }))?.spotify).toBeNull();
  expect(parseLanyard(lanyard({ discord_status: "online", listening_to_spotify: true, spotify: null }))?.spotify).toBeNull();
});

test("lanyard: non-https art url is dropped, bad payloads are null", () => {
  const http = { ...spotify, album_art_url: "http://x/y.jpg" };
  const r = parseLanyard(lanyard({ discord_status: "dnd", listening_to_spotify: true, spotify: http }));
  expect(r?.spotify?.artUrl).toBeNull();
  expect(parseLanyard({ success: false })).toBeNull();
  expect(parseLanyard(lanyard({ discord_status: "weird" }))).toBeNull();
  expect(parseLanyard(null)).toBeNull();
});

test("lichess: shows only the ratings that exist", () => {
  const perfs = (p: object) => ({ perfs: p });
  expect(parseLichess(perfs({ rapid: { rating: 1650 }, puzzle: { rating: 2100 } }))).toEqual([
    { perf: "rapid", rating: 1650 },
    { perf: "puzzle", rating: 2100 },
  ]);
  expect(parseLichess(perfs({ puzzle: { rating: 2100 } }))).toEqual([{ perf: "puzzle", rating: 2100 }]);
  expect(parseLichess(perfs({ rapid: { rating: "x" } }))).toBeNull();
  expect(parseLichess({})).toBeNull();
  // unplayed modes come back as a default provisional rating
  expect(parseLichess(perfs({ rapid: { rating: 2500, games: 0, prov: true }, puzzle: { rating: 2100, games: 40 } }))).toEqual([
    { perf: "puzzle", rating: 2100 },
  ]);
  expect(parseLichess(perfs({ rapid: { rating: 1500, games: 3, prov: true } }))).toBeNull();
});

test("github: distinct repos from push events, newest first, top 3", () => {
  const push = (name: string) => ({ type: "PushEvent", repo: { name } });
  const events = [push("z/a"), { type: "WatchEvent", repo: { name: "z/w" } }, push("z/b"), push("z/a"), push("z/c"), push("z/d")];
  expect(parseGithub(events)).toEqual(["z/a", "z/b", "z/c"]);
  expect(parseGithub([{ type: "WatchEvent", repo: { name: "z/w" } }])).toBeNull();
  expect(parseGithub({ message: "rate limited" })).toBeNull();
});

test("looking: validates types", () => {
  expect(parseLooking({ looking: true, phrase: "p" })).toEqual({ looking: true, phrase: "p" });
  expect(parseLooking({ looking: "yes", phrase: "p" })).toBeNull();
  expect(parseLooking({ looking: true })).toBeNull();
  expect(parseLooking({ looking: true, phrase: "  " })).toBeNull();
});

test("closing: looking line wins, otherwise random from the list", () => {
  const lines = ["one", "two"];
  expect(pickClosing(lines, { looking: true, phrase: "p" }, () => 0.99)).toBe("i'm looking for p. write to me.");
  expect(pickClosing(lines, { looking: false, phrase: "p" }, () => 0.99)).toBe("two");
  expect(pickClosing(lines, null, () => 0)).toBe("one");
  expect(pickClosing([], null)).toBe("");
});
