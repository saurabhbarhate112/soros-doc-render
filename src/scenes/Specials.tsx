import React from "react";
import { AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { geoMercator, geoPath, geoInterpolate } from "d3-geo";
import { feature } from "topojson-client";
import world from "world-atlas/countries-110m.json";
import { EASE, H, W, clamp, fmtNum, noise1, pop, prog } from "../lib/anim";
import { pal } from "../lib/palettes";
import { ANTON, MONO, MONT, PLAYFAIR, PLAYFAIR_I } from "../lib/fonts";
import { Atmosphere, LightLeak, Particles } from "../fx/fx";
import { GridFloor } from "../stage/Decor";

const COUNTRIES: any[] = (feature(world as any, (world as any).objects.countries) as any).features;

/* ---------------------------------- MAP ---------------------------------- */
export type MapProps = {
  palette?: string;
  from: { lon: number; lat: number; scale: number };
  to: { lon: number; lat: number; scale: number };
  highlight?: { ids: string[]; at?: number; color?: string }[];
  pins?: { lon: number; lat: number; label: string; sub?: string; at: number; color?: string }[];
  arcs?: { a: [number, number]; b: [number, number]; at: number; color?: string; len?: number }[];
  title?: string;
  titleAt?: number;
  dur: number;
};

export const MapScene: React.FC<MapProps> = ({ palette, from, to, highlight = [], pins = [], arcs = [], title, titleAt = 0, dur }) => {
  const f = useCurrentFrame();
  const p = pal(palette);
  const t = interpolate(f, [0, dur], [0, 1], { ...clamp, easing: EASE.inOut });
  const lon = from.lon + (to.lon - from.lon) * t;
  const lat = from.lat + (to.lat - from.lat) * t;
  const scale = Math.exp(Math.log(from.scale) + (Math.log(to.scale) - Math.log(from.scale)) * t);
  const proj = geoMercator().center([lon, lat]).scale(scale).translate([W / 2, H / 2]);
  const path = geoPath(proj);
  const hlMap: Record<string, { o: number; color: string }> = {};
  highlight.forEach((h) => {
    const o = interpolate(f, [h.at ?? 0, (h.at ?? 0) + 12], [0, 1], clamp);
    h.ids.forEach((id) => (hlMap[String(Number(id))] = { o, color: h.color ?? p.a }));
  });
  return (
    <AbsoluteFill style={{ background: p.c }}>
      <Atmosphere c1={p.bg2} c2={p.bg1} base={p.c} seed="map" />
      <AbsoluteFill style={{ perspective: 1400 }}>
        <AbsoluteFill style={{ transform: `rotateX(${18 - t * 6}deg) scale(1.12)`, transformOrigin: "50% 60%" }}>
          <AbsoluteFill style={{ transform: "translateY(-40px)" }}>
            <GridFloor w={W * 1.4} h={H * 1.4} color={p.a} />
          </AbsoluteFill>
          <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            <defs>
              <filter id="mglow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="8" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {COUNTRIES.map((c, i) => {
              const hl = hlMap[String(Number(c.id))];
              const d = path(c) ?? "";
              return (
                <path
                  key={i}
                  d={d}
                  fill={hl ? hl.color : "#1c2233"}
                  fillOpacity={hl ? 0.25 + 0.65 * hl.o : 0.9}
                  stroke={hl ? "#fff" : p.a}
                  strokeOpacity={hl ? 0.6 + 0.4 * hl.o : 0.35}
                  strokeWidth={hl ? 2.2 : 0.8}
                  filter={hl && hl.o > 0.1 ? "url(#mglow)" : undefined}
                />
              );
            })}
            {arcs.map((a, i) => {
              const k = prog(f, a.at, a.len ?? 30, EASE.inOut);
              if (k <= 0) return null;
              const interp = geoInterpolate(a.a, a.b);
              const pts: string[] = [];
              const N = 40;
              for (let j = 0; j <= N * k; j++) {
                const q = proj(interp(j / N)) as [number, number];
                const lift = Math.sin((Math.PI * j) / N) * 120;
                pts.push(`${q[0]},${q[1] - lift}`);
              }
              return <polyline key={i} points={pts.join(" ")} fill="none" stroke={a.color ?? p.accent} strokeWidth={5} filter="url(#mglow)" strokeLinecap="round" />;
            })}
          </svg>
          {pins.map((pn, i) => {
            const q = proj([pn.lon, pn.lat]) as [number, number];
            const s = pop(f, pn.at, 14);
            if (s <= 0) return null;
            const pulse = 1 + 0.5 * ((f - pn.at) % 30) / 30;
            return (
              <div key={i} style={{ position: "absolute", left: q[0], top: q[1], transform: `scale(${s})` }}>
                <div style={{ position: "absolute", left: -40 * pulse, top: -40 * pulse, width: 80 * pulse, height: 80 * pulse, borderRadius: "50%", border: `3px solid ${pn.color ?? p.accent}`, opacity: 1.5 - pulse }} />
                <div style={{ position: "absolute", left: -12, top: -12, width: 24, height: 24, borderRadius: "50%", background: pn.color ?? p.accent, boxShadow: `0 0 30px ${pn.color ?? p.accent}` }} />
                <div style={{ position: "absolute", left: 28, top: -70, whiteSpace: "nowrap" }}>
                  <div style={{ fontFamily: ANTON, fontSize: 64, color: "#fff", textShadow: `0 0 20px ${p.a}, 0 6px 20px #000`, letterSpacing: 2 }}>{pn.label.toUpperCase()}</div>
                  {pn.sub ? <div style={{ fontFamily: MONT, fontWeight: 800, fontSize: 28, color: p.accent, letterSpacing: 3, textTransform: "uppercase" }}>{pn.sub}</div> : null}
                </div>
              </div>
            );
          })}
        </AbsoluteFill>
      </AbsoluteFill>
      {title ? (
        <div style={{ position: "absolute", left: 90, top: 70, fontFamily: MONT, fontWeight: 900, fontSize: 38, letterSpacing: 6, color: p.accent, opacity: prog(f, titleAt, 12), textTransform: "uppercase", textShadow: "0 4px 20px #000" }}>
          {title}
        </div>
      ) : null}
      <LightLeak colors={[p.a, p.b]} intensity={0.22} seed="mapl" />
      <Particles color={p.accent} count={24} seed="mapp" />
    </AbsoluteFill>
  );
};

/* --------------------------------- CHART --------------------------------- */
export type ChartProps = {
  palette?: string;
  title: string;
  sub?: string;
  data: { x: string; y: number }[];
  at?: number;
  len?: number;
  kind?: "line" | "bar";
  color?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  notes?: { i: number; text: string; at: number }[];
  bgSrc?: string;
  dur: number;
};

export const ChartScene: React.FC<ChartProps> = ({ palette, title, sub, data, at = 8, len = 60, kind = "line", color, prefix = "", suffix = "", decimals = 2, notes = [], bgSrc, dur }) => {
  const f = useCurrentFrame();
  const p = pal(palette);
  const col = color ?? p.a;
  const cw = 1400, ch = 600;
  const ys = data.map((d) => d.y);
  const min = Math.min(...ys), max = Math.max(...ys);
  const pad = (max - min) * 0.15 || 1;
  const sx = (i: number) => (i / Math.max(1, data.length - 1)) * cw;
  const sy = (v: number) => ch - ((v - (min - pad)) / (max + pad - (min - pad))) * ch;
  const k = prog(f, at, len, EASE.inOut);
  const pts = data.map((d, i) => [sx(i), sy(d.y)] as [number, number]);
  const total = (data.length - 1) * k;
  const idx = Math.floor(total);
  const fr = total - idx;
  const vis = pts.slice(0, idx + 1);
  if (idx < pts.length - 1) vis.push([pts[idx][0] + (pts[idx + 1][0] - pts[idx][0]) * fr, pts[idx][1] + (pts[idx + 1][1] - pts[idx][1]) * fr]);
  const head = vis[vis.length - 1];
  const curV = idx < data.length - 1 ? data[idx].y + (data[idx + 1].y - data[idx].y) * fr : data[data.length - 1].y;
  const camT = interpolate(f, [0, dur], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: p.c }}>
      {bgSrc ? (
        <AbsoluteFill>
          <Img src={staticFile(bgSrc)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(1) blur(6px) brightness(0.45)", transform: `scale(${1.1 + camT * 0.06})` }} />
          <AbsoluteFill style={{ background: `linear-gradient(135deg, ${p.bg2}cc, ${p.c}ee)`, mixBlendMode: "multiply" }} />
        </AbsoluteFill>
      ) : (
        <Atmosphere c1={p.bg2} c2={p.bg1} base={p.c} seed="chart" />
      )}
      <AbsoluteFill style={{ perspective: 1600 }}>
        <div style={{ position: "absolute", left: (W - cw) / 2, top: 300, width: cw, height: ch, transformStyle: "preserve-3d", transform: `rotateX(${10 - camT * 4}deg) rotateY(${-10 + camT * 14}deg) translateZ(${camT * 80}px)` }}>
          <div style={{ position: "absolute", inset: -80, opacity: 0.6 }}><GridFloor w={cw + 160} h={ch + 160} color={p.a} /></div>
          <svg width={cw} height={ch} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            <defs>
              <linearGradient id="carea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={col} stopOpacity="0.55" />
                <stop offset="1" stopColor={col} stopOpacity="0" />
              </linearGradient>
              <filter id="cglow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="7" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {kind === "line" ? (
              <>
                <polygon points={`0,${ch} ${vis.map((q) => q.join(",")).join(" ")} ${head[0]},${ch}`} fill="url(#carea)" />
                <polyline points={vis.map((q) => q.join(",")).join(" ")} fill="none" stroke={col} strokeWidth={8} strokeLinejoin="round" strokeLinecap="round" filter="url(#cglow)" />
              </>
            ) : (
              data.map((d, i) => {
                const g = prog(f, at + (i * len) / data.length, 14, EASE.back);
                const bw = cw / data.length * 0.6;
                const hgt = (ch - sy(d.y)) * g;
                return <rect key={i} x={sx(i) - bw / 2 + (i === 0 ? bw / 2 : 0)} y={ch - hgt} width={bw} height={hgt} fill={col} opacity={0.9} filter="url(#cglow)" />;
              })
            )}
            {data.map((d, i) => (
              <text key={i} x={sx(i)} y={ch + 50} fill="#fff" opacity={0.75} fontFamily={MONT} fontWeight={700} fontSize={26} textAnchor="middle">{d.x}</text>
            ))}
          </svg>
          {kind === "line" && k > 0 ? (
            <div style={{ position: "absolute", left: head[0], top: head[1], transform: "translate(-50%,-50%)" }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#fff", boxShadow: `0 0 30px ${col}, 0 0 60px ${col}` }} />
              <div style={{ position: "absolute", left: 40, top: -80, fontFamily: ANTON, fontSize: 72, color: "#fff", whiteSpace: "nowrap", textShadow: `0 0 24px ${col}, 0 6px 20px #000` }}>
                {prefix}{fmtNum(curV, decimals)}{suffix}
              </div>
            </div>
          ) : null}
          {notes.map((n, i) => {
            const s = pop(f, n.at, 12);
            if (s <= 0) return null;
            const q = pts[Math.min(n.i, pts.length - 1)];
            return (
              <div key={i} style={{ position: "absolute", left: q[0], top: q[1] - 150, transform: `translateX(-50%) scale(${s})`, background: p.accent, color: "#111", fontFamily: MONT, fontWeight: 900, fontSize: 30, padding: "8px 18px", whiteSpace: "nowrap", boxShadow: "0 10px 30px rgba(0,0,0,0.6)" }}>
                {n.text.toUpperCase()}
                <div style={{ position: "absolute", left: "50%", top: "100%", width: 3, height: 90, background: p.accent }} />
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 110, top: 80 }}>
        <div style={{ fontFamily: ANTON, fontSize: 96, color: "#fff", letterSpacing: 2, opacity: prog(f, 0, 10), transform: `translateY(${(1 - prog(f, 0, 14)) * 30}px)`, textShadow: `0 0 30px ${col}88, 0 6px 24px #000` }}>{title.toUpperCase()}</div>
        {sub ? <div style={{ fontFamily: MONT, fontWeight: 800, fontSize: 32, color: p.accent, letterSpacing: 4, opacity: prog(f, 6, 12), textTransform: "uppercase" }}>{sub}</div> : null}
      </div>
      <LightLeak colors={[col, p.b]} intensity={0.2} seed="chl" />
      <Particles color={p.accent} count={20} seed="chp" />
    </AbsoluteFill>
  );
};

/* --------------------------- CHAPTER CARD (hero) -------------------------- */
const tornEdge = (seed: string, w: number, amp: number, top: boolean) => {
  let d = top ? `M0,${amp}` : `M0,0`;
  const n = 60;
  for (let i = 0; i <= n; i++) {
    const x = (i / n) * w;
    const y = amp * (0.3 + random(seed + i) * 0.7);
    d += ` L${x.toFixed(1)},${(top ? amp - y : y).toFixed(1)}`;
  }
  return d + (top ? ` L${w},${amp} Z` : ` L${w},0 Z`);
};

export const ChapterCard: React.FC<{ num: number; title: string; palette?: string; hero: string; dur: number }> = ({ num, title, palette, hero, dur }) => {
  const f = useCurrentFrame();
  const p = pal(palette);
  const strip = prog(f, 6, 14, EASE.inOut);
  const txt = prog(f, 12, 14);
  const outT = prog(f, dur - 16, 14, EASE.in);
  const camS = 1.04 + (f / dur) * 0.08;
  return (
    <AbsoluteFill style={{ background: p.c, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${camS})` }}>
        <Atmosphere c1={p.bg2} c2={p.a} base={p.c} seed={"cc" + num} />
        <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ANTON, fontSize: 520, color: p.a, opacity: 0.16, letterSpacing: 20, transform: `translateX(${-f * 1.2}px)` }}>SOROS</AbsoluteFill>
        <Img src={staticFile(hero)} style={{ position: "absolute", right: 120 - f * 0.4, bottom: -40, height: 1080, filter: `grayscale(1) contrast(1.25) drop-shadow(0 0 3px ${p.b}) drop-shadow(0 0 40px ${p.b}aa)` }} />
        <AbsoluteFill style={{ background: `linear-gradient(90deg, ${p.c} 0%, transparent 55%)` }} />
      </AbsoluteFill>
      {/* torn paper strip */}
      <div style={{ position: "absolute", left: 0, top: 380, width: W, height: 330, clipPath: `inset(0 ${100 - strip * 100}% 0 0)` }}>
        <svg width={W} height={40} style={{ position: "absolute", top: -39 }}><path d={tornEdge("t" + num, W, 40, true)} fill={p.accent} /></svg>
        <div style={{ position: "absolute", inset: 0, background: p.accent }} />
        <svg width={W} height={40} style={{ position: "absolute", bottom: -39 }}><path d={tornEdge("b" + num, W, 40, false)} fill={p.accent} /></svg>
        <div style={{ position: "absolute", inset: 0, opacity: 0.18, background: "repeating-linear-gradient(100deg, transparent 0 8px, rgba(0,0,0,0.25) 8px 9px)" }} />
        <div style={{ position: "absolute", left: 150, top: 40, opacity: txt, transform: `translateX(${(1 - txt) * -60}px)` }}>
          <div style={{ fontFamily: MONT, fontWeight: 900, fontSize: 40, letterSpacing: 18, color: "#141414" }}>CHAPTER {num}</div>
          <div style={{ fontFamily: PLAYFAIR, fontWeight: 900, fontSize: 118, color: "#111", lineHeight: 1.05, maxWidth: 1500 }}>{title}</div>
        </div>
      </div>
      <LightLeak colors={[p.a, p.b]} intensity={0.35} seed={"ccl" + num} />
      <Particles color={p.accent} count={30} seed={"ccp" + num} />
      <AbsoluteFill style={{ background: "#000", opacity: outT }} />
    </AbsoluteFill>
  );
};

/* ------------------------------- TITLE CARD ------------------------------- */
export const TitleCard: React.FC<{ hero: string; dur: number }> = ({ hero, dur }) => {
  const f = useCurrentFrame();
  const p = pal("hook");
  const a = prog(f, 4, 16);
  const b = prog(f, 18, 18);
  const out = prog(f, dur - 12, 12, EASE.in);
  return (
    <AbsoluteFill style={{ background: "#07030a", overflow: "hidden" }}>
      <Atmosphere c1="#5e0b1f" c2="#b8860b" base="#07030a" seed="title" />
      <Img src={staticFile(hero)} style={{ position: "absolute", left: "50%", bottom: -60, height: 1150, transform: `translateX(-50%) scale(${1.02 + f / dur * 0.06})`, filter: "grayscale(1) contrast(1.3) brightness(0.6) drop-shadow(0 0 40px #ff3b3b88)", opacity: 0.85 }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, transparent 20%, #07030a 80%)" }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <div style={{ fontFamily: ANTON, fontSize: 230, letterSpacing: 24, color: "#fff", opacity: a, transform: `scale(${1.25 - a * 0.25})`, filter: `blur(${(1 - a) * 12}px)`, textShadow: `0 0 50px ${p.a}aa, 0 10px 40px #000` }}>GEORGE SOROS</div>
        <div style={{ fontFamily: PLAYFAIR_I, fontWeight: 700, fontSize: 82, color: p.accent, opacity: b, transform: `translateY(${(1 - b) * 30}px)`, textShadow: "0 6px 30px #000" }}>The Most Evil Man in the World?</div>
      </AbsoluteFill>
      <LightLeak colors={["#ff3b3b", "#ffb347"]} intensity={0.4} seed="tl" />
      <Particles color="#ffd27a" count={40} seed="tp" />
      <AbsoluteFill style={{ background: "#000", opacity: out }} />
    </AbsoluteFill>
  );
};

/* --------------------------------- VERDICT -------------------------------- */
export const Verdict: React.FC<{ palette?: string; title: string; rows: { text: string; tag: string; at: number }[]; dur: number }> = ({ palette, title, rows, dur }) => {
  const f = useCurrentFrame();
  const p = pal(palette);
  const TAGC: Record<string, string> = { FACT: "#22c55e", ALLEGATION: "#ff9f1c", DISPUTED: "#ff4d6d", OPINION: "#58a6ff", CLAIM: "#ff9f1c" };
  return (
    <AbsoluteFill style={{ background: p.c }}>
      <Atmosphere c1={p.bg2} c2={p.bg1} base={p.c} seed="vd" />
      <AbsoluteFill style={{ perspective: 1500 }}>
        <div style={{ position: "absolute", left: 230, top: 120, width: 1460, transform: `rotateY(${-8 + f / dur * 6}deg) rotateX(4deg)`, transformStyle: "preserve-3d" }}>
          <div style={{ fontFamily: MONT, fontWeight: 900, fontSize: 40, color: p.accent, letterSpacing: 10, marginBottom: 30, opacity: prog(f, 0, 10) }}>{title.toUpperCase()}</div>
          {rows.map((r, i) => {
            const t = prog(f, r.at, 12);
            const st = pop(f, r.at + 10, 10);
            const c = TAGC[r.tag] ?? p.a;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 40, marginBottom: 34, opacity: t, transform: `translateX(${(1 - t) * -80}px)` }}>
                <div style={{ flex: 1, fontFamily: MONT, fontWeight: 800, fontSize: 44, color: "#fff", lineHeight: 1.2, background: "rgba(10,10,16,0.65)", padding: "22px 30px", borderLeft: `8px solid ${c}`, boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>{r.text}</div>
                <div style={{ width: 320, transform: `scale(${st > 0 ? 2.2 - st * 1.2 : 0}) rotate(-8deg)`, opacity: st > 0 ? 1 : 0, border: `6px solid ${c}`, color: c, fontFamily: ANTON, fontSize: 64, textAlign: "center", padding: "6px 0", letterSpacing: 4, textShadow: `0 0 20px ${c}88`, boxShadow: `0 0 30px ${c}55, inset 0 0 20px ${c}44` }}>{r.tag}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <Particles color={p.accent} count={18} seed="vdp" />
    </AbsoluteFill>
  );
};

/* -------------------------------- MONTAGE --------------------------------- */
export const Montage: React.FC<{ items: { src: string; at: number; grade?: string; label?: string }[]; palette?: string; dur: number }> = ({ items, palette, dur }) => {
  const f = useCurrentFrame();
  const p = pal(palette);
  let cur = 0;
  items.forEach((it, i) => { if (f >= it.at) cur = i; });
  const it = items[cur];
  const next = items[cur + 1]?.at ?? dur;
  const local = f - it.at;
  const len = next - it.at;
  const cols = [p.a, p.b, p.accent2, p.accent];
  const tint = cols[cur % cols.length];
  const z = 1.08 + (local / Math.max(1, len)) * 0.12;
  const flash = interpolate(local, [0, 4], [0.85, 0], clamp);
  const dir = random("md" + cur) > 0.5 ? 1 : -1;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${z}) translateX(${dir * (local / Math.max(1, len)) * 40}px) rotate(${dir * 1.2}deg)` }}>
        <Img src={staticFile(it.src)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: it.grade === "natural" ? "saturate(1.2) contrast(1.1)" : "grayscale(1) contrast(1.3)" }} />
        {it.grade !== "natural" ? <AbsoluteFill style={{ background: `linear-gradient(135deg, ${tint}, ${p.c})`, mixBlendMode: "color", opacity: 0.85 }} /> : null}
      </AbsoluteFill>
      {it.label ? (
        <div style={{ position: "absolute", left: 110, bottom: 120, fontFamily: ANTON, fontSize: 110, color: "#fff", letterSpacing: 3, textShadow: `0 0 30px ${tint}, 0 8px 30px #000`, transform: `translateX(${(1 - prog(local, 0, 8)) * -80}px)` }}>{it.label.toUpperCase()}</div>
      ) : null}
      <AbsoluteFill style={{ background: "#fff", opacity: flash, mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};

/* ---------------------------------- CARDS --------------------------------- */
/** Photo cards on a slanted wall; camera trucks across, each card pops at its time */
export const CardWall: React.FC<{ cards: { src: string; label?: string; sub?: string; at: number; grade?: string }[]; palette?: string; dur: number; bg?: string }> = ({ cards, palette, dur, bg }) => {
  const f = useCurrentFrame();
  const p = pal(palette);
  const n = cards.length;
  const spacing = 620;
  const t = interpolate(f, [0, dur], [0, 1], { ...clamp, easing: EASE.inOut });
  const camX = -((n - 1) * spacing) / 2 + t * (n - 1) * spacing * 0.85;
  return (
    <AbsoluteFill style={{ background: p.c, overflow: "hidden" }}>
      {bg ? <Img src={staticFile(bg)} style={{ position: "absolute", width: "110%", height: "110%", left: "-5%", top: "-5%", objectFit: "cover", filter: "grayscale(1) blur(10px) brightness(0.4)" }} /> : <Atmosphere c1={p.bg2} c2={p.bg1} base={p.c} seed="cw" />}
      {bg ? <AbsoluteFill style={{ background: `linear-gradient(135deg, ${p.bg2}, ${p.c})`, mixBlendMode: "color", opacity: 0.8 }} /> : null}
      <AbsoluteFill style={{ perspective: 1300 }}>
        <div style={{ position: "absolute", left: W / 2, top: H / 2, transformStyle: "preserve-3d", transform: `rotateY(-24deg) rotateX(4deg) translate3d(${-camX}px, 0, -200px)` }}>
          {cards.map((c, i) => {
            const s = pop(f, c.at, 14);
            if (s <= 0) return null;
            const rot = (random("cr" + i) - 0.5) * 8;
            return (
              <div key={i} style={{ position: "absolute", left: i * spacing - ((n - 1) * spacing) / 2 - 260, top: -340 + (random("cy" + i) - 0.5) * 80, width: 520, transform: `scale(${s}) rotate(${rot}deg) translateZ(${(random("cz" + i) - 0.5) * 120}px)` }}>
                <div style={{ background: "#f3eee4", padding: 14, paddingBottom: c.label ? 90 : 14, boxShadow: "0 40px 80px rgba(0,0,0,0.65)", position: "relative" }}>
                  <div style={{ position: "relative", width: 492, height: 560, overflow: "hidden", isolation: "isolate" }}>
                    <Img src={staticFile(c.src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 25%", filter: c.grade === "natural" ? "saturate(1.15)" : "grayscale(1) contrast(1.2)" }} />
                    {c.grade !== "natural" ? <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${p.a}, ${p.b})`, mixBlendMode: "color", opacity: 0.75 }} /> : null}
                  </div>
                  {c.label ? (
                    <div style={{ position: "absolute", left: 20, bottom: 18, fontFamily: ANTON, fontSize: 52, color: "#111", letterSpacing: 1 }}>
                      {c.label.toUpperCase()}
                      {c.sub ? <span style={{ fontFamily: MONT, fontWeight: 800, fontSize: 22, color: "#555", marginLeft: 14, letterSpacing: 2 }}>{c.sub.toUpperCase()}</span> : null}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <LightLeak colors={[p.a, p.b]} intensity={0.25} seed="cwl" />
      <Particles color={p.accent} count={22} seed="cwp" />
    </AbsoluteFill>
  );
};

/* ------------------------------ COUNTER TEXT ------------------------------ */
export const Counter: React.FC<{ value: number; at: number; len?: number; prefix?: string; suffix?: string; decimals?: number; size?: number; color?: string; label?: string; palette?: string; start?: number; sep?: boolean }> = ({
  value, at, len = 40, prefix = "", suffix = "", decimals = 0, size = 220, color, label, palette, start = 0, sep = true,
}) => {
  const f = useCurrentFrame();
  const p = pal(palette);
  const k = prog(f, at, len, EASE.out);
  const o = prog(f, at, 6);
  const col = color ?? p.accent;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: o }}>
      <div style={{ fontFamily: ANTON, fontSize: size, color: col, letterSpacing: 4, lineHeight: 1, textShadow: `0 0 ${size * 0.2}px ${col}88, 0 10px 40px #000`, transform: `scale(${1.3 - 0.3 * prog(f, at, 10)})`, whiteSpace: "nowrap" }}>
        {prefix}{sep ? fmtNum(start + (value - start) * k, decimals) : Math.round(start + (value - start) * k)}{suffix}
      </div>
      {label ? <div style={{ fontFamily: MONT, fontWeight: 900, fontSize: size * 0.2, color: "#fff", letterSpacing: 8, textTransform: "uppercase", opacity: prog(f, at + 10, 10), textShadow: "0 6px 20px #000", whiteSpace: "nowrap" }}>{label}</div> : null}
    </div>
  );
};
