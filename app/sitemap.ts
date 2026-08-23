import { products, PRODUCTS_LAST_SYNCED } from "../lib/products";
import { guides } from "../lib/guides";
import { getLiveStateConfigs } from "../lib/plates/stateConfig";

export default async function sitemap() {
  const baseUrl = "https://www.myframely.com";

  const productUrls = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: new Date(PRODUCTS_LAST_SYNCED),
  }));

  const guideUrls = guides.map((guide) => ({
    url: `${baseUrl}/guides/${guide.slug}`,
    lastModified: new Date(guide.updatedDate),
  }));

  const liveStates = await getLiveStateConfigs();
  const popularUrls = liveStates.map((config) => ({
    url: `${baseUrl}/popular?state=${config.stateCode}`,
  }));

  const staticUrls = [`${baseUrl}/contact`, `${baseUrl}/privacy`, `${baseUrl}/terms`, `${baseUrl}/guides`].map(
    (url) => ({ url })
  );

  // No reliable "last changed" signal for the homepage itself (it isn't
  // tied to the product catalog's own sync date) — omitting lastModified
  // is more honest than either a stale guess or a meaningless "now" on
  // every hourly regen.
  return [{ url: baseUrl }, ...productUrls, ...guideUrls, ...popularUrls, ...staticUrls];
}
