import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { CheckoutForm } from "./checkout-form";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const user = await requireUser("/checkout");
  return (
    <div className="mx-auto max-w-5xl px-4 pt-12">
      <h1 className="mb-8 text-5xl font-bold">Checkout</h1>
      <CheckoutForm
        defaults={{ name: user.full_name ?? "", email: user.email ?? "", phone: user.phone ?? "" }}
      />
    </div>
  );
}
