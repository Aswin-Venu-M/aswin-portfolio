# Spider-Man Visual Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace placeholder geometric Spider-Man sprites and sky background with GBC-faithful pixel-art sprites and `game-bg.webp` as the scrolling background.

**Architecture:** Six targeted file edits — no new files, no structural changes. BootScene generates pixel-art textures via RenderTexture; GameScene uses a TileSprite for the background; Building, Player, MenuScene, and config receive small palette/scale tweaks.

**Tech Stack:** Phaser 3.90, TypeScript, Next.js (game rendered client-side only)

**Spec:** `docs/superpowers/specs/2026-03-26-spiderman-visual-upgrade-design.md`

---

## File Map

| File | Change |
|------|--------|
| `src/components/game/config.ts` | `backgroundColor` → dark navy |
| `src/components/game/entities/Building.ts` | `COMIC_PALETTE` + window color |
| `src/components/game/entities/Player.ts` | Add `setScale(2)` |
| `src/components/game/scenes/MenuScene.ts` | `setScale(3)` → `setScale(4)` |
| `src/components/game/scenes/BootScene.ts` | Add `preload()`, rewrite `generateSpideyTextures()` |
| `src/components/game/scenes/GameScene.ts` | TileSprite bg, remove skyline |

---

## Task 1: Update backgroundColor in config.ts

**Files:**
- Modify: `src/components/game/config.ts:12`

- [ ] **Step 1: Make the change**

In `config.ts`, change line 12:
```ts
// Before
backgroundColor: "#87CEEB",
// After
backgroundColor: "#1a2a4a",
```

- [ ] **Step 2: TypeScript check**

```bash
cd "d:/Projects/Portfolio Main/portfolio_aswin/aswin-porfolio"
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/game/config.ts
git commit -m "feat: update game backgroundColor to dark navy"
```

---

## Task 2: Update Building palette and window color

**Files:**
- Modify: `src/components/game/entities/Building.ts:3,53`

- [ ] **Step 1: Replace COMIC_PALETTE**

In `Building.ts`, change line 3:
```ts
// Before
const COMIC_PALETTE = [0xf4d03f, 0x2e86c1, 0xe74c3c, 0x27ae60, 0x8e44ad, 0xe67e22];
// After
const PIXEL_PALETTE = [0x2d3a5e, 0x3d4f7a, 0x4a3728, 0x6b4c3b, 0x1e2d4a, 0x5c4033];
```

Also rename the usage on line 27:
```ts
// Before
const color = Phaser.Utils.Array.GetRandom(COMIC_PALETTE) as number;
// After
const color = Phaser.Utils.Array.GetRandom(PIXEL_PALETTE) as number;
```

- [ ] **Step 2: Update window color**

In `Building.ts`, change line 53:
```ts
// Before
this.graphics.fillStyle(0xffffcc);
// After
this.graphics.fillStyle(0x8899bb);
```

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/components/game/entities/Building.ts
git commit -m "feat: update building colors to match pixel art background"
```

---

## Task 3: Add setScale(2) to Player

**Files:**
- Modify: `src/components/game/entities/Player.ts:26`

- [ ] **Step 1: Add setScale after setFixedRotation**

In `Player.ts`, after line 26 (`this.sprite.setFixedRotation();`), add:
```ts
this.sprite.setScale(2);
```

> Note: `setScale(2)` only affects the visual display — the Matter physics body stays at the raw texture size (24×36). This is intentional (tighter hitbox).

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/game/entities/Player.ts
git commit -m "feat: display player sprite at 2x scale for pixel art look"
```

---

## Task 4: Update MenuScene sprite scale

**Files:**
- Modify: `src/components/game/scenes/MenuScene.ts:29`

- [ ] **Step 1: Change setScale value**

In `MenuScene.ts`, change line 29:
```ts
// Before
this.add.image(width / 2, height * 0.6, "spidey-swing").setScale(3);
// After
this.add.image(width / 2, height * 0.6, "spidey-swing").setScale(4);
```

Rationale: old texture was 40×40 at 3× = 120×120; new texture is 24×36 at 4× = 96×144.

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/game/scenes/MenuScene.ts
git commit -m "feat: update menu sprite scale for new 24x36 texture size"
```

---

## Task 5: Rewrite BootScene with preload and pixel-art sprites

**Files:**
- Modify: `src/components/game/scenes/BootScene.ts`

This is the core task. The entire file is replaced.

- [ ] **Step 1: Write the new BootScene**

Replace the full contents of `src/components/game/scenes/BootScene.ts` with:

```ts
import Phaser from "phaser";

const COLOR_MAP: Record<string, number> = {
  R: 0xcc1111, // red suit
  r: 0x991100, // dark red (web detail)
  B: 0x1144bb, // blue suit
  b: 0x002299, // dark blue (shadows)
  W: 0xffffff, // eye lenses
  K: 0x000000, // outline
};

function drawPixelSprite(
  scene: Phaser.Scene,
  rows: string[],
  key: string
): void {
  const w = rows[0].length;
  const h = rows.length;
  const rt = scene.add.renderTexture(0, 0, w, h);
  const g = scene.add.graphics();
  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch === "." || !(ch in COLOR_MAP)) return;
      g.fillStyle(COLOR_MAP[ch]);
      g.fillRect(x, y, 1, 1);
    });
  });
  rt.draw(g, 0, 0);
  g.destroy();
  rt.saveTexture(key);
  rt.destroy();
}

// ---------------------------------------------------------------------------
// Pixel art arrays — 24 cols × 36 rows each. '.' = transparent.
// ---------------------------------------------------------------------------

const RUN_ROWS: string[] = [
  "........KKKKKK..........", // head top
  ".......KrRRRRrK.........", // head
  "......KRRRRRRRrK........", // head
  "......KrWWRRWWrK........", // eyes
  "......KrWWRRWWrK........", // eyes
  "......KRRRRRRRrK........", // head
  ".......KKKKKKKK.........", // chin
  ".....KBKRRRRRRKBK.......", // neck/shoulders
  "....KBBKrRRRRrKBBK......", // torso top + arms
  "...KBBbKRRRRRRKBBbK.....", // torso
  "...KBBbKRRRRRRKBBbK.....", // torso
  "....KBbKRRRrRRKBbK......", // torso (web detail)
  ".....KBKRRRRRRKBK.......", // torso
  ".....KBKRRRRRRrKBK......", // torso lower
  "......KKRRRRRRrKK.......", // waist
  ".......KBBRRBBbK........", // hip
  "......KBBBKKBBBbK.......", // upper legs split
  ".....KBBBb.KBBBbK.......", // legs
  "....KBBBb...KBBbK.......", // legs
  "...KBBBb.....KBbK.......", // legs
  "..KBBBb.......KBK.......", // legs
  ".KBBBb.........KK.......", // legs
  "KBBBb...........K.......", // left lower leg
  "KBBb.............K......", // left lower leg
  "KBBb..............KK....", // left foot area
  ".KBb...............KBK..", // left foot + right lower
  "..KBb...............KBbK", // right lower leg
  "...KBb..............KBbK", // right lower leg
  "...KBb..............KBbK", // right lower leg
  "....KBb.............KBbK", // right lower leg
  "....KBb..............KKK", // right foot
  ".....KKK................", // left foot
  "........................", // padding
  "........................",
  "........................",
  "........................",
];

const SWING_ROWS: string[] = [
  "....................KBbK", // raised arm tip (web wrist)
  "....................KBbK", // arm
  "....................KBbK", // arm
  ".......KKKKKK......KBbK.", // head top + arm
  "......KrRRRRrK.....KBbK.", // head + arm
  ".....KRRRRRRRrK....KBbK.", // head + arm
  ".....KrWWRRWWrK....KBbK.", // eyes + arm
  ".....KrWWRRWWrK....KBbK.", // eyes + arm
  ".....KRRRRRRRrK...KBBbK.", // head + arm shoulder
  "......KKKKKKKK...KBBBbK.", // chin + arm
  "....KBKrRRRRrKKKBBBBbK..", // torso top + arm connect
  "....KBBKRRRRRrKBBBBbK...", // torso + arm
  "...KBBbKRRRRRrKBBBbK....", // torso + arm
  "...KBBbKRRRRRrKBBbK.....", // torso
  "....KBbKRRRRrRKBbK......", // torso (web detail)
  ".....KBKRRRRRRKBK.......", // torso
  "......KKRRRRRRrKK.......", // waist
  ".......KBBRRBBbK........", // hip
  ".......KBBBBBBbK........", // hip -> legs
  "......KBBBBBBbK.........", // upper legs tuck
  ".....KBBBBBbbK..........", // legs tucking
  "....KBBBBbbbK...........", // legs tucking
  "...KBBBBbbbbK...........", // legs
  "..KBBBbbbbbK............", // legs
  "..KBBbbbb.KBbbK.........", // legs split
  ".KBBbbb...KBBbbK........", // legs
  "KBBbbb.....KBBbbK.......", // legs
  "KBBbb.......KBBbK.......", // legs
  ".KBbb........KBbK.......", // lower legs
  "..KBb.........KBbK......", // lower legs
  "...KBb.........KBK......", // lower legs
  "....KBb.........KK......", // feet area
  ".....KBb........KKK.....", // feet
  "......KKK.......KKK.....", // feet
  "........................", // padding
  "........................",
];

const FALL_ROWS: string[] = [
  "........................", // arms start lower
  "........................",
  "........KKKKKK.........." , // head top
  ".......KrRRRRrK.........", // head
  "......KRRRRRRRrK........", // head
  "......KrWWRRWWrK........", // eyes
  "......KrWWRRWWrK........", // eyes
  "......KRRRRRRRrK........", // head
  ".......KKKKKKKK.........", // chin
  ".......KrRRRRrK.........", // neck
  "...KBBKRRRRRRKBBbK......", // arms start spread
  "..KBBbKRRRRRRKBBbbK.....", // arms wider
  ".KBBbbKRRRRRRKBBbbbK....", // arms wider
  "KBBbbbKRRRRRRKBBbbbbK...", // arms out
  "KBBbbbbKRRRRRrKBBbbbbbK.", // arms fully spread
  ".KBbbbKKrRRRRrKKBbbbbK..", // waist
  "..KBbbKRRRRRRKBbbbK.....", // hip
  "...KBbKRRRRRRKBbbK......", // hip
  "....KBKRRRRRRKBbK.......", // hip lower
  "........KBBbKKBBbK......", // upper legs split
  ".......KBBBb..KBBBbK....", // legs
  "......KBBBb....KBBbK....", // legs
  ".....KBBBb......KBbK....", // legs
  "....KBBBb........KBK....", // legs
  "...KBBBb..........KbK...", // legs
  "..KBBBb............KKK..", // left leg continuing
  ".KBBb...............KBK.", // lower legs
  "KBBb.................KBK", // lower legs
  "KBb.................KBbK", // lower legs
  ".KBb...............KBbbK", // lower legs
  "..KBb..............KBbbK", // lower legs
  "...KBb..............KBbK", // lower legs
  "....KBb..............KKK", // feet
  ".....KKK................", // left foot
  "........................", // padding
  "........................",
];

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload() {
    this.load.image("game-bg", "/game-bg.webp");
  }

  create() {
    drawPixelSprite(this, RUN_ROWS, "spidey-run");
    drawPixelSprite(this, SWING_ROWS, "spidey-swing");
    drawPixelSprite(this, FALL_ROWS, "spidey-fall");
    // scene.start must be last — textures must be registered before MenuScene uses them
    this.scene.start("MenuScene");
  }
}
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/game/scenes/BootScene.ts
git commit -m "feat: replace geometric sprites with GBC pixel-art Spider-Man"
```

---

## Task 6: Replace sky background with game-bg.webp TileSprite

**Files:**
- Modify: `src/components/game/scenes/GameScene.ts`

- [ ] **Step 1: Remove sky/skyline fields and methods, add bg field**

In `GameScene.ts`:

**Remove** these two class fields (lines 17–18):
```ts
private skyline!: Phaser.GameObjects.Graphics;
private skylineOffsetX = 0;
```

**Add** this field in their place:
```ts
private bg!: Phaser.GameObjects.TileSprite;
```

- [ ] **Step 2: Replace sky/skyline in create()**

**Remove** line 43 (the reset in create):
```ts
this.skylineOffsetX = 0;
```

**Remove** lines 46–50 (sky rect + skyline graphics):
```ts
// Sky
this.add.rectangle(0, 0, width, height, 0x87ceeb).setOrigin(0);

// Parallax skyline (distant buildings)
this.skyline = this.add.graphics();
this.drawSkyline(width, height);
```

**Add** the following in their place (as the first thing in create(), before the ground body):
```ts
// Pixel art background
this.bg = this.add
  .tileSprite(0, 0, width, height, "game-bg")
  .setOrigin(0)
  .setScrollFactor(0)
  .setDepth(-1);
```

- [ ] **Step 3: Replace skyline scroll in update()**

**Remove** lines 220–221 (skyline parallax):
```ts
this.skylineOffsetX -= this.speed * 0.3;
this.skyline.x = this.skylineOffsetX;
```

**Add** in their place:
```ts
this.bg.tilePositionX += this.speed * 0.6;
```

- [ ] **Step 4: Remove drawSkyline method**

Delete the entire `private drawSkyline(width: number, height: number)` method (lines 110–116 in the original file).

- [ ] **Step 5: TypeScript check**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add src/components/game/scenes/GameScene.ts
git commit -m "feat: replace sky background with scrolling game-bg.webp tileSprite"
```

---

## Task 7: Visual verification

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Navigate to game**

Open `http://localhost:3000/game` in browser.

- [ ] **Step 3: Check MenuScene**

Expected:
- Dark background (not bright sky blue flash)
- Spider-Man `spidey-swing` sprite visible at centre, ~96×144px, clearly red/blue with white eyes

- [ ] **Step 4: Start a game, check GameScene**

Expected:
- `game-bg.webp` pixel-art city skyline scrolling as background
- Dark navy/brick buildings (no bright yellow/green/purple)
- Spider-Man character at ~48×72px with distinct red suit and blue legs
- Web line visible when swinging
- `spidey-swing` texture shows arm raised when player is swinging
- `spidey-fall` texture shows spread-eagle when player is falling
- `spidey-run` texture shows crouched run when grounded/moving

- [ ] **Step 5: Tune scroll speed if needed**

If `game-bg.webp` scrolls too fast/slow, adjust the multiplier in `GameScene.ts`:
```ts
this.bg.tilePositionX += this.speed * 0.6; // increase/decrease 0.6
```

- [ ] **Step 6: Tune pixel art if needed**

If sprites look off, edit the pixel arrays in `BootScene.ts`. The arrays use a simple character grid — change a `.` to a color key (R/B/W/K/r/b) to add a pixel, or change a color key to `.` to remove one. Restart dev server to see changes.
