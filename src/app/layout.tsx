import { DirectionProvider, Toaster } from "@/components/ui";
import { fontVariables } from "@/config/fonts";
import { siteMetadata } from "@/config/metadata";
import "@/styles/globals.css";

export const metadata = siteMetadata;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" dir="ltr" className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <DirectionProvider direction="ltr">{children}</DirectionProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
