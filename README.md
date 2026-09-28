# Neem Studio — sample site (single file, light "premium" theme + WebGL)

## What's in here
- `index.html` — the whole site in one file (655,635 bytes). three.js r128 (MIT) is inlined,
  so there is **no build step, no npm, no CDN dependency**. Double-click it and it runs.
- `README.md` — this file.

## Open it
Just open `index.html` in Chrome, Safari or Firefox. Everything works from `file://`,
including the live "Open now / Closed" clock (it always uses Africa/Johannesburg time, not the
visitor's clock) and the 3D orb.

Two things that need the internet:
- **Fonts** — Bodoni Moda + Jost load from Google Fonts. Offline you get the fallback serif/sans,
  still styled, just less fancy.
- **Links** — "Book 062 171 0836", the Google Maps link and the Instagram link point outward.

Nothing else is fetched. No analytics, no images to host.

## What is real vs. what needs confirming
Every fact on the page was taken from the public Google listing and the Fresha page —
4.5★/136 Google, 4.7★/483 Fresha, 219 Imam Haron Rd, hours, phone, @neem_studio_, and the
published prices (cupping 425/1h, facial cupping 80/15min, back scrub 120/15min, reflexology
99/20min, kids 100/170/200, neem massage from 150, Hijaama women-only). Where no price is
published it says **"Enquire"** rather than inventing one.

The layout, wording, section order and the orb are a **concept** — confirm the copy, prices and
hours before this goes live.

## Change the colours (one block)
Open `index.html`, find `:root{` (about line 17) and edit:

```
--bone:#f7f4ed      page background
--forest:#142d26    all type, buttons, the orb's glass
--muted:#55665f     secondary text
--gold:#9a742f      accent: rules, labels, hover rails, prices
--gold-lt:#c8a45f   champagne highlight (button wipe, selection)
--jade:#2f7d5c      "open now" dot      --rose:#a8616f  "closed" dot
--display / --body  the two font stacks
```

The 3D scene has its own colours a bit further down, in the block marked
`// procedural studio environment` — `scene.background`, `setClearColor`, and the
`MeshPhysicalMaterial` colour control the orb's glass and reflections.

## Performance notes
Device pixel ratio is capped at 1.8, the orb morphs every 2nd frame (3rd on phones), and the
render loop pauses when the tab is hidden. If WebGL is unavailable or blocked, the canvas hides
itself and the page still reads fine — the fallback is pure CSS.

## Publishing
Drop `index.html` in a repo and turn on Settings → Pages → Deploy from branch → `master` / root.
Or drag the file onto app.netlify.com/drop for a live URL in about 20 seconds.
Then point `neemstudio.co.za` at it (that domain is currently dead, which is the pitch angle).
