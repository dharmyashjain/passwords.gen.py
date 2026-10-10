const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const inrPaise = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatINR = (n: number) => inr.format(n);
export const formatINRPrecise = (n: number) => inrPaise.format(n);
export const formatQty = (n: number) => n.toLocaleString("en-IN");

export const sidesLabel = (s: string | null) =>
  s === "double" ? "Both sides" : s === "single" ? "Single side" : "—";

export function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "in_production",
  "completed",
  "cancelled",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const statusLabel: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  in_production: "Printing",
  completed: "Delivered",
  cancelled: "Cancelled",
};
