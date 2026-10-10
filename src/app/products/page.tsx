import type { Metadata } from "next";
import { getProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";

export const metadata: Metadata = { title: "Products" };

export default async function ProductsPage() {
  const products = await getProducts();
  return (
    <div className="mx-auto max-w-6xl px-4 pt-12">
      <h1 className="text-5xl font-bold">All products</h1>
      <p className="mt-3 max-w-xl text-lg text-ink-soft">
        Everything we print, with live prices. Prices are in ₹ and exclude GST.
      </p>
      <div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p, i) => (
          <ProductCard key={p.slug} product={p} index={i} />
        ))}
      </div>
    </div>
  );
}
