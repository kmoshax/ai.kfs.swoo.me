import type { Identity, Transcript } from "@/types";
import { enFaculty, enLevel, enProgram } from "../../presentation";

type IdentityHeaderProps = {
  identity: Identity;
  transcript: Transcript;
};

export function IdentityHeader({ identity, transcript }: IdentityHeaderProps) {
  const level = enLevel(transcript.level);
  const program = enProgram(transcript.section);
  return (
    <header className="animate-rise" style={{ animationDelay: "60ms" }}>
      <h1 className="font-heading text-3xl font-semibold leading-tight tracking-tight text-balance break-words sm:text-4xl lg:text-5xl">
        {identity.name}
      </h1>
      <p className="mt-3 text-sm text-muted-foreground sm:text-base">
        {enFaculty(transcript.faculty)}
        {program && ` · ${program}`}
        {level && ` · ${level}`}
        <span className="font-mono"> · ID {identity.code}</span>
      </p>
    </header>
  );
}
