import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/auth";
import { safeNext } from "@/lib/safe-next";

export const metadata: Metadata = { title: "Create account" };

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const sp = await searchParams;
  const next = safeNext(typeof sp.next === "string" ? sp.next : null);
  if (await getCurrentUser()) redirect(next);

  return (
    <div className="mx-auto max-w-md px-4 pt-14">
      <h1 className="text-center text-5xl font-bold">Join Printza 🎨</h1>
      <p className="mb-8 mt-3 text-center text-lg text-ink-soft">Takes 30 seconds. Then let&apos;s print something great.</p>
      <AuthForm mode="signup" next={next} />
    </div>
  );
}
