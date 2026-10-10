"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CheckoutItem = { variantId: string; quantity: number; filePath: string };
export type CheckoutResult = { ok: true; orderNumber: string } | { ok: false; error: string };

const UUID = /^[0-9a-f-]{36}$/i;

export async function placeOrder(input: {
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  items: CheckoutItem[];
}): Promise<CheckoutResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Your session expired. Please sign in again." };

  const name = input.name.trim();
  const phone = input.phone.trim();
  const address = input.address.trim();
  if (!name || !phone || !address) {
    return { ok: false, error: "Name, phone and delivery address are required." };
  }
  if (!Array.isArray(input.items) || input.items.length === 0 || input.items.length > 50) {
    return { ok: false, error: "Your cart is empty." };
  }
  for (const item of input.items) {
    if (
      !UUID.test(item.variantId) ||
      !Number.isInteger(item.quantity) ||
      item.quantity <= 0 ||
      typeof item.filePath !== "string" ||
      !item.filePath.startsWith(`${user.id}/`)
    ) {
      return { ok: false, error: "Something in your cart is invalid. Please re-add it." };
    }
  }

  // Prices are computed in the database by place_order/quote_variant,
  // never taken from the browser.
  const { data, error } = await supabase.rpc("place_order", {
    p_customer_name: name,
    p_customer_email: user.email ?? input.email.trim(),
    p_customer_phone: phone,
    p_delivery_address: address,
    p_notes: input.notes.trim() || null,
    p_items: input.items.map((i) => ({
      variant_id: i.variantId,
      quantity: i.quantity,
      design_file_url: i.filePath,
    })),
  });
  if (error) return { ok: false, error: error.message };

  const row = Array.isArray(data) ? data[0] : data;
  revalidatePath("/orders");
  return { ok: true, orderNumber: row.order_number };
}
