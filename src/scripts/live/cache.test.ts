/// <reference types="bun" />
import { expect, test } from "bun:test";
import { isFresh, recall, remember } from "./cache";

function store(): Storage {
  const m = new Map<string, string>();
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => void m.set(k, v),
    removeItem: (k) => void m.delete(k),
    clear: () => m.clear(),
    key: () => null,
    get length() {
      return m.size;
    },
  };
}

test("remembers the last answer and how old it is", () => {
  const s = store();
  expect(recall("github", s)).toBeNull();
  expect(isFresh("github", 1000, 0, s)).toBe(false);
  remember("github", [{ a: 1 }], 5000, s);
  expect(recall("github", s)).toEqual([{ a: 1 }]);
  expect(isFresh("github", 1000, 5999, s)).toBe(true);
  expect(isFresh("github", 1000, 6001, s)).toBe(false);
});

test("bad or missing storage reads as empty and never throws", () => {
  const s = store();
  s.setItem("cache:github", "{not json");
  expect(recall("github", s)).toBeNull();
  expect(isFresh("github", 1000, 0, s)).toBe(false);
  const broken = { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("blocked"); } } as unknown as Storage;
  expect(recall("github", broken)).toBeNull();
  expect(() => remember("github", 1, 0, broken)).not.toThrow();
  expect(recall("github", undefined)).toBeNull();
});
