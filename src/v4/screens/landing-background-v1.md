# landing-background-v1 — snapshot (saved 2026-09-20)

The landing hero background as of v1: the daybreak gradient ground plus the
hand-drawn **pixel bitmap clouds** drifting across it. Saved before trying
the Paper shader cloud background (v2). To restore, set `LANDING_BG = 'v1'`
in `Landing.jsx` — all v1 code remains in the repo.

## Ground

- Hero section class `grad-daybreak`, gradient painted by `.lp-hero-grad`
  inside `.lp-hero-parallax` (translates at 0.4× scroll for parallax):

  ```css
  --grad-daybreak: linear-gradient(155deg, #AFC8F6 0%, #C6C1F0 26%, #E7DDEE 48%, #FBEBDD 68%, #F9BF9E 100%);
  ```

- The section's own `backgroundImage` is switched off inline; the
  `grad-daybreak` class also carries the DS grain `::before` overlay.

## Pixel clouds (assets: `public/ds-v4/assets/clouds/cloud-{a,b,c}.svg`)

Hand-drawn 1× pixel grids (28×14 / 18×10 / 24×12): cream `#FFFDF9` bodies,
peri `#DCE6FB` dithered undersides, stray edge pixels; cloud-a wears a face
(ink `#1C1746` eyes, blush `#F9BF9E`).

Five `<span class="lp-cloud">` instances inside `.lp-clouds` (in the
parallax wrapper), each `--dur` / `--delay` / `--rest` / `--op`:

| cloud   | top   | width | dur  | delay  | rest | opacity |
|---------|-------|-------|------|--------|------|---------|
| cloud-a | 84px  | 196px | 95s  | −12s   | 10vw | 0.95    |
| cloud-b | 152px | 118px | 135s | −78s   | 58vw | 0.8     |
| cloud-b | 44px  | 88px  | 160s | −110s  | 80vw | 0.7     |
| cloud-c | 316px | 150px | 115s | −45s   | 30vw | 0.45    |
| cloud-c | 430px | 108px | 145s | −20s   | 72vw | 0.35    |

## Animations (Landing.css)

- `lp-cloud-drift`: translateX(−30vw → 112vw), linear, infinite (per-cloud
  `--dur`, negative `--delay` spreads them mid-flight).
- `lp-cloud-bob`: translateY(0 → 7px), ease-in-out, alternate, 7s base with
  9s/−3s and 11s/−6s phase staggers via `:nth-child(2n/3n)`.
- Drop shadow: `drop-shadow(0 8px 18px rgba(28, 23, 70, 0.07))`,
  `image-rendering: pixelated`.
- Reduced motion: animations off, each cloud parked at `translateX(--rest)`.

## Characters (currently hidden)

Pixel sprites at `public/ds-v4/assets/pixel/{bird,snail,spark}.svg`
(commented-out `.lp2-float` imgs in `Landing.jsx`; float animation
`bw-float` 5.5s with `d1/d2/d3` delays).
