"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { WORK_COVER_LQIPS } from "@/content/work-covers";

/**
 * One-shot migration shim for the legacy hash deep-links (`/#footy` →
 * `/design/footy`). The hash model was replaced with real routes so each
 * case study can ship its own OG image; this catches anyone arriving via an
 * already-shared hash link and forwards them to the equivalent real route.
 *
 * Mounted on `/` only. Reads `location.hash` once on mount, and if it looks
 * like a known case-study slug, replaces the URL with `/design/<slug>`
 * (using `router.replace` so the hash URL doesn't pollute history).
 *
 * Slug-validity is checked against the LQIPs registry — the only build-time
 * list of work slugs available to a client component without dragging the
 * full server `getAllMeta` over. Each cover path encodes its slug as
 * `/work/<slug>/...`, so the registry's keys give us the valid set for free.
 * If a hash doesn't match a known slug, we leave it alone and the home page
 * shows normally.
 *
 * Delete this component once analytics show no traffic landing on `/#…`.
 */
export function HashRedirect() {
  const router = useRouter();
  useEffect(() => {
    const raw = window.location.hash.replace(/^#/, "");
    if (!raw) return;
    const slug = decodeURIComponent(raw);
    const known = new Set(
      Object.keys(WORK_COVER_LQIPS).map((path) => path.split("/")[2] ?? ""),
    );
    if (known.has(slug)) router.replace(`/design/${slug}`);
  }, [router]);
  return null;
}
