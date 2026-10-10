import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getMyOrders } from "@/lib/orders";
import { formatDate, formatINR } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";

export const metadata: Metadata = { title: "My orders" };

export default async function OrdersPage() {
  const user = await requireUser("/orders");
  const orders = await getMyOrders(user.id);

  return (
    <div className="mx-auto max-w-4xl px-4 pt-12">
      <h1 className="text-5xl font-bold">My orders</h1>
      {orders.length === 0 ? (
        <div className="card mt-8 bg-sky-soft p-10 text-center">
          <p className="text-5xl">📦</p>
          <p className="mt-3 text-lg font-semibold">No orders yet.</p>
          <Link href="/products" className="btn-primary mt-5">Start printing</Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {orders.map((o) => (
            <li key={o.id}>
              <Link href={`/orders/${o.order_number}`} className="card group flex flex-wrap items-center justify-between gap-4 p-5 transition-all hover:-translate-y-1 hover:shadow-pop-lg">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-display text-xl font-bold">{o.order_number}</span>
                    <StatusBadge status={o.status} />
                  </div>
                  <p className="mt-1 text-sm text-ink-soft">
                    {formatDate(o.created_at)} · {o.order_items.length} item{o.order_items.length === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-display text-2xl font-bold">{formatINR(Number(o.total_price))}</span>
                  <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
