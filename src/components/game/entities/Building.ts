import Phaser from "phaser";

const PIXEL_PALETTE = [0x2d3a5e, 0x3d4f7a, 0x4a3728, 0x6b4c3b, 0x1e2d4a, 0x5c4033];

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
    const color = Phaser.Utils.Array.GetRandom(PIXEL_PALETTE) as number;

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
    this.graphics.fillStyle(0x8899bb);
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
