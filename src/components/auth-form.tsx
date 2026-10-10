"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { signIn, signUp, type AuthState } from "@/app/auth/actions";

export function AuthForm({ mode, next, initialError }: { mode: "login" | "signup"; next: string; initialError?: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    mode === "login" ? signIn : signUp,
    initialError ? { error: initialError } : undefined,
  );

  if (state?.message) {
    return (
      <div className="card animate-pop-in bg-mint-soft p-8 text-center">
        <p className="text-5xl">📬</p>
        <h2 className="mt-3 text-2xl font-bold">Check your inbox</h2>
        <p className="mt-2 text-ink-soft">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="card space-y-5 p-7 sm:p-9">
      <input type="hidden" name="next" value={next} />
      {mode === "signup" && (
        <>
          <div>
            <label className="label" htmlFor="full_name">Your name</label>
            <input className="input" id="full_name" name="full_name" autoComplete="name" required />
          </div>
          <div>
            <label className="label" htmlFor="phone">Phone <span className="font-normal text-ink-soft">(for delivery updates)</span></label>
            <input className="input" id="phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" />
          </div>
        </>
      )}
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input className="input" id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input
          className="input"
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          minLength={mode === "signup" ? 8 : undefined}
          required
        />
      </div>
      {state?.error && (
        <p role="alert" className="rounded-2xl border-2 border-ink bg-bubble-soft px-4 py-3 font-semibold">
          {state.error}
        </p>
      )}
      <button className="btn-primary w-full py-3 text-lg" disabled={pending}>
        {pending && <Loader2 className="size-5 animate-spin" />}
        {mode === "login" ? "Sign in" : "Create account"}
      </button>
      <p className="text-center text-ink-soft">
        {mode === "login" ? (
          <>New here? <Link href={`/signup?next=${encodeURIComponent(next)}`} className="font-bold text-ink underline decoration-bubble decoration-4 underline-offset-4">Create an account</Link></>
        ) : (
          <>Already have an account? <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-bold text-ink underline decoration-sky decoration-4 underline-offset-4">Sign in</Link></>
        )}
      </p>
    </form>
  );
}
