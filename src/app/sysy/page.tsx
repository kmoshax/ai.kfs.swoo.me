import { notFound } from "next/navigation";
import { InsightsDashboard } from "@/features/insights";
import { buildInsights } from "@/server/kfs/insights";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

const INSIGHTS_PASSWORD = process.env.INSIGHTS_PASSWORD || "kfs-insights";

export default async function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ password?: string }>;
}) {
  const { password } = await searchParams;

  // Semi-hidden: a wrong or missing password is indistinguishable from a
  // route that does not exist.
  if (password !== INSIGHTS_PASSWORD) notFound();

  const data = await buildInsights();

  return (
    <main className="min-h-dvh px-4 py-8 sm:px-6 sm:py-10">
      <InsightsDashboard data={data} />
    </main>
  );
}
