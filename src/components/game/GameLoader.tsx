"use client";

export default function GameLoader() {
  return (
    <iframe
      src="/spider-man/index.html"
      title="Spider-Man Game"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        border: "none",
        background: "#000",
      }}
    />
  );
}
