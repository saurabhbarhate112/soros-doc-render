import React from "react";
import { interpolate, random, useCurrentFrame } from "remotion";
import { EASE, clamp, noise1, prog } from "../lib/anim";
import { ANTON, MONT } from "../lib/fonts";

/** Saturated pop background: gradient + optional sunburst rays + halftone dots + grain. MagnatesMedia-style */
export const PopBg: React.FC<{ w: number; h: number; c1: string; c2: string; c3?: string; rays?: boolean; dots?: boolean; spin?: number; seed?: string; texture?: "plastic" | "paper" | "none" }> = ({
  w, h, c1, c2, c3, rays = true, dots = true, spin = 0.08, seed = "pb", texture = "plastic",
}) => {
  const f = useCurrentFrame();
  const ang = f * spin;
  const cx = 50 + noise1(seed + "x", f / 90) * 8;
  const cy = 50 + noise1(seed + "y", f / 100) * 8;
  return (
    <div style={{ position: "relative", width: w, height: h, overflow: "hidden", background: `radial-gradient(ellipse 70% 70% at ${cx}% ${cy}%, ${c2} 0%, ${c1} 75%, ${c3 ?? c1} 100%)` }}>
      {rays ? (
        <div style={{ position: "absolute", inset: "-50%", background: `repeating-conic-gradient(from ${ang}deg at 50% 50%, rgba(255,255,255,0.10) 0deg 7deg, rgba(255,255,255,0) 7deg 18deg)`, mixBlendMode: "overlay" }} />
      ) : null}
      {dots ? (
        <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.28) 2.2px, transparent 2.6px)`, backgroundSize: "14px 14px", maskImage: `radial-gradient(ellipse 60% 60% at 50% 50%, transparent 35%, #000 100%)`, WebkitMaskImage: `radial-gradient(ellipse 60% 60% at 50% 50%, transparent 35%, #000 100%)`, opacity: 0.9 }} />
      ) : null}
      {texture === "plastic" ? (
        <div style={{ position: "absolute", inset: 0, opacity: 0.22, mixBlendMode: "soft-light", background: `repeating-linear-gradient(${115 + noise1(seed, f / 200) * 10}deg, rgba(255,255,255,0.0) 0px, rgba(255,255,255,0.55) 3px, rgba(0,0,0,0.25) 9px, rgba(255,255,255,0) 22px)` }} />
      ) : null}
      {texture === "paper" ? (
        <svg width={w} height={h} style={{ position: "absolute", inset: 0, opacity: 0.35, mixBlendMode: "multiply" }}>
          <filter id={"pp" + seed}><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="4" seed={7} /><feColorMatrix type="saturate" values="0" /></filter>
          <rect width={w} height={h} filter={`url(#pp${seed})`} />
        </svg>
      ) : null}
    </div>
  );
};

/** Hand-drawn marker shapes that draw on: arrow, circle, underline, cross, question, burst */
export const Scribble: React.FC<{ shape: string; w: number; color: string; at: number; len?: number; stroke?: number; flip?: boolean; seed?: string }> = ({ shape, w, color, at, len = 14, stroke = 14, flip, seed = "s" }) => {
  const f = useCurrentFrame();
  const t = prog(f, at, len, EASE.out);
  if (t <= 0) return null;
  const j = (k: string, a = 6) => (random(seed + k) - 0.5) * a;
  let d = "";
  let vb = "0 0 400 400";
  let extra: React.ReactNode = null;
  if (shape === "arrow") {
    vb = "0 0 400 200";
    d = `M10,${150 + j("a")} C120,${20 + j("b", 30)} 250,${30 + j("c", 30)} 360,${110 + j("d")}`;
    extra = <path d={`M300,${70 + j("e")} L365,${112} L310,${165 + j("f")}`} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="300" strokeDashoffset={300 * (1 - Math.max(0, (t - 0.6) / 0.4))} />;
  } else if (shape === "circle") {
    d = `M200,${30 + j("a")} C330,${25 + j("b")} 385,140 370,220 C350,330 230,375 150,360 C60,340 15,250 30,160 C45,80 120,35 230,40`;
  } else if (shape === "underline") {
    vb = "0 0 400 60";
    d = `M10,${35 + j("a")} C120,${25 + j("b")} 260,${45 + j("c")} 390,${28 + j("d")}`;
  } else if (shape === "cross") {
    d = `M60,60 L340,340 M340,60 L60,340`;
  } else if (shape === "question") {
    d = `M120,140 C120,40 300,30 300,130 C300,200 200,200 200,270 L200,290`;
    extra = t > 0.85 ? <circle cx="200" cy="350" r={stroke * 1.2} fill={color} /> : null;
  } else if (shape === "burst") {
    d = new Array(10).fill(0).map((_, i) => { const a = (i / 10) * Math.PI * 2; return `M${200 + Math.cos(a) * 90},${200 + Math.sin(a) * 90} L${200 + Math.cos(a) * 180},${200 + Math.sin(a) * 180}`; }).join(" ");
  }
  return (
    <svg width={w} viewBox={vb} style={{ overflow: "visible", transform: flip ? "scaleX(-1)" : undefined, filter: `drop-shadow(0 0 10px ${color}aa) drop-shadow(0 6px 10px rgba(0,0,0,0.5))` }}>
      <path d={d} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" pathLength={1000} strokeDasharray="1000" strokeDashoffset={1000 * (1 - Math.min(1, t / 0.75))} />
      {extra}
    </svg>
  );
};

/** Phone mockup with incoming call */
export const PhoneMock: React.FC<{ w: number; name: string; sub?: string; at: number; accent: string }> = ({ w, name, sub, at, accent }) => {
  const f = useCurrentFrame();
  const local = f - at;
  const shake = local > 0 && local % 30 < 12 ? Math.sin(local * 2.2) * 4 : 0;
  const h = w * 2.05;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.13, background: "#0b0b0f", padding: w * 0.035, boxShadow: `0 40px 80px rgba(0,0,0,0.6), 0 0 0 3px #2a2a30, 0 0 40px ${accent}55`, transform: `rotate(${shake}deg)` }}>
      <div style={{ width: "100%", height: "100%", borderRadius: w * 0.1, overflow: "hidden", background: `linear-gradient(180deg, #1b2440, #0a0d18)`, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: h * 0.12, fontFamily: MONT, color: "#fff" }}>
        <div style={{ width: w * 0.32, height: w * 0.32, borderRadius: "50%", background: `linear-gradient(135deg, ${accent}, #333)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ANTON, fontSize: w * 0.15 }}>{name.slice(0, 1)}</div>
        <div style={{ marginTop: w * 0.06, fontWeight: 800, fontSize: w * 0.085, textAlign: "center", padding: "0 6%" }}>{name}</div>
        {sub ? <div style={{ marginTop: w * 0.02, fontWeight: 600, fontSize: w * 0.05, opacity: 0.7 }}>{sub}</div> : null}
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", width: "70%", justifyContent: "space-between", marginBottom: h * 0.1 }}>
          <div style={{ width: w * 0.18, height: w * 0.18, borderRadius: "50%", background: "#ff3b30" }} />
          <div style={{ width: w * 0.18, height: w * 0.18, borderRadius: "50%", background: "#34c759", transform: `scale(${1 + 0.08 * Math.sin(local / 3)})` }} />
        </div>
      </div>
    </div>
  );
};

/** Torn paper strip with text (for quotes / headlines) */
export const PaperNote: React.FC<{ w: number; text: string; sub?: string; color?: string; ink?: string; rot?: number }> = ({ w, text, sub, color = "#f4eee2", ink = "#141414", rot = -2 }) => (
  <div style={{ width: w, background: color, padding: "26px 34px", transform: `rotate(${rot}deg)`, boxShadow: "0 30px 60px rgba(0,0,0,0.5)", clipPath: "polygon(0% 4%, 6% 0%, 14% 3%, 25% 0%, 38% 4%, 52% 1%, 66% 4%, 79% 0%, 91% 3%, 100% 1%, 99% 96%, 90% 100%, 77% 97%, 63% 100%, 48% 96%, 33% 100%, 19% 97%, 8% 100%, 0% 97%)" }}>
    <div style={{ fontFamily: ANTON, fontSize: w * 0.075, color: ink, lineHeight: 1.05, textTransform: "uppercase" }}>{text}</div>
    {sub ? <div style={{ fontFamily: MONT, fontWeight: 700, fontSize: w * 0.035, color: ink, opacity: 0.7, marginTop: 8, letterSpacing: 2, textTransform: "uppercase" }}>{sub}</div> : null}
  </div>
);

/** Gradient-map duotone SVG filter definition (shadow colour -> highlight colour) */
export const hexRgb = (h: string) => {
  const s = h.replace("#", "");
  const n = parseInt(s.length === 3 ? s.split("").map((c) => c + c).join("") : s.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255);
};
export const GradMapDef: React.FC<{ id: string; dark: string; light: string; contrast?: number }> = ({ id, dark, light, contrast = 1.25 }) => {
  const a = hexRgb(dark);
  const b = hexRgb(light);
  const slope = contrast;
  const icpt = -(contrast - 1) / 2;
  return (
    <svg width={0} height={0} style={{ position: "absolute" }}>
      <filter id={id} colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0 0 0 1 0" />
        <feComponentTransfer>
          <feFuncR type="linear" slope={slope} intercept={icpt} />
          <feFuncG type="linear" slope={slope} intercept={icpt} />
          <feFuncB type="linear" slope={slope} intercept={icpt} />
        </feComponentTransfer>
        <feComponentTransfer>
          <feFuncR type="table" tableValues={`${a[0]} ${b[0]}`} />
          <feFuncG type="table" tableValues={`${a[1]} ${b[1]}`} />
          <feFuncB type="table" tableValues={`${a[2]} ${b[2]}`} />
        </feComponentTransfer>
      </filter>
    </svg>
  );
};
