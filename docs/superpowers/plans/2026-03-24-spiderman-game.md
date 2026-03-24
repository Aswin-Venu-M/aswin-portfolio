# Spider-Man Web-Swinging Endless Runner — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a full-screen Spider-Man web-swinging endless runner game at `/game`, accessible via a "Play a Game" button in the portfolio footer.

**Architecture:** Phaser.js game (MatterJS physics) rendered in a dedicated Next.js route group `(game)` that is fully isolated from the portfolio's SmoothScroll/CustomCursor/LoadingScreen wrappers. All game assets are drawn programmatically via Phaser's Graphics API — no image files required. MatterJS is accessed exclusively through Phaser's re-export (`Phaser.Physics.Matter.Matter`) — `matter-js` is never imported as a standalone package. The footer gets a single new `<Link>` button.

**Tech Stack:** Next.js 15+ App Router, Phaser 3, MatterJS (via Phaser), TypeScript, Tailwind CSS (footer only), react-icons.

---

## File Map

**New files:**
- `src/app/(portfolio)/layout.tsx` — portfolio root layout (moved from `src/app/layout.tsx`)
- `src/app/(portfolio)/page.tsx` — home page (moved from `src/app/page.tsx`)
- `src/app/(game)/layout.tsx` — bare root layout for game route
- `src/app/(game)/game/page.tsx` — game page Server Component + metadata
- `src/components/game/GameLoader.tsx` — dynamic import wrapper with loading fallback
- `src/components/game/SpiderManGame.tsx` — Phaser mount/destroy (`"use no memo"` + `"use client"`)
- `src/components/game/config.ts` — Phaser GameConfig
- `src/components/game/scenes/BootScene.ts` — programmatic texture generation
- `src/components/game/scenes/MenuScene.ts` — splash screen
- `src/components/game/scenes/GameScene.ts` — core game loop
- `src/components/game/scenes/GameOverScene.ts` — score screen
- `src/components/game/entities/Player.ts` — Spidey + swing physics
- `src/components/game/entities/Building.ts` — procedural building generator
- `src/components/game/entities/WebLine.ts` — web rope renderer

**Modified files:**
- `src/components/Footer.tsx` — add "Play a Game" Link button
- `src/app/layout.tsx` — deleted after route group migration

---

## Task 1: Install Phaser

**Files:**
- Modify: `package.json` (via npm)

- [ ] **Step 1: Install Phaser**

```bash
npm install phaser
```

- [ ] **Step 2: Verify install**

```bash
node -e "const p = require('phaser'); console.log(p.VERSION)"
```

Expected: prints a Phaser version string (e.g. `3.x.x`)

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install phaser"
```

---

## Task 2: Route Group Restructure

Move existing `src/app/layout.tsx` and `src/app/page.tsx` into a `(portfolio)` route group so the `/game` route can have its own isolated root layout.

**Why:** Next.js App Router always wraps nested layouts with all ancestor layouts. The only way to isolate `/game` from `SmoothScroll`, `CustomCursor`, and `ClientLayout` is to use multiple root layouts via route groups.

**Files:**
- Create: `src/app/(portfolio)/layout.tsx`
- Create: `src/app/(portfolio)/page.tsx`
- Delete: `src/app/layout.tsx`
- Delete: `src/app/page.tsx`

- [ ] **Step 1: Create `src/app/(portfolio)/layout.tsx`**

Copy the current `src/app/layout.tsx` content exactly, but update the `globals.css` import from `./globals.css` to `../globals.css` (the file stays at `src/app/globals.css`):

```tsx
import type { Metadata } from "next";
import { Bricolage_Grotesque, JetBrains_Mono, DM_Sans } from "next/font/google";
import "../globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import CustomCursor from "@/components/CustomCursor";
import ThemeProvider from "@/components/ThemeProvider";
import ClientLayout from "@/components/ClientLayout";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aswin Venu M — Jr. Software Engineer",
  description:
    "Full-stack engineer from Trivandrum, India. Building scalable web applications — school management systems, booking platforms, and more.",
  keywords: ["Aswin Venu M", "Software Engineer", "Full Stack", "React", "Next.js", "Node.js", "Trivandrum"],
  authors: [{ name: "Aswin Venu M" }],
  openGraph: {
    title: "Aswin Venu M — Jr. Software Engineer",
    description: "Building full-stack systems that actually work.",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${jetbrains.variable} ${dmSans.variable}`}
    >
      <body>
        <ThemeProvider>
          <ClientLayout>
            <SmoothScroll>
              <CustomCursor />
              {children}
            </SmoothScroll>
          </ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Move `src/app/page.tsx` to `src/app/(portfolio)/page.tsx`**

Copy the entire contents of `src/app/page.tsx` into `src/app/(portfolio)/page.tsx` unchanged.

- [ ] **Step 3: Delete the old root-level files**

```bash
rm src/app/layout.tsx
rm src/app/page.tsx
```

- [ ] **Step 4: Verify dev server still works**

```bash
npm run dev
```

Open `http://localhost:3000` — portfolio home page must render exactly as before, with SmoothScroll, CustomCursor, and LoadingScreen active. No visual changes expected.

- [ ] **Step 5: Commit**

```bash
git add src/app/
git commit -m "refactor: migrate to route groups for layout isolation"
```

---

## Task 3: Game Route Group Layout

Create the bare root layout for the `(game)` route group — no portfolio wrappers.

**Files:**
- Create: `src/app/(game)/layout.tsx`

- [ ] **Step 1: Create `src/app/(game)/layout.tsx`**

```tsx
import { Bricolage_Grotesque, JetBrains_Mono, DM_Sans } from "next/font/google";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export default function GameGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${jetbrains.variable} ${dmSans.variable}`}
    >
      <body style={{ margin: 0, background: "#000", overflow: "hidden" }}>
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/(game)/layout.tsx
git commit -m "feat: add bare game route group layout"
```

---

## Task 4: Game Page Shell

**Files:**
- Create: `src/app/(game)/game/page.tsx`

- [ ] **Step 1: Create `src/app/(game)/game/page.tsx`**

```tsx
import GameLoader from "@/components/game/GameLoader";

export const metadata = {
  title: "Spider-Man | Aswin Venu M",
  description: "Web-swinging endless runner — a mini-game by Aswin Venu M.",
};

export default function GamePage() {
  return <GameLoader />;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/(game)/game/page.tsx
git commit -m "feat: add /game route page shell"
```

---

## Task 5: GameLoader Component

**Files:**
- Create: `src/components/game/GameLoader.tsx`

- [ ] **Step 1: Create `src/components/game/GameLoader.tsx`**

```tsx
"use client";

import dynamic from "next/dynamic";

const SpiderManGame = dynamic(() => import("./SpiderManGame"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-jetbrains), monospace",
          fontSize: "1.25rem",
          color: "#F4A261",
          letterSpacing: "0.15em",
          animation: "pulse 1s ease-in-out infinite",
        }}
      >
        LOADING...
      </span>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  ),
});

export default function GameLoader() {
  return <SpiderManGame />;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/game/GameLoader.tsx
git commit -m "feat: add GameLoader with dynamic import and loading fallback"
```

---

## Task 6: Scene Stubs + Config + SpiderManGame

Creating all four scene stubs first so `SpiderManGame.tsx` can import them without TypeScript errors. The stubs are minimal valid Phaser scenes that are filled out in later tasks.

**Files:**
- Create: `src/components/game/scenes/BootScene.ts` (stub)
- Create: `src/components/game/scenes/MenuScene.ts` (stub)
- Create: `src/components/game/scenes/GameScene.ts` (stub)
- Create: `src/components/game/scenes/GameOverScene.ts` (stub)
- Create: `src/components/game/config.ts`
- Create: `src/components/game/SpiderManGame.tsx`

- [ ] **Step 1: Create stub `src/components/game/scenes/BootScene.ts`**

```ts
import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() { super({ key: "BootScene" }); }
  create() { this.scene.start("MenuScene"); }
}
```

- [ ] **Step 2: Create stub `src/components/game/scenes/MenuScene.ts`**

```ts
import Phaser from "phaser";

export class MenuScene extends Phaser.Scene {
  constructor() { super({ key: "MenuScene" }); }
  create() { this.scene.start("GameScene"); }
}
```

- [ ] **Step 3: Create stub `src/components/game/scenes/GameScene.ts`**

```ts
import Phaser from "phaser";

export class GameScene extends Phaser.Scene {
  constructor() { super({ key: "GameScene" }); }
  create() {}
  update() {}
}
```

- [ ] **Step 4: Create stub `src/components/game/scenes/GameOverScene.ts`**

```ts
import Phaser from "phaser";

export class GameOverScene extends Phaser.Scene {
  constructor() { super({ key: "GameOverScene" }); }
  create() {}
}
```

- [ ] **Step 5: Create `src/components/game/config.ts`**

```ts
import Phaser from "phaser";

export function buildConfig(scenes: Phaser.Types.Core.SceneType[]): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    scale: {
      mode: Phaser.Scale.RESIZE,
      width: "100%",
      height: "100%",
      parent: "phaser-container",
    },
    backgroundColor: "#87CEEB",
    physics: {
      default: "matter",
      matter: {
        gravity: { x: 0, y: 1.5 },
        debug: false,
      },
    },
    scene: scenes,
  };
}
```

- [ ] **Step 6: Create `src/components/game/SpiderManGame.tsx`**

Note: `"use no memo"` is required on line 1 — the project has `reactCompiler: true` in `next.config.ts`. Without it the React Compiler may optimize away the `initiated.current` mutation, causing double Phaser instantiation. `"use client"` follows on line 2.

```tsx
"use no memo";
"use client";

import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { buildConfig } from "./config";
import { BootScene } from "./scenes/BootScene";
import { MenuScene } from "./scenes/MenuScene";
import { GameScene } from "./scenes/GameScene";
import { GameOverScene } from "./scenes/GameOverScene";

export default function SpiderManGame() {
  const initiated = useRef(false);

  useEffect(() => {
    if (initiated.current) return;
    initiated.current = true;

    const config = buildConfig([BootScene, MenuScene, GameScene, GameOverScene]);
    const game = new Phaser.Game(config);

    return () => {
      game.destroy(true);
      initiated.current = false;
    };
  }, []);

  return (
    <div
      id="phaser-container"
      style={{ width: "100vw", height: "100vh", overflow: "hidden" }}
    />
  );
}
```

- [ ] **Step 7: Verify TypeScript compiles (no module-not-found errors)**

```bash
npx tsc --noEmit
```

Expected: no errors related to missing scene files. There may be Phaser internal type warnings — these are acceptable.

- [ ] **Step 8: Commit**

```bash
git add src/components/game/
git commit -m "feat: add scene stubs, Phaser config, and SpiderManGame mount"
```

---

## Task 7: BootScene — Programmatic Texture Generation

Replace the stub with the full implementation. All textures are drawn with Phaser's `Graphics` and `RenderTexture` APIs — no image files are loaded.

**Key:** `rt.saveTexture(key)` registers the texture in Phaser's `TextureManager`. Each key holds a single frame (`frame 0`). These are pose textures, not animation strips — `Player` switches poses by calling `sprite.setTexture('spidey-swing')` etc.

**Files:**
- Modify: `src/components/game/scenes/BootScene.ts`

- [ ] **Step 1: Replace `src/components/game/scenes/BootScene.ts` with full implementation**

```ts
import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  create() {
    this.generateSpideyTextures();
    this.scene.start("MenuScene");
  }

  private generateSpideyTextures() {
    const size = 40;

    // --- spidey-run: upright body ---
    const rtRun = this.add.renderTexture(0, 0, size, size);
    const gRun = this.add.graphics();
    gRun.fillStyle(0x0000cc); gRun.fillRect(12, 14, 16, 18);
    gRun.fillStyle(0xcc0000); gRun.fillCircle(20, 10, 10);
    gRun.fillStyle(0x0000cc); gRun.fillRect(12, 30, 6, 10); gRun.fillRect(22, 30, 6, 10);
    rtRun.draw(gRun, 0, 0);
    gRun.destroy();
    rtRun.saveTexture("spidey-run");
    rtRun.destroy();

    // --- spidey-swing: arm extended upward ---
    const rtSwing = this.add.renderTexture(0, 0, size, size);
    const gSwing = this.add.graphics();
    gSwing.fillStyle(0x0000cc); gSwing.fillRect(12, 14, 16, 18);
    gSwing.fillStyle(0xcc0000); gSwing.fillCircle(20, 10, 10);
    gSwing.lineStyle(3, 0x0000cc); gSwing.lineBetween(20, 14, 32, 2);
    gSwing.fillStyle(0x0000cc); gSwing.fillRect(12, 30, 6, 10); gSwing.fillRect(22, 30, 6, 10);
    rtSwing.draw(gSwing, 0, 0);
    gSwing.destroy();
    rtSwing.saveTexture("spidey-swing");
    rtSwing.destroy();

    // --- spidey-fall: arms and legs spread ---
    const rtFall = this.add.renderTexture(0, 0, size, size);
    const gFall = this.add.graphics();
    gFall.fillStyle(0x0000cc); gFall.fillRect(12, 16, 16, 16);
    gFall.fillStyle(0xcc0000); gFall.fillCircle(20, 10, 10);
    gFall.lineStyle(3, 0x0000cc); gFall.lineBetween(12, 20, 2, 14); gFall.lineBetween(28, 20, 38, 14);
    gFall.fillStyle(0x0000cc); gFall.fillRect(10, 30, 6, 10); gFall.fillRect(24, 30, 6, 10);
    rtFall.draw(gFall, 0, 0);
    gFall.destroy();
    rtFall.saveTexture("spidey-fall");
    rtFall.destroy();
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/game/scenes/BootScene.ts
git commit -m "feat: implement BootScene with programmatic Spidey textures"
```

---

## Task 8: MenuScene

**Files:**
- Modify: `src/components/game/scenes/MenuScene.ts`

- [ ] **Step 1: Replace `src/components/game/scenes/MenuScene.ts` with full implementation**

```ts
import Phaser from "phaser";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MenuScene" });
  }

  create() {
    const { width, height } = this.scale;

    this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0);

    this.add.text(width / 2, height * 0.28, "SPIDER-MAN", {
      fontFamily: "Impact, Arial Black, sans-serif",
      fontSize: "64px",
      color: "#FF0000",
      stroke: "#000000",
      strokeThickness: 6,
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.38, "WEB RUNNER", {
      fontFamily: "Impact, Arial Black, sans-serif",
      fontSize: "36px",
      color: "#FFFFFF",
      stroke: "#000000",
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.image(width / 2, height * 0.6, "spidey-swing").setScale(3);

    const prompt = this.add.text(width / 2, height * 0.82, "PRESS SPACE OR TAP TO SWING", {
      fontFamily: "Impact, Arial Black, sans-serif",
      fontSize: "22px",
      color: "#F4A261",
      stroke: "#000000",
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.tweens.add({ targets: prompt, alpha: 0, duration: 600, yoyo: true, repeat: -1 });

    this.add.text(width / 2, height * 0.93, "← Back to Portfolio", {
      fontFamily: "monospace",
      fontSize: "14px",
      color: "#888888",
    }).setOrigin(0.5).setInteractive({ cursor: "pointer" })
      .on("pointerdown", () => { window.location.href = "/"; });

    this.input.keyboard!.once("keydown-SPACE", () => this.scene.start("GameScene"));
    this.input.once("pointerdown", () => this.scene.start("GameScene"));
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/game/scenes/MenuScene.ts
git commit -m "feat: implement MenuScene splash screen"
```

---

## Task 9: Building Entity

**Files:**
- Create: `src/components/game/entities/Building.ts`

- [ ] **Step 1: Create `src/components/game/entities/Building.ts`**

```ts
import Phaser from "phaser";

const COMIC_PALETTE = [0xf4d03f, 0x2e86c1, 0xe74c3c, 0x27ae60, 0x8e44ad, 0xe67e22];

export interface BuildingData {
  x: number;
  width: number;
  height: number;
  anchorX: number;
  anchorY: number;
}

export class Building {
  graphics: Phaser.GameObjects.Graphics;
  data: BuildingData;

  constructor(
    scene: Phaser.Scene,
    x: number,
    screenHeight: number,
    ropeLength: number,
    playerSpawnY: number
  ) {
    const minHeight = playerSpawnY - 100;
    const maxHeight = screenHeight * 0.8;
    const height = Phaser.Math.Between(minHeight, maxHeight);
    const width = Phaser.Math.Between(80, 160);
    const color = Phaser.Utils.Array.GetRandom(COMIC_PALETTE) as number;

    this.data = {
      x,
      width,
      height,
      anchorX: x + width / 2,
      anchorY: screenHeight - height,
    };

    this.graphics = scene.add.graphics();
    this.draw(color, screenHeight);
  }

  private draw(color: number, screenHeight: number) {
    const { x, width, height } = this.data;
    const top = screenHeight - height;

    this.graphics.fillStyle(color);
    this.graphics.fillRect(x, top, width, height);

    this.graphics.lineStyle(3, 0x000000);
    this.graphics.strokeRect(x, top, width, height);

    const cols = Math.floor(width / 20);
    const rows = Math.floor(height / 25);
    this.graphics.fillStyle(0xffffcc);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        this.graphics.fillRect(x + 6 + c * 20, top + 8 + r * 25, 10, 14);
      }
    }
  }

  destroy() {
    this.graphics.destroy();
  }
}

/** Maximum horizontal gap between buildings that is always swingable. */
export function maxGap(ropeLength: number): number {
  return ropeLength * 1.8;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/game/entities/Building.ts
git commit -m "feat: add Building entity with procedural generation and gap constraint"
```

---

## Task 10: WebLine Entity

**Files:**
- Create: `src/components/game/entities/WebLine.ts`

- [ ] **Step 1: Create `src/components/game/entities/WebLine.ts`**

```ts
import Phaser from "phaser";

export class WebLine {
  private graphics: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    this.graphics = scene.add.graphics();
  }

  update(fromX: number, fromY: number, toX: number, toY: number, active: boolean) {
    this.graphics.clear();
    if (!active) return;
    this.graphics.lineStyle(2, 0xffffff, 0.7);
    this.graphics.lineBetween(fromX, fromY, toX, toY);
  }

  destroy() {
    this.graphics.destroy();
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/game/entities/WebLine.ts
git commit -m "feat: add WebLine entity for rope rendering"
```

---

## Task 11: Player Entity

Spidey's physics body, swing constraint, and pose switching. **MatterJS is accessed via `Phaser.Physics.Matter.Matter`** — never imported from `matter-js` directly, as it is not a standalone installed package. The Matter.js world is accessed via `(scene.matter.world as Phaser.Physics.Matter.World).localWorld`.

**Files:**
- Create: `src/components/game/entities/Player.ts`

- [ ] **Step 1: Create `src/components/game/entities/Player.ts`**

```ts
import Phaser from "phaser";

// Access MatterJS through Phaser's re-export — do NOT import "matter-js" directly.
// matter-js is bundled inside Phaser and is not an installed standalone package.
const Matter = Phaser.Physics.Matter.Matter;

type MatterScene = Phaser.Scene & { matter: Phaser.Physics.Matter.MatterPhysics };

export class Player {
  sprite: Phaser.Physics.Matter.Image;
  private scene: MatterScene;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private constraint: any = null;
  private isSwinging = false;
  anchorX = 0;
  anchorY = 0;

  constructor(scene: MatterScene, x: number, y: number) {
    this.scene = scene;
    this.sprite = scene.matter.add.image(x, y, "spidey-run", undefined, {
      frictionAir: 0.01,
      restitution: 0,
      label: "player",
    });
    this.sprite.setFixedRotation();
  }

  fireWeb(anchorX: number, anchorY: number) {
    this.releaseWeb();

    const ropeLen = Phaser.Math.Clamp(
      Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, anchorX, anchorY),
      120,
      200
    );

    const matterWorld = (this.scene.matter.world as Phaser.Physics.Matter.World).localWorld;

    this.constraint = Matter.Constraint.create({
      pointA: { x: anchorX, y: anchorY },
      bodyB: this.sprite.body as Matter.Body,
      length: ropeLen,
      stiffness: 0.02,
      damping: 0.01,
    });

    Matter.Composite.add(matterWorld, this.constraint);

    this.anchorX = anchorX;
    this.anchorY = anchorY;
    this.isSwinging = true;
    this.sprite.setTexture("spidey-swing");
  }

  releaseWeb() {
    if (this.constraint) {
      const matterWorld = (this.scene.matter.world as Phaser.Physics.Matter.World).localWorld;
      Matter.Composite.remove(matterWorld, this.constraint);
      this.constraint = null;
    }
    this.isSwinging = false;
  }

  get swinging() {
    return this.isSwinging;
  }

  update() {
    if (this.isSwinging) {
      this.sprite.setTexture("spidey-swing");
    } else if ((this.sprite.body as Matter.Body).velocity.y > 0.5) {
      this.sprite.setTexture("spidey-fall");
    } else {
      this.sprite.setTexture("spidey-run");
    }
  }

  get x() { return this.sprite.x; }
  get y() { return this.sprite.y; }

  destroy() {
    this.releaseWeb();
    this.sprite.destroy();
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/game/entities/Player.ts
git commit -m "feat: add Player entity with swing physics via Phaser MatterJS"
```

---

## Task 12: GameScene — Core Loop

**Files:**
- Modify: `src/components/game/scenes/GameScene.ts`

- [ ] **Step 1: Replace `src/components/game/scenes/GameScene.ts` with full implementation**

```ts
import Phaser from "phaser";
import { Player } from "../entities/Player";
import { Building, maxGap } from "../entities/Building";
import { WebLine } from "../entities/WebLine";

const INITIAL_SPEED = 4;
const ROPE_LENGTH = 160;
const SPEED_INCREASE_INTERVAL = 30000;
const SPEED_CAP_MULTIPLIER = 3;

type MatterScene = Phaser.Scene & { matter: Phaser.Physics.Matter.MatterPhysics };

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private buildings: Building[] = [];
  private webLine!: WebLine;
  private skyline!: Phaser.GameObjects.Graphics;
  private skylineOffsetX = 0;

  private score = 0;
  private combo = 0;
  private speed = INITIAL_SPEED;
  private lastSpeedIncrease = 0;

  private scoreText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private isGameOver = false;

  constructor() {
    super({ key: "GameScene" });
  }

  create() {
    const { width, height } = this.scale;

    this.score = 0;
    this.combo = 0;
    this.speed = INITIAL_SPEED;
    this.lastSpeedIncrease = 0;
    this.isGameOver = false;
    this.buildings = [];
    this.skylineOffsetX = 0;

    // Sky
    this.add.rectangle(0, 0, width, height, 0x87ceeb).setOrigin(0);

    // Parallax skyline (distant buildings)
    this.skyline = this.add.graphics();
    this.drawSkyline(width, height);

    // Static ground body
    this.matter.add.rectangle(width / 2, height + 10, width * 10, 20, {
      isStatic: true,
      label: "ground",
    });

    // Initial buildings
    this.spawnInitialBuildings(width, height);

    // Player
    this.player = new Player(this as unknown as MatterScene, 120, height * 0.5);

    // Web line renderer
    this.webLine = new WebLine(this);

    // HUD
    this.scoreText = this.add
      .text(16, 16, "SCORE: 0", {
        fontFamily: "Impact, Arial Black, sans-serif",
        fontSize: "24px",
        color: "#FFFFFF",
        stroke: "#000",
        strokeThickness: 3,
      })
      .setScrollFactor(0)
      .setDepth(10);

    this.comboText = this.add
      .text(width - 16, 16, "", {
        fontFamily: "Impact, Arial Black, sans-serif",
        fontSize: "20px",
        color: "#F4A261",
        stroke: "#000",
        strokeThickness: 3,
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(10);

    // Input
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.spaceKey.on("down", () => this.handleSwingInput());
    this.spaceKey.on("up", () => this.handleReleaseInput());
    this.input.on("pointerdown", () => this.handleSwingInput());
    this.input.on("pointerup", () => this.handleReleaseInput());

    // Game over on ground collision
    this.matter.world.on(
      "collisionstart",
      (_event: Phaser.Physics.Matter.Events.CollisionStartEvent, bodyA: Matter.Body, bodyB: Matter.Body) => {
        const labels = [bodyA?.label, bodyB?.label];
        if (labels.includes("ground") && labels.includes("player")) {
          this.triggerGameOver();
        }
      }
    );
  }

  private drawSkyline(width: number, height: number) {
    this.skyline.fillStyle(0x4a6fa5, 0.5);
    for (let x = 0; x < width * 3; x += 60) {
      const h = Phaser.Math.Between(60, 140);
      this.skyline.fillRect(x, height - h - 60, 50, h);
    }
  }

  private spawnInitialBuildings(width: number, height: number) {
    let x = 200;
    while (x < width + 400) {
      const b = new Building(this, x, height, ROPE_LENGTH, height * 0.5);
      this.buildings.push(b);
      x += b.data.width + Phaser.Math.Between(80, maxGap(ROPE_LENGTH));
    }
  }

  private spawnNextBuilding() {
    const last = this.buildings[this.buildings.length - 1];
    const { height } = this.scale;
    const gap = Phaser.Math.Between(80, maxGap(ROPE_LENGTH));
    const x = last.data.x + last.data.width + gap;
    this.buildings.push(new Building(this, x, height, ROPE_LENGTH, height * 0.5));
  }

  private handleSwingInput() {
    if (this.isGameOver || this.player.swinging) return;
    const nearest = this.buildings
      .filter(b => b.data.anchorX + b.graphics.x > this.player.x && b.data.anchorY < this.player.y)
      .sort((a, b) =>
        Phaser.Math.Distance.Between(this.player.x, this.player.y, a.data.anchorX + a.graphics.x, a.data.anchorY) -
        Phaser.Math.Distance.Between(this.player.x, this.player.y, b.data.anchorX + b.graphics.x, b.data.anchorY)
      )[0];

    if (!nearest) return;
    this.player.fireWeb(nearest.data.anchorX + nearest.graphics.x, nearest.data.anchorY);
    this.spawnThwip(nearest.data.anchorX + nearest.graphics.x, nearest.data.anchorY);
  }

  private handleReleaseInput() {
    if (this.isGameOver || !this.player.swinging) return;
    this.player.releaseWeb();
    this.combo++;
    this.score += this.getMultiplier();
    this.updateHUD();
  }

  private getMultiplier(): number {
    if (this.combo >= 10) return 4;
    if (this.combo >= 6) return 3;
    if (this.combo >= 3) return 2;
    return 1;
  }

  private updateHUD() {
    this.scoreText.setText(`SCORE: ${this.score}`);
    const mult = this.getMultiplier();
    this.comboText.setText(mult > 1 ? `${mult}× COMBO` : "");
  }

  private spawnThwip(x: number, y: number) {
    const text = this.add.text(x, y, "THWIP!", {
      fontFamily: "Impact, Arial Black, sans-serif",
      fontSize: "20px",
      color: "#FFFF00",
      stroke: "#000",
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(20);

    this.tweens.add({
      targets: text,
      alpha: 0,
      scaleX: 1.8,
      scaleY: 1.8,
      y: y - 30,
      duration: 400,
      onComplete: () => text.destroy(),
    });
  }

  private triggerGameOver() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.player.releaseWeb();
    this.combo = 0;

    const stored = parseInt(localStorage.getItem("spidey-hiscore") ?? "0", 10);
    if (this.score > stored) {
      localStorage.setItem("spidey-hiscore", String(this.score));
    }

    this.time.delayedCall(800, () => {
      this.scene.start("GameOverScene", { score: this.score });
    });
  }

  update(time: number) {
    if (this.isGameOver) return;
    const { width } = this.scale;

    // Speed progression
    if (time - this.lastSpeedIncrease > SPEED_INCREASE_INTERVAL) {
      this.speed = Math.min(this.speed * 1.1, INITIAL_SPEED * SPEED_CAP_MULTIPLIER);
      this.lastSpeedIncrease = time;
    }

    // Scroll buildings left
    this.buildings.forEach(b => { b.graphics.x -= this.speed; });

    // Parallax skyline
    this.skylineOffsetX -= this.speed * 0.3;
    this.skyline.x = this.skylineOffsetX;

    // Remove off-screen buildings, score per building cleared
    while (
      this.buildings.length > 0 &&
      this.buildings[0].data.x + this.buildings[0].graphics.x + this.buildings[0].data.width < 0
    ) {
      this.buildings[0].destroy();
      this.buildings.shift();
      this.score++;
      this.updateHUD();
    }

    // Spawn new buildings when near right edge
    const last = this.buildings[this.buildings.length - 1];
    if (last && last.data.x + last.graphics.x < width + 200) {
      this.spawnNextBuilding();
    }

    // Fall off screen = game over
    if (this.player.y > this.scale.height + 100) {
      this.triggerGameOver();
    }

    this.player.update();
    this.webLine.update(
      this.player.x,
      this.player.y,
      this.player.anchorX,
      this.player.anchorY,
      this.player.swinging
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/game/scenes/GameScene.ts
git commit -m "feat: implement GameScene core loop with scrolling, physics, and scoring"
```

---

## Task 13: GameOverScene

**Files:**
- Modify: `src/components/game/scenes/GameOverScene.ts`

- [ ] **Step 1: Replace `src/components/game/scenes/GameOverScene.ts` with full implementation**

```ts
import Phaser from "phaser";

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameOverScene" });
  }

  create(data: { score: number }) {
    const { width, height } = this.scale;
    const hiScore = parseInt(localStorage.getItem("spidey-hiscore") ?? "0", 10);

    this.add.rectangle(0, 0, width, height, 0x1a0000).setOrigin(0);

    this.add.text(width / 2, height * 0.2, "GAME OVER", {
      fontFamily: "Impact, Arial Black, sans-serif",
      fontSize: "72px",
      color: "#FF0000",
      stroke: "#000",
      strokeThickness: 8,
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.38, `SCORE: ${data.score}`, {
      fontFamily: "Impact, Arial Black, sans-serif",
      fontSize: "36px",
      color: "#FFFFFF",
      stroke: "#000",
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.49, `BEST: ${hiScore}`, {
      fontFamily: "Impact, Arial Black, sans-serif",
      fontSize: "28px",
      color: "#F4A261",
      stroke: "#000",
      strokeThickness: 3,
    }).setOrigin(0.5);

    const playAgain = this.add.text(width / 2, height * 0.65, "[ PLAY AGAIN ]", {
      fontFamily: "Impact, Arial Black, sans-serif",
      fontSize: "30px",
      color: "#FFFF00",
      stroke: "#000",
      strokeThickness: 4,
    }).setOrigin(0.5).setInteractive({ cursor: "pointer" });

    playAgain.on("pointerover", () => playAgain.setColor("#FF0000"));
    playAgain.on("pointerout", () => playAgain.setColor("#FFFF00"));
    playAgain.on("pointerdown", () => this.scene.start("GameScene"));

    const back = this.add.text(width / 2, height * 0.77, "← Back to Portfolio", {
      fontFamily: "monospace",
      fontSize: "16px",
      color: "#888888",
    }).setOrigin(0.5).setInteractive({ cursor: "pointer" });

    back.on("pointerover", () => back.setColor("#FFFFFF"));
    back.on("pointerout", () => back.setColor("#888888"));
    back.on("pointerdown", () => { window.location.href = "/"; });

    this.input.keyboard!.once("keydown-SPACE", () => this.scene.start("GameScene"));
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/game/scenes/GameOverScene.ts
git commit -m "feat: implement GameOverScene with score display and high score"
```

---

## Task 14: Footer Button

**Files:**
- Modify: `src/components/Footer.tsx`

- [ ] **Step 1: Update imports in `src/components/Footer.tsx`**

Replace the existing import line:
```tsx
import { FiArrowUp, FiGithub, FiLinkedin, FiDownload } from "react-icons/fi";
```
With:
```tsx
import { FiArrowUp, FiGithub, FiLinkedin, FiDownload, FiPlayCircle } from "react-icons/fi";
import Link from "next/link";
```

- [ ] **Step 2: Add the "Play a Game" Link to the bottom bar**

In the bottom bar `<div>` (the flex row that contains the copyright `<p>` and the "Back to Top" `<button>`), add the Link between them:

```tsx
<Link
  href="/game"
  className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-[#F0EBE0]/30 mono-tag text-[#F0EBE0]/60 hover:border-accent hover:text-accent transition-colors brutal-hover"
>
  <FiPlayCircle size={13} aria-hidden="true" />
  Play a Game
</Link>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Footer.tsx
git commit -m "feat: add Play a Game button to footer"
```

---

## Task 15: End-to-End Verification

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Verify portfolio is unchanged**

Open `http://localhost:3000`. Confirm:
- Portfolio renders normally
- SmoothScroll (Lenis) active — page scrolls smoothly
- Custom cursor visible
- LoadingScreen appears on first load
- Footer shows "Play a Game" button

- [ ] **Step 3: Verify game route is isolated**

Open `http://localhost:3000/game`. Confirm:
- No custom cursor
- No Lenis smooth scroll
- No LoadingScreen animation
- Full-black page with pulsing "LOADING..." while Phaser loads
- Menu screen appears: "SPIDER-MAN WEB RUNNER" title, blinking prompt, Spidey silhouette

- [ ] **Step 4: Play through the game**

- Press Space / tap → Spidey fires a web and swings
- Release → Spidey flies forward
- Buildings scroll left, THWIP! burst appears on web fire
- Score increments as buildings are cleared
- Combo badge appears after 3+ consecutive swings without ground contact
- Fall to ground → 800ms delay → Game Over screen with score
- High score persists after page refresh (`localStorage.getItem("spidey-hiscore")`)
- "Play Again" resets and restarts the game
- "← Back to Portfolio" navigates to `/`

- [ ] **Step 5: Production build check**

```bash
npm run build
```

Expected: build succeeds. Phaser may emit TypeScript warnings about internal types — these are acceptable if the build output completes without errors.

- [ ] **Step 6: Final commit**

```bash
git add .
git commit -m "feat: Spider-Man web-swinging endless runner complete"
```
