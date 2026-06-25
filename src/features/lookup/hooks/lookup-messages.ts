import { toast } from "sonner";
import type { LookupErrorReason } from "@/shared/types";

export function toastLookupFailure(reason: LookupErrorReason) {
  if (reason === "not_found")
    toast.error("No student found with that National ID.");
  else if (reason === "invalid_id")
    toast.error("Enter a valid 14-digit National ID.");
  else if (reason === "view_limit")
    toast.error("You've reached the maximum number of result views.");
  else toast.error("Something went wrong. Please try again shortly.");
}
