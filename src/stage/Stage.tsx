import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Video } from "@remotion/media";
import { Cam, EASE, H, W, camAt, clamp, handheld, prog, noise1 } from "../lib/anim";
import { pal } from "../lib/palettes";
import { Atmosphere, LightLeak, Particles } from "../fx/fx";
import { TextBlock, TextSpec } from "./Text";
import { Ticker, GridFloor } from "./Decor";
import { Icon } from "./Icons";
import { Counter } from "../scenes/Specials";

export type Grade = "natural" | "vivid" | "mono" | "tint" | "duo" | "dark" | "none";

export type LayerSpec = {
  kind: "img" | "cutout" | "video" | "atmos" | "text" | "ticker" | "grid" | "solid" | "icon" | "frame" | "line" | "label" | "glow" | "counter";
  value?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  len?: number;
  start?: number;
  sep?: boolean;
  src?: string;
  x?: number; // px offset from centre (in layer plane)
  y?: number;
  z?: number; // depth (negative = further)
  w?: number; // width in px (at z=0 scale)
  h?: number;
  fill?: boolean; // cover whole frame at its depth
  rot?: number;
  ry?: number;
  rx?: number;
  opacity?: number;
  blur?: number;
  grade?: Grade;
  tint?: string; // tint colour for grade
  tint2?: string;
  glow?: string; // rim light colour for cutouts
  shadow?: boolean;
  border?: boolean; // white photo border (polaroid)
  radius?: number;
  at?: number; // appear frame (relative to scene)
  out?: number; // disappear frame
  anim?: "fade" | "pop" | "slideL" | "slideR" | "slideU" | "slideD" | "drop" | "zoom" | "wipe" | "flip" | "none";
  animLen?: number;
  drift?: { x?: number; y?: number; z?: number; r?: number; s?: number }; // movement across whole scene
  text?: TextSpec;
  color?: string;
  c2?: string;
  icon?: string;
  label?: string;
  sub?: string;
  objPos?: string;
  startFrom?: number; // video start (frames)
  playbackRate?: number;
  blend?: string;
  x2?: number;
  y2?: number;
  dash?: boolean;
  seed?: string;
};

export type StageProps = {
  layers: LayerSpec[];
  cam?: { from: Cam; to: Cam; ease?: "out" | "inOut" | "soft" | "linear" };
  camKeys?: { f: number; c: Cam }[]; // keyframed camera (frames relative to scene)
  perspective?: number;
  palette?: string;
  bg?: string;
  particles?: boolean | string;
  leak?: boolean;
  shake?: number;
  dur: number;
};

const P_DEFAULT = 1200;

const LayerBody: React.FC<{ l: LayerSpec; dur: number; palette?: string }> = ({ l, dur, palette }) => {
  const f = useCurrentFrame();
  const p = pal(palette);
  const tint = l.tint ?? p.a;
  const src = l.src ? (l.src.startsWith("http") ? l.src : staticFile(l.src)) : undefined;

  const filt: string[] = [];
  if (l.grade === "mono" || l.grade === "tint" || l.grade === "duo") filt.push("grayscale(1) contrast(1.25) brightness(1.02)");
  if (l.grade === "natural") filt.push("saturate(1.12) contrast(1.08)");
  if (l.grade === "vivid") filt.push("saturate(1.4) contrast(1.15) brightness(1.03)");
  if (l.grade === "dark") filt.push("saturate(1.05) contrast(1.15) brightness(0.72)");
  if (l.blur) filt.push(`blur(${l.blur}px)`);
  if (l.kind === "cutout" && l.glow) filt.push(`drop-shadow(0 0 2px ${l.glow}) drop-shadow(0 0 22px ${l.glow}aa)`);
  if (l.kind === "cutout" && l.shadow !== false) filt.push("drop-shadow(18px 26px 26px rgba(0,0,0,0.55))");

  const tintOverlay =
    l.grade === "tint" || l.grade === "duo" || l.grade === "natural" || l.grade === "vivid" ? (
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            l.grade === "duo"
              ? `linear-gradient(135deg, ${tint} 0%, ${l.tint2 ?? p.b} 100%)`
              : l.grade === "tint"
              ? tint
              : `linear-gradient(160deg, ${p.a}55 0%, transparent 45%, ${p.b}55 100%)`,
          mixBlendMode: l.grade === "duo" || l.grade === "tint" ? "color" : "soft-light",
          opacity: l.grade === "duo" || l.grade === "tint" ? 0.85 : 0.9,
          ...(l.kind === "cutout" && src
            ? { WebkitMaskImage: `url(${src})`, WebkitMaskSize: "100% 100%", maskImage: `url(${src})`, maskSize: "100% 100%" }
            : {}),
        }}
      />
    ) : null;

  const box: React.CSSProperties = {
    position: "relative",
    width: l.w ?? 800,
    height: l.h,
    isolation: "isolate",
    borderRadius: l.radius,
    overflow: l.kind === "cutout" ? "visible" : "hidden",
  };

  if (l.kind === "img" || l.kind === "cutout") {
    return (
      <div
        style={{
          ...box,
          ...(l.border ? { padding: 14, background: "#f4efe6", boxShadow: "0 30px 60px rgba(0,0,0,0.55)" } : {}),
          ...(l.shadow && l.kind === "img" && !l.border ? { boxShadow: "0 40px 80px rgba(0,0,0,0.6)" } : {}),
        }}
      >
        <div style={{ position: "relative", width: "100%", height: l.h ? "100%" : undefined, isolation: "isolate", overflow: l.kind === "cutout" ? "visible" : "hidden", borderRadius: l.radius }}>
          <Img
            src={src!}
            style={{
              display: "block",
              width: "100%",
              height: l.h ? "100%" : "auto",
              objectFit: l.kind === "cutout" ? "contain" : "cover",
              objectPosition: l.objPos ?? "50% 35%",
              filter: filt.join(" ") || undefined,
            }}
          />
          {tintOverlay}
        </div>
      </div>
    );
  }
  if (l.kind === "video") {
    return (
      <div style={{ ...box, height: l.h ?? (l.w ?? 800) * 0.5625 }}>
        <Video
          src={src!}
          muted
          loop
          trimBefore={l.startFrom ?? 0}
          playbackRate={l.playbackRate ?? 1}
          objectFit="cover" style={{ width: "100%", height: "100%", filter: filt.join(" ") || undefined }}
        />
        {tintOverlay}
      </div>
    );
  }
  if (l.kind === "atmos") {
    return (
      <div style={{ position: "relative", width: l.w ?? W, height: l.h ?? H }}>
        <Atmosphere c1={l.color ?? p.bg2} c2={l.c2 ?? p.a} base={p.c} seed={l.seed ?? "atm"} />
      </div>
    );
  }
  if (l.kind === "solid") {
    return <div style={{ width: l.w ?? W, height: l.h ?? H, background: l.color ?? p.bg1 }} />;
  }
  if (l.kind === "counter") return <Counter value={l.value ?? 0} at={l.at ?? 0} len={l.len ?? 40} prefix={l.prefix} suffix={l.suffix} decimals={l.decimals} size={l.w ?? 220} label={l.label} color={l.color} palette={palette} start={(l as any).start} sep={(l as any).sep} />;
  if (l.kind === "text" && l.text) return <TextBlock spec={l.text} palette={palette} />;
  if (l.kind === "ticker") return <Ticker w={l.w ?? 2400} h={l.h ?? 1400} color={l.color ?? p.accent2} seed={l.seed} />;
  if (l.kind === "grid") return <GridFloor w={l.w ?? 3000} h={l.h ?? 2000} color={l.color ?? p.a} />;
  if (l.kind === "icon") return <Icon name={l.icon!} size={l.w ?? 160} color={l.color ?? "#fff"} glow={l.glow} label={l.label} sub={l.sub} labelColor={p.accent} />;
  if (l.kind === "glow") {
    return <div style={{ width: l.w ?? 900, height: l.h ?? l.w ?? 900, borderRadius: "50%", background: `radial-gradient(circle, ${l.color ?? p.a}cc 0%, ${l.color ?? p.a}33 40%, transparent 70%)`, mixBlendMode: "screen" }} />;
  }
  if (l.kind === "label") {
    return (
      <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-start" }}>
        <div
          style={{
            background: l.color ?? p.a,
            color: "#fff",
            fontFamily: "Montserrat",
            fontWeight: 900,
            fontSize: (l.w ?? 40),
            padding: "6px 18px 4px",
            letterSpacing: 1,
            textTransform: "uppercase",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            whiteSpace: "nowrap",
          }}
        >
          {l.label}
        </div>
        {l.sub ? (
          <div style={{ background: "rgba(8,8,12,0.85)", color: p.accent, fontFamily: "Montserrat", fontWeight: 700, fontSize: (l.w ?? 40) * 0.55, padding: "4px 14px", letterSpacing: 2, textTransform: "uppercase", whiteSpace: "nowrap" }}>
            {l.sub}
          </div>
        ) : null}
      </div>
    );
  }
  if (l.kind === "line") {
    // animated dashed connector from (0,0) to (x2,y2) relative
    const len = Math.hypot(l.x2 ?? 400, l.y2 ?? 0);
    const t = prog(f, l.at ?? 0, l.animLen ?? 20, EASE.inOut);
    const ang = (Math.atan2(l.y2 ?? 0, l.x2 ?? 400) * 180) / Math.PI;
    return (
      <div
        style={{
          width: len * t,
          height: 6,
          transformOrigin: "0 50%",
          transform: `rotate(${ang}deg)`,
          background: l.dash === false ? l.color ?? "#fff" : `repeating-linear-gradient(90deg, ${l.color ?? "#fff"} 0 18px, transparent 18px 30px)`,
          boxShadow: `0 0 14px ${l.color ?? "#fff"}88`,
        }}
      />
    );
  }
  return null;
};

const appear = (l: LayerSpec, f: number) => {
  const at = l.at ?? 0;
  const len = l.animLen ?? 14;
  const a = l.anim ?? (l.at ? "fade" : "none");
  const t = a === "none" ? 1 : prog(f, at, len, a === "pop" || a === "drop" ? EASE.back : EASE.out);
  let o = a === "none" ? 1 : interpolate(f, [at, at + Math.min(len, 8)], [0, 1], clamp);
  let dx = 0, dy = 0, s = 1, rz = 0, ry = 0, clip: string | undefined;
  if (a === "pop") s = 0.2 + 0.8 * t;
  if (a === "zoom") s = 1.6 - 0.6 * t;
  if (a === "slideL") dx = -900 * (1 - t);
  if (a === "slideR") dx = 900 * (1 - t);
  if (a === "slideU") dy = 500 * (1 - t);
  if (a === "slideD") dy = -500 * (1 - t);
  if (a === "drop") { dy = -700 * (1 - t); rz = (1 - t) * 12; }
  if (a === "flip") { ry = 90 * (1 - t); }
  if (a === "wipe") { clip = `inset(0 ${100 - t * 100}% 0 0)`; o = 1; }
  if (l.out !== undefined) o *= interpolate(f, [l.out, l.out + 8], [1, 0], clamp);
  return { o, dx, dy, s, rz, ry, clip, visible: f >= at - 1 && (l.out === undefined || f < l.out + 9) };
};

export const Stage: React.FC<StageProps> = ({ layers, cam, camKeys, perspective = P_DEFAULT, palette, bg, particles, leak, shake = 1, dur }) => {
  const f = useCurrentFrame();
  const p = pal(palette);
  const ease = cam?.ease === "linear" ? (x: number) => x : cam?.ease === "inOut" ? EASE.inOut : cam?.ease === "soft" ? EASE.soft : EASE.soft;
  let c: Required<Cam>;
  if (camKeys && camKeys.length) {
    const ks = camKeys;
    let i = 0;
    while (i < ks.length - 1 && f >= ks[i + 1].f) i++;
    if (i >= ks.length - 1) c = camAt(ks[ks.length - 1].c, ks[ks.length - 1].c, 1);
    else {
      const t = interpolate(f, [ks[i].f, ks[i + 1].f], [0, 1], { ...clamp, easing: EASE.inOut });
      c = camAt(ks[i].c, ks[i + 1].c, t);
    }
  } else {
    const t = interpolate(f, [0, dur], [0, 1], { ...clamp, easing: ease });
    c = camAt(cam?.from ?? { z: 0 }, cam?.to ?? { z: 60 }, t);
  }
  const hh = handheld("cam", f, shake);
  const P = perspective;

  return (
    <AbsoluteFill style={{ background: bg ?? p.c, overflow: "hidden" }}>
      <AbsoluteFill style={{ perspective: `${P}px`, perspectiveOrigin: "50% 50%" }}>
        <div
          style={{
            position: "absolute",
            left: W / 2,
            top: H / 2,
            width: 0,
            height: 0,
            transformStyle: "preserve-3d",
            transform: `translateZ(${c.z}px) rotateZ(${c.rz + hh.r}deg) rotateX(${c.rx}deg) rotateY(${c.ry}deg) translate3d(${-c.x + hh.x}px, ${-c.y + hh.y}px, 0px)`,
          }}
        >
          {layers.map((l, i) => {
            const ap = appear(l, f);
            if (!ap.visible) return null;
            const z = (l.z ?? 0) + (l.drift?.z ?? 0) * (f / dur);
            const k = (P - z) / P; // keeps apparent size constant across depth
            const dx = (l.drift?.x ?? 0) * (f / dur);
            const dy = (l.drift?.y ?? 0) * (f / dur);
            const dr = (l.drift?.r ?? 0) * (f / dur);
            const ds = 1 + (l.drift?.s ?? 0) * (f / dur);
            const isFill = l.fill;
            const w = isFill ? W * 1.32 : l.w;
            const h = isFill ? H * 1.32 : l.h;
            const ll = { ...l, w, h };
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  transformStyle: "preserve-3d",
                  transform: `translate3d(${(l.x ?? 0) + dx + ap.dx}px, ${(l.y ?? 0) + dy + ap.dy}px, ${z}px) translate(-50%, -50%) scale(${k * ap.s * ds}) rotateZ(${(l.rot ?? 0) + dr + ap.rz}deg) rotateY(${(l.ry ?? 0) + ap.ry}deg) rotateX(${l.rx ?? 0}deg)`,
                  opacity: (l.opacity ?? 1) * ap.o,
                  clipPath: ap.clip,
                  mixBlendMode: (l.blend as any) ?? undefined,
                  ...(l.kind === "label" || l.kind === "line" ? { transform: `translate3d(${(l.x ?? 0) + dx + ap.dx}px, ${(l.y ?? 0) + dy + ap.dy}px, ${z}px) scale(${k * ap.s})` } : {}),
                }}
              >
                <LayerBody l={ll} dur={dur} palette={palette} />
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      {leak ? <LightLeak colors={[p.a, p.b]} intensity={0.32} seed={"lk" + (palette ?? "")} /> : null}
      {particles ? <Particles color={typeof particles === "string" ? particles : p.accent} seed={"pt" + (palette ?? "")} /> : null}
    </AbsoluteFill>
  );
};
