import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { EASE, clamp } from "../lib/anim";
import { pal } from "../lib/palettes";
import { ANTON, MONT, MONO, PLAYFAIR, PLAYFAIR_I } from "../lib/fonts";

export type LineSpec = {
  t: string; // words; [x] = accent colour, {x} = accent2, _x_ = white-on-strip
  size?: number;
  font?: "anton" | "mont" | "serif" | "serifI" | "mono";
  color?: string;
  at?: number; // first word frame
  wf?: number[]; // explicit per-word frames (from narration sync)
  stagger?: number;
  upper?: boolean;
  weight?: number;
  track?: number;
  strip?: string; // background strip colour behind line
};

export type TextSpec = {
  lines: LineSpec[];
  align?: "left" | "center" | "right";
  width?: number;
  style?: "slam" | "rise" | "type" | "blur" | "fade" | "drop";
  glow?: boolean;
  out?: number;
  gap?: number;
};

const FONTS: Record<string, string> = { anton: ANTON, mont: MONT, serif: PLAYFAIR, serifI: PLAYFAIR_I, mono: MONO };

type Tok = { w: string; kind: "n" | "a" | "b" | "s" };
const tokenize = (t: string): Tok[] => {
  const out: Tok[] = [];
  const re = /\[([^\]]+)\]|\{([^}]+)\}|_([^_]+)_|(\S+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(t))) {
    if (m[1]) m[1].split(" ").forEach((w) => out.push({ w, kind: "a" }));
    else if (m[2]) m[2].split(" ").forEach((w) => out.push({ w, kind: "b" }));
    else if (m[3]) m[3].split(" ").forEach((w) => out.push({ w, kind: "s" }));
    else out.push({ w: m[4], kind: "n" });
  }
  return out;
};

export const TextBlock: React.FC<{ spec: TextSpec; palette?: string }> = ({ spec, palette }) => {
  const f = useCurrentFrame();
  const p = pal(palette);
  const style = spec.style ?? "slam";
  const outO = spec.out !== undefined ? interpolate(f, [spec.out, spec.out + 8], [1, 0], clamp) : 1;
  const outX = spec.out !== undefined ? interpolate(f, [spec.out, spec.out + 8], [0, -120], { ...clamp, easing: EASE.in }) : 0;
  return (
    <div
      style={{
        width: spec.width ?? 1500,
        display: "flex",
        flexDirection: "column",
        alignItems: spec.align === "left" ? "flex-start" : spec.align === "right" ? "flex-end" : "center",
        gap: spec.gap ?? 4,
        opacity: outO,
        transform: `translateX(${outX}px)`,
        filter: outX ? `blur(${Math.abs(outX) / 20}px)` : undefined,
      }}
    >
      {spec.lines.map((ln, li) => {
        const toks = tokenize(ln.t);
        const size = ln.size ?? 90;
        const font = FONTS[ln.font ?? "anton"];
        const base = ln.color ?? "#ffffff";
        const st = ln.stagger ?? 3;
        return (
          <div
            key={li}
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: spec.align === "left" ? "flex-start" : spec.align === "right" ? "flex-end" : "center",
              columnGap: size * 0.24,
              lineHeight: 1.02,
              background: ln.strip,
              padding: ln.strip ? `${size * 0.08}px ${size * 0.3}px` : undefined,
            }}
          >
            {toks.map((tk, i) => {
              const wf = ln.wf && ln.wf[i] !== undefined ? ln.wf[i] : (ln.at ?? 0) + i * st;
              const t = interpolate(f, [wf, wf + (style === "type" ? 1 : 7)], [0, 1], { ...clamp, easing: EASE.out });
              if (t <= 0) return <span key={i} style={{ opacity: 0, fontFamily: font, fontSize: size }}>{tk.w}</span>;
              const col = tk.kind === "a" ? p.accent : tk.kind === "b" ? p.accent2 : base;
              let tr = "";
              let blur = 0;
              if (style === "slam") { tr = `scale(${1 + (1 - t) * 0.7})`; blur = (1 - t) * 10; }
              if (style === "rise") tr = `translateY(${(1 - t) * size * 0.5}px)`;
              if (style === "drop") tr = `translateY(${-(1 - t) * size * 0.6}px)`;
              if (style === "blur") blur = (1 - t) * 18;
              return (
                <span
                  key={i}
                  style={{
                    display: "inline-block",
                    fontFamily: font,
                    fontSize: size * (tk.kind === "a" ? 1.0 : 1),
                    fontWeight: ln.weight ?? (ln.font === "mont" ? 900 : 400),
                    letterSpacing: ln.track ?? (ln.font === "anton" ? 1 : 0),
                    textTransform: ln.upper === false ? undefined : ln.font === "serif" || ln.font === "serifI" ? undefined : "uppercase",
                    color: tk.kind === "s" ? "#111" : col,
                    background: tk.kind === "s" ? p.accent : undefined,
                    padding: tk.kind === "s" ? "0 10px" : undefined,
                    opacity: t,
                    transform: tr,
                    filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
                    textShadow:
                      spec.glow !== false
                        ? `0 0 ${size * 0.25}px ${tk.kind === "a" ? p.accent : tk.kind === "b" ? p.accent2 : "rgba(255,255,255,0.35)"}66, 0 6px 24px rgba(0,0,0,0.65)`
                        : "0 6px 24px rgba(0,0,0,0.65)",
                    whiteSpace: "pre",
                  }}
                >
                  {tk.w}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
