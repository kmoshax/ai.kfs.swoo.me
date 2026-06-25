import type { Page } from "@/types";

export class SeedExpired extends Error {
  constructor(public page: Page) {
    super(`seed expired: ${page}`);
  }
}

export class LookupError extends Error {
  constructor(
    public reason: string,
    message?: string,
  ) {
    super(message ?? reason);
  }
}
