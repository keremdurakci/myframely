import { products, PRODUCTS_LAST_SYNCED } from "../lib/products";
import { guides } from "../lib/guides";

export default function sitemap() {
  const baseUrl = "https://www.myframely.com";

  const productUrls = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: new Date(PRODUCTS_LAST_SYNCED),
  }));

  const guideUrls = guides.map((guide) => ({
    url: `${baseUrl}/guides/${guide.slug}`,
    lastModified: new Date(guide.updatedDate),
  }));

  const staticUrls = [`${baseUrl}/contact`, `${baseUrl}/privacy`, `${baseUrl}/terms`, `${baseUrl}/guides`].map(
    (url) => ({ url })
  );

  // No reliable "last changed" signal for the homepage itself (it isn't
  // tied to the product catalog's own sync date) — omitting lastModified
  // is more honest than either a stale guess or a meaningless "now" on
  // every hourly regen.
  return [{ url: baseUrl }, ...productUrls, ...guideUrls, ...staticUrls];
}
