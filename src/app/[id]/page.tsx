import { LookupWizard } from "@/features/lookup";

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
