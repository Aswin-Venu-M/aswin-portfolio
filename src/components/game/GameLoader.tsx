"use client";

import dynamic from "next/dynamic";

const SpiderManGame = dynamic(() => import("./SpiderManGame"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-jetbrains), monospace",
          fontSize: "1.25rem",
          color: "#F4A261",
          letterSpacing: "0.15em",
          animation: "pulse 1s ease-in-out infinite",
        }}
      >
        LOADING...
      </span>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  ),
});

export default function GameLoader() {
  return <SpiderManGame />;
}
