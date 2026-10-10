"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { ORDER_STATUSES, statusLabel, type OrderStatus } from "@/lib/format";
import { updateOrderStatus, type ActionState } from "./actions";

export function StatusForm({ id, status }: { id: string; status: OrderStatus }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateOrderStatus, undefined);
  return (
    <form action={action} className="flex flex-wrap items-center gap-3">
      <input type="hidden" name="id" value={id} />
      <select name="status" defaultValue={status} className="input w-auto py-2.5">
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>{statusLabel[s]}</option>
        ))}
      </select>
      <button className="btn-primary" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />} Update
      </button>
      {state?.ok && <span className="font-semibold text-ink-soft">✓ {state.ok}</span>}
      {state?.error && <span className="font-semibold text-danger">{state.error}</span>}
    </form>
  );
}
