import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/format";

export type OrderItem = {
  id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  design_file_url: string | null;
  product_variants: {
    gsm: number | null;
    paper_type: string | null;
    sides: "single" | "double" | null;
    size: string | null;
    delivery_days: string | null;
    products: { name: string; slug: string } | null;
  } | null;
};

export type Order = {
  id: string;
  order_number: string;
  status: OrderStatus;
  total_price: number;
  created_at: string;
  updated_at: string | null;
  user_id: string | null;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  delivery_address: string | null;
  notes: string | null;
  order_items: OrderItem[];
};

export const ORDER_SELECT = `
  id, order_number, status, total_price, created_at, updated_at, user_id,
  customer_name, customer_email, customer_phone, delivery_address, notes,
  order_items (
    id, quantity, unit_price, subtotal, design_file_url,
    product_variants ( gsm, paper_type, sides, size, delivery_days, products ( name, slug ) )
  )`;

export async function getMyOrders(userId: string): Promise<Order[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as unknown as Order[];
}

/** RLS limits this to the owner's orders (or everything for staff). */
export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("order_number", orderNumber)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as Order | null;
}

/** Short-lived download links for design files the current user may read. */
export async function signDesignFiles(paths: string[]): Promise<Record<string, string>> {
  const unique = [...new Set(paths.filter(Boolean))];
  if (!unique.length) return {};
  const supabase = await createClient();
  const { data } = await supabase.storage.from("design-files").createSignedUrls(unique, 60 * 30);
  const out: Record<string, string> = {};
  for (const row of data ?? []) if (row.path && row.signedUrl) out[row.path] = row.signedUrl;
  return out;
}

export function fileNameFromPath(path: string) {
  return path.split("/").pop()?.replace(/^\d+-/, "") ?? path;
}
