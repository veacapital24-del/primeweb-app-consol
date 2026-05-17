-- Replace 8 product images that pointed at non-existent Unsplash photo IDs
-- (verified by curl -I on each upstream URL; replacements are IDs we already
-- use elsewhere in the storefront and have confirmed return 200).

update products set image_url =
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'
  where slug = 'tomatoes-1kg';

update products set image_url =
  'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=800&q=80'
  where slug = 'beef-mince-500g';

update products set image_url =
  'https://images.unsplash.com/photo-1535007813616-79dc02ba4021?auto=format&fit=crop&w=800&q=80'
  where slug = 'white-fish-fillet-500g';

update products set image_url =
  'https://images.unsplash.com/photo-1571212515416-fef01fc43637?auto=format&fit=crop&w=800&q=80'
  where slug = 'butter-salted-200g';

update products set image_url =
  'https://images.unsplash.com/photo-1571212515416-fef01fc43637?auto=format&fit=crop&w=800&q=80'
  where slug = 'cooking-cream-200ml';

update products set image_url =
  'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=800&q=80'
  where slug = 'brown-sugar-500g';

update products set image_url =
  'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=800&q=80'
  where slug = 'red-lentils-500g';

update products set image_url =
  'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=800&q=80'
  where slug = 'mayonnaise-400g';
