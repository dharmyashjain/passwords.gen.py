import { Download, FileText } from "lucide-react";
import { formatINR, formatQty, sidesLabel } from "@/lib/format";
import { fileNameFromPath, type OrderItem } from "@/lib/orders";
import { ProductArt, themeFor } from "./product-art";

export function OrderItems({ items, fileUrls }: { items: OrderItem[]; fileUrls: Record<string, string> }) {
  return (
    <ul className="divide-y-2 divide-dashed divide-ink/20">
      {items.map((item) => {
        const v = item.product_variants;
        const slug = v?.products?.slug ?? "leaflet";
        const url = item.design_file_url ? fileUrls[item.design_file_url] : undefined;
        return (
          <li key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
            <div className={`grid size-16 shrink-0 place-items-center rounded-2xl border-2 border-ink ${themeFor(slug).soft}`}>
              <ProductArt slug={slug} className="h-12" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex justify-between gap-2">
                <p className="font-display text-lg font-semibold">
                  {formatQty(item.quantity)} × {v?.products?.name ?? "Item"}
                </p>
                <p className="font-bold">{formatINR(Number(item.subtotal))}</p>
              </div>
              {v && (
                <p className="text-sm text-ink-soft">
                  {v.gsm} GSM {v.paper_type} · {sidesLabel(v.sides)} · {v.size}&quot; · {v.delivery_days}
                </p>
              )}
              {item.design_file_url && (
                url ? (
                  <a href={url} target="_blank" rel="noreferrer" className="chip mt-2 max-w-full bg-mint-soft text-xs hover:bg-mint">
                    <Download className="size-3.5 shrink-0" />
                    <span className="truncate">{fileNameFromPath(item.design_file_url)}</span>
                  </a>
                ) : (
                  <span className="chip mt-2 max-w-full bg-paper text-xs">
                    <FileText className="size-3.5 shrink-0" />
                    <span className="truncate">{fileNameFromPath(item.design_file_url)}</span>
                  </span>
                )
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
