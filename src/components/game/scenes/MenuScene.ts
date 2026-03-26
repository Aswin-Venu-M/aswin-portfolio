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

    this.add.image(width / 2, height * 0.6, "spidey-swing").setScale(5);

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
      .on("pointerdown", (_pointer: Phaser.Input.Pointer, _lx: number, _ly: number, event: Phaser.Types.Input.EventData) => {
        event.stopPropagation();
        window.location.href = "/";
      });

    this.input.keyboard!.once("keydown-SPACE", () => this.scene.start("GameScene"));
    this.input.once("pointerdown", () => this.scene.start("GameScene"));
  }
}
