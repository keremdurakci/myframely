import assert from "node:assert/strict";
import test from "node:test";
import { products, getMetaDescription, type Product } from "../lib/products.ts";

function fakeProduct(description: string): Product {
  return { slug: "x", title: "X", src: "/x.jpg", etsy: "https://etsy.com/x", description } as Product;
}

test("strips emojis and collapses the opening paragraph to one line", () => {
  const description = getMetaDescription(
    fakeProduct("Add a cute touch to your car 🐾✨\nDesigned for kitty fans.\n\nMore details below.")
  );
  assert.equal(description, "Add a cute touch to your car Designed for kitty fans.");
});

test("only uses the first paragraph, not the whole description", () => {
  const description = getMetaDescription(fakeProduct("First paragraph here.\n\n✨ Bullet section\n• one\n• two"));
  assert.equal(description, "First paragraph here.");
});

test("truncates at a word boundary with an ellipsis when over the max length", () => {
  const longSentence = "This is a very long opening sentence that goes on and on ".repeat(4).trim();
  const description = getMetaDescription(fakeProduct(longSentence), 50);
  assert.ok(description.length <= 51);
  assert.ok(description.endsWith("…"));
  assert.ok(!description.slice(0, -1).endsWith(" "));
});

test("returns the paragraph unchanged when already under the max length", () => {
  const description = getMetaDescription(fakeProduct("Short and sweet."), 160);
  assert.equal(description, "Short and sweet.");
});

test("every real product's meta description is non-empty, short, and unique", () => {
  const descriptions = products.map((p) => getMetaDescription(p));
  for (const d of descriptions) {
    assert.ok(d.length > 0, "meta description should never be empty");
    assert.ok(d.length <= 161, `meta description too long: "${d}"`);
  }
  assert.equal(new Set(descriptions).size, descriptions.length, "meta descriptions should be unique per product");
});
