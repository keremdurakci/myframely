"use client";

// The Plate Watch card lives right next to the search form (same section),
// so a plain "#search" anchor link doesn't produce a visible scroll — the
// target's already on screen. Scrolling to and focusing the word input
// directly gives an obvious, tactile result every time regardless of layout.
export default function ScrollToPlateForm({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  function handleClick() {
    const input = document.getElementById("plate-word-input");
    input?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (input instanceof HTMLInputElement) input.focus();
  }

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
