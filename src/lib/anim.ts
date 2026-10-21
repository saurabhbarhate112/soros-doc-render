import { Easing, interpolate, random } from "remotion";

export const FPS = 30;
export const W = 1920;
export const H = 1080;

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const EASE = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  soft: Easing.bezier(0.33, 0, 0.2, 1),
  back: Easing.bezier(0.34, 1.56, 0.64, 1),
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** progress 0..1 over [start, start+len] with easing */
export const prog = (frame: number, start: number, len: number, ease = EASE.out) =>
  interpolate(frame, [start, start + Math.max(1, len)], [0, 1], { ...clamp, easing: ease });

/** pop-in scale with slight overshoot */
export const pop = (frame: number, start: number, len = 12) =>
  interpolate(frame, [start, start + len], [0, 1], { ...clamp, easing: EASE.back });

/** smooth deterministic noise in [-1,1] */
export const noise1 = (seed: string, t: number) => {
  const i = Math.floor(t);
  const f = t - i;
  const a = random(seed + i) * 2 - 1;
  const b = random(seed + (i + 1)) * 2 - 1;
  const u = f * f * (3 - 2 * f);
  return a + (b - a) * u;
};

/** subtle handheld camera drift (px / deg) */
export const handheld = (seed: string, frame: number, amp = 1) => ({
  x: noise1(seed + "x", frame / 45) * 6 * amp,
  y: noise1(seed + "y", frame / 52) * 4 * amp,
  r: noise1(seed + "r", frame / 60) * 0.25 * amp,
});

export type Cam = { x?: number; y?: number; z?: number; rx?: number; ry?: number; rz?: number };

export const camAt = (from: Cam, to: Cam, t: number): Required<Cam> => {
  const k = (key: keyof Cam) => lerp(from[key] ?? 0, to[key] ?? from[key] ?? 0, t);
  return { x: k("x"), y: k("y"), z: k("z"), rx: k("rx"), ry: k("ry"), rz: k("rz") };
};

export const fmtNum = (n: number, decimals = 0) =>
  n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
