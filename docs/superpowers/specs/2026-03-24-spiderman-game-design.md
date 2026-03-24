# Spider-Man Web-Swinging Endless Runner — Design Spec

**Date:** 2026-03-24
**Status:** Approved

---

## Overview

A Spider-Man themed web-swinging endless runner game, accessible from the portfolio footer via a "Play a Game" button. The game lives at `/game` as a dedicated full-screen page. Built with Phaser.js (lazy-loaded so it has zero impact on portfolio performance). Visual style is full comic-book: bright NYC skyline, colorful buildings, classic red/blue Spidey suit.

---

## Architecture

### Page & Component Structure

- `src/app/game/page.tsx` — Full-screen Next.js route shell. Dynamically imports `SpiderManGame` with `{ ssr: false }` so Phaser (which requires `window`) never runs server-side.
- `src/components/game/SpiderManGame.tsx` — Client component that mounts a Phaser `Game` instance into a `div` ref on mount and destroys it on unmount.

### Scenes

| Scene | Purpose |
|---|---|
| `BootScene` | Preloads all assets: sprite sheets, building tiles, fonts |
| `MenuScene` | Splash screen — Spidey silhouette, "PRESS SPACE / TAP TO SWING", comic-book panel style |
| `GameScene` | Core game loop |
| `GameOverScene` | Final score, high score (localStorage), "Play Again" + "← Back to Portfolio" buttons |

### Entities

| Entity | Purpose |
|---|---|
| `Player` | Spidey sprite, swing physics via MatterJS constraint, animation states (swing / fall / run) |
| `Building` | Procedural building generator — randomized heights/widths, always crossable |
| `WebLine` | Renders the rope line between Spidey and the anchor point while swinging |

### Config

`src/components/game/config.ts` — Phaser `GameConfig`: canvas dimensions (full viewport), MatterJS physics, scene order.

### Assets

```
public/game/
  spidey-sheet.png    ← sprite sheet: swinging, falling, running frames
  buildings.png       ← building tile set
```

---

## Game Mechanics

### Movement

- Spidey auto-moves right continuously (world scrolls left).
- `Space` (desktop) or tap (mobile) fires a web to the nearest building anchor above-right.
- Spidey swings in a pendulum arc using a MatterJS rope constraint.
- Release `Space` / lift tap to detach and fly.
- Holding longer = fuller swing arc = more height/distance.
- Missing an anchor = fall = game over.

### World Generation

- Buildings procedurally generated from the right edge.
- Randomized heights and widths; gap between buildings is always swingable.
- Speed increases every 30 seconds.
- Comic-book visual style: bright fill colors (yellows, blues, reds), bold black outlines, window grids.

### Scoring

- +1 point per building cleared.
- Combo multiplier for chaining swings without touching the ground.
- High score persisted in `localStorage`.

### Visual Polish

- **Parallax layers:** Distant NYC skyline scrolls slower than foreground buildings.
- **Web line:** Drawn between Spidey and anchor while swinging.
- **THWIP! burst:** Small comic-book text burst on web fire.
- **Spidey sprite:** Pixel-art or SVG, classic red/blue suit, animated frames.

---

## Footer Integration

A new button added to the bottom bar of `src/components/Footer.tsx`:

```tsx
<a
  href="/game"
  className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-[#F0EBE0]/30 mono-tag text-[#F0EBE0]/60 hover:border-accent hover:text-accent transition-colors brutal-hover"
>
  <FiGrid size={13} aria-hidden="true" />
  Play a Game
</a>
```

Styled to match the existing "Back to Top" button aesthetics.

---

## File Structure

```
src/
  app/
    game/
      page.tsx
  components/
    game/
      SpiderManGame.tsx
      config.ts
      scenes/
        BootScene.ts
        MenuScene.ts
        GameScene.ts
        GameOverScene.ts
      entities/
        Player.ts
        Building.ts
        WebLine.ts
public/
  game/
    spidey-sheet.png
    buildings.png
```

---

## Constraints & Notes

- Phaser must be dynamically imported (`next/dynamic`, `ssr: false`) — it accesses `window` at import time.
- The `/game` route is independent; no shared state with the rest of the portfolio.
- Assets in `public/game/` are served statically; sprite sheets should be kept small (<200KB total).
- Mobile support via tap events in Phaser's input system.
