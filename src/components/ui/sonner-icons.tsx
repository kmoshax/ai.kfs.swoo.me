import {
  Alert02Icon,
  CheckmarkCircle02Icon,
  InformationCircleIcon,
  Loading03Icon,
  MultiplicationSignCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const icon = (glyph: typeof Alert02Icon, className = "size-4") => (
  <HugeiconsIcon icon={glyph} strokeWidth={2} className={className} />
);

export const toastIcons = {
  success: icon(CheckmarkCircle02Icon),
  info: icon(InformationCircleIcon),
  warning: icon(Alert02Icon),
  error: icon(MultiplicationSignCircleIcon),
  loading: icon(Loading03Icon, "size-4 animate-spin"),
};
