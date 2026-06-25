"use client";

import { toPng } from "html-to-image";
import { useRef, useState } from "react";
import { toast } from "sonner";

export function useDownloadImage(name: string) {
  const captureRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  async function downloadImage() {
    const node = captureRef.current;
    if (!node) return;
    setDownloading(true);
    try {
      const bg = getComputedStyle(document.body).backgroundColor;
      const dataUrl = await toPng(node, {
        pixelRatio: 2,
        backgroundColor: bg,
        cacheBust: true,
      });
      const a = document.createElement("a");
      a.download = `${name} — GPA.png`;
      a.href = dataUrl;
      a.click();
    } catch {
      toast.error("Couldn't generate the image.");
    } finally {
      setDownloading(false);
    }
  }

  return { captureRef, downloading, downloadImage };
}
