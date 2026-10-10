import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getOrderByNumber, signDesignFiles } from "@/lib/orders";
import { formatDate, formatINR } from "@/lib/format";
import { StatusBadge, StatusTimeline } from "@/components/status-badge";
import { OrderItems } from "@/components/order-items";

export async function generateMetadata({ params }: PageProps<"/orders/[number]">): Promise<Metadata> {
  return { title: `Order ${(await params).number}` };
}

export default async function OrderPage({ params, searchParams }: PageProps<"/orders/[number]">) {
  const { number } = await params;
  const { placed } = await searchParams;
  const user = await requireUser(`/orders/${number}`);
  const order = await getOrderByNumber(number);
  if (!order || order.user_id !== user.id) notFound();

  const fileUrls = await signDesignFiles(order.order_items.map((i) => i.design_file_url ?? ""));

  return (
    <div className="mx-auto max-w-3xl px-4 pt-10">
      <Link href="/orders" className="inline-flex items-center gap-1 font-semibold text-ink-soft hover:text-ink">
        <ArrowLeft className="size-4" /> My orders
      </Link>

      {placed && (
        <div className="card mt-6 animate-pop-in bg-mint-soft p-7 text-center">
          <p className="text-6xl">🎉</p>
          <h1 className="mt-3 text-4xl font-bold">Order placed!</h1>
          <p className="mt-2 text-lg text-ink-soft">
            We&apos;ll check your files and get in touch on {order.customer_phone} with payment details.
          </p>
        </div>
      )}

      <div className="card mt-6 space-y-7 p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-3xl font-bold">{order.order_number}</h2>
            <p className="text-ink-soft">{formatDate(order.created_at)}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>
        <StatusTimeline status={order.status} />
        <OrderItems items={order.order_items} fileUrls={fileUrls} />
        <div className="flex justify-between border-t-2 border-ink pt-4 font-display text-2xl font-bold">
          <span>Total</span>
          <span>{formatINR(Number(order.total_price))} <span className="text-base text-ink-soft">+ GST</span></span>
        </div>
        <div className="grid gap-4 rounded-2xl bg-cream p-5 sm:grid-cols-2">
          <div>
            <p className="label">Deliver to</p>
            <p className="whitespace-pre-line">{order.customer_name}{"\n"}{order.delivery_address}</p>
          </div>
          <div>
            <p className="label">Contact</p>
            <p>{order.customer_phone}<br />{order.customer_email}</p>
            {order.notes && (<><p className="label mt-3">Notes</p><p className="whitespace-pre-line">{order.notes}</p></>)}
          </div>
        </div>
      </div>
    </div>
  );
}
