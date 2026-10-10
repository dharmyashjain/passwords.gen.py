import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, Clock, ShieldCheck } from "lucide-react";
import { getProduct } from "@/lib/catalog";
import { getCurrentUser } from "@/lib/auth";
import { Configurator } from "@/components/configurator";
import { ProductArt, themeFor } from "@/components/product-art";

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  return { title: product?.name ?? "Product" };
}

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const [product, user] = await Promise.all([getProduct(slug), getCurrentUser()]);
  if (!product) notFound();
  const theme = themeFor(product.slug);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8">
      <Link href="/products" className="inline-flex items-center gap-1 font-semibold text-ink-soft hover:text-ink">
        <ArrowLeft className="size-4" /> All products
      </Link>
      <div className="mt-6 grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className={`card grid aspect-[4/3] place-items-center ${theme.soft}`}>
            <ProductArt slug={product.slug} className="h-3/4 w-auto animate-float [--r:-2deg]" />
          </div>
          <h1 className="mt-8 text-5xl font-bold">
            {product.name} <span className="inline-block animate-wiggle">{theme.emoji}</span>
          </h1>
          <p className="mt-3 text-lg text-ink-soft">{product.description}</p>
          <ul className="mt-6 space-y-2 font-semibold">
            <li className="flex items-center gap-2"><BadgeCheck className="size-5 text-mint" /> Every file checked by a human before printing</li>
            <li className="flex items-center gap-2"><Clock className="size-5 text-sky" /> Dispatch times shown per paper</li>
            <li className="flex items-center gap-2"><ShieldCheck className="size-5 text-bubble" /> Your files stay private to you and our team</li>
          </ul>
        </div>
        <div>
          {product.variants.length ? (
            <Configurator product={product} userId={user?.id ?? null} />
          ) : (
            <div className="card bg-sun-soft p-8 text-center">
              <h2 className="text-3xl font-bold">Coming soon!</h2>
              <p className="mt-2 text-ink-soft">We&apos;re finalising rates for {product.name.toLowerCase()}s. Check back shortly.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
