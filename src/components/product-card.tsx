import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { formatINR } from "@/lib/format";
import { ProductArt, themeFor } from "./product-art";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const theme = themeFor(product.slug);
  const available = product.variants.length > 0;
  const tilt = index % 2 === 0 ? "hover:-rotate-1" : "hover:rotate-1";
  const papers = new Set(product.variants.map((v) => v.paper)).size;

  const body = (
    <>
      <div className={`relative grid h-48 place-items-center border-b-2 border-ink ${theme.soft}`}>
        <ProductArt slug={product.slug} className="h-40 w-auto transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3" />
        {!available && (
          <span className="chip absolute right-3 top-3 rotate-6 bg-sun">Coming soon</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="text-2xl font-semibold">{product.name}</h3>
        <p className="flex-1 text-ink-soft">{product.description}</p>
        {available ? (
          <div className="mt-2 flex items-end justify-between gap-2">
            <div>
              <p className="text-sm font-bold text-ink-soft">
                {papers} paper{papers > 1 ? "s" : ""} · from
              </p>
              <p className="font-display text-2xl font-bold">
                {formatINR(product.fromPrice!)}
                <span className="ml-1 text-sm font-semibold text-ink-soft">
                  / {product.variants[0].tiers[0].quantity.toLocaleString("en-IN")}
                </span>
              </p>
            </div>
            <span className={`grid size-11 place-items-center rounded-full border-2 border-ink ${theme.bg} shadow-pop-sm transition-transform group-hover:translate-x-1`}>
              <ArrowRight className="size-5" strokeWidth={2.6} />
            </span>
          </div>
        ) : (
          <p className="mt-2 flex items-center gap-2 font-semibold text-ink-soft">
            <Clock className="size-4" /> Rates being finalised
          </p>
        )}
      </div>
    </>
  );

  return available ? (
    <Link
      href={`/products/${product.slug}`}
      className={`card group flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-pop-lg ${tilt}`}
    >
      {body}
    </Link>
  ) : (
    <div className="card group flex flex-col overflow-hidden opacity-80" aria-disabled>
      {body}
    </div>
  );
}
