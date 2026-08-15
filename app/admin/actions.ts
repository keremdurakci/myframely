"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabaseServer";

// Re-checks the admin secret independently of the page load — the key in
// the URL only gates viewing the dashboard, this gates the actual write.
function assertAuthorized(key: FormDataEntryValue | null): void {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret || key !== adminSecret) {
    throw new Error("Unauthorized");
  }
}

export async function toggleLiveCheck(formData: FormData): Promise<void> {
  assertAuthorized(formData.get("key"));

  const stateCode = formData.get("stateCode");
  const nextValue = formData.get("nextValue") === "true";
  if (typeof stateCode !== "string" || !stateCode) throw new Error("Missing stateCode");

  await supabaseServer
    .from("state_configs")
    .update({ live_check_enabled: nextValue, updated_at: new Date().toISOString() })
    .eq("state_code", stateCode);

  revalidatePath("/admin");
}
