import type { GallerySection, Row } from "@/components/Gallery";
import type { BrandEntry } from "@/content/brand";

/* Kickoff — second brand/gallery entry (S41), folded out of the lab section
 * (was src/content/lab/kickoff.mdx; the prose moved to an essay, see
 * src/content/writing/bringing-back-the-browser-football-manager.mdx).
 * Assets live at /design/kickoff/ (unified from the old /lab/kickoff/ in S42,
 * to match /design/chipmango/ and the /design/kickoff route). Built up in
 * batches as the game's screens land — S42 added the Club dashboard. */

// Native capture ratio for the in-game UI screenshots (3024×1656 retina grabs,
// stored lossless at 2048px wide and served `unoptimized`). aspect = native so
// object-cover never crops.
const UI = "3024 / 1656";

// Every in-game screenshot is the same shape: a full-width product-ui frame at
// the native capture ratio, served `unoptimized` (lossless source as-is, so
// Next's lossy optimizer doesn't ring the UI text). This helper keeps the
// per-batch sections below to just src + alt.
const ui = (name: string, alt: string): Row => ({
  span: "full",
  block: { kind: "product-ui", aspect: UI, unoptimized: true, src: `/design/kickoff/${name}.webp`, alt },
});

// Headings double as wayfinding across the long gallery and map to the game's
// own top-nav tabs (Club · Squad · Cups · League · Market) plus the Match-day
// flow. The splash hero stays headless.
const sections: GallerySection[] = [
  // Splash trailer — the hero (headless).
  {
    rows: [
      {
        span: "full",
        block: {
          kind: "video",
          aspect: "16 / 9",
          src: "/design/kickoff/splash.mp4",
          poster: "/design/kickoff/splash-poster.webp",
          alt: "Kickoff splash trailer",
        },
      },
    ],
  },
  // Club dashboard — the home screen after login (S42, batch 1).
  {
    heading: "Club",
    rows: [
      ui("club-dashboard-overview", "Club dashboard — welcome banner, the next game (AFC Gunmetal vs Ashfield, Matchday 12), and squad insights"),
      ui("club-dashboard-competitions", "Club dashboard — mailbox, last three results, and the competitions the club is in (league, local cup, continental cup)"),
    ],
  },
  // Squad — the team-management section: roster, formation, player development (S42, batch 2).
  {
    heading: "Squad",
    rows: [
      ui("squad-players", "Squad › Players — the 20-player roster, each with position, age, overall rating, and energy"),
      ui("squad-player-detail", "A player's detail view — the eight attributes, recent training gains, and a reveal-training-result prompt"),
      ui("squad-formation", "Squad › Formation — a 4-3-3 set out on the pitch, with the substitutes rail and a tactics entry point"),
      ui("squad-training", "Squad › Training — the player-training queue, with a completed session ready to reveal"),
      ui("squad-training-complete", "The training-complete reveal — Rafael Rodrigues's Speed ticks up 64 → 65, with confetti"),
    ],
  },
  // Cups — the two knockout competitions: the domestic Local Cup and the Continental Cup (S42, batch 3).
  {
    heading: "Cups",
    rows: [
      ui("cups-local-cup", "Cups › Local Cup — The English Cup, Round of 32: a knocked-out banner, the club's cup-run bracket, and the round draw"),
      ui("cups-continental-overview", "Cups › Continental — the Continental Cup league phase: progress bracket, the next match (Almanza CF vs AFC Gunmetal), and the standings"),
      ui("cups-continental-results", "Cups › Continental — the league-phase standings tail and the club's own round-by-round results and fixtures"),
      // A past Continental Cup run through the knockout rounds (play-off → knocked out at the quarter-final).
      ui("cups-continental-playoff", "Cups › Continental — a play-off tie: the upcoming first leg (AFC Gunmetal vs VfB Lindenthal) and a double-header note"),
      ui("cups-continental-knockout", "Cups › Continental — knocked out at the quarter-final, with the club's route through the earlier rounds"),
      ui("cups-continental-ties", "Cups › Continental — the two-legged route in detail (round of 16, quarter-final) and the other quarter-final ties"),
    ],
  },
  // League — the domestic division: fixtures, the table, and player leaderboards (S42, batch 4).
  {
    heading: "League",
    rows: [
      ui("league-fixtures", "League › Fixtures — recent results, the next match (AFC Gunmetal vs Ashfield, Matchday 12), and upcoming games"),
      ui("league-table", "League › Table — the England Gold League standings, Season 2 Matchday 11, with AFC Gunmetal 4th and recent form"),
      ui("league-player-stats-scorers", "League › Player Stats — the top-scorers leaderboard for the division"),
      ui("league-player-stats-assists", "League › Player Stats — the assists leaderboard for the division"),
    ],
  },
  // Market — buying, selling, and scouting: the transfer market and the talent-reveal flow (S42, batch 5).
  {
    heading: "Market",
    rows: [
      ui("market-transfers", "Market › Transfers — the transfer market with the club's own active listings and transfer history"),
      ui("market-list-player", "Market › Transfers — listing a player for sale, with a suggested value range and an asking-price field"),
      ui("market-talent-unrevealed", "Market — a scouted talent waiting to be revealed, with a tap-to-reveal card"),
      ui("market-talent-revealed", "Market — a revealed talent (Lucas Diallo, an 80-rated attacker with a Clutch trait), with full attributes and a sign-or-dismiss choice"),
    ],
  },
  // Match day — the payoff: the post-match summary, a player breakthrough, and a detailed match-stats view (S42, batch 6).
  {
    heading: "Match day",
    rows: [
      ui("match-result", "Match day — the post-match summary: AFC Gunmetal 1–0 Auto FC, the goal-and-card timeline, match stats (possession, shots, xG), and the development each player gained"),
      ui("match-breakthrough", "Match day — a breakthrough reveal: Rafael Rodrigues's potential ceiling rises 72 → 73"),
      ui("match-stats", "Match day — a match's detailed stats (possession, shots, xG, tackles, passes) and the per-player development gained"),
    ],
  },
];

export const kickoff: BrandEntry = {
  meta: {
    slug: "kickoff",
    title: "Kickoff",
    date: "2026-07-15",
    blurb: "A football manager game in the browser",
    image: "/design/kickoff/splash-poster.webp",
    video: "/design/kickoff/splash.mp4",
    ratio: "16 / 9",
    blurDataURL: undefined,
    eyebrow: "In progress",
    tags: ["UI/UX", "Visual Identity", "Web Design", "Game Design"],
    description:
      "A minimal, low-effort football manager for the browser, built with a backend-dev friend — visual language and game feel, down to the game logic itself. Live at Kickoff.games.",
  },
  sections,
};
