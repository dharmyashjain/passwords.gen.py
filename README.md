# Printza

Online printing storefront: leaflets, pamphlets and letterheads, priced live from Supabase.
Customers pick paper, sides and quantity, upload their design, and check out. Staff manage
orders and prices from `/admin`.

Built with Next.js 16 (App Router), Tailwind CSS v4 and Supabase (Postgres, Auth, Storage).

## Getting started

```bash
cp .env.example .env.local   # fill in your Supabase URL + publishable key
npm install
npm run dev                  # http://localhost:3000
```

| Variable | Where to find it |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project settings → API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → Project settings → API keys (`sb_publishable_…`) |
| `NEXT_PUBLIC_SITE_URL` | Public URL of the site, used in sign-up confirmation emails |

Add `<NEXT_PUBLIC_SITE_URL>/auth/confirm` to **Auth → URL Configuration → Redirect URLs** in Supabase.

## What's in v1

- **Catalog**: `/products` and `/products/[slug]` read the `catalogue` view. Products with no
  priced variants (visiting cards, envelopes) show as **Coming soon** until their rates are added.
- **Configurator**: paper → printing sides → quantity tier, with per-piece price.
- **Design upload**: files go straight from the browser to the private `design-files` bucket under
  `<user id>/…` (PDF, AI, EPS, CDR, PNG, JPG, TIFF, up to 100 MB). Templates and AI design are shown
  as "coming soon" in the UI and are not implemented yet.
- **Cart and checkout**: the cart lives in `localStorage`. Checkout calls the `place_order` RPC, which
  prices every line in the database, so browser prices are never trusted. Payment is mocked as
  "pay after file check". Orders are created as `pending`.
- **Accounts**: email + password with Supabase Auth; `/orders` shows a customer's own orders.
- **Admin** (`/admin`, staff/admin role only): order list with filters and stats, order detail with
  design file downloads and status updates, and a price editor (edit tiers, add quantities, hide variants).

### Making someone an admin

Have them sign up, then run in the Supabase SQL editor:

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'you@example.com');
```

## Database

The schema already exists in the Supabase project (`products`, `product_variants`, `list_prices`,
`orders`, `order_items`, `profiles`, RLS policies, `quote_variant`, `place_order`, storage buckets).

`supabase/migrations/20261010140000_price_history_and_checkout_hardening.sql` is **not applied yet**.
Review it and apply it when ready (SQL editor, or `supabase db push`). It:

1. Keeps price history: drops the one-price-per-tier unique key, adds `current_list_prices`, and makes
   `catalogue` and `quote_variant` use the newest price in effect.
2. Loads the six rate-card prices you confirmed (Leaflet both-side 1000 = ₹2,700 and 4000 = ₹7,400;
   Letterhead 80 JK Excel Bond ₹2,020, 90 Sunshine ₹1,880, 100 DO both-side ₹2,840, 110 Matt ₹1,990).
3. Requires sign-in for `place_order`, and only accepts design files from the caller's own folder.
4. Fills in product descriptions.

Until it is applied, the site shows the earlier sheet prices, and the admin price editor overwrites
a tier's price in place instead of keeping history.

## Next up

- Visiting card and envelope rates, then add their variants in `/admin/prices`.
- The 110 GSM Matt letterhead (both sides) is on the rate card but has no price yet.
- Templates (tables `templates`, `template_fields` and `template_drafts` already exist) and the AI designer.
- Online payments (Razorpay) and automated file preflight (`preflight_checks` table exists).
