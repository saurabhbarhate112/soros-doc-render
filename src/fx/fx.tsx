import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { clamp, noise1 } from "../lib/anim";

/** Animated film grain (SVG turbulence, reseeded every 2 frames) */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.075 }) => {
  const f = useCurrentFrame();
  const seed = Math.floor(f / 2) % 24;
  return (
    <AbsoluteFill style={{ opacity, mixBlendMode: "overlay", pointerEvents: "none" }}>
      <svg width="100%" height="100%" viewBox="0 0 960 540" preserveAspectRatio="none">
        <filter id={`grain${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="960" height="540" filter={`url(#grain${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};

/** Warm film edge burn: corners darken with a warm brown, centre stays clean */
export const EdgeBurn: React.FC<{ strength?: number }> = ({ strength = 1 }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 75% 70% at 50% 50%, rgba(0,0,0,0) 55%, rgba(70,28,8,${0.42 * strength}) 85%, rgba(30,10,2,${0.78 * strength}) 100%)`,
        mixBlendMode: "multiply",
      }}
    />
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 90% 85% at 50% 50%, rgba(0,0,0,0) 70%, rgba(255,140,60,${0.07 * strength}) 100%)`,
        mixBlendMode: "screen",
      }}
    />
  </AbsoluteFill>
);

/** Floating dust / bokeh particles */
export const Particles: React.FC<{ color?: string; count?: number; seed?: string; speed?: number; big?: boolean; opacity?: number }> = ({
  color = "#ffd27a",
  count = 36,
  seed = "p",
  speed = 1,
  big = true,
  opacity = 0.9,
}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity, mixBlendMode: "screen" }}>
      {new Array(count).fill(0).map((_, i) => {
        const r = (k: string) => random(seed + i + k);
        const bokeh = big && r("b") > 0.8;
        const size = bokeh ? 18 + r("s") * 40 : 2 + r("s") * 5;
        const x = ((r("x") * 2200 + f * (r("vx") - 0.5) * 0.6 * speed) % 2200) - 140;
        const y = ((r("y") * 1300 - f * (0.25 + r("vy") * 0.8) * speed) % 1300 + 1300) % 1300 - 110;
        const tw = 0.45 + 0.55 * Math.abs(Math.sin(f / (18 + r("t") * 30) + r("p") * 6));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: "50%",
              background: bokeh ? `radial-gradient(circle, ${color}55 0%, ${color}22 55%, transparent 70%)` : color,
              boxShadow: bokeh ? undefined : `0 0 ${size * 3}px ${color}`,
              opacity: (bokeh ? 0.5 : 0.85) * tw,
              filter: bokeh ? "blur(2px)" : undefined,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Moving coloured light leak blobs (screen blend) */
export const LightLeak: React.FC<{ colors?: string[]; intensity?: number; seed?: string }> = ({
  colors = ["#ff7a18", "#ff2e63"],
  intensity = 0.5,
  seed = "ll",
}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", pointerEvents: "none", opacity: intensity }}>
      {colors.map((c, i) => {
        const x = 50 + noise1(seed + i + "x", f / 70) * 60;
        const y = 50 + noise1(seed + i + "y", f / 80) * 50;
        return (
          <AbsoluteFill
            key={i}
            style={{ background: `radial-gradient(ellipse 45% 55% at ${x}% ${y}%, ${c}cc 0%, ${c}44 40%, transparent 70%)` }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Drifting smoke/atmosphere backdrop built from blurred radial blobs */
export const Atmosphere: React.FC<{ c1: string; c2: string; base?: string; seed?: string }> = ({ c1, c2, base = "#05040a", seed = "atm" }) => {
  const f = useCurrentFrame();
  const blobs = [c1, c2, c1, c2, "#ffffff"];
  return (
    <AbsoluteFill style={{ background: base, overflow: "hidden" }}>
      {blobs.map((c, i) => {
        const x = 50 + noise1(seed + i + "x", f / 120 + i * 3) * 55;
        const y = 50 + noise1(seed + i + "y", f / 140 + i * 5) * 45;
        const s = 50 + i * 12;
        return (
          <AbsoluteFill
            key={i}
            style={{
              background: `radial-gradient(ellipse ${s}% ${s * 0.8}% at ${x}% ${y}%, ${c}${i === 4 ? "14" : "88"} 0%, transparent 65%)`,
              mixBlendMode: i === 4 ? "screen" : "normal",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Full-frame flash used at cuts */
export const Flash: React.FC<{ at: number; color?: string; len?: number; peak?: number }> = ({ at, color = "#fff", len = 10, peak = 0.9 }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [at - 2, at, at + len], [0, peak, 0], clamp);
  if (o <= 0) return null;
  return <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, ${color} 0%, ${color}aa 45%, ${color}00 100%)`, opacity: o, mixBlendMode: "screen" }} />;
};

/** Horizontal light streak / anamorphic flare */
export const Streak: React.FC<{ y?: number; color?: string; opacity?: number }> = ({ y = 50, color = "#9fd8ff", opacity = 0.5 }) => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(180deg, transparent ${y - 1.2}%, ${color} ${y}%, transparent ${y + 1.2}%)`,
      opacity,
      mixBlendMode: "screen",
      filter: "blur(6px)",
    }}
  />
);
