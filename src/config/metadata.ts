import type { Metadata } from "next";

const title =
  "Results — Faculty of Artificial Intelligence, Kafr El-Sheikh University";
const description =
  "Check your grades and cumulative GPA with your National ID alone — Faculty of Artificial Intelligence, Kafr El-Sheikh University.";
const image = {
  url: "/thumbnail.png",
  width: 1862,
  height: 1070,
  alt: title,
};

export const siteMetadata: Metadata = {
  metadataBase: new URL("https://ai.kfs.swoo.me"),
  title,
  description,
  openGraph: {
    title,
    description,
    url: "https://ai.kfs.swoo.me",
    siteName: "KFS AI — Results",
    type: "website",
    images: [image],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [image],
  },
};
