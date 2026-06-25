"use client";

import { Button, Input, Spinner } from "@/shared/ui";

type NationalIdFormProps = {
  nationalId: string;
  loading: boolean;
  onNationalIdChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export function NationalIdForm({
  nationalId,
  loading,
  onNationalIdChange,
  onSubmit,
}: NationalIdFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="animate-rise w-full max-w-lg space-y-3"
      style={{ animationDelay: "220ms" }}
    >
      <Input
        inputMode="numeric"
        autoComplete="off"
        aria-label="National ID"
        placeholder="National ID"
        value={nationalId}
        onChange={(e) =>
          onNationalIdChange(e.target.value.replace(/\D/g, "").slice(0, 14))
        }
        className="h-16 rounded-2xl font-mono text-xl tracking-[0.12em] placeholder:font-sans placeholder:tracking-normal placeholder:text-muted-foreground/50"
      />
      <Button
        type="submit"
        className="h-16 w-full rounded-2xl text-lg font-semibold transition-transform active:scale-[0.99]"
        disabled={loading}
      >
        {loading ? <Spinner className="size-5" /> : "Show my grades"}
      </Button>
    </form>
  );
}
