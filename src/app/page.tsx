import Link from "next/link";
import { ArrowRight, Bot, Palette, Printer, Sparkles, Truck, Upload } from "lucide-react";
import { getProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";
import { ProductArt } from "@/components/product-art";

export default async function Home() {
  const products = await getProducts();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-12 md:grid-cols-[1.1fr_1fr] md:pt-20">
          <div className="relative z-10">
            <span className="chip animate-pop-in bg-mint-soft">
              <Sparkles className="size-4" /> Fresh off the press
            </span>
            <h1 className="mt-5 text-5xl font-bold leading-[1.02] sm:text-6xl lg:text-7xl">
              Print that makes people{" "}
              <span className="relative inline-block">
                <span className="relative z-10">smile</span>
                <svg viewBox="0 0 200 20" className="absolute -bottom-2 left-0 h-4 w-full" aria-hidden>
                  <path d="M3 14 C 50 2, 120 2, 197 12" fill="none" stroke="var(--color-bubble)" strokeWidth="8" strokeLinecap="round" />
                </svg>
              </span>
              .
            </h1>
            <p className="mt-6 max-w-lg text-lg text-ink-soft sm:text-xl">
              Leaflets, pamphlets and letterheads printed on great paper and delivered in days.
              Upload your design, pick your paper, done.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products" className="btn-primary px-7 py-3.5 text-lg">
                Start printing <ArrowRight className="size-5" strokeWidth={2.6} />
              </Link>
              <Link href="#how-it-works" className="btn-ghost px-7 py-3.5 text-lg">
                How it works
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 font-semibold text-ink-soft">
              <span>⚡ Next-day options</span>
              <span>🎨 Full colour</span>
              <span>🧾 GST invoices</span>
            </div>
          </div>

          <div className="relative mx-auto aspect-square w-full max-w-md" aria-hidden>
            <div className="absolute inset-6 rounded-[3rem] border-2 border-ink bg-sun shadow-pop-lg" />
            <div className="absolute left-0 top-4 w-1/2 animate-float rounded-3xl border-2 border-ink bg-bubble-soft p-3 shadow-pop [--r:-8deg]">
              <ProductArt slug="leaflet" />
            </div>
            <div className="absolute right-0 top-16 w-1/2 animate-float rounded-3xl border-2 border-ink bg-mint-soft p-3 shadow-pop [--r:6deg] [animation-delay:-2s]">
              <ProductArt slug="letterhead" />
            </div>
            <div className="absolute bottom-2 left-1/4 w-1/2 animate-float rounded-3xl border-2 border-ink bg-sky-soft p-3 shadow-pop [--r:-3deg] [animation-delay:-4s]">
              <ProductArt slug="pamphlet" />
            </div>
            <span className="absolute -right-2 bottom-10 animate-wiggle text-5xl">✨</span>
          </div>
        </div>
      </section>

      {/* Marquee strip */}
      <div className="-rotate-1 border-y-2 border-ink bg-ink py-3 text-cream">
        <div className="flex gap-10 overflow-hidden whitespace-nowrap font-display text-xl font-semibold">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className="flex shrink-0 gap-10">
              <span>Leaflets</span><span className="text-sun">★</span>
              <span>Pamphlets</span><span className="text-bubble">★</span>
              <span>Letterheads</span><span className="text-sky">★</span>
              <span>Visiting cards soon</span><span className="text-mint">★</span>
              <span>Envelopes soon</span><span className="text-grape">★</span>
            </span>
          ))}
        </div>
      </div>

      {/* Products */}
      <section className="mx-auto max-w-6xl px-4 pt-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl font-bold sm:text-5xl">Pick your print</h2>
            <p className="mt-2 text-lg text-ink-soft">Honest prices, per thousand. GST extra.</p>
          </div>
          <Link href="/products" className="btn-ghost">
            See all <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {products.slice(0, 3).map((p, i) => (
            <ProductCard key={p.slug} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-24">
        <h2 className="text-center text-4xl font-bold sm:text-5xl">Three steps. Zero stress.</h2>
        <div className="mt-12 grid gap-7 md:grid-cols-3">
          {[
            { icon: Upload, color: "bg-bubble", title: "Upload", text: "Choose a product and paper, then upload your print-ready file (PDF, AI, CDR, PNG, JPG)." },
            { icon: Printer, color: "bg-sun", title: "We print", text: "Our team checks your file and gets it on the press. We call you if anything looks off." },
            { icon: Truck, color: "bg-sky", title: "Delivered", text: "Fresh prints at your door in as little as one day, depending on the paper you pick." },
          ].map((step, i) => (
            <div key={step.title} className="card relative p-7">
              <span className="absolute -top-5 right-6 grid size-10 place-items-center rounded-full border-2 border-ink bg-cream font-display text-lg font-bold">
                {i + 1}
              </span>
              <span className={`grid size-14 place-items-center rounded-2xl border-2 border-ink ${step.color} shadow-pop-sm`}>
                <step.icon className="size-7" strokeWidth={2.4} />
              </span>
              <h3 className="mt-5 text-2xl font-semibold">{step.title}</h3>
              <p className="mt-2 text-ink-soft">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Coming soon */}
      <section className="mx-auto max-w-6xl px-4 pt-24">
        <div className="card relative overflow-hidden bg-grape-soft p-8 sm:p-12">
          <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
            <div>
              <span className="chip bg-paper">Coming soon</span>
              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">No design? No problem — soon.</h2>
              <p className="mt-3 max-w-xl text-lg text-ink-soft">
                Ready-made templates and an AI designer are on their way. For now, upload your own
                artwork and we&apos;ll print it beautifully.
              </p>
            </div>
            <div className="flex gap-4">
              <span className="grid size-20 rotate-6 place-items-center rounded-3xl border-2 border-ink bg-sun shadow-pop">
                <Palette className="size-9" strokeWidth={2.2} />
              </span>
              <span className="grid size-20 -rotate-6 place-items-center rounded-3xl border-2 border-ink bg-bubble shadow-pop">
                <Bot className="size-9" strokeWidth={2.2} />
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
