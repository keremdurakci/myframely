import { products } from "../lib/products";

export default function sitemap() {
  const baseUrl = "https://myframely.com";

  const productUrls = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: new Date(),
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    ...productUrls,
  ];
}
