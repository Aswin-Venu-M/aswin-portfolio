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
