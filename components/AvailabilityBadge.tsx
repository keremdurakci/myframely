export type DisplayAvailability = "AVAILABLE" | "TAKEN" | "UNKNOWN" | "ERROR" | "NOT_CHECKED";

const STYLES: Record<DisplayAvailability, { label: string; className: string }> = {
  AVAILABLE: { label: "Appears Available", className: "bg-green-500/15 text-green-400 border-green-500/30" },
  TAKEN: { label: "Taken", className: "bg-red-500/15 text-red-400 border-red-500/30" },
  UNKNOWN: { label: "Status Unknown", className: "bg-white/10 text-white/60 border-white/20" },
  ERROR: { label: "Check Unavailable", className: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  NOT_CHECKED: { label: "Not Checked Yet", className: "bg-white/10 text-white/60 border-white/20" },
};

export default function AvailabilityBadge({ status }: { status: DisplayAvailability }) {
  const { label, className } = STYLES[status];
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${className}`}>
      {label}
    </span>
  );
}
