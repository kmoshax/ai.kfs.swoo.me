import type { Program } from "@/types";

const TRAINING_HOURS: Record<Program, number> = {
  general: 4,
  bio: 2,
};

export function isTraining(name: string): boolean {
  return /تدريب|training/i.test(name);
}

export function trainingHours(program: Program): number {
  return TRAINING_HOURS[program];
}
