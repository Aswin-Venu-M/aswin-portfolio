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
