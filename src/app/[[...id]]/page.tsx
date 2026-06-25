import { LookupWizard } from "@/components/lookup-wizard";

export default async function Home({
  params,
}: {
  params: Promise<{ id?: string[] }>;
}) {
  const { id } = await params;
  // A shareable link looks like /<nationalId>. Anything else falls back to the
  // plain lookup screen.
  const first = id?.[0] ?? "";
  const initialId = /^\d{14}$/.test(first) ? first : undefined;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-20">
      <LookupWizard initialId={initialId} />
    </main>
  );
}
