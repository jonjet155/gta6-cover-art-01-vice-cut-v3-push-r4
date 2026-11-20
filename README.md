# VICE CUT — One Photo, One Poster

[![make.fun](https://make.fun/badge.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![make.fun](https://make.fun/badge.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![make.fun](https://make.fun/badge.svg)](https://make.fun/bounty/gta6-cover-art-01)

A GTA 6 cover-art studio that turns **one photo into a movie poster**: one huge
face, one giant title, one neon cut. Built for the
[make.fun GTA 6 Cover Art bounty](https://make.fun/bounty/gta6-cover-art-01).

## The concept

The top covers on the leaderboard
all do the same thing: **one big photo, one huge face, one giant title**. No
panels, no collage. So VICE CUT does exactly that — a one-sheet movie poster:

- **Full-bleed hero photo, ONE face HUGE** — face height ≥ 50% of the cover,
  warm sunset / neon grading, subtle vignette. The face IS the cover.
- **The CUT** — a thin neon diagonal slash (pink → purple) cutting across the
  lower third. The title sits on the cut.
- **Redesigned logo lockup "VICE CUT"** — Bebas Neue, tightened. **VICE** in
  solid white, **CUT** in a neon pink → purple gradient, the two words split
  by the diagonal slash at ~30°. Neon glow, thick dark outline, drop shadow.
  A small **VC monogram in a slashed square** (drawn in code) marks the editor
  header and the favicon.
- **Tagline "Painted in Leonida."** in Caveat script, tucked tight under the
  title.
- **Poster furniture** — round seal ("ORIGINAL COVER ART • EST. 2026") top
  corner, 5-star rating, billing block at the very bottom, "VOL. 06" mark.
- Everything stays readable at 768×480 — the judge's whole view.

## 3 steps, photo to PNG

1. **Drop your photo** — FileReader / object URLs, never uploaded. Click to
   place; crop + pan + zoom (drag the poster, scroll to zoom, "Fit face").
2. **Pick grade + poster style + edit the words** — 4 grades (Warm Sunset,
   Neon Night, Teal Coast, Ink Mono), 4 poster styles (Full-Bleed, Split,
   Duotone, Framed), title / tagline / billing text all editable.
3. **Export PNG** — exact 1080×1080, 1080×1350, 1920×1080.

Zero clicks to a first poster: Full-Bleed + sunset grade + title `VICE CUT` +
tagline `Painted in Leonida.` + sample photos preloaded.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

Fully offline: static files under `app/` only, no network requests of any
kind. Fonts are local OFL files (`app/fonts/`). No libraries.

## Shots

`?shot=cover` shows the cover alone, full frame. `?shot=editor` shows the
studio with a sample loaded. Params: `layout`, `grade`, `style`, `title`,
`tagline`, `billing`, `size`, `stars` (1/0), `badge` (1/0), `photo`. The app
sets `window.__shotReady` once painted.

## Credits

- Sample photos: free-license stock from Pexels (Pexels License, free to use):
  - `hero.jpg` — smiling woman at golden hour, by Kiro Wang —
    https://www.pexels.com/photo/a-woman-with-brown-hair-backlit-by-the-sunset-7243031/
  - `closeup.jpg` — close-up portrait in warm sunset light —
    https://www.pexels.com/photo/selective-focus-close-up-photo-of-woman-s-face-2897408/
  - `curly.jpg` — curly-haired woman at golden hour, by Katie Mukhina —
    https://www.pexels.com/photo/golden-hour-portrait-of-a-woman-with-curly-hair-34105559/
  - `blond.jpg` — blond woman in warm sunlight, by Jamie Saw —
    https://www.pexels.com/photo/photo-of-a-beautiful-blond-woman-10029734/
  - `shades.jpg` — smiling man with sunglasses, city street —
    https://www.pexels.com/photo/close-up-photography-of-man-wearing-sunglasses-1212984/
  - `dusk.jpg` — woman looking over her shoulder at golden hour, by Kate Gundareva —
    https://www.pexels.com/photo/beautiful-woman-looking-over-shoulder-9452966/
- Fonts: Bebas Neue (Dharma Type) and Caveat (Caveat Project Authors), both
  SIL Open Font License 1.1 — license texts in `app/fonts/`.
- Original art only: no Rockstar Games logo, artwork or font anywhere.

## License

MIT — see LICENSE.
