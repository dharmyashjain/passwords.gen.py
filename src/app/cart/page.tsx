"use client";

import Link from "next/link";
import { ArrowRight, FileText, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { ProductArt, themeFor } from "@/components/product-art";
import { formatINR, formatQty } from "@/lib/format";

export default function CartPage() {
  const { items, ready, total, remove } = useCart();

  if (!ready) return <div className="mx-auto max-w-4xl px-4 pt-14" />;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-20 text-center">
        <p className="animate-wiggle text-7xl">🛍️</p>
        <h1 className="mt-6 text-4xl font-bold">Your cart is empty</h1>
        <p className="mt-3 text-lg text-ink-soft">Let&apos;s fix that. Pick something to print!</p>
        <Link href="/products" className="btn-primary mt-8 px-7 py-3 text-lg">
          Browse products <ArrowRight className="size-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pt-12">
      <h1 className="text-5xl font-bold">Your cart</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <ul className="space-y-4">
          {items.map((item) => {
            const theme = themeFor(item.productSlug);
            return (
              <li key={item.key} className="card flex animate-pop-in gap-4 p-4">
                <div className={`grid size-24 shrink-0 place-items-center rounded-2xl border-2 border-ink ${theme.soft}`}>
                  <ProductArt slug={item.productSlug} className="h-20" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-xl font-semibold">
                      {formatQty(item.quantity)} {item.productName}s
                    </h2>
                    <p className="font-display text-xl font-bold">{formatINR(item.price)}</p>
                  </div>
                  <p className="text-sm text-ink-soft">{item.spec}</p>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="chip max-w-full truncate bg-mint-soft text-xs">
                      <FileText className="size-3.5 shrink-0" /> <span className="truncate">{item.fileName}</span>
                    </span>
                    <button
                      onClick={() => remove(item.key)}
                      className="inline-flex cursor-pointer items-center gap-1 text-sm font-bold text-ink-soft hover:text-danger"
                    >
                      <Trash2 className="size-4" /> Remove
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <aside className="card h-fit space-y-4 bg-sun-soft p-6 lg:sticky lg:top-28">
          <h2 className="text-2xl font-bold">Summary</h2>
          <div className="flex justify-between font-semibold">
            <span>Subtotal</span>
            <span>{formatINR(total)}</span>
          </div>
          <div className="flex justify-between text-ink-soft">
            <span>GST</span>
            <span>Added on invoice</span>
          </div>
          <div className="flex justify-between text-ink-soft">
            <span>Delivery</span>
            <span>Confirmed with you</span>
          </div>
          <hr className="border-t-2 border-dashed border-ink/30" />
          <div className="flex justify-between font-display text-2xl font-bold">
            <span>Total</span>
            <span>{formatINR(total)}</span>
          </div>
          <Link href="/checkout" className="btn-primary w-full py-3 text-lg">
            Checkout <ArrowRight className="size-5" />
          </Link>
        </aside>
      </div>
    </div>
  );
}
