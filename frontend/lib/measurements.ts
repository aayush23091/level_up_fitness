/**
 * Measurement unit conversion utilities.
 * Database stores: height (cm), weight (kg), body measurements (cm).
 * Frontend displays: inches (in), pounds (lbs).
 */

const CM_PER_INCH = 2.54;
const LBS_PER_KG = 2.20462;

/** Convert centimeters to inches, rounded to nearest whole number. */
export function cmToInches(cm: number | string | undefined | null): number {
  const val = typeof cm === "string" ? parseFloat(cm) : cm;
  if (val == null || isNaN(val)) return 0;
  return Math.round(val / CM_PER_INCH);
}

/** Convert kilograms to pounds, rounded to nearest whole number. */
export function kgToLbs(kg: number | string | undefined | null): number {
  const val = typeof kg === "string" ? parseFloat(kg) : kg;
  if (val == null || isNaN(val)) return 0;
  return Math.round(val * LBS_PER_KG);
}

/** Convert inches to centimeters (for API submission), rounded to 2 decimals. */
export function inchesToCm(inches: number | string): number {
  const val = typeof inches === "string" ? parseFloat(inches) : inches;
  if (isNaN(val)) return 0;
  return Math.round(val * CM_PER_INCH * 100) / 100;
}

/** Convert pounds to kilograms (for API submission), rounded to 2 decimals. */
export function lbsToKg(lbs: number | string): number {
  const val = typeof lbs === "string" ? parseFloat(lbs) : lbs;
  if (isNaN(val)) return 0;
  return Math.round((val / LBS_PER_KG) * 100) / 100;
}

/** Format a numeric value with its unit label, or return "Not added" if falsy. */
export function formatMeasurement(
  metricValue: number | string | undefined | null,
  type: "height" | "weight" | "length"
): string {
  const numVal =
    typeof metricValue === "string" ? parseFloat(metricValue) : metricValue;
  if (numVal == null || isNaN(numVal) || numVal === 0) return "Not added";

  if (type === "weight") {
    return `${kgToLbs(numVal)} lbs`;
  }
  // height and other body measurements are cm → inches
  return `${cmToInches(numVal)} in`;
}
