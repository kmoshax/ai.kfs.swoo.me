import type { Metadata } from "next";
import { TermsView } from "@/features/legal";

export const metadata: Metadata = {
  title: "Terms of Use · ai.kfs.swoo.me",
};

export default function TermsPage() {
  return (
    <main className="min-h-dvh">
      <TermsView />
    </main>
  );
}
