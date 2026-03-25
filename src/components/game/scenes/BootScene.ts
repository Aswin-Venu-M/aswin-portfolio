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

const RUN_ROWS: string[] = [
  "........KKKKKK..........",
  ".......KrRRRRrK.........",
  "......KRRRRRRRrK........",
  "......KrWWRRWWrK........",
  "......KrWWRRWWrK........",
  "......KRRRRRRRrK........",
  ".......KKKKKKKK.........",
  ".....KBKRRRRRRKBK.......",
  "....KBBKrRRRRrKBBK......",
  "...KBBbKRRRRRRKBBbK.....",
  "...KBBbKRRRRRRKBBbK.....",
  "....KBbKRRRrRRKBbK......",
  ".....KBKRRRRRRKBK.......",
  ".....KBKRRRRRRrKBK......",
  "......KKRRRRRRrKK.......",
  ".......KBBRRBBbK........",
  "......KBBBKKBBBbK.......",
  ".....KBBBb.KBBBbK.......",
  "....KBBBb...KBBbK.......",
  "...KBBBb.....KBbK.......",
  "..KBBBb.......KBK.......",
  ".KBBBb.........KK.......",
  "KBBBb...........K.......",
  "KBBb.............K......",
  "KBBb..............KK....",
  ".KBb...............KBK..",
  "..KBb...............KBbK",
  "...KBb..............KBbK",
  "...KBb..............KBbK",
  "....KBb.............KBbK",
  "....KBb..............KKK",
  ".....KKK................",
  "........................",
  "........................",
  "........................",
  "........................",
];

const SWING_ROWS: string[] = [
  "....................KBbK",
  "....................KBbK",
  "....................KBbK",
  ".......KKKKKK......KBbK.",
  "......KrRRRRrK.....KBbK.",
  ".....KRRRRRRRrK....KBbK.",
  ".....KrWWRRWWrK....KBbK.",
  ".....KrWWRRWWrK....KBbK.",
  ".....KRRRRRRRrK...KBBbK.",
  "......KKKKKKKK...KBBBbK.",
  "....KBKrRRRRrKKKBBBBbK..",
  "....KBBKRRRRRrKBBBBbK...",
  "...KBBbKRRRRRrKBBBbK....",
  "...KBBbKRRRRRrKBBbK.....",
  "....KBbKRRRRrRKBbK......",
  ".....KBKRRRRRRKBK.......",
  "......KKRRRRRRrKK.......",
  ".......KBBRRBBbK........",
  ".......KBBBBBBbK........",
  "......KBBBBBBbK.........",
  ".....KBBBBBbbK..........",
  "....KBBBBbbbK...........",
  "...KBBBBbbbbK...........",
  "..KBBBbbbbbK............",
  "..KBBbbbb.KBbbK.........",
  ".KBBbbb...KBBbbK........",
  "KBBbbb.....KBBbbK.......",
  "KBBbb.......KBBbK.......",
  ".KBbb........KBbK.......",
  "..KBb.........KBbK......",
  "...KBb.........KBK......",
  "....KBb.........KK......",
  ".....KBb........KKK.....",
  "......KKK.......KKK.....",
  "........................",
  "........................",
];

const FALL_ROWS: string[] = [
  "........................",
  "........................",
  "........KKKKKK..........",
  ".......KrRRRRrK.........",
  "......KRRRRRRRrK........",
  "......KrWWRRWWrK........",
  "......KrWWRRWWrK........",
  "......KRRRRRRRrK........",
  ".......KKKKKKKK.........",
  ".......KrRRRRrK.........",
  "...KBBKRRRRRRKBBbK......",
  "..KBBbKRRRRRRKBBbbK.....",
  ".KBBbbKRRRRRRKBBbbbK....",
  "KBBbbbKRRRRRRKBBbbbbK...",
  "KBBbbbbKRRRRRrKBBbbbbbK.",
  ".KBbbbKKrRRRRrKKBbbbbK..",
  "..KBbbKRRRRRRKBbbbK.....",
  "...KBbKRRRRRRKBbbK......",
  "....KBKRRRRRRKBbK.......",
  "........KBBbKKBBbK......",
  ".......KBBBb..KBBBbK....",
  "......KBBBb....KBBbK....",
  ".....KBBBb......KBbK....",
  "....KBBBb........KBK....",
  "...KBBBb..........KbK...",
  "..KBBBb............KKK..",
  ".KBBb...............KBK.",
  "KBBb.................KBK",
  "KBb.................KBbK",
  ".KBb...............KBbbK",
  "..KBb..............KBbbK",
  "...KBb..............KBbK",
  "....KBb..............KKK",
  ".....KKK................",
  "........................",
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
