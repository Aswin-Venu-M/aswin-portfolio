# Spider-Man Visual Upgrade — Design Spec
Date: 2026-03-26

## Overview
Replace the placeholder geometric Spider-Man sprites and programmatic sky background with:
1. GBC-faithful pixel-art Spider-Man sprites (3 poses) drawn programmatically via Phaser RenderTexture
2. `public/game-bg.webp` pixel-art city skyline as the scrolling game background

---

## 1. Spider-Man Sprites

### Approach
Pixel data arrays (Option B). Each sprite is defined as a 24×36 array of single-character color keys, rendered via `fillRect(x, y, 1, 1)` calls onto a Phaser RenderTexture. The canvas is 24×36 px; the `Player` sprite displays at `setScale(2)` → 48×72 visual size.

> **Physics note:** Phaser's `Matter.Image` auto-body is sized from the texture dimensions, not the display scale. Calling `setScale(2)` after construction leaves the physics body unchanged at 24×36. This gives a slightly tight hitbox — intentional, makes the game more forgiving on web swings.

### Color Palette
| Key | Hex       | Usage                        |
|-----|-----------|------------------------------|
| `R` | `#CC1111` | Red suit — head, torso, shoulders |
| `r` | `#991100` | Dark red — web line detail   |
| `B` | `#1144BB` | Blue suit — legs, outer arms |
| `b` | `#002299` | Dark blue — leg shadows      |
| `W` | `#FFFFFF` | Eye lenses                   |
| `K` | `#000000` | Outline pixels               |
| `.` | —         | Transparent (skip draw)      |

### Sprite Acceptance Criteria
All three textures must satisfy:
- Uses only the palette above
- At 48×72 display size, head and two white eye lenses are clearly visible
- Red suit region covers head, torso, and shoulder areas; blue covers legs and outer arms
- Each pose is visually distinct at a glance (run ≠ swing ≠ fall)
- No stray isolated pixels outside the character silhouette

### Pixel Data Arrays — Render Loop
Each pose is a `string[]` of 24 characters × 36 rows. Full rendering sequence per pose:
```ts
const colorMap: Record<string, number> = {
  R: 0xCC1111, r: 0x991100, B: 0x1144BB, b: 0x002299,
  W: 0xFFFFFF, K: 0x000000,
};

const rt = this.add.renderTexture(0, 0, 24, 36);
const g = this.add.graphics();
rows.forEach((row, y) => {
  [...row].forEach((ch, x) => {
    if (ch === '.') return;
    g.fillStyle(colorMap[ch]);
    g.fillRect(x, y, 1, 1);
  });
});
rt.draw(g, 0, 0);   // draw Graphics into the RenderTexture
g.destroy();         // destroy Graphics first — it's no longer needed
rt.saveTexture(key); // copy pixel data into Phaser texture manager
rt.destroy();        // safe to destroy after saveTexture copies the data
```

### Pose Layout Guide

**`spidey-run`** — crouched running stance, body leaning forward:
- Rows 0–7: Head (~8×8), centered cols 8–15, slightly forward-angled
- Eye lenses: two 2×2 `W` blocks side by side on rows 3–4
- Rows 8–18: Torso red (`R`/`r`); left arm (`B`) extends back toward col 0–4; right arm (`B`) forward cols 18–22
- Rows 19–27: Upper legs in running split — left knee bent back-left, right leg stepped forward-right
- Rows 28–35: Lower legs and feet; left foot back (cols 2–6), right foot forward (cols 14–19)

**`spidey-swing`** — body angled ~30° forward, web-firing arm raised:
- Rows 0–7: Head tilted forward, same eye lens pattern
- Rows 8–16: Torso angled; right arm raised vertically (`B`, cols 18–21, rows 0–9); left arm trails back
- Rows 17–27: Legs tucked up and back; both knees bent, feet behind torso
- No feet below row 28

**`spidey-fall`** — spread-eagle free-fall:
- Rows 0–7: Head centered
- Rows 8–14: Torso; both arms spread wide (`B`, cols 0–5 left arm, cols 18–23 right arm)
- Rows 15–28: Legs split wide, left leg down-left, right leg down-right
- Widest silhouette of all three poses

### Changes to `BootScene`
1. Add `preload()` method (before `create()`):
   ```ts
   preload() {
     this.load.image('game-bg', '/game-bg.webp');
   }
   ```
2. Replace `generateSpideyTextures()` body with the pixel-array renderer for all 3 poses using the render loop above.
3. `this.scene.start('MenuScene')` must remain the **last statement** in `create()`, after all `saveTexture()` calls complete — `saveTexture` is synchronous but the scene must not start before all textures are registered.

> **Lifecycle reminder:** `generateSpideyTextures()` stays in `create()`. `add.renderTexture` and Graphics drawing require the scene graph, which is only available in `create()`, not `preload()`.

### Changes to `Player`
Add `this.sprite.setScale(2)` after `scene.matter.add.image(...)`.

---

## 2. Background

### Asset
`public/game-bg.webp` — pixel-art city skyline. Phaser 3 with WebGL2 (Phaser ≥ 3.50, modern browsers) handles non-power-of-two textures natively, so no asset resize is needed for WebGL mode. If Canvas fallback is a concern, change `type: Phaser.AUTO` → `type: Phaser.WEBGL` in `config.ts`.

### Rendering
In `GameScene`:

**New field:**
```ts
private bg!: Phaser.GameObjects.TileSprite;
```

**`create()`** — replace the sky rectangle, `this.skyline = this.add.graphics()`, and `drawSkyline(width, height)` call with:
```ts
this.bg = this.add.tileSprite(0, 0, width, height, 'game-bg')
  .setOrigin(0)
  .setScrollFactor(0)
  .setDepth(-1);  // explicit depth below all game objects
```

**`update()`** — replace the `skylineOffsetX` scroll block with:
```ts
this.bg.tilePositionX += this.speed * 0.6;
```
> Multiplier is 0.6 to match the visual parallax speed of the old skyline. The old Graphics skyline was drawn 3× viewport-wide and scrolled at `speed * 0.3`; because it looped over a wider canvas its effective perceived motion was slower per frame than a looping TileSprite. A looping TileSprite repeats at the texture's natural width, so a higher multiplier matches the same visual cadence. Tune if needed once rendered.

**Removals from `GameScene`:**
| Item | Location |
|------|----------|
| `private skyline!: Phaser.GameObjects.Graphics` | class field |
| `private skylineOffsetX = 0` | class field |
| `this.skylineOffsetX = 0` | `create()` reset (line 43) |
| `this.add.rectangle(0, 0, width, height, 0x87ceeb).setOrigin(0)` | `create()` |
| `this.skyline = this.add.graphics()` | `create()` |
| `drawSkyline(width, height)` call | `create()` |
| `private drawSkyline(...)` method | full method |
| `this.skylineOffsetX -= this.speed * 0.3` + `this.skyline.x = ...` | `update()` |

### `config.ts` backgroundColor
Change `backgroundColor: "#87CEEB"` → `backgroundColor: "#1a2a4a"` (dark navy) to avoid a bright sky flash during scene transitions.

---

## 3. Building Color Palette

In `Building.ts`, replace:
```ts
const COMIC_PALETTE = [0xf4d03f, 0x2e86c1, 0xe74c3c, 0x27ae60, 0x8e44ad, 0xe67e22];
```
with:
```ts
const PIXEL_PALETTE = [0x2d3a5e, 0x3d4f7a, 0x4a3728, 0x6b4c3b, 0x1e2d4a, 0x5c4033];
```

Also change window fill `0xffffcc` → `0x8899bb` (muted blue-grey), which reads better against dark building bodies.

---

## 4. MenuScene Sprite Scale
`MenuScene.ts` line 29: change `setScale(3)` → `setScale(4)`.
- Old: 40×40 texture at 3× = 120×120 display
- New: 24×36 texture at 4× = 96×144 display
- Maintains a large, legible preview character on the menu screen.

---

## 5. Depth Order Summary
| Layer | Object | Depth |
|-------|--------|-------|
| Background | `bg` TileSprite | `-1` |
| Buildings | `Building.graphics` | `0` (default, fine by insertion order) |
| Player / WebLine | `Player.sprite`, `WebLine` | `0` (default, above bg by insertion) |
| HUD | `scoreText`, `comboText` | `10` (already set) |

No depth changes required beyond setting `bg` to `-1`.

---

## 6. Files Changed
| File | Change |
|------|--------|
| `src/components/game/scenes/BootScene.ts` | Add `preload()`, replace `generateSpideyTextures()` |
| `src/components/game/scenes/GameScene.ts` | TileSprite bg, remove skyline, update scroll |
| `src/components/game/config.ts` | `backgroundColor` → `#1a2a4a` |
| `src/components/game/entities/Building.ts` | `PIXEL_PALETTE` + window color |
| `src/components/game/entities/Player.ts` | `setScale(2)` |
| `src/components/game/scenes/MenuScene.ts` | `setScale(3)` → `setScale(4)` |

---

## 7. Out of Scope
- Animation frames (multi-frame sprite sheet per pose)
- Enemy sprites or new game mechanics
- Changes to web swing physics or scoring
