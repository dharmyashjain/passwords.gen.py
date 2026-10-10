import Link from "next/link";
import { requireStaff } from "@/lib/auth";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireStaff();
  return (
    <div className="mx-auto max-w-6xl px-4 pt-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl font-bold">Admin 🛠️</h1>
        <nav className="flex gap-2">
          <Link href="/admin" className="btn-ghost">Orders</Link>
          <Link href="/admin/prices" className="btn-sun">Products &amp; prices</Link>
        </nav>
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}
