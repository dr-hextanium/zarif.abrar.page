// leave empty until the Lemon Squeezy checkout exists; the holdup page then shows "coming soon"
export const holdupCheckoutURL = "";

// in release order. page: true means apps/<slug> exists and gets a link
export const apps = [
  { slug: "holdup", name: "holdup", blurb: "ejects external disks and names what holds them", status: holdupCheckoutURL ? "$4.99" : "coming soon, $4.99", page: true },
  { slug: "ui-chimes", name: "ui chimes", blurb: "sounds for mac events", status: "coming soon", page: false },
  { slug: "origin", name: "origin", blurb: "where each file came from", status: "coming soon", page: false },
  { slug: "kick", name: "kick", blurb: "safe restarts for flaky mac parts", status: "coming soon", page: false },
  { slug: "edgescrub", name: "edgescrub", blurb: "scrub video from the trackpad edge", status: "coming soon", page: false },
  { slug: "fogglass", name: "fogglass", blurb: "wipe a foggy desktop clear", status: "coming soon", page: false },
];
