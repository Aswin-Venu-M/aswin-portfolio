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
