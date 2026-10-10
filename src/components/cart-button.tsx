"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "./cart-provider";

export function CartButton() {
  const { count, ready } = useCart();
  return (
    <Link href="/cart" className="btn-ghost relative px-3.5" aria-label={`Cart, ${count} items`}>
      <ShoppingBag className="size-5" strokeWidth={2.4} />
      <span className="hidden sm:inline">Cart</span>
      {ready && count > 0 && (
        <span className="absolute -right-2 -top-2 grid size-6 animate-pop-in place-items-center rounded-full border-2 border-ink bg-bubble text-xs font-black">
          {count}
        </span>
      )}
    </Link>
  );
}
