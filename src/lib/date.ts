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
