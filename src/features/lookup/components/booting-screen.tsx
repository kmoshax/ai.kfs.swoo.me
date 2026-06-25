import { Spinner } from "@/components/ui";

export function BootingScreen() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <Spinner className="size-6 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Loading result…</p>
    </div>
  );
}
