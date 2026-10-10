import "server-only";
import { createClient } from "@/lib/supabase/server";

export type PriceTier = { quantity: number; price: number };

export type Variant = {
  id: string;
  gsm: number | null;
  paper: string | null;
  sides: "single" | "double" | null;
  size: string | null;
  delivery: string | null;
  tiers: PriceTier[];
};

export type Product = {
  slug: string;
  name: string;
  description: string | null;
  variants: Variant[];
  /** Lowest per-piece price across all variants/tiers, for "from ₹x/pc". */
  fromPerPiece: number | null;
  /** Lowest total price across all tiers. */
  fromPrice: number | null;
};

type CatalogueRow = {
  product_slug: string;
  product_name: string;
  variant_id: string;
  gsm: number | null;
  paper_type: string | null;
  sides: "single" | "double" | null;
  size: string | null;
  delivery_days: string | null;
  quantity: number;
  price: number;
};

/**
 * All active products. Products with no priced variants (e.g. visiting cards
 * and envelopes until their rates are confirmed) come back with no variants
 * and are shown as "coming soon".
 */
export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const [{ data: products, error: pErr }, { data: rows, error: cErr }] = await Promise.all([
    supabase.from("products").select("slug, name, description").eq("active", true),
    supabase.from("catalogue").select("*"),
  ]);
  if (pErr) throw pErr;
  if (cErr) throw cErr;

  const bySlug = new Map<string, Product>();
  for (const p of products ?? []) {
    bySlug.set(p.slug, { ...p, variants: [], fromPerPiece: null, fromPrice: null });
  }

  for (const r of (rows ?? []) as CatalogueRow[]) {
    const product = bySlug.get(r.product_slug);
    if (!product) continue;
    let variant = product.variants.find((v) => v.id === r.variant_id);
    if (!variant) {
      variant = {
        id: r.variant_id,
        gsm: r.gsm,
        paper: r.paper_type,
        sides: r.sides,
        size: r.size,
        delivery: r.delivery_days,
        tiers: [],
      };
      product.variants.push(variant);
    }
    const price = Number(r.price);
    variant.tiers.push({ quantity: r.quantity, price });
    const perPiece = price / r.quantity;
    if (product.fromPerPiece === null || perPiece < product.fromPerPiece) {
      product.fromPerPiece = perPiece;
    }
    if (product.fromPrice === null || price < product.fromPrice) product.fromPrice = price;
  }

  for (const p of bySlug.values()) {
    p.variants.sort(
      (a, b) =>
        (a.gsm ?? 0) - (b.gsm ?? 0) ||
        (a.paper ?? "").localeCompare(b.paper ?? "") ||
        (a.sides === "single" ? 0 : 1) - (b.sides === "single" ? 0 : 1),
    );
    for (const v of p.variants) v.tiers.sort((a, b) => a.quantity - b.quantity);
  }

  const order = ["leaflet", "pamphlet", "letterhead", "visiting_card", "envelope"];
  return [...bySlug.values()].sort(
    (a, b) =>
      (a.variants.length ? 0 : 1) - (b.variants.length ? 0 : 1) ||
      rank(order, a.slug) - rank(order, b.slug) ||
      a.name.localeCompare(b.name),
  );
}

function rank(order: string[], slug: string) {
  const i = order.indexOf(slug);
  return i === -1 ? order.length : i;
}

export async function getProduct(slug: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((p) => p.slug === slug) ?? null;
}
