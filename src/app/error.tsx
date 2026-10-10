"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-lg px-4 pt-24 text-center">
      <p className="text-6xl">🖨️💥</p>
      <h1 className="mt-4 text-3xl font-bold">Paper jam!</h1>
      <p className="mt-2 text-ink-soft">Something went wrong loading this page.</p>
      <button onClick={reset} className="btn-primary mt-8">Try again</button>
    </div>
  );
}
