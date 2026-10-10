"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Bot, Check, Clock, LayoutTemplate, LogIn, Ruler, ShoppingBag, Upload } from "lucide-react";
import type { Product, Variant } from "@/lib/catalog";
import { formatINR, formatINRPrecise, formatQty, sidesLabel } from "@/lib/format";
import { useCart } from "./cart-provider";
import { FileUpload, type UploadedFile } from "./file-upload";

type PaperKey = string;
const paperKey = (v: Variant): PaperKey => `${v.gsm}|${v.paper}`;
const paperLabel = (v: Variant) => `${v.gsm} GSM ${v.paper}`;

export function Configurator({ product, userId }: { product: Product; userId: string | null }) {
  const { add } = useCart();

  const papers = useMemo(() => {
    const seen = new Map<PaperKey, Variant>();
    for (const v of product.variants) if (!seen.has(paperKey(v))) seen.set(paperKey(v), v);
    return [...seen.entries()];
  }, [product.variants]);

  const [paper, setPaper] = useState<PaperKey>(papers[0]?.[0]);
  const sidesForPaper = product.variants.filter((v) => paperKey(v) === paper);
  const [sides, setSides] = useState(sidesForPaper[0]?.sides);
  const variant =
    sidesForPaper.find((v) => v.sides === sides) ?? sidesForPaper[0];
  const [qty, setQty] = useState(variant.tiers[0].quantity);
  const tier = variant.tiers.find((t) => t.quantity === qty) ?? variant.tiers[0];

  const [file, setFile] = useState<UploadedFile | null>(null);
  const [added, setAdded] = useState(false);

  function choosePaper(key: PaperKey) {
    setPaper(key);
    const options = product.variants.filter((v) => paperKey(v) === key);
    const next = options.find((v) => v.sides === sides) ?? options[0];
    setSides(next.sides);
    if (!next.tiers.some((t) => t.quantity === qty)) setQty(next.tiers[0].quantity);
  }

  function chooseSides(s: Variant["sides"]) {
    setSides(s);
    const next = sidesForPaper.find((v) => v.sides === s)!;
    if (!next.tiers.some((t) => t.quantity === qty)) setQty(next.tiers[0].quantity);
  }

  function addToCart() {
    if (!file) return;
    add({
      variantId: variant.id,
      productSlug: product.slug,
      productName: product.name,
      spec: [paperLabel(variant), sidesLabel(variant.sides), `${variant.size}"`].join(" · "),
      quantity: tier.quantity,
      price: tier.price,
      filePath: file.path,
      fileName: file.name,
    });
    setFile(null);
    setAdded(true);
  }

  const step = "flex items-center gap-2 text-xl font-semibold";
  const num = "grid size-8 place-items-center rounded-full border-2 border-ink bg-sun font-display text-sm font-bold";

  return (
    <div className="space-y-8">
      {/* 1. Paper */}
      <section>
        <h2 className={step}><span className={num}>1</span> Paper</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {papers.map(([key, v]) => (
            <button key={key} type="button" className="option" data-selected={key === paper} onClick={() => choosePaper(key)}>
              <span className="block font-display text-lg font-semibold">{v.paper}</span>
              <span className="text-sm text-ink-soft">{v.gsm} GSM</span>
            </button>
          ))}
        </div>
      </section>

      {/* 2. Sides */}
      <section>
        <h2 className={step}><span className={num}>2</span> Printing</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {(["single", "double"] as const).map((s) => {
            const available = sidesForPaper.some((v) => v.sides === s);
            return (
              <button
                key={s}
                type="button"
                className="option disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                data-selected={available && variant.sides === s}
                disabled={!available}
                onClick={() => chooseSides(s)}
              >
                <span className="block font-display text-lg font-semibold">{sidesLabel(s)}</span>
                <span className="text-sm text-ink-soft">{available ? (s === "double" ? "Front & back" : "Front only") : "Not for this paper"}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <span className="chip bg-paper"><Ruler className="size-4" /> {variant.size} in</span>
          <span className="chip bg-paper"><Clock className="size-4" /> {variant.delivery}</span>
        </div>
      </section>

      {/* 3. Quantity */}
      <section>
        <h2 className={step}><span className={num}>3</span> Quantity</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {variant.tiers.map((t, i) => {
            const best = variant.tiers.length > 1 && i === variant.tiers.length - 1;
            return (
              <button key={t.quantity} type="button" className="option relative" data-selected={t.quantity === tier.quantity} onClick={() => setQty(t.quantity)}>
                {best && <span className="chip absolute -right-2 -top-3 rotate-3 bg-mint px-2 py-0 text-xs">Best value</span>}
                <span className="block font-display text-xl font-bold">{formatQty(t.quantity)}</span>
                <span className="block font-semibold">{formatINR(t.price)}</span>
                <span className="text-xs text-ink-soft">{formatINRPrecise(t.price / t.quantity)} / pc</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. Design */}
      <section>
        <h2 className={step}><span className={num}>4</span> Your design</h2>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <span className="chip bg-sun"><Upload className="size-4" /> Upload file</span>
          <span className="chip border-dashed bg-transparent text-ink-soft" title="Coming soon">
            <LayoutTemplate className="size-4" /> Templates · soon
          </span>
          <span className="chip border-dashed bg-transparent text-ink-soft" title="Coming soon">
            <Bot className="size-4" /> AI design · soon
          </span>
        </div>
        <div className="mt-4">
          {userId ? (
            <FileUpload userId={userId} value={file} onChange={(f) => { setFile(f); setAdded(false); }} />
          ) : (
            <div className="card flex flex-col items-center gap-3 bg-sky-soft p-6 text-center">
              <p className="font-semibold">Sign in to upload your design securely.</p>
              <Link href={`/login?next=/products/${product.slug}`} className="btn-dark">
                <LogIn className="size-4" /> Sign in to upload
              </Link>
            </div>
          )}
          <p className="mt-3 text-sm text-ink-soft">
            Tip: export at 300 DPI in CMYK with 3 mm bleed on every side. Keep text 5 mm inside the edge.
          </p>
        </div>
      </section>

      {/* Summary */}
      <div className="card sticky bottom-3 z-10 flex items-center justify-between gap-3 bg-paper p-3 sm:bottom-4 sm:p-5">
        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-ink-soft sm:text-sm">
            {formatQty(tier.quantity)} × {product.name} · {paperLabel(variant)}
          </p>
          <p className="font-display text-2xl font-bold sm:text-3xl">
            {formatINR(tier.price)} <span className="text-sm font-semibold text-ink-soft sm:text-base">+ GST</span>
          </p>
        </div>
        {added ? (
          <Link href="/cart" className="btn-primary shrink-0 px-4 sm:px-6">
            <Check className="size-5" /> Go to cart
          </Link>
        ) : (
          <button type="button" className="btn-primary shrink-0 px-4 sm:px-6 sm:py-3 sm:text-lg" disabled={!file} onClick={addToCart}>
            <ShoppingBag className="size-5" /> {file ? "Add to cart" : <><span className="sm:hidden">Upload first</span><span className="hidden sm:inline">Upload to continue</span></>}
          </button>
        )}
      </div>
    </div>
  );
}
