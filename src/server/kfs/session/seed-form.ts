import type { Seed } from "@/db";
import type { FormState } from "@/server/kfs/scraper";

export function seedToForm(seed: Seed): FormState {
  return {
    cookies: seed.cookies,
    viewState: seed.viewState,
    viewStateGenerator: seed.viewStateGenerator,
    eventValidation: seed.eventValidation,
    captcha: "",
  };
}

export function formToSeed(form: FormState, captchaText: string): Seed {
  return {
    cookies: form.cookies,
    viewState: form.viewState,
    viewStateGenerator: form.viewStateGenerator,
    eventValidation: form.eventValidation,
    captchaText,
    seededAt: Date.now(),
  };
}
