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
