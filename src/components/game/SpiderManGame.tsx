"use no memo";
"use client";

import { useEffect, useRef } from "react";
import { SpidermanGame } from "./spiderman-engine";

export default function SpiderManGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef   = useRef<SpidermanGame | null>(null);

  useEffect(() => {
    if (!canvasRef.current || gameRef.current) return;
    const game = new SpidermanGame({ canvas: canvasRef.current });
    gameRef.current = game;
    game.load();
    return () => {
      game.destroy();
      gameRef.current = null;
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#000",
      }}
    >
      {/* Controls HUD */}
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          padding: "6px 12px",
          fontSize: 13,
          fontFamily: "Helvetica, Arial, sans-serif",
          color: "#ccc",
          background: "rgba(0,0,0,0.7)",
          marginBottom: 12,
          borderRadius: 4,
        }}
      >
        <span><Key wide>Space</Key> Shoot</span>
        <span><Key>←</Key><Key>→</Key> Move</span>
        <span><Key>↑</Key> Jump</span>
        <span><Key>Esc</Key> Pause</span>
        <a
          href="/"
          style={{
            marginLeft: 12,
            color: "#aaa",
            textDecoration: "none",
            border: "1px solid #444",
            padding: "3px 10px",
            borderRadius: 4,
            fontSize: 13,
          }}
        >
          ← Portfolio
        </a>
      </div>

      {/* Tablet frame */}
      <div
        style={{
          background: "linear-gradient(145deg, #2dd4bf, #0d9488)",
          borderRadius: 28,
          padding: "20px 22px 32px 22px",
          boxShadow:
            "0 0 0 2px #0f766e, 0 20px 60px rgba(13,148,136,0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
        }}
      >
        {/* Camera notch */}
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#0f766e",
            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.4)",
            alignSelf: "center",
            marginBottom: -6,
          }}
        />

        {/* Screen bezel */}
        <div
          style={{
            borderRadius: 8,
            overflow: "hidden",
            boxShadow: "inset 0 2px 8px rgba(0,0,0,0.6), 0 0 0 1px #0f766e",
          }}
        >
          <canvas ref={canvasRef} />
        </div>

        {/* Home button */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "linear-gradient(145deg, #0f766e, #134e4a)",
            boxShadow:
              "0 2px 4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
            border: "1.5px solid #0f766e",
          }}
        />
      </div>
    </div>
  );
}

function Key({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <span
      style={{
        display: "inline-block",
        height: 24,
        minWidth: 18,
        lineHeight: "24px",
        textAlign: "center",
        border: "1px solid #ccc",
        borderBottom: "3px solid #bbb",
        background: "white",
        padding: wide ? "0 14px" : "0 5px",
        borderRadius: 4,
        color: "#333",
        fontWeight: "bold",
        fontSize: 12,
        marginRight: 2,
      }}
    >
      {children}
    </span>
  );
}
