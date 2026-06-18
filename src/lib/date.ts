/** Format an ISO date string (e.g. "2026-05-02") as "May 2, 2026".
 *  Parsed in UTC so the day never shifts across timezones. */
export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** Format an ISO date string (e.g. "2026-05-02") as "02/05/26" (dd/mm/yy). */
export function formatDateShort(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    timeZone: "UTC",
  });
}
