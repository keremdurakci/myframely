---
domain: www.myframely.com
origin: https://www.myframely.com
source_render: false
generated_at: 2026-08-16T17:19:24.042Z
findings: 1
source_evidence: .seoagent/audit/evidence.md
note: >-
  MACHINE-GENERATED findings report derived from the live-crawl evidence.
  The audit (audit/latest.md) BUILDS ON this file — it must carry every
  finding below forward (adding GSC context and prioritization on top),
  never re-derive or truncate the list. Do not hand-edit; re-run
  `seoagent crawl` to regenerate.
---

# Technical findings — www.myframely.com (from the live crawl)

Derived by code from `.seoagent/audit/evidence.md` (crawled https://www.myframely.com at 2026-08-16T17:19:24.042Z). Every finding below is **Confirmed** against that evidence. Reporting every one of these is non-negotiable — session economy trims bookkeeping, never findings.

## [Medium] 1 page has no canonical tag in the server HTML

**Confirmed** · Evidence: evidence.md § Site-wide rollup — Pages missing canonical

The server HTML of these pages contains no `<link rel="canonical">`.

Affected URLs:
- https://www.myframely.com/

**Why it matters:** Without a self-referencing canonical, URL variants (query strings, trailing slashes, http/https, www) can split ranking signals across duplicates.

**Suggested fix:** Add a self-referencing `<link rel="canonical" href="{full URL}">` to each listed page.

## Already present on the live site — never recommend adding these

The crawl confirms the following already exist in the live server HTML. If the repo source lacks any of them, the **repo source is stale — the live page already serves it; reconcile the source** with what is live. Never phrase these as "add X".

- https://www.myframely.com/ — <title>, meta description, Open Graph tags, Twitter card, JSON-LD schema (Organization)
- https://www.myframely.com/products/hello-kitty-license-plate-frame — <title>, meta description, canonical, Open Graph tags, Twitter card, JSON-LD schema (Organization, Product, BreadcrumbList)
- https://www.myframely.com/products/wing-license-plate-frame — <title>, meta description, canonical, Open Graph tags, Twitter card, JSON-LD schema (Organization, Product, BreadcrumbList)
- https://www.myframely.com/products/owl-license-plate-frame — <title>, meta description, canonical, Open Graph tags, Twitter card, JSON-LD schema (Organization, Product, BreadcrumbList)
- https://www.myframely.com/products/speed-demon-flame-license-plate-frame — <title>, meta description, canonical, Open Graph tags, Twitter card, JSON-LD schema (Organization, Product, BreadcrumbList)
- https://www.myframely.com/products/fifa-world-cup-2026-license-plate-frame — <title>, meta description, canonical, Open Graph tags, Twitter card, JSON-LD schema (Organization, Product, BreadcrumbList)
- https://www.myframely.com/products/no-fear-license-plate-frame — <title>, meta description, canonical, Open Graph tags, Twitter card, JSON-LD schema (Organization, Product, BreadcrumbList)
- https://www.myframely.com/products/snoopy-license-plate-frame — <title>, meta description, canonical, Open Graph tags, Twitter card, JSON-LD schema (Organization, Product, BreadcrumbList)
- https://www.myframely.com/products/veteran-license-plate-frame-usa-canada — <title>, meta description, canonical, Open Graph tags, Twitter card, JSON-LD schema (Organization, Product, BreadcrumbList)
- https://www.myframely.com/products/vintage-license-plate-frame — <title>, meta description, canonical, Open Graph tags, Twitter card, JSON-LD schema (Organization, Product, BreadcrumbList)
- https://www.myframely.com/products/queen-pink-license-plate-frame — <title>, meta description, canonical, Open Graph tags, Twitter card, JSON-LD schema (Organization, Product, BreadcrumbList)
- https://www.myframely.com/products/chrome-skull-license-plate-frame — <title>, meta description, canonical, Open Graph tags, Twitter card, JSON-LD schema (Organization, Product, BreadcrumbList)
- https://www.myframely.com/products/adventure-awaits-license-plate-frame — <title>, meta description, canonical, Open Graph tags, Twitter card, JSON-LD schema (Organization, Product, BreadcrumbList)
- https://www.myframely.com/products/rainbow-license-plate-frame — <title>, meta description, canonical, Open Graph tags, Twitter card, JSON-LD schema (Organization, Product, BreadcrumbList)
- https://www.myframely.com/products/pearl-floral-license-plate-frame — <title>, meta description, canonical, Open Graph tags, Twitter card, JSON-LD schema (Organization, Product, BreadcrumbList)
