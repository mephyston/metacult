/**
 * Date utilities for catalog navigation.
 * Implements "Smart Year" logic for catalog pages.
 */

/**
 * Returns the current catalog year based on the "Smart Year" rule:
 * - Before March 1st: returns previous year (N-1)
 * - From March 1st onwards: returns current year (N)
 *
 * Rationale: Early in the year, most "best of" lists still refer to the previous year
 * since the current year hasn't had enough releases yet.
 *
 * @param now - Optional date for testing (defaults to current date)
 * @returns The catalog year (4-digit number)
 */
export function getCurrentCatalogYear(now: Date = new Date()): number {
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed (0 = January, 2 = March)

  // Before March (months 0, 1) → return previous year
  if (currentMonth < 2) {
    return currentYear - 1;
  }

  return currentYear;
}
