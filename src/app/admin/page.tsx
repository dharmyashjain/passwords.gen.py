import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ORDER_SELECT, type Order } from "@/lib/orders";
import { ORDER_STATUSES, formatDate, formatINR, statusLabel, type OrderStatus } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";

export default async function AdminOrders({ searchParams }: PageProps<"/admin">) {
  const { status } = await searchParams;
  const filter = ORDER_STATUSES.includes(status as OrderStatus) ? (status as OrderStatus) : null;

  const supabase = await createClient();
  let query = supabase.from("orders").select(ORDER_SELECT).order("created_at", { ascending: false }).limit(200);
  if (filter) query = query.eq("status", filter);
  const [{ data, error }, { data: all }] = await Promise.all([
    query,
    supabase.from("orders").select("status, total_price, created_at"),
  ]);
  if (error) throw error;
  const orders = (data ?? []) as unknown as Order[];

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const stats = {
    pending: all?.filter((o) => o.status === "pending").length ?? 0,
    printing: all?.filter((o) => o.status === "in_production").length ?? 0,
    month: (all ?? [])
      .filter((o) => o.status !== "cancelled" && new Date(o.created_at) >= monthStart)
      .reduce((s, o) => s + Number(o.total_price ?? 0), 0),
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-5 sm:grid-cols-3">
        <div className="card bg-sun-soft p-5"><p className="font-bold text-ink-soft">Waiting for review</p><p className="font-display text-4xl font-bold">{stats.pending}</p></div>
        <div className="card bg-grape-soft p-5"><p className="font-bold text-ink-soft">On the press</p><p className="font-display text-4xl font-bold">{stats.printing}</p></div>
        <div className="card bg-mint-soft p-5"><p className="font-bold text-ink-soft">This month (ex. GST)</p><p className="font-display text-4xl font-bold">{formatINR(stats.month)}</p></div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/admin" className={`chip ${!filter ? "bg-ink text-cream" : "bg-paper"}`}>All</Link>
        {ORDER_STATUSES.map((s) => (
          <Link key={s} href={`/admin?status=${s}`} className={`chip ${filter === s ? "bg-ink text-cream" : "bg-paper"}`}>
            {statusLabel[s]}
          </Link>
        ))}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[640px] text-left">
          <thead className="border-b-2 border-ink font-display">
            <tr>
              <th className="p-4">Order</th><th className="p-4">Customer</th><th className="p-4">Items</th>
              <th className="p-4">Total</th><th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-dashed divide-ink/15">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-sun-soft/60">
                <td className="p-4">
                  <Link href={`/admin/orders/${o.order_number}`} className="font-display text-lg font-bold underline decoration-bubble decoration-2 underline-offset-4">
                    {o.order_number}
                  </Link>
                  <p className="text-xs text-ink-soft">{formatDate(o.created_at)}</p>
                </td>
                <td className="p-4"><p className="font-semibold">{o.customer_name}</p><p className="text-xs text-ink-soft">{o.customer_phone}</p></td>
                <td className="p-4 text-sm">
                  {o.order_items.map((i) => (
                    <p key={i.id}>{i.quantity.toLocaleString("en-IN")} × {i.product_variants?.products?.name}</p>
                  ))}
                </td>
                <td className="p-4 font-bold">{formatINR(Number(o.total_price))}</td>
                <td className="p-4"><StatusBadge status={o.status} /></td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={5} className="p-10 text-center text-ink-soft">No orders here yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
