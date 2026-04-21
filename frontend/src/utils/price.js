/**
 * Parse a price value that may be a number, numeric string, or currency string (e.g. "₹199", "199.50").
 * Returns a finite number, or 0 if unparseable.
 */
export function parsePrice(value) {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  const s = String(value).trim();
  if (!s) return 0;
  const n = parseFloat(s.replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export function computeOrderTotals(subtotal, delivery = 50, taxRate = 0.18) {
  const s = Math.round(parsePrice(subtotal) * 100) / 100;
  const tax = Math.round(s * taxRate * 100) / 100;
  const d = parsePrice(delivery);
  const total = Math.round((s + tax + d) * 100) / 100;
  return { subtotal: s, tax, delivery: d, total };
}
