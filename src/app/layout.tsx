import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { DirectionProvider } from "@/components/ui/direction";
import { Toaster } from "@/components/ui/sonner";
import "@/styles/globals.css";

const cairo = Cairo({
  variable: "--font-sans",
  subsets: ["arabic", "latin"],
});

export const metadata: Metadata = {
  title: "نتائج كلية الذكاء الاصطناعي — جامعة كفر الشيخ",
  description:
    "اعرف درجاتك ومعدلك التراكمي (GPA) بالرقم القومي فقط — كلية الذكاء الاصطناعي، جامعة كفر الشيخ.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <DirectionProvider direction="rtl">{children}</DirectionProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
