-- Seed data for local development
-- Prices in MUR (Mauritian Rupee)

insert into products (sku, slug, name, description, image_url, retail_price_mur, wholesale_price_mur, wholesale_min_qty, is_hard_discount) values
  ('PR-RICE-5KG',   'basmati-rice-5kg',         'Basmati Rice 5kg',           'Premium long grain basmati. House staple.',         'https://picsum.photos/seed/rice/600/600',  349.00, 299.00, 6,  true),
  ('PR-OIL-1L',     'sunflower-oil-1l',         'Sunflower Oil 1L',           'Cold-pressed cooking oil.',                          'https://picsum.photos/seed/oil/600/600',   139.00, 119.00, 12, true),
  ('PR-MILK-1L',    'fresh-milk-1l',            'UHT Milk 1L',                 'Long-life full cream milk.',                         'https://picsum.photos/seed/milk/600/600',   59.00,  49.00, 12, true),
  ('PR-BREAD-PAIN', 'pain-maison-pack',         'Pain Maison (4 pack)',        'Soft Mauritian bread rolls. Daily bake.',           'https://picsum.photos/seed/bread/600/600',  35.00,  28.00, 20, false),
  ('PR-NOODLE-MAG', 'maggi-2min-noodles',       'Maggi 2-Minute Noodles',      'Pack of 12. Office and shop favourite.',            'https://picsum.photos/seed/noodle/600/600', 95.00,  79.00, 6,  true),
  ('PR-COKE-1.5L',  'coca-cola-1-5l',           'Coca-Cola 1.5L',              '1.5L PET bottle. Case of 6.',                       'https://picsum.photos/seed/coke/600/600',   85.00,  70.00, 6,  false),
  ('PR-PHENIX-66',  'phenix-beer-66cl',         'Phenix Beer 66cl',            'Local lager. Tabagie classic.',                     'https://picsum.photos/seed/beer/600/600',   75.00,  62.00, 24, false),
  ('PR-SOAP-LUX',   'lux-soap-bar-100g',        'Lux Soap Bar 100g',           'Pack of 4 bars.',                                   'https://picsum.photos/seed/soap/600/600',   89.00,  72.00, 12, true),
  ('PR-TEA-VANILLA','bois-cheri-vanilla-100g',  'Bois Chéri Vanilla Tea 100g', 'Iconic Mauritian vanilla tea.',                     'https://picsum.photos/seed/tea/600/600',    119.00, 99.00, 6,  false),
  ('PR-MAYO-400',   'mayonnaise-400g',          'Mayonnaise 400g',             'Local jar mayo. Restaurant grade.',                 'https://picsum.photos/seed/mayo/600/600',   145.00, 119.00, 6,  false)
on conflict (sku) do nothing;

-- Initial stock levels (some intentionally low to demo Flash Inventory)
insert into inventory (product_id, on_hand, reserved, low_stock_threshold)
select p.id,
       case
         when p.sku in ('PR-RICE-5KG', 'PR-OIL-1L') then 4   -- low stock!
         when p.sku = 'PR-MILK-1L' then 2                    -- almost out
         when p.sku = 'PR-PHENIX-66' then 0                  -- sold out
         else 80
       end,
       0,
       5
from products p
on conflict (product_id) do nothing;

-- Seed reels (these slugs become /reel/<slug> URLs + in-app shoppable feed)
insert into reels (slug, platform, external_url, thumbnail_url, video_url, caption, posted_at) values
  ('rice-haul-may',     'instagram', 'https://www.instagram.com/reel/sample-rice/',     'https://picsum.photos/seed/reel-rice/800/1000',     'https://videos.pexels.com/video-files/5730222/5730222-uhd_1440_2732_25fps.mp4',     'Rice + oil bundle for the month — flash drop only',     now() - interval '2 days'),
  ('breakfast-combo',   'tiktok',    'https://www.tiktok.com/@primemu/video/sample-bf', 'https://picsum.photos/seed/reel-bf/800/1000',       'https://videos.pexels.com/video-files/5594377/5594377-uhd_1440_2562_25fps.mp4',       'The Mauritian breakfast bundle every tabagie needs',    now() - interval '1 day'),
  ('tabagie-restock',   'instagram', 'https://www.instagram.com/reel/sample-tabagie/',  'https://picsum.photos/seed/reel-tab/800/1000',      'https://videos.pexels.com/video-files/6981411/6981411-hd_720_1366_25fps.mp4',      'Wholesale restock pack — DM for delivery',              now())
on conflict (slug) do update set
  video_url = excluded.video_url,
  thumbnail_url = excluded.thumbnail_url,
  caption = excluded.caption;

-- Map reels -> products
with r as (select * from reels), p as (select * from products)
insert into reel_products (reel_id, product_id, position)
select r.id, p.id, x.pos from r, p, (values
  ('rice-haul-may',   'PR-RICE-5KG',    0),
  ('rice-haul-may',   'PR-OIL-1L',      1),
  ('breakfast-combo', 'PR-MILK-1L',     0),
  ('breakfast-combo', 'PR-BREAD-PAIN',  1),
  ('breakfast-combo', 'PR-TEA-VANILLA', 2),
  ('tabagie-restock', 'PR-NOODLE-MAG',  0),
  ('tabagie-restock', 'PR-COKE-1.5L',   1),
  ('tabagie-restock', 'PR-PHENIX-66',   2),
  ('tabagie-restock', 'PR-SOAP-LUX',    3)
) as x(reel_slug, sku, pos)
where r.slug = x.reel_slug and p.sku = x.sku
on conflict do nothing;
