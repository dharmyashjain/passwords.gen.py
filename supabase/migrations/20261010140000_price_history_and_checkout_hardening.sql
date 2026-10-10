-- Printza: keep price history, load confirmed rate-card prices, harden checkout.
--
-- 1. list_prices was unique on (variant_id, quantity), so a price change had to
--    overwrite the old row. Prices are now versioned by effective_from and the
--    newest row in effect wins. Order items already snapshot unit_price/subtotal.
-- 2. Rate-card prices confirmed by the owner on 10 Oct 2026 replace six live
--    prices (old rows are kept as history).
-- 3. place_order now requires a signed-in user and only accepts design files
--    from that user's own storage folder.

alter table public.list_prices
  drop constraint if exists list_prices_variant_id_quantity_key;
alter table public.list_prices
  add constraint list_prices_variant_qty_effective_key
  unique (variant_id, quantity, effective_from);

create or replace view public.current_list_prices
with (security_invoker = true) as
select distinct on (lp.variant_id, lp.quantity)
  lp.id, lp.variant_id, lp.quantity, lp.price, lp.source, lp.effective_from, lp.notes
from public.list_prices lp
where lp.effective_from <= now()
order by lp.variant_id, lp.quantity, lp.effective_from desc;

grant select on public.current_list_prices to anon, authenticated;

create or replace view public.catalogue
with (security_invoker = true) as
select p.slug as product_slug,
       p.name as product_name,
       v.id as variant_id,
       v.gsm,
       v.paper_type,
       v.sides,
       v.size,
       v.delivery_days,
       lp.quantity,
       lp.price
from products p
join product_variants v on v.product_id = p.id
join current_list_prices lp on lp.variant_id = v.id
where p.active and v.active
order by p.name, v.gsm, lp.quantity;

create or replace function public.quote_variant(p_variant_id uuid, p_quantity integer)
returns table(variant_id uuid, quantity integer, unit_price numeric, subtotal numeric,
              matched_tier integer, exact_tier boolean)
language plpgsql
stable security definer
set search_path to 'public'
as $function$
declare
  v_tier record;
begin
  if p_quantity is null or p_quantity <= 0 then
    raise exception 'Quantity must be greater than zero';
  end if;

  if not exists (
    select 1 from product_variants v join products p on p.id = v.product_id
    where v.id = p_variant_id and v.active and p.active
  ) then
    raise exception 'This product option is not available';
  end if;

  -- exact tier
  select lp.quantity, lp.price into v_tier
  from current_list_prices lp
  where lp.variant_id = p_variant_id and lp.quantity = p_quantity;

  if found then
    return query select p_variant_id, p_quantity,
      round(v_tier.price / v_tier.quantity, 4),
      v_tier.price,
      v_tier.quantity,
      true;
    return;
  end if;

  -- nearest tier at or below
  select lp.quantity, lp.price into v_tier
  from current_list_prices lp
  where lp.variant_id = p_variant_id and lp.quantity <= p_quantity
  order by lp.quantity desc
  limit 1;

  if not found then
    -- below the lowest published tier: use the lowest tier's per-piece rate
    select lp.quantity, lp.price into v_tier
    from current_list_prices lp
    where lp.variant_id = p_variant_id
    order by lp.quantity asc
    limit 1;
  end if;

  if not found then
    raise exception 'No published price for this variant';
  end if;

  return query select p_variant_id, p_quantity,
    round(v_tier.price / v_tier.quantity, 4),
    round((v_tier.price / v_tier.quantity) * p_quantity, 2),
    v_tier.quantity,
    false;
end;
$function$;

create or replace function public.place_order(
  p_customer_name text, p_customer_email text, p_customer_phone text,
  p_delivery_address text, p_items jsonb, p_notes text default null::text)
returns table(order_id uuid, order_number text, total_price numeric)
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_uid uuid := auth.uid();
  v_order_id uuid;
  v_order_number text;
  v_total numeric := 0;
  v_item jsonb;
  v_file text;
  v_q record;
begin
  if v_uid is null then
    raise exception 'Please sign in to place an order';
  end if;
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Order must contain at least one item';
  end if;
  if coalesce(trim(p_customer_name), '') = '' then
    raise exception 'Customer name is required';
  end if;

  insert into orders (user_id, customer_name, customer_email, customer_phone,
                      delivery_address, notes, status, total_price)
  values (v_uid, p_customer_name, p_customer_email, p_customer_phone,
          p_delivery_address, p_notes, 'pending', 0)
  returning orders.id, orders.order_number into v_order_id, v_order_number;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_file := nullif(v_item->>'design_file_url', '');
    if v_file is not null and v_file not like v_uid::text || '/%' then
      raise exception 'Design file does not belong to this account';
    end if;

    select * into v_q from public.quote_variant(
      (v_item->>'variant_id')::uuid,
      (v_item->>'quantity')::int
    );

    insert into order_items (order_id, variant_id, quantity, unit_price, subtotal, design_file_url)
    values (v_order_id, v_q.variant_id, v_q.quantity, v_q.unit_price, v_q.subtotal, v_file);

    v_total := v_total + v_q.subtotal;
  end loop;

  update orders set total_price = v_total, updated_at = now() where orders.id = v_order_id;

  return query select v_order_id, v_order_number, v_total;
end;
$function$;

revoke execute on function public.place_order(text, text, text, text, jsonb, text) from anon, public;
grant execute on function public.place_order(text, text, text, text, jsonb, text) to authenticated;

-- Confirmed rate-card prices (owner chose rate card over the earlier sheet values).
insert into public.list_prices (variant_id, quantity, price, source, notes)
select v.id, x.quantity, x.price, 'rate_card_2026_10_10', 'Rate card photo confirmed by owner'
from (values
  ('leaflet',    90,  'Art Paper',     'double', 1000, 2700),
  ('leaflet',    90,  'Art Paper',     'double', 4000, 7400),
  ('letterhead', 80,  'JK Excel Bond', 'single', 1000, 2020),
  ('letterhead', 90,  'Sunshine',      'single', 1000, 1880),
  ('letterhead', 100, 'DO Paper',      'double', 1000, 2840),
  ('letterhead', 110, 'Matt Paper',    'single', 1000, 1990)
) as x(slug, gsm, paper, sides, quantity, price)
join public.products p on p.slug = x.slug
join public.product_variants v
  on v.product_id = p.id and v.gsm = x.gsm and v.paper_type = x.paper and v.sides = x.sides;

update public.products set description = case slug
  when 'pamphlet'   then 'Lightweight single-sided pamphlets for handouts, menus and door-to-door campaigns.'
  when 'leaflet'    then 'Bright 90 GSM art-paper leaflets, single or double sided, for promotions that pop.'
  when 'letterhead' then 'Professional letterheads on bond, Sunshine, DO and matt stock for every business.'
  when 'visiting_card' then 'Premium visiting cards. Rates coming soon.'
  when 'envelope'   then 'Branded envelopes. Rates coming soon.'
  else description end;
