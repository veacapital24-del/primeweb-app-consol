import { HeroNewsletter } from "@/components/sections/HeroNewsletter";
import { FeaturedCategories } from "@/components/sections/FeaturedCategories";
import { ProductTabs } from "@/components/sections/ProductTabs";
import { PromoBanners } from "@/components/sections/PromoBanners";
import { BigSalesToday } from "@/components/sections/BigSalesToday";
import { DeliveryBanner } from "@/components/sections/DeliveryBanner";
import { BlogAndTestimonials } from "@/components/sections/BlogAndTestimonials";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { SupportBlock } from "@/components/sections/SupportBlock";
import { BrandLogos } from "@/components/sections/BrandLogos";
import {
  getPopularProducts,
  getTopRatedProducts,
  getOnSaleProducts,
  getPosts,
} from "@/lib/data";

// Home surfaces popular / on-sale products from Prime Supabase; refresh
// every 60s so admin changes propagate without a redeploy.
export const revalidate = 60;

export default async function Home() {
  const [popular, topRated, onSale] = await Promise.all([
    getPopularProducts(4),
    getTopRatedProducts(4),
    getOnSaleProducts(5),
  ]);
  const posts = getPosts();

  return (
    <>
      <HeroNewsletter />
      <FeaturedCategories />
      <ProductTabs popular={popular} topRated={topRated} />
      <PromoBanners />
      <BigSalesToday products={onSale.length >= 5 ? onSale : popular} />
      <DeliveryBanner />
      <BlogAndTestimonials posts={posts} />
      <TrustStrip />
      <SupportBlock />
      <BrandLogos />
    </>
  );
}
