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
