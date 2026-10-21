import React from "react";
import { random, useCurrentFrame } from "remotion";
import { MONO } from "../lib/fonts";

/** Wall of scrolling market numbers */
export const Ticker: React.FC<{ w: number; h: number; color: string; seed?: string }> = ({ w, h, color, seed = "tk" }) => {
  const f = useCurrentFrame();
  const rows = 16;
  const cols = 7;
  return (
    <div style={{ width: w, height: h, position: "relative", overflow: "hidden", fontFamily: MONO, fontWeight: 700 }}>
      {new Array(rows).fill(0).map((_, r) => {
        const speed = 0.6 + random(seed + r) * 1.4;
        const off = ((f * speed * (r % 2 ? 1 : -1)) % 400) - 200;
        return (
          <div key={r} style={{ position: "absolute", top: (r / rows) * h, left: off, whiteSpace: "nowrap", fontSize: h / rows * 0.55, opacity: 0.35 + random(seed + "o" + r) * 0.5 }}>
            {new Array(cols * 2).fill(0).map((__, c) => {
              const v = random(seed + r + "-" + c + Math.floor(f / 6));
              const neg = random(seed + r + "s" + c) > 0.5;
              return (
                <span key={c} style={{ marginRight: w / cols * 0.35, color: neg ? "#ff3b4f" : color }}>
                  {neg ? "▼" : "▲"} {(v * 9.99).toFixed(2)}%  {(random(seed + "p" + r + c) * 400 + 10).toFixed(2)}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

/** Glowing perspective grid plane */
export const GridFloor: React.FC<{ w: number; h: number; color: string }> = ({ w, h, color }) => (
  <div
    style={{
      width: w,
      height: h,
      backgroundImage: `linear-gradient(${color}55 2px, transparent 2px), linear-gradient(90deg, ${color}55 2px, transparent 2px)`,
      backgroundSize: "90px 90px",
      maskImage: "radial-gradient(ellipse 60% 60% at 50% 50%, #000 30%, transparent 75%)",
      WebkitMaskImage: "radial-gradient(ellipse 60% 60% at 50% 50%, #000 30%, transparent 75%)",
    }}
  />
);
