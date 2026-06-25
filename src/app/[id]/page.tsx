import { LookupWizard } from "@/components/lookup-wizard";

// Shareable link: /<nationalId>. A valid 14-digit id auto-runs the lookup;
// anything else just falls back to the plain lookup screen.
export default async function SharedResult({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const initialId = /^\d{14}$/.test(id) ? id : undefined;

  return (
    <main className="flex min-h-dvh flex-col">
      <LookupWizard initialId={initialId} />
    </main>
  );
}
