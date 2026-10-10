"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/auth";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/format";

export type ActionState = { ok?: string; error?: string } | undefined;

export async function updateOrderStatus(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireStaff();
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as OrderStatus;
  if (!ORDER_STATUSES.includes(status)) return { error: "Unknown status" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin", "layout");
  revalidatePath("/orders", "layout");
  return { ok: "Status updated" };
}

/**
 * Sets the selling price for one quantity tier. A new list_prices row is added so
 * old prices stay on record. Databases that still have the old one-price-per-tier
 * unique constraint fall back to updating the row in place.
 */
export async function setTierPrice(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireStaff();
  const variantId = String(formData.get("variant_id"));
  const quantity = Number(formData.get("quantity"));
  const price = Number(formData.get("price"));
  if (!Number.isInteger(quantity) || quantity <= 0) return { error: "Quantity must be a whole number" };
  if (!Number.isFinite(price) || price <= 0) return { error: "Price must be more than 0" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("list_prices")
    .insert({ variant_id: variantId, quantity, price, source: "admin" });

  let note = "Saved";
  if (error?.code === "23505") {
    const { error: updErr } = await supabase
      .from("list_prices")
      .update({ price, source: "admin", effective_from: new Date().toISOString() })
      .eq("variant_id", variantId)
      .eq("quantity", quantity);
    if (updErr) return { error: updErr.message };
    note = "Saved (apply the price-history migration to keep old prices)";
  } else if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { ok: note };
}

export async function toggleVariant(formData: FormData) {
  await requireStaff();
  const supabase = await createClient();
  await supabase
    .from("product_variants")
    .update({ active: formData.get("active") === "true" })
    .eq("id", String(formData.get("variant_id")));
  revalidatePath("/", "layout");
}
