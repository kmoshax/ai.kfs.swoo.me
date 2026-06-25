import {
  Geist,
  Geist_Mono,
  IBM_Plex_Sans_Arabic,
  Space_Grotesk,
} from "next/font/google";

export const body = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const heading = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const arabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

export const fontVariables = [body, heading, mono, arabic]
  .map((f) => f.variable)
  .join(" ");
