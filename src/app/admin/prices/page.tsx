import { createClient } from "@/lib/supabase/server";
import { sidesLabel } from "@/lib/format";
import { toggleVariant } from "../actions";
import { PriceForm } from "./price-form";

type VariantRow = {
  id: string;
  gsm: number | null;
  paper_type: string | null;
  sides: "single" | "double" | null;
  size: string | null;
  delivery_days: string | null;
  active: boolean;
  products: { name: string; slug: string } | null;
};
type PriceRow = { variant_id: string; quantity: number; price: number; effective_from: string; source: string | null };

/** Newest price per (variant, quantity) that is already in effect. Input is newest-first. */
function currentPrices(prices: PriceRow[]) {
  const now = Date.now();
  const current = new Map<string, PriceRow>();
  for (const p of prices) {
    const key = `${p.variant_id}|${p.quantity}`;
    if (new Date(p.effective_from).getTime() <= now && !current.has(key)) current.set(key, p);
  }
  return current;
}

export default async function AdminPrices() {
  const supabase = await createClient();
  const [{ data: variants, error: vErr }, { data: prices, error: pErr }, { data: products }] = await Promise.all([
    supabase.from("product_variants").select("id, gsm, paper_type, sides, size, delivery_days, active, products(name, slug)"),
    supabase.from("list_prices").select("variant_id, quantity, price, effective_from, source").order("effective_from", { ascending: false }),
    supabase.from("products").select("name, slug").order("name"),
  ]);
  if (vErr) throw vErr;
  if (pErr) throw pErr;

  const current = currentPrices((prices ?? []) as PriceRow[]);

  const rows = (variants ?? []) as unknown as VariantRow[];
  const grouped = (products ?? []).map((product) => ({
    product,
    variants: rows
      .filter((v) => v.products?.slug === product.slug)
      .sort((a, b) => (a.gsm ?? 0) - (b.gsm ?? 0) || (a.paper_type ?? "").localeCompare(b.paper_type ?? "")),
  }));

  return (
    <div className="space-y-10">
      <p className="max-w-2xl text-ink-soft">
        Selling prices in ₹, excluding GST. Changing a price adds a new dated price, and orders
        already placed keep the price they were sold at.
      </p>
      {grouped.map(({ product, variants }) => (
        <section key={product.slug}>
          <h2 className="mb-4 text-3xl font-bold">{product.name}</h2>
          {variants.length === 0 && (
            <p className="card bg-sun-soft p-5 font-semibold">No variants yet. Shown as “coming soon” on the site.</p>
          )}
          <div className="grid gap-5 md:grid-cols-2">
            {variants.map((v) => {
              const tiers = [...current.values()]
                .filter((p) => p.variant_id === v.id)
                .sort((a, b) => a.quantity - b.quantity);
              return (
                <div key={v.id} className={`card space-y-4 p-5 ${v.active ? "" : "opacity-60"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold">{v.gsm} GSM {v.paper_type}</h3>
                      <p className="text-sm text-ink-soft">{sidesLabel(v.sides)} · {v.size}&quot; · {v.delivery_days}</p>
                    </div>
                    <form action={toggleVariant}>
                      <input type="hidden" name="variant_id" value={v.id} />
                      <input type="hidden" name="active" value={String(!v.active)} />
                      <button className={`chip cursor-pointer ${v.active ? "bg-mint" : "bg-paper"}`}>
                        {v.active ? "On website" : "Hidden"}
                      </button>
                    </form>
                  </div>
                  <div className="space-y-2">
                    {tiers.map((t) => (
                      <PriceForm key={t.quantity} variantId={v.id} quantity={t.quantity} price={Number(t.price)} />
                    ))}
                    {tiers.length === 0 && <p className="text-sm font-semibold text-danger">No prices, so customers can&apos;t see this.</p>}
                  </div>
                  <details>
                    <summary className="cursor-pointer text-sm font-bold text-ink-soft hover:text-ink">+ Add a quantity</summary>
                    <div className="mt-2">
                      <PriceForm variantId={v.id} />
                    </div>
                  </details>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
