"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { setTierPrice, type ActionState } from "../actions";

export function PriceForm({ variantId, quantity, price }: { variantId: string; quantity?: number; price?: number }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(setTierPrice, undefined);
  const isNew = quantity === undefined;

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="variant_id" value={variantId} />
      {isNew ? (
        <input name="quantity" type="number" min={1} step={1} placeholder="Qty" required className="input w-28 py-2" />
      ) : (
        <>
          <input type="hidden" name="quantity" value={quantity} />
          <span className="w-20 font-display font-semibold">{quantity.toLocaleString("en-IN")}</span>
        </>
      )}
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-bold text-ink-soft">₹</span>
        <input
          name="price"
          type="number"
          min={1}
          step="0.01"
          defaultValue={price}
          placeholder="Price"
          required
          className="input w-32 py-2 pl-7"
        />
      </div>
      <button className="btn-ghost px-3 py-1.5 text-sm" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : isNew ? "Add" : "Save"}
      </button>
      {state?.ok && <span className="text-sm font-semibold text-ink-soft">✓ {state.ok}</span>}
      {state?.error && <span className="text-sm font-semibold text-danger">{state.error}</span>}
    </form>
  );
}
