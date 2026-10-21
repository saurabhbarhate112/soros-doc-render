import React from "react";
import { MONT } from "../lib/fonts";

/** Simple flat white icons (24x24 viewBox) used in MagnatesMedia-style process diagrams */
const PATHS: Record<string, string> = {
  bank: "M12 2 2 7v2h20V7L12 2zm-8 9v7h2v-7H4zm5 0v7h2v-7H9zm4 0v7h2v-7h-2zm5 0v7h2v-7h-2zM2 20v2h20v-2H2z",
  money: "M2 6h20v12H2V6zm10 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM4 8v2a2 2 0 0 0 2-2H4zm14 0a2 2 0 0 0 2 2V8h-2zM4 14v2h2a2 2 0 0 0-2-2zm16 0a2 2 0 0 0-2 2h2v-2z",
  bag: "M9 2h6l-1.5 3h-3L9 2zm1 4h4c4 2 7 6 7 10a6 6 0 0 1-6 6H9a6 6 0 0 1-6-6c0-4 3-8 7-10zm2.8 5.2V10h-1.6v1.2c-1.2.3-2 1.1-2 2.2 0 1.5 1.3 2 2.6 2.3 1 .2 1.4.5 1.4.9 0 .5-.6.8-1.3.8-.8 0-1.4-.4-1.5-1H9.8c.1 1.2 1 2 2.4 2.3V20h1.6v-1.3c1.2-.3 2-1.1 2-2.3 0-1.6-1.4-2-2.7-2.3-1-.2-1.3-.5-1.3-.9s.5-.7 1.1-.7c.7 0 1.1.3 1.2.8h1.6c-.1-1-.9-1.8-2.1-2.1z",
  chartdown: "M3 3h2v16h16v2H3V3zm4 4 4 4 3-3 5 5v-3h2v7h-7v-2h3.6L14 11l-3 3-5.4-5.4L7 7z",
  chartup: "M3 3h2v16h16v2H3V3zm16 2h2v7h-2V8.4l-5 5-3-3-4 4L5.6 13 11 7.6l3 3L17.6 7H14V5h5z",
  person: "M12 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 12c5.5 0 9 2.5 9 6v2H3v-2c0-3.5 3.5-6 9-6z",
  crowd: "M8 4a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zm9 1a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM8 12.5c4 0 7 1.8 7 4.5V20H1v-3c0-2.7 3-4.5 7-4.5zm9 .5c3.4 0 6 1.6 6 4v3h-6v-3c0-1.6-.8-2.9-2-3.8.6-.1 1.3-.2 2-.2z",
  building: "M4 2h11v20H4V2zm2 3v2h2V5H6zm4 0v2h2V5h-2zM6 9v2h2V9H6zm4 0v2h2V9h-2zm-4 4v2h2v-2H6zm4 0v2h2v-2h-2zm6-5h4v14h-4V8zm1 3v2h2v-2h-2zm0 4v2h2v-2h-2zM8 18v4h3v-4H8z",
  document: "M6 2h8l5 5v15H6V2zm7 1.5V8h4.5L13 3.5zM8 11v1.5h9V11H8zm0 3v1.5h9V14H8zm0 3v1.5h6V17H8z",
  ballot: "M4 12h16v10H4V12zm3-10h10v8h-1.8V4H8.8v6H7V2zm2.5 4.6 1.2-1.2 1.6 1.6 3-3 1.2 1.2-4.2 4.2-2.8-2.8z",
  gavel: "M13.2 2.6 19 8.4l-2.1 2.1-1-1-2.9 2.9 6.4 6.4-1.8 1.8L11.2 14l-2.9 2.9 1 1-2.1 2.1L1.4 14.2l2.1-2.1 1 1 6.6-6.6-1-1 3.1-2.9zM2 21h10v2H2v-2z",
  globe: "M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm-1 2.1A8 8 0 0 0 4.1 11H8c.1-2.7.9-5.2 2-6.9h1zm2 0c1.2 1.7 1.9 4.2 2 6.9h3.9A8 8 0 0 0 13 4.1zM10 11h4c-.1-2.6-.9-4.8-2-6.2-1.1 1.4-1.9 3.6-2 6.2zm-5.9 2A8 8 0 0 0 11 19.9c-1.2-1.7-1.9-4.2-2-6.9H4.1zm5.9 0c.1 2.6.9 4.8 2 6.2 1.1-1.4 1.9-3.6 2-6.2h-4zm6 0c-.1 2.7-.8 5.2-2 6.9a8 8 0 0 0 6.9-6.9H16z",
  megaphone: "M3 9h4l10-5v16L7 15H6l1 5H4.5L3.5 15H3V9zm16 0a3 3 0 0 1 0 6V9z",
  scales: "M11 3h2v2h6l3 7a4 4 0 0 1-8 0l2.7-6H13v13h4v2H7v-2h4V6H6.3L9 12a4 4 0 0 1-8 0l3-7h7V3zM5 7.4 3 12h4L5 7.4zm14 0L17 12h4l-2-4.6z",
  shield: "M12 2 20 5v6c0 5-3.4 9.4-8 11-4.6-1.6-8-6-8-11V5l8-3zm-1.2 13.4 6-6-1.4-1.4-4.6 4.6-2.2-2.2-1.4 1.4 3.6 3.6z",
  phone: "M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 3v13h10V5H7zm5 14.2a1 1 0 1 0 0 2 1 1 0 0 0 0-2z",
  rose: "M12 2c2.5 1 4 3 4 5.5S14.2 12 12 12s-4-2-4-4.5S9.5 3 12 2zm0 10v10h-1.5v-6.2C9 17 6.5 17 5 15c2-.8 4.3-.5 5.5.8V12H12zm1.5 3.8c1.2-1.3 3.5-1.6 5.5-.8-1.5 2-4 2-5.5.8z",
  flag: "M5 2h2v20H5V2zm3 1h12l-3 4.5L20 12H8V3z",
  newspaper: "M3 4h15v15a1 1 0 0 0 2 0V8h2v11a3 3 0 0 1-3 3H5a2 2 0 0 1-2-2V4zm3 3v4h5V7H6zm7 0v1.5h3V7h-3zm0 3v1.5h3V10h-3zm-7 3v1.5h10V13H6zm0 3v1.5h10V16H6z",
  university: "M12 2 1 8l11 6 9-4.9V16h2V8L12 2zM5 12.2V17c0 2 3.1 4 7 4s7-2 7-4v-4.8L12 16l-7-3.8z",
  printer: "M6 2h12v6H6V2zM3 9h18a2 2 0 0 1 2 2v7h-4v4H5v-4H1v-7a2 2 0 0 1 2-2zm4 7v4h10v-4H7zm11-5a1 1 0 1 0 0 2 1 1 0 0 0 0-2z",
  lock: "M12 2a5 5 0 0 1 5 5v3h2v12H5V10h2V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v3h6V7a3 3 0 0 0-3-3zm0 9a2 2 0 0 0-1 3.7V19h2v-2.3A2 2 0 0 0 12 13z",
  eye: "M12 5c5 0 9 4 10.5 7C21 15 17 19 12 19S3 15 1.5 12C3 9 7 5 12 5zm0 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z",
  target: "M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm0 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 2.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z",
  plane: "M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z",
  fire: "M12 2s1 3.5-1.5 6.5C8.5 11 7 12.5 7 15a5 5 0 0 0 10 0c0-2-1-3.8-2-5 0 1.8-.8 3-2 3.5.5-2.5-.2-6-1-11.5zM12 22a7 7 0 0 1-7-7c0-3 1.8-5.2 3.5-7C10 6.5 11 4.5 11 2c3 2 8 6.5 8 13a7 7 0 0 1-7 7z",
  arrowdown: "M11 3h2v13.2l4.6-4.6 1.4 1.4-7 7-7-7 1.4-1.4 4.6 4.6V3z",
  arrowup: "M13 21h-2V7.8l-4.6 4.6L5 11l7-7 7 7-1.4 1.4L13 7.8V21z",
  handcuffs: "M7 6a5 5 0 1 1 0 10A5 5 0 0 1 7 6zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm10 0a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM10.5 10h3v2h-3z",
  tv: "M3 5h18a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-7v2h3v2H7v-2h3v-2H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1 2v9h16V7H4z",
  pound: "M14.5 3c2.2 0 3.8.9 4.6 2.4l-1.7 1C16.8 5.5 15.9 5 14.5 5 12.6 5 11 6.4 11 8.7V11h5v2h-5v1c0 2-.6 3.6-1.8 5H19v2H5v-2h1.2C8 17.9 9 16.2 9 14v-1H6v-2h3V8.7C9 5.3 11.4 3 14.5 3z",
  dollar: "M11 2h2v2.1c2.2.3 3.8 1.6 4 3.6h-2.1c-.2-1-1.2-1.7-2.9-1.7-1.8 0-2.8.8-2.8 1.8 0 1.1 1 1.6 3.1 2.1 2.8.6 4.9 1.5 4.9 4.1 0 2.1-1.7 3.5-4.2 3.8V20h-2v-2.2c-2.4-.3-4.1-1.7-4.3-3.9h2.1c.2 1.2 1.3 2 3.2 2 2 0 3.1-.8 3.1-1.9 0-1.2-1-1.7-3.4-2.2-2.5-.6-4.6-1.4-4.6-3.9 0-1.9 1.6-3.4 3.9-3.8V2z",
};

export const Icon: React.FC<{ name: string; size: number; color: string; glow?: string; label?: string; sub?: string; labelColor?: string }> = ({
  name, size, color, glow, label, sub, labelColor,
}) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: size * 0.08 }}>
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ filter: `drop-shadow(0 0 ${size * 0.08}px ${glow ?? color}) drop-shadow(0 8px 18px rgba(0,0,0,0.6))` }}>
      <path d={PATHS[name] ?? PATHS.person} fill={color} fillRule="evenodd" />
    </svg>
    {label ? (
      <div style={{ fontFamily: MONT, fontWeight: 900, fontSize: size * 0.26, color: labelColor ?? "#fff", textTransform: "uppercase", letterSpacing: 2, whiteSpace: "nowrap", textShadow: "0 4px 14px rgba(0,0,0,0.8)" }}>
        {label}
      </div>
    ) : null}
    {sub ? (
      <div style={{ fontFamily: MONT, fontWeight: 700, fontSize: size * 0.16, color: "#fff", opacity: 0.85, textTransform: "uppercase", letterSpacing: 2, whiteSpace: "nowrap" }}>{sub}</div>
    ) : null}
  </div>
);

export const ICON_NAMES = Object.keys(PATHS);
