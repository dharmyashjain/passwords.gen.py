import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  company_name: string | null;
  gstin: string | null;
  role: "customer" | "staff" | "admin";
};

/** The signed-in user's profile, or null. Verifies the JWT via getUser(). */
export async function getCurrentUser(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, phone, company_name, gstin, role")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email ?? null,
    full_name: data?.full_name ?? (user.user_metadata?.full_name as string) ?? null,
    phone: data?.phone ?? null,
    company_name: data?.company_name ?? null,
    gstin: data?.gstin ?? null,
    role: (data?.role as Profile["role"]) ?? "customer",
  };
}

export async function requireUser(next: string): Promise<Profile> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

export async function requireStaff(): Promise<Profile> {
  const user = await requireUser("/admin");
  if (user.role !== "staff" && user.role !== "admin") redirect("/?denied=1");
  return user;
}
