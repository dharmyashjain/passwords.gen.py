import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/auth";
import { safeNext } from "@/lib/safe-next";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const next = safeNext(typeof sp.next === "string" ? sp.next : null);
  if (await getCurrentUser()) redirect(next);

  return (
    <div className="mx-auto max-w-md px-4 pt-14">
      <h1 className="text-center text-5xl font-bold">Welcome back 👋</h1>
      <p className="mb-8 mt-3 text-center text-lg text-ink-soft">Sign in to upload designs and track orders.</p>
      <AuthForm
        mode="login"
        next={next}
        initialError={sp.error === "confirm" ? "That confirmation link has expired. Try signing in or sign up again." : undefined}
      />
    </div>
  );
}
