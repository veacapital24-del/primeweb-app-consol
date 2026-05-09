-- Catalog expansion seed.
-- 1) Backfill the existing 10 products with proper category_slug + real
--    photographic image URLs (replacing the picsum.photos placeholders).
-- 2) Add ~29 new products across all 7 storefront categories so /shop and
--    each /category/[slug] page has meaningful content.
-- Each product gets an inventory row with sensible on_hand/threshold values.
--
-- Idempotent: ON CONFLICT (slug) clauses skip on re-run.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1) Backfill existing rows
-- ─────────────────────────────────────────────────────────────────────────────

update products set category_slug = 'essentials',
       image_url = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80'
  where slug = 'basmati-rice-5kg' and category_slug is null;

update products set category_slug = 'essentials',
       image_url = 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80'
  where slug = 'sunflower-oil-1l' and category_slug is null;

update products set category_slug = 'milk',
       image_url = 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80'
  where slug = 'fresh-milk-1l' and category_slug is null;

update products set category_slug = 'essentials',
       image_url = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80'
  where slug = 'pain-maison-pack' and category_slug is null;

update products set category_slug = 'essentials',
       image_url = 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=800&q=80'
  where slug = 'maggi-2min-noodles' and category_slug is null;

update products set category_slug = 'others',
       image_url = 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?auto=format&fit=crop&w=800&q=80'
  where slug = 'coca-cola-1-5l' and category_slug is null;

update products set category_slug = 'others',
       image_url = 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&w=800&q=80'
  where slug = 'phenix-beer-66cl' and category_slug is null;

update products set category_slug = 'others',
       image_url = 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=800&q=80'
  where slug = 'lux-soap-bar-100g' and category_slug is null;

update products set category_slug = 'others',
       image_url = 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=800&q=80'
  where slug = 'bois-cheri-vanilla-100g' and category_slug is null;

update products set category_slug = 'essentials',
       image_url = 'https://images.unsplash.com/photo-1604908554027-22d8f8a9e4cf?auto=format&fit=crop&w=800&q=80'
  where slug = 'mayonnaise-400g' and category_slug is null;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2) New products
-- ─────────────────────────────────────────────────────────────────────────────

-- Use a named CTE so we can insert products + their inventory rows together.
with new_products(sku, slug, name, description, image_url, retail_price_mur,
                  wholesale_price_mur, wholesale_min_qty, is_hard_discount,
                  category_slug, tags, on_hand, low_stock_threshold) as (
  values
  -- Fresh Produce ───────────────────────────────────────────────────────────
  ('NL-FP-TOM-1KG', 'tomatoes-1kg', 'Tomates fraîches 1kg',
   'Tomates rouges fermes, idéales pour salades et rougails.',
   'https://images.unsplash.com/photo-1546470427-227cdfee62a0?auto=format&fit=crop&w=800&q=80',
   65.00, 55.00, 5, true, 'fresh-produce', array['rougail','frais','locale'], 80, 15),

  ('NL-FP-ONI-1KG', 'onions-1kg', 'Oignons jaunes 1kg',
   'Oignons jaunes secs pour la cuisine de tous les jours.',
   'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80',
   45.00, 38.00, 5, true, 'fresh-produce', array['cuisine','base'], 120, 20),

  ('NL-FP-POT-2KG', 'potatoes-2kg', 'Pommes de terre 2kg',
   'Pommes de terre à chair ferme, parfaites pour frites et purées.',
   'https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?auto=format&fit=crop&w=800&q=80',
   95.00, 80.00, 5, false, 'fresh-produce', array['locale','frais'], 60, 10),

  ('NL-FP-CAR-1KG', 'carrots-1kg', 'Carottes 1kg',
   'Carottes croquantes — pour salades, soupes et plats mijotés.',
   'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=800&q=80',
   55.00, 45.00, 5, false, 'fresh-produce', array['frais'], 75, 15),

  ('NL-FP-LET-1', 'lettuce-head', 'Laitue iceberg',
   'Laitue iceberg fraîche du jour, croquante.',
   'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&w=800&q=80',
   45.00, 38.00, 5, false, 'fresh-produce', array['frais','salade'], 40, 8),

  -- Fresh Fruit ─────────────────────────────────────────────────────────────
  ('NL-FR-BAN-1KG', 'bananas-1kg', 'Bananes 1kg',
   'Bananes mauriciennes mûres, sucrées et parfumées.',
   'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80',
   45.00, 38.00, 5, true, 'fresh-fruit', array['locale','tropical'], 90, 20),

  ('NL-FR-MAN-1KG', 'mangoes-1kg', 'Mangues 1kg',
   'Mangues mûres et juteuses — saison locale.',
   'https://images.unsplash.com/photo-1591073113125-e46713c829ed?auto=format&fit=crop&w=800&q=80',
   120.00, 100.00, 5, false, 'fresh-fruit', array['locale','tropical'], 50, 10),

  ('NL-FR-PIN-1', 'pineapple-each', 'Ananas (la pièce)',
   'Ananas mauricien sucré, parfait pour jus et desserts.',
   'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=800&q=80',
   75.00, 65.00, 5, false, 'fresh-fruit', array['locale','tropical'], 35, 8),

  -- Meat ────────────────────────────────────────────────────────────────────
  ('NL-MT-CHK-1', 'chicken-whole-1-2kg', 'Poulet entier 1.2kg',
   'Poulet fermier entier, prêt à cuire.',
   'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=800&q=80',
   195.00, 165.00, 4, false, 'meat', array['frais','volaille'], 40, 8),

  ('NL-MT-BEEF-500', 'beef-mince-500g', 'Boeuf haché 500g',
   'Boeuf haché frais 5% MG — pour bolognaise et hamburgers.',
   'https://images.unsplash.com/photo-1602470521006-bac6cc9d3aa7?auto=format&fit=crop&w=800&q=80',
   285.00, 245.00, 4, false, 'meat', array['frais','boeuf'], 30, 6),

  ('NL-MT-LAMB-1', 'lamb-shoulder-1kg', 'Épaule d''agneau 1kg',
   'Épaule d''agneau désossée — idéale rôtie au four.',
   'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=800&q=80',
   595.00, 525.00, 3, false, 'meat', array['agneau','premium'], 18, 4),

  ('NL-MT-CHK-BR', 'chicken-breast-1kg', 'Poitrine de poulet 1kg',
   'Filets de poulet sans peau ni os, prêts à cuisiner.',
   'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&w=800&q=80',
   245.00, 215.00, 4, true, 'meat', array['frais','volaille','léger'], 45, 8),

  -- Seafood ─────────────────────────────────────────────────────────────────
  ('NL-SF-SAL-500', 'fresh-salmon-fillet-500g', 'Filet de saumon 500g',
   'Filet de saumon frais sans peau — prêt en moins de 10 minutes.',
   'https://images.unsplash.com/photo-1535007813616-79dc02ba4021?auto=format&fit=crop&w=800&q=80',
   495.00, 435.00, 3, false, 'fish-seafood', array['premium','oméga-3'], 22, 5),

  ('NL-SF-PRA-500', 'prawns-frozen-500g', 'Crevettes congelées 500g',
   'Crevettes décortiquées surgelées — prêtes à sauter.',
   'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80',
   385.00, 335.00, 4, true, 'fish-seafood', array['surgelé','crevettes'], 30, 6),

  ('NL-SF-WHT-500', 'white-fish-fillet-500g', 'Filet de poisson blanc 500g',
   'Filet de cabillaud frais — pour grillade ou court-bouillon.',
   'https://images.unsplash.com/photo-1535399831218-d9bd5cd3502f?auto=format&fit=crop&w=800&q=80',
   295.00, 255.00, 4, false, 'fish-seafood', array['frais','poisson'], 28, 6),

  -- Cheese ──────────────────────────────────────────────────────────────────
  ('NL-CH-CHED-200', 'mauritian-cheddar-200g', 'Cheddar 200g',
   'Cheddar mature au goût marqué — idéal pour sandwichs et gratins.',
   'https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&w=800&q=80',
   175.00, 155.00, 4, false, 'cheese', array['affiné'], 35, 8),

  ('NL-CH-BRIE-150', 'brie-de-meaux-150g', 'Brie 150g',
   'Brie crémeux à pâte molle — parfait sur un plateau.',
   'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=800&q=80',
   295.00, 255.00, 3, false, 'cheese', array['crémeux','français'], 20, 5),

  ('NL-CH-MOZ-200', 'mozzarella-fior-di-latte', 'Mozzarella fior di latte',
   'Mozzarella fraîche au lait de vache — idéale pour pizza et caprese.',
   'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=800&q=80',
   225.00, 195.00, 4, true, 'cheese', array['frais','italien'], 28, 6),

  -- Milk & dairy ────────────────────────────────────────────────────────────
  ('NL-MK-YOG-500', 'plain-yogurt-500g', 'Yaourt nature 500g',
   'Yaourt nature au lait entier — onctueux, sans sucre ajouté.',
   'https://images.unsplash.com/photo-1571212515416-fef01fc43637?auto=format&fit=crop&w=800&q=80',
   95.00, 85.00, 4, false, 'milk', array['frais','laitier'], 50, 10),

  ('NL-MK-BUT-200', 'butter-salted-200g', 'Beurre salé 200g',
   'Beurre salé de baratte — pour tartines et cuisson.',
   'https://images.unsplash.com/photo-1589985270958-1bdf38b8f3ba?auto=format&fit=crop&w=800&q=80',
   185.00, 165.00, 4, false, 'milk', array['laitier'], 38, 8),

  ('NL-MK-CRM-200', 'cooking-cream-200ml', 'Crème cuisine 200ml',
   'Crème fluide UHT — pour sauces et desserts.',
   'https://images.unsplash.com/photo-1612187028748-eed35cdaeebc?auto=format&fit=crop&w=800&q=80',
   75.00, 65.00, 4, false, 'milk', array['UHT','laitier'], 65, 12),

  -- Essentials ──────────────────────────────────────────────────────────────
  ('NL-ES-EGG-12', 'fresh-eggs-12pk', 'Oeufs frais x12',
   'Oeufs frais de poules élevées au sol — calibre M.',
   'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80',
   145.00, 125.00, 4, false, 'essentials', array['frais','base'], 70, 12),

  ('NL-ES-FLR-1KG', 'white-flour-1kg', 'Farine blanche 1kg',
   'Farine de blé tout usage T55 — pour pain, gâteaux et pâtes.',
   'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
   65.00, 55.00, 5, true, 'essentials', array['base','boulangerie'], 90, 20),

  ('NL-ES-SUG-500', 'brown-sugar-500g', 'Sucre brun 500g',
   'Sucre roux — pour boissons et pâtisseries.',
   'https://images.unsplash.com/photo-1610173827414-a4a55f55bb8a?auto=format&fit=crop&w=800&q=80',
   55.00, 48.00, 5, false, 'essentials', array['base'], 80, 15),

  ('NL-ES-LEN-500', 'red-lentils-500g', 'Lentilles rouges 500g',
   'Lentilles rouges décortiquées — cuisson rapide.',
   'https://images.unsplash.com/photo-1605472356935-29541a2bc56f?auto=format&fit=crop&w=800&q=80',
   95.00, 82.00, 5, false, 'essentials', array['légumineuse','base'], 60, 12),

  ('NL-ES-PAS-500', 'spaghetti-500g', 'Spaghetti 500g',
   'Pâtes spaghetti italiennes — al dente en 9 minutes.',
   'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
   75.00, 65.00, 5, true, 'essentials', array['italien','pâtes'], 95, 18),

  -- Others ──────────────────────────────────────────────────────────────────
  ('NL-OT-TEA-25', 'green-tea-bags-25', 'Thé vert (25 sachets)',
   'Thé vert pure feuille — boîte de 25 sachets.',
   'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=800&q=80',
   95.00, 82.00, 6, false, 'others', array['thé','infusion'], 55, 10),

  ('NL-OT-CHO-100', 'dark-chocolate-100g', 'Chocolat noir 70% 100g',
   'Tablette de chocolat noir 70% cacao — origine équateur.',
   'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=800&q=80',
   110.00, 95.00, 6, false, 'others', array['chocolat'], 65, 12),

  ('NL-OT-WTR-1-5', 'mineral-water-1-5l', 'Eau minérale 1.5L',
   'Eau minérale plate de source — bouteille 1.5L.',
   'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80',
   35.00, 30.00, 6, true, 'others', array['boisson','base'], 200, 30)
)
insert into products (sku, slug, name, description, image_url, retail_price_mur,
                      wholesale_price_mur, wholesale_min_qty, is_hard_discount,
                      category_slug, tags)
select sku, slug, name, description, image_url, retail_price_mur,
       wholesale_price_mur, wholesale_min_qty, is_hard_discount,
       category_slug, tags
from new_products
on conflict (slug) do nothing;

-- Inventory rows for the new products (skipped on re-run via ON CONFLICT)
insert into inventory (product_id, on_hand, reserved, low_stock_threshold)
select p.id, np.on_hand, 0, np.low_stock_threshold
from products p
join (
  values
  ('tomatoes-1kg', 80, 15), ('onions-1kg', 120, 20),
  ('potatoes-2kg', 60, 10), ('carrots-1kg', 75, 15),
  ('lettuce-head', 40, 8), ('bananas-1kg', 90, 20),
  ('mangoes-1kg', 50, 10), ('pineapple-each', 35, 8),
  ('chicken-whole-1-2kg', 40, 8), ('beef-mince-500g', 30, 6),
  ('lamb-shoulder-1kg', 18, 4), ('chicken-breast-1kg', 45, 8),
  ('fresh-salmon-fillet-500g', 22, 5), ('prawns-frozen-500g', 30, 6),
  ('white-fish-fillet-500g', 28, 6), ('mauritian-cheddar-200g', 35, 8),
  ('brie-de-meaux-150g', 20, 5), ('mozzarella-fior-di-latte', 28, 6),
  ('plain-yogurt-500g', 50, 10), ('butter-salted-200g', 38, 8),
  ('cooking-cream-200ml', 65, 12), ('fresh-eggs-12pk', 70, 12),
  ('white-flour-1kg', 90, 20), ('brown-sugar-500g', 80, 15),
  ('red-lentils-500g', 60, 12), ('spaghetti-500g', 95, 18),
  ('green-tea-bags-25', 55, 10), ('dark-chocolate-100g', 65, 12),
  ('mineral-water-1-5l', 200, 30)
) as np(slug, on_hand, low_stock_threshold) on np.slug = p.slug
on conflict (product_id) do nothing;
