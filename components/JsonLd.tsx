// Renders a JSON-LD structured-data block. `data` is always our own
// hardcoded product/site data, never user input, but `<` is still escaped
// so a `</script>` sequence can never prematurely close the tag.
export default function JsonLd({ data }: { data: object }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
