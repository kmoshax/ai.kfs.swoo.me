import type { Program } from "@/types";

export function detectProgram(section: string | null): Program {
  return section?.includes("حيوي") ? "bio" : "general";
}
