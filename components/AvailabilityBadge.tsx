export type DisplayAvailability = "AVAILABLE" | "TAKEN" | "UNKNOWN" | "ERROR" | "NOT_CHECKED";

const STYLES: Record<DisplayAvailability, { label: string; className: string }> = {
  AVAILABLE: { label: "Appears Available", className: "bg-green-50 text-green-700 border-green-200" },
  TAKEN: { label: "Taken", className: "bg-red-50 text-red-700 border-red-200" },
  UNKNOWN: { label: "Status Unknown", className: "bg-neutral-100 text-neutral-600 border-neutral-200" },
  ERROR: { label: "Check Unavailable", className: "bg-amber-50 text-amber-700 border-amber-200" },
  NOT_CHECKED: { label: "Not Checked Yet", className: "bg-neutral-100 text-neutral-600 border-neutral-200" },
};

export default function AvailabilityBadge({ status }: { status: DisplayAvailability }) {
  const { label, className } = STYLES[status];
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${className}`}>
      {label}
    </span>
  );
}
