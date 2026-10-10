"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, Lock, PartyPopper } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { formatINR, formatQty } from "@/lib/format";
import { placeOrder } from "./actions";

export function CheckoutForm({
  defaults,
}: {
  defaults: { name: string; email: string; phone: string };
}) {
  const router = useRouter();
  const { items, ready, total, clear } = useCart();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!ready) return null;
  if (items.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-lg">Your cart is empty.</p>
        <Link href="/products" className="btn-primary mt-4">Browse products</Link>
      </div>
    );
  }

  function submit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await placeOrder({
        name: String(formData.get("name") ?? ""),
        email: defaults.email,
        phone: String(formData.get("phone") ?? ""),
        address: String(formData.get("address") ?? ""),
        notes: String(formData.get("notes") ?? ""),
        items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity, filePath: i.filePath })),
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      clear();
      router.push(`/orders/${result.orderNumber}?placed=1`);
    });
  }

  return (
    <form action={submit} className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-8">
        <section className="card space-y-5 p-7">
          <h2 className="text-2xl font-bold">Delivery details</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="name">Full name</label>
              <input className="input" id="name" name="name" defaultValue={defaults.name} autoComplete="name" required />
            </div>
            <div>
              <label className="label" htmlFor="phone">Phone</label>
              <input className="input" id="phone" name="phone" type="tel" inputMode="tel" defaultValue={defaults.phone} autoComplete="tel" required />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="address">Delivery address</label>
            <textarea className="input min-h-28" id="address" name="address" autoComplete="street-address" required />
          </div>
          <div>
            <label className="label" htmlFor="notes">Notes for the printer <span className="font-normal text-ink-soft">(optional)</span></label>
            <textarea className="input min-h-20" id="notes" name="notes" placeholder="GSTIN, preferred delivery time, special instructions…" />
          </div>
        </section>

        <section className="card space-y-4 p-7">
          <h2 className="text-2xl font-bold">Payment</h2>
          <label className="option flex items-start gap-3" data-selected="true">
            <input type="radio" name="payment" defaultChecked className="mt-1.5 size-4 accent-ink" />
            <span>
              <span className="block font-display text-lg font-semibold">Pay after file check</span>
              <span className="text-sm text-ink-soft">
                No payment now. We check your files, confirm the order and share UPI / bank details
                with your GST invoice.
              </span>
            </span>
          </label>
          <p className="flex items-center gap-2 text-sm text-ink-soft">
            <Lock className="size-4" /> Online payments are coming soon.
          </p>
        </section>
      </div>

      <aside className="card h-fit space-y-4 bg-sun-soft p-6 lg:sticky lg:top-28">
        <h2 className="text-2xl font-bold">Your order</h2>
        <ul className="space-y-3">
          {items.map((i) => (
            <li key={i.key} className="flex justify-between gap-3">
              <span>
                <span className="font-semibold">{formatQty(i.quantity)} {i.productName}s</span>
                <span className="block text-xs text-ink-soft">{i.spec}</span>
              </span>
              <span className="font-semibold">{formatINR(i.price)}</span>
            </li>
          ))}
        </ul>
        <hr className="border-t-2 border-dashed border-ink/30" />
        <div className="flex justify-between font-display text-2xl font-bold">
          <span>Total</span>
          <span>{formatINR(total)}</span>
        </div>
        <p className="text-sm text-ink-soft">+ GST as applicable. Final price is confirmed by our system when you place the order.</p>
        {error && (
          <p role="alert" className="rounded-2xl border-2 border-ink bg-bubble-soft px-4 py-3 font-semibold">{error}</p>
        )}
        <button className="btn-primary w-full py-3 text-lg" disabled={pending}>
          {pending ? <Loader2 className="size-5 animate-spin" /> : <PartyPopper className="size-5" />}
          Place order
        </button>
      </aside>
    </form>
  );
}
