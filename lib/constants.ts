// ============================================================
// Shared constants used across multiple pages
// ============================================================

export const CURRENCIES = [
  { value: "USD", label: "USD ($)", symbol: "$" },
  { value: "EUR", label: "EUR (€)", symbol: "€" },
  { value: "GBP", label: "GBP (£)", symbol: "£" },
  { value: "INR", label: "INR (₹)", symbol: "₹" },
  { value: "AUD", label: "AUD (A$)", symbol: "A$" },
  { value: "CAD", label: "CAD (C$)", symbol: "C$" },
] as const;

export const COUNTRIES = [
  { value: "", label: "Auto-detect from currency" },
  { value: "US", label: "🇺🇸 United States" },
  { value: "IN", label: "🇮🇳 India" },
  { value: "GB", label: "🇬🇧 United Kingdom" },
  { value: "EU", label: "🇪🇺 European Union" },
  { value: "AU", label: "🇦🇺 Australia" },
  { value: "CA", label: "🇨🇦 Canada" },
] as const;

export function getCurrencySymbol(code: string): string {
  return CURRENCIES.find((c) => c.value === code)?.symbol ?? "$";
}

// ============================================================
// Score helpers (used in analyze, dashboard, compare, bulk, report, history)
// ============================================================

export function getScoreColor(score: number) {
  if (score >= 70) return { ring: "stroke-emerald-500", text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", label: "Good Deal" };
  if (score >= 40) return { ring: "stroke-amber-500", text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", label: "Needs Work" };
  return { ring: "stroke-red-500", text: "text-red-600", bg: "bg-red-50", border: "border-red-200", label: "Risky Deal" };
}

export function getRecommendationConfig(rec: string) {
  switch (rec) {
    case "sign":
      return { label: "SIGN", variant: "success" as const, bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" };
    case "negotiate":
      return { label: "NEGOTIATE", variant: "warning" as const, bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" };
    case "walk_away":
      return { label: "WALK AWAY", variant: "danger" as const, bg: "bg-red-50", text: "text-red-700", border: "border-red-200" };
    default:
      return { label: rec.toUpperCase(), variant: "default" as const, bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" };
  }
}

export function getSeverityVariant(severity: string): "critical" | "high" | "medium" | "low" | "default" {
  const s = severity.toLowerCase();
  if (s === "critical") return "critical";
  if (s === "high") return "high";
  if (s === "medium") return "medium";
  if (s === "low") return "low";
  return "default";
}

export function getImportanceVariant(importance: string): "critical" | "warning" | "info" | "default" {
  const i = importance.toLowerCase();
  if (i === "critical") return "critical";
  if (i === "important") return "warning";
  if (i === "nice_to_have") return "info";
  return "default";
}

// ============================================================
// Date formatting
// ============================================================

export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}

export function formatRelativeDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateStr);
  } catch {
    return dateStr;
  }
}

// ============================================================
// Sample contract for "Try with sample" button
// ============================================================

export const SAMPLE_CONTRACT = {
  text: `FREELANCE SERVICE AGREEMENT. The Contractor agrees to provide web development services as directed by the Client. The Contractor shall make unlimited revisions until the Client is satisfied with all deliverables. Payment of $6,000 shall be made within 60 days of project completion and final acceptance by the Client. All intellectual property including code, designs, and documentation created under this agreement shall be owned by the Client upon creation. The Client may terminate this agreement at any time with 7 days written notice. The Contractor agrees not to work with direct competitors of the Client for a period of 12 months following termination. The Contractor shall indemnify the Client against all claims arising from the services. This agreement shall be governed by the laws of the State of New York.`,
  scope: "Website redesign with CMS integration and payment processing",
  price: 6000,
  hours: 80,
  currency: "USD",
};
