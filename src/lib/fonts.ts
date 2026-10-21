import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadMono } from "@remotion/google-fonts/IBMPlexMono";

export const ANTON = loadAnton("normal", { weights: ["400"], subsets: ["latin", "latin-ext"] }).fontFamily;
export const MONT = loadMontserrat("normal", { weights: ["500", "700", "800", "900"], subsets: ["latin", "latin-ext"] }).fontFamily;
export const PLAYFAIR = loadPlayfair("normal", { weights: ["700", "900"], subsets: ["latin", "latin-ext"] }).fontFamily;
export const PLAYFAIR_I = loadPlayfair("italic", { weights: ["700"], subsets: ["latin", "latin-ext"] }).fontFamily;
export const MONO = loadMono("normal", { weights: ["500", "700"], subsets: ["latin"] }).fontFamily;
