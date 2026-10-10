import Link from "next/link";
import { LayoutDashboard, LogOut, Package, UserRound } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { signOut } from "@/app/auth/actions";
import { Logo } from "./logo";
import { CartButton } from "./cart-button";

export async function Header() {
  const user = await getCurrentUser();
  const isStaff = user?.role === "staff" || user?.role === "admin";

  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-cream/90 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-3 px-4">
        <Logo />
        <nav className="hidden items-center gap-1 font-display font-semibold md:flex">
          <Link href="/products" className="rounded-full px-4 py-2 hover:bg-sun-soft">Products</Link>
          <Link href="/#how-it-works" className="rounded-full px-4 py-2 hover:bg-sky-soft">How it works</Link>
          {user && <Link href="/orders" className="rounded-full px-4 py-2 hover:bg-mint-soft">My orders</Link>}
          {isStaff && <Link href="/admin" className="rounded-full px-4 py-2 hover:bg-grape-soft">Admin</Link>}
        </nav>
        <div className="flex items-center gap-2">
          <CartButton />
          {user ? (
            <details className="relative">
              <summary className="btn-ghost list-none px-3.5 [&::-webkit-details-marker]:hidden">
                <UserRound className="size-5" strokeWidth={2.4} />
                <span className="hidden max-w-28 truncate sm:inline">
                  {user.full_name?.split(" ")[0] || "Account"}
                </span>
              </summary>
              <div className="card absolute right-0 mt-3 w-56 animate-pop-in p-2">
                <p className="truncate px-3 py-2 text-sm text-ink-soft">{user.email}</p>
                <Link href="/products" className="flex items-center gap-2 rounded-2xl px-3 py-2 font-semibold hover:bg-sun-soft md:hidden">
                  <Package className="size-4" /> Products
                </Link>
                <Link href="/orders" className="flex items-center gap-2 rounded-2xl px-3 py-2 font-semibold hover:bg-mint-soft">
                  <Package className="size-4" /> My orders
                </Link>
                {isStaff && (
                  <Link href="/admin" className="flex items-center gap-2 rounded-2xl px-3 py-2 font-semibold hover:bg-grape-soft">
                    <LayoutDashboard className="size-4" /> Admin
                  </Link>
                )}
                <form action={signOut}>
                  <button className="flex w-full cursor-pointer items-center gap-2 rounded-2xl px-3 py-2 text-left font-semibold hover:bg-bubble-soft">
                    <LogOut className="size-4" /> Sign out
                  </button>
                </form>
              </div>
            </details>
          ) : (
            <Link href="/login" className="btn-dark px-4">Sign in</Link>
          )}
        </div>
      </div>
    </header>
  );
}
