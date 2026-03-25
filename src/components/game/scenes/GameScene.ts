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
    this.lastSpeedIncrease = this.time.now;
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
      (_event: Phaser.Physics.Matter.Events.CollisionStartEvent, bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType) => {
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
      const b = new Building(this, x, height, height * 0.5);
      this.buildings.push(b);
      x += b.data.width + Phaser.Math.Between(80, maxGap(ROPE_LENGTH));
    }
  }

  private spawnNextBuilding() {
    const last = this.buildings[this.buildings.length - 1];
    const { height } = this.scale;
    const gap = Phaser.Math.Between(80, maxGap(ROPE_LENGTH));
    const x = last.data.x + last.data.width + gap;
    this.buildings.push(new Building(this, x, height, height * 0.5));
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
