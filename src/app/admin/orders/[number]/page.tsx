import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getOrderByNumber, signDesignFiles } from "@/lib/orders";
import { formatDate, formatINR } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";
import { OrderItems } from "@/components/order-items";
import { StatusForm } from "../../status-form";

export default async function AdminOrder({ params }: PageProps<"/admin/orders/[number]">) {
  const { number } = await params;
  const order = await getOrderByNumber(number);
  if (!order) notFound();
  const fileUrls = await signDesignFiles(order.order_items.map((i) => i.design_file_url ?? ""));

  return (
    <div className="space-y-6">
      <Link href="/admin" className="inline-flex items-center gap-1 font-semibold text-ink-soft hover:text-ink">
        <ArrowLeft className="size-4" /> All orders
      </Link>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="card space-y-6 p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-3xl font-bold">{order.order_number}</h2>
              <p className="text-ink-soft">{formatDate(order.created_at)}</p>
            </div>
            <StatusBadge status={order.status} />
          </div>
          <OrderItems items={order.order_items} fileUrls={fileUrls} />
          <div className="flex justify-between border-t-2 border-ink pt-4 font-display text-2xl font-bold">
            <span>Total (ex. GST)</span>
            <span>{formatINR(Number(order.total_price))}</span>
          </div>
        </div>
        <aside className="space-y-6">
          <div className="card space-y-3 bg-sun-soft p-6">
            <h3 className="text-xl font-bold">Update status</h3>
            <StatusForm id={order.id} status={order.status} />
          </div>
          <div className="card space-y-3 p-6">
            <h3 className="text-xl font-bold">Customer</h3>
            <p className="font-semibold">{order.customer_name}</p>
            <p>
              {order.customer_phone && <a className="underline" href={`tel:${order.customer_phone}`}>{order.customer_phone}</a>}
              <br />
              {order.customer_email && <a className="underline" href={`mailto:${order.customer_email}`}>{order.customer_email}</a>}
            </p>
            <p className="label mt-3">Deliver to</p>
            <p className="whitespace-pre-line">{order.delivery_address}</p>
            {order.notes && (<><p className="label mt-3">Notes</p><p className="whitespace-pre-line">{order.notes}</p></>)}
          </div>
        </aside>
      </div>
    </div>
  );
}
