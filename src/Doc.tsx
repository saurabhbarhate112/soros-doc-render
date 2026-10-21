import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import scenesData from "./data/scenes.json";
import { Stage } from "./stage/Stage";
import { CardWall, ChapterCard, ChartScene, MapScene, Montage, TitleCard, Verdict } from "./scenes/Specials";
import { EdgeBurn, Grain } from "./fx/fx";
import { EASE, clamp } from "./lib/anim";

type SceneJ = { id: string; type: string; from: number; dur: number; tr?: string; trColor?: string; trOut?: string; props: any };
const SCENES: SceneJ[] = (scenesData as any).scenes;

const Body: React.FC<{ s: SceneJ }> = ({ s }) => {
  const P = { ...s.props, dur: s.dur };
  switch (s.type) {
    case "stage": return <Stage {...P} />;
    case "map": return <MapScene {...P} />;
    case "chart": return <ChartScene {...P} />;
    case "chapter": return <ChapterCard {...P} />;
    case "title": return <TitleCard {...P} />;
    case "verdict": return <Verdict {...P} />;
    case "montage": return <Montage {...P} />;
    case "cards": return <CardWall {...P} />;
    default: return <AbsoluteFill style={{ background: "#300" }} />;
  }
};

/** Wraps a scene with its entry transition and an exit move that matches the next scene's entry */
const Transitioned: React.FC<{ s: SceneJ; nextTr?: string }> = ({ s, nextTr }) => {
  const f = useCurrentFrame();
  const tr = s.tr ?? "cut";
  let transform = "";
  let filter = "";
  let overlay: React.ReactNode = null;
  // entry
  if (tr === "whip") {
    const t = interpolate(f, [0, 8], [1, 0], { ...clamp, easing: EASE.out });
    transform += ` translateX(${t * 380}px) scale(${1 + t * 0.06})`;
    if (t > 0.02) filter += ` blur(${t * 22}px)`;
  } else if (tr === "zoom") {
    const t = interpolate(f, [0, 10], [1, 0], { ...clamp, easing: EASE.out });
    transform += ` scale(${1 + t * 0.35})`;
    if (t > 0.02) filter += ` blur(${t * 16}px) brightness(${1 + t * 0.6})`;
  } else if (tr === "blur") {
    const t = interpolate(f, [0, 12], [1, 0], { ...clamp, easing: EASE.out });
    if (t > 0.02) filter += ` blur(${t * 26}px)`;
  } else if (tr === "glitch") {
    if (f < 7) { transform += ` translate(${((f * 37) % 23) - 11}px, ${((f * 17) % 9) - 4}px)`; filter += ` hue-rotate(${f * 40}deg) saturate(2)`; }
  } else if (tr === "drop") {
    const t = interpolate(f, [0, 10], [1, 0], { ...clamp, easing: EASE.out });
    transform += ` translateY(${-t * 300}px) rotate(${t * -3}deg)`;
    if (t > 0.02) filter += ` blur(${t * 18}px)`;
  }
  if (tr === "flash" || tr === "zoom" || tr === "glitch") {
    const o = interpolate(f, [0, 8], [tr === "flash" ? 0.95 : 0.55, 0], clamp);
    overlay = <AbsoluteFill style={{ background: `radial-gradient(circle, ${s.trColor ?? "#ffffff"} 0%, ${s.trColor ?? "#ffffff"}99 50%, transparent 100%)`, opacity: o, mixBlendMode: "screen" }} />;
  }
  if (tr === "burn") {
    const t = interpolate(f, [0, 14], [0, 1], { ...clamp, easing: EASE.out });
    overlay = <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 55%, transparent ${t * 75}%, #000 ${t * 75 + 20}%)` }} />;
  }
  // exit (anticipate next transition)
  const rem = s.dur - f;
  if (nextTr === "whip" && rem < 6) {
    const t = interpolate(rem, [6, 0], [0, 1], { ...clamp, easing: EASE.in });
    transform += ` translateX(${-t * 380}px)`;
    filter += ` blur(${t * 22}px)`;
  } else if (nextTr === "zoom" && rem < 6) {
    const t = interpolate(rem, [6, 0], [0, 1], { ...clamp, easing: EASE.in });
    transform += ` scale(${1 + t * 0.25})`;
    filter += ` blur(${t * 12}px) brightness(${1 + t * 0.8})`;
  } else if (nextTr === "blur" && rem < 8) {
    const t = interpolate(rem, [8, 0], [0, 1], clamp);
    filter += ` blur(${t * 20}px)`;
  }
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: transform || undefined, filter: filter || undefined }}>
        <Body s={s} />
      </AbsoluteFill>
      {overlay}
    </AbsoluteFill>
  );
};

export const Doc: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {SCENES.map((s, i) => (
        <Sequence key={s.id} from={s.from} durationInFrames={s.dur} name={`${s.id} ${s.type}`}>
          <Transitioned s={s} nextTr={SCENES[i + 1]?.tr} />
        </Sequence>
      ))}
      <EdgeBurn strength={1} />
      <Grain opacity={0.07} />
    </AbsoluteFill>
  );
};
