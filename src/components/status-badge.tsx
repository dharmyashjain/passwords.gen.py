import { statusLabel, type OrderStatus } from "@/lib/format";

const colors: Record<OrderStatus, string> = {
  pending: "bg-sun",
  confirmed: "bg-sky",
  in_production: "bg-grape",
  completed: "bg-mint",
  cancelled: "bg-bubble-soft",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`chip ${colors[status]} text-xs uppercase tracking-wide`}>{statusLabel[status]}</span>;
}

const steps: OrderStatus[] = ["pending", "confirmed", "in_production", "completed"];

export function StatusTimeline({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return <p className="chip bg-bubble-soft">This order was cancelled.</p>;
  }
  const current = steps.indexOf(status);
  return (
    <ol className="grid grid-cols-4 gap-2">
      {steps.map((s, i) => (
        <li key={s} className="flex flex-col items-center gap-2 text-center">
          <span
            className={`grid size-10 place-items-center rounded-full border-2 border-ink font-display font-bold ${
              i <= current ? `${colors[s]} shadow-pop-sm` : "bg-paper text-ink-soft"
            }`}
          >
            {i < current ? "✓" : i + 1}
          </span>
          <span className={`text-xs font-bold sm:text-sm ${i <= current ? "" : "text-ink-soft"}`}>{statusLabel[s]}</span>
        </li>
      ))}
    </ol>
  );
}
