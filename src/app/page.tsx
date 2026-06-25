import { SparklesIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { LookupWizard } from "@/components/lookup-wizard";

export default function Home() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-10">
      {/* ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,theme(colors.primary/15%),transparent)]"
      />

      <header className="mb-8 flex flex-col items-center gap-3 text-center">
        <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
          <HugeiconsIcon
            icon={SparklesIcon}
            size={14}
            className="text-primary"
          />
          جامعة كفر الشيخ · كلية الذكاء الاصطناعي
        </div>
        <h1 className="text-balance text-2xl font-extrabold sm:text-3xl">
          درجاتك ومعدلك التراكمي
          <span className="text-primary"> في ثانية</span>
        </h1>
        <p className="max-w-sm text-balance text-sm text-muted-foreground">
          من غير ما تفتكر الكود ولا الباسورد — رقمك القومي وبس.
        </p>
      </header>

      <LookupWizard />
    </main>
  );
}
