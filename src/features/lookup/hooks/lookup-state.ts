import type { Dispatch, RefObject, SetStateAction } from "react";
import type { LookupResult, Page } from "@/types";

export type Reseed = { page: Page; seedId: string; captcha: string };

export type LookupState = {
  nationalId: string;
  setNationalId: Dispatch<SetStateAction<string>>;
  result: LookupResult | null;
  setResult: Dispatch<SetStateAction<LookupResult | null>>;
  reseed: Reseed | null;
  setReseed: Dispatch<SetStateAction<Reseed | null>>;
  captcha: string;
  setCaptcha: Dispatch<SetStateAction<string>>;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  booting: boolean;
  setBooting: Dispatch<SetStateAction<boolean>>;
  captchaRef: RefObject<HTMLInputElement | null>;
};
