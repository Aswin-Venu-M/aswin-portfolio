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
