import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import { DirectionProvider } from "@/components/ui/direction";
import { Toaster } from "@/components/ui/sonner";
import "@/styles/globals.css";

// Body — clean, modern, neutral with just enough warmth.
const body = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Display — geometric grotesk for headlines and the GPA verdict.
const heading = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

// Data — National ID, captcha, anything that should read as a precise value.
const mono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title:
    "Results — Faculty of Artificial Intelligence, Kafr El-Sheikh University",
  description:
    "Check your grades and cumulative GPA with your National ID alone — Faculty of Artificial Intelligence, Kafr El-Sheikh University.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${body.variable} ${heading.variable} ${mono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <DirectionProvider direction="ltr">{children}</DirectionProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
