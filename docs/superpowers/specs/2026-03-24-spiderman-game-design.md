# Spider-Man Web-Swinging Endless Runner — Design Spec

**Date:** 2026-03-24
**Status:** Approved

---

## Overview

A Spider-Man themed web-swinging endless runner game, accessible from the portfolio footer via a "Play a Game" button. The game lives at `/game` as a dedicated full-screen page. Built with Phaser.js (lazy-loaded so it has zero impact on portfolio performance). Visual style is full comic-book: bright NYC skyline, colorful buildings, classic red/blue Spidey suit.

---

## Architecture

### Route Group Restructure (Required for Layout Isolation)

In Next.js App Router, nested layouts are always wrapped by all ancestor layouts. A simple `src/app/game/layout.tsx` cannot opt out of the root layout's `SmoothScroll`, `CustomCursor`, and `ClientLayout`. The only supported escape hatch is multiple root layouts via route groups.

**Required restructure:**

```
src/app/
  (portfolio)/
    layout.tsx     ← moves current root layout here (ThemeProvider, ClientLayout, SmoothScroll, CustomCursor, fonts)
    page.tsx       ← moved from src/app/page.tsx
    ... all other existing portfolio routes
  (game)/
    layout.tsx     ← bare root layout: <html> + <body> with font variables only, no wrappers
    game/
      page.tsx     ← Server Component shell + metadata
```

The `(portfolio)/layout.tsx` is based on the current `src/app/layout.tsx` with one change: the `./globals.css` import must be updated to `../globals.css` since the layout moves one directory deeper (from `src/app/` to `src/app/(portfolio)/`). The CSS file itself stays at `src/app/globals.css` and is not moved.

The `(game)/layout.tsx` includes only `<html lang="en" className={fontVariables}>` and `<body>{children}</body>` — no `ThemeProvider`, `ClientLayout`, `SmoothScroll`, `CustomCursor`, or `globals.css` import. Font variables are applied so the HUD text is consistent.

The current `src/app/layout.tsx` is deleted after the route group files are created.

### Page & Component Structure

- `src/app/(game)/game/page.tsx` — Server Component shell. Renders `GameLoader`. Exports route metadata.
- `src/components/game/GameLoader.tsx` — `"use client"` component. Calls `next/dynamic` with `ssr: false` to import `SpiderManGame`. Provides a styled loading fallback.
- `src/components/game/SpiderManGame.tsx` — Client component. Mounts a Phaser `Game` instance into a `div` ref on mount, destroys it on unmount. Includes a React 19 Strict Mode guard (see below).

**Why the two-level split:** `ssr: false` is not permitted in Server Components in the App Router. `GameLoader` is the Client Component boundary that holds the dynamic import; `page.tsx` stays a Server Component so it can export `metadata`.

**Loading fallback:** While Phaser loads, `GameLoader` renders a full-screen black panel with centered text `"LOADING..."` in the accent color with a pulsing animation. Passed as the `loading` prop to `next/dynamic`.

### React 19 Strict Mode Guard

React 19 re-invokes `useEffect` mount/unmount/remount in development Strict Mode. Phaser's `Game` constructor attaches a canvas to the DOM by container id — a second mount will find an existing canvas and error. `SpiderManGame.tsx` must guard against this:

```ts
"use no memo"; // ← REQUIRED: opts out of React Compiler (reactCompiler: true in next.config.ts)
              //   The Compiler can silently corrupt mutation of useRef flags used as side-effect guards.

const initiated = useRef(false);
useEffect(() => {
  if (initiated.current) return;
  initiated.current = true;
  const game = new Phaser.Game(config);
  return () => { game.destroy(true); initiated.current = false; };
}, []);
```

The `"use no memo"` directive at the top of `SpiderManGame.tsx` is mandatory. The project has `reactCompiler: true` globally in `next.config.ts`. The React Compiler treats refs as stable and may optimize away the `initiated.current` mutation, breaking the guard.

### Scenes

| Scene | Purpose |
|---|---|
| `BootScene` | Generates all textures programmatically (no file loading); registers them with the TextureManager |
| `MenuScene` | Splash screen — Spidey silhouette, "PRESS SPACE / TAP TO SWING", comic-book panel style |
| `GameScene` | Core game loop |
| `GameOverScene` | Final score, high score (localStorage), "Play Again" + "← Back to Portfolio" buttons |

### Entities

| Entity | Purpose |
|---|---|
| `Player` | Spidey sprite, swing physics via MatterJS constraint, animation states (swing / fall / run) |
| `Building` | Procedural building generator — randomized heights/widths, gap constraints enforced |
| `WebLine` | Renders the rope line between Spidey and the anchor point while swinging |

### Config

`src/components/game/config.ts` — Phaser `GameConfig`:

- `type: Phaser.AUTO`
- `scale: { mode: Phaser.Scale.RESIZE, width: "100%", height: "100%" }` — responds to window resize, required for full-viewport canvas on mobile
- `physics: { default: "matter", matter: { gravity: { y: 1.5 } } }`
- `scene: [BootScene, MenuScene, GameScene, GameOverScene]`

### Route Metadata

`src/app/(game)/game/page.tsx` exports:

```ts
export const metadata = {
  title: "Spider-Man | Aswin Venu M",
  description: "Web-swinging endless runner — a mini-game by Aswin Venu M.",
};
```

---

## Assets (Programmatic — No External Files)

All assets are generated at runtime using Phaser's `Graphics` and `RenderTexture` APIs in `BootScene`. No files in `public/game/` are needed.

### Spidey Sprite Frames

In `BootScene`, three frames are drawn to individual `RenderTexture` instances, then registered with the `TextureManager` using `rt.saveTexture(key)`:

- `spidey-run` — body in upright position, legs mid-stride
- `spidey-swing` — arm extended upward (web firing pose)
- `spidey-fall` — arms/legs spread (falling pose)

Each key holds **a single frame** (frame `0`). These are not multi-frame sprite strips — they are three separate single-frame textures, one per pose. `this.anims.create` entries must reference `{ key: 'spidey-run', frame: 0 }` explicitly. The `Player` entity switches between animation keys (`play('spidey-run')`, `play('spidey-swing')`, `play('spidey-fall')`) to change Spidey's pose — there is no frame-by-frame animation within a single key.

Using `saveTexture` is required because `AnimationManager` works with keys registered in `TextureManager`, not raw `RenderTexture` objects.

### Buildings

Drawn procedurally in `Building.ts` via `Phaser.GameObjects.Graphics`. Each building: a filled rectangle in a comic-book palette color, bold black outline (lineWidth 3), and a simple grid of window rectangles.

### Skyline Background

Static `Graphics` layer in `GameScene` of distant building silhouettes in a muted blue-grey, scrolled at 0.3× foreground speed for parallax.

### Text Effects

"THWIP!" burst: `Phaser.GameObjects.Text` with a comic-book style font (system `Impact` or `Arial Black`, fallback acceptable), spawned at the anchor point and tweened to fade + scale out over 400ms.

---

## Game Mechanics

### Movement

- Spidey auto-moves right continuously (world scrolls left).
- `Space` (desktop) or tap (mobile) fires a web to the nearest building anchor point above-right within range.
- Spidey swings in a pendulum arc using a MatterJS rope constraint.
- Release `Space` / lift tap to detach and fly forward.
- Holding longer = fuller swing arc = more height/distance.
- Missing an anchor (no building in range, or falling below screen bottom) = game over.

### Physics Tuning (MatterJS Constraint)

| Parameter | Value |
|---|---|
| Rope length | 120–200px (scales with distance to anchor) |
| Stiffness | 0.02 (soft pendulum, not rigid) |
| Damping | 0.01 (minimal — preserves momentum) |
| Gravity | 1.5× default (set in Phaser config) |

Fine-tuning within ±30% of these values during implementation is expected.

### World Generation

- Buildings procedurally generated from the right edge.
- **Gap crossability constraint:** horizontal gap between buildings capped at `rope_length × 1.8`. Minimum building height is `player_spawn_y - 100px` so there is always a valid anchor above Spidey's trajectory. Both constraints enforced in `Building.ts` before each building placement.
- Speed increases 10% every 30 seconds, capped at 3× initial speed.

### Scoring

- +1 point per building cleared.
- **Combo multiplier:** Consecutive swings without ground contact: 1 swing = 1×, 3 swings = 2×, 6 swings = 3×, 10+ swings = 4× (capped). Resets to 1× on ground contact or fall. Displayed as a small HUD badge top-right.
- High score persisted in `localStorage` under key `spidey-hiscore`.

### Visual Polish

- **Parallax layers:** Distant skyline scrolls at 0.3× foreground speed.
- **Web line:** Drawn each frame between Spidey and anchor while swinging, white with slight opacity.
- **THWIP! burst:** Text object spawned at anchor point on web fire, fades + scales out over 400ms.

---

## Footer Integration

A new button added to the bottom bar of `src/components/Footer.tsx`, using `Link` from `next/link`:

```tsx
import Link from "next/link";
import { FiPlayCircle } from "react-icons/fi";

<Link
  href="/game"
  className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-[#F0EBE0]/30 mono-tag text-[#F0EBE0]/60 hover:border-accent hover:text-accent transition-colors brutal-hover"
>
  <FiPlayCircle size={13} aria-hidden="true" />
  Play a Game
</Link>
```

Placed alongside the existing "Back to Top" button in the bottom bar flex row.

---

## File Structure

```
src/
  app/
    (portfolio)/
      layout.tsx              ← current root layout moved here
      page.tsx                ← current home page moved here
      ... all existing portfolio routes
    (game)/
      layout.tsx              ← bare root layout (html + body + fonts only)
      game/
        page.tsx              ← Server Component shell + metadata
  components/
    game/
      GameLoader.tsx          ← "use client", dynamic import + loading fallback
      SpiderManGame.tsx       ← mounts/destroys Phaser instance (with Strict Mode guard)
      config.ts               ← Phaser GameConfig (RESIZE scale mode, MatterJS)
      scenes/
        BootScene.ts          ← programmatic texture generation
        MenuScene.ts
        GameScene.ts
        GameOverScene.ts
      entities/
        Player.ts
        Building.ts
        WebLine.ts
```

No changes to `public/` — all assets drawn programmatically.

---

## Constraints & Notes

- **Route groups are required** to isolate `/game` from `SmoothScroll`, `CustomCursor`, and `LoadingScreen`. A nested `game/layout.tsx` alone cannot achieve this in the App Router.
- `ssr: false` lives in `GameLoader.tsx` (Client Component), not in `page.tsx` (Server Component).
- React 19 Strict Mode guard required in `SpiderManGame.tsx` to prevent double Phaser instantiation.
- `BootScene` generates textures via `RenderTexture` + `saveTexture()` — no `this.load.*` calls for images.
- `Phaser.Scale.RESIZE` required in config for full-viewport responsive canvas.
- Phaser must be installed: `npm install phaser`.
