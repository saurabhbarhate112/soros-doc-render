// Render QC stills: node qc.mjs <outDir> <scale> <frame,frame,...|start:end:step>
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition, openBrowser } from "@remotion/renderer";
import fs from "fs";
import path from "path";
const [outDir, scaleStr, spec] = process.argv.slice(2);
const scale = Number(scaleStr || 0.33);
fs.mkdirSync(outDir, { recursive: true });
let frames = [];
if (spec.includes(":")) { const [a, b, s] = spec.split(":").map(Number); for (let f = a; f < b; f += s) frames.push(f); }
else frames = spec.split(",").map(Number);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const browser = await openBrowser("chrome", { chromiumOptions: { gl: process.env.GL || undefined } });
const composition = await selectComposition({ serveUrl, id: "Doc", puppeteerInstance: browser });
frames = frames.filter((f) => f < composition.durationInFrames && !fs.existsSync(path.join(outDir, `f_${String(f).padStart(6, "0")}.jpg`)));
const conc = Number(process.env.QC_CONC || 3);
let i = 0;
async function worker(wi) {
  while (i < frames.length) {
    const f = frames[i++];
    await renderStill({ serveUrl, composition, frame: f, output: path.join(outDir, `f_${String(f).padStart(6, "0")}.jpg`), imageFormat: "jpeg", jpegQuality: 80, scale, puppeteerInstance: browser, port: 3100 + wi });
  }
}
const t0 = Date.now();
await Promise.all(new Array(conc).fill(0).map((_, k) => worker(k)));
console.log(`rendered ${frames.length} stills in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
await browser.close({ silent: true });
