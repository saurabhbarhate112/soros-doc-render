/** Chapter colour identities: rich, vibrant, premium. a = key light, b = rim/accent, c = shadow tint, text accent */
export type Palette = { a: string; b: string; c: string; accent: string; accent2: string; bg1: string; bg2: string };

export const PALETTES: Record<string, Palette> = {
  hook: { a: "#ff3b3b", b: "#ffb347", c: "#1a0610", accent: "#ffd23f", accent2: "#ff4d6d", bg1: "#2a0614", bg2: "#5e0b1f" },
  ch1: { a: "#ffb35c", b: "#2ec4b6", c: "#120d08", accent: "#ffcf70", accent2: "#3dd6c6", bg1: "#24160a", bg2: "#4a2a10" },
  ch2: { a: "#3a7bff", b: "#ffcf3f", c: "#050b1f", accent: "#ffd84d", accent2: "#58a6ff", bg1: "#07102e", bg2: "#13306e" },
  ch3: { a: "#ff6a1f", b: "#19d3c5", c: "#1a0702", accent: "#ffb020", accent2: "#20e3d2", bg1: "#2b0a02", bg2: "#6b1c04" },
  ch4: { a: "#16c79a", b: "#e8c547", c: "#02130f", accent: "#e8d26a", accent2: "#3df5c1", bg1: "#031c17", bg2: "#06463a" },
  ch5: { a: "#b14cff", b: "#ff4fa3", c: "#0e0418", accent: "#ffd166", accent2: "#d17bff", bg1: "#1a0630", bg2: "#45106b" },
  ch6: { a: "#ff2e63", b: "#ff9a1f", c: "#1a0309", accent: "#ffb627", accent2: "#ff5c8a", bg1: "#2c0510", bg2: "#6e0d2a" },
  ch7: { a: "#2f6bff", b: "#ff3048", c: "#04081c", accent: "#ffffff", accent2: "#ff4b5c", bg1: "#060c2b", bg2: "#2a0c2e" },
  ch8: { a: "#13c4ff", b: "#ffb000", c: "#020b14", accent: "#ffc93c", accent2: "#3fd8ff", bg1: "#031524", bg2: "#08385a" },
  ch9: { a: "#ff9933", b: "#22c55e", c: "#140a02", accent: "#ffb347", accent2: "#3ee07a", bg1: "#241003", bg2: "#5a2a06" },
  ch10: { a: "#ffbf3c", b: "#e0294f", c: "#120806", accent: "#ffd76a", accent2: "#ff4d6d", bg1: "#1e0d06", bg2: "#4d1608" },
};

export const pal = (key?: string) => PALETTES[key ?? "hook"] ?? PALETTES.hook;
