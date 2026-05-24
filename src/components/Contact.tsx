/** Contact route shown in the card column. */

// Real contact channels.
const EMAIL = "chukwuka0009@gmail.com";
const GITHUB = "https://github.com/Chukwuka-Osakwe";
const FARCASTER = "https://farcaster.xyz/chukwukaosakwe";

// Understated text link: muted at rest, warms to accent on hover/focus
// (parity), mirroring the "read more" affordance on the idea cards.
const LINK =
  "rounded text-base font-semibold text-text-muted outline-none transition hover:text-accent focus-visible:text-accent focus-visible:underline";

export function Contact() {
  return (
    <div className="mx-auto mt-[12vh] flex w-full max-w-2xl flex-col items-center text-center">
      <p className="text-[clamp(1.5rem,5vw,2.5rem)] font-semibold tracking-tight text-balance text-accent">
        better call chuka!
      </p>

      <p className="mt-4 max-w-md text-base text-text-muted text-balance">
        got a product worth building, or just want to say hi? my inbox is open.
      </p>

      {/* Primary CTA — the one solid-accent button on the site; everything else
          uses accent as text/fill, so this reads unambiguously as the action. */}
      <a
        href={`mailto:${EMAIL}`}
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-base font-semibold text-nav-fill outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        email me
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M3 8h9M8.5 4l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>

      {/* Secondary channels — text links with a hairline dot separator. */}
      <div className="mt-6 flex items-center gap-3">
        <a href={GITHUB} target="_blank" rel="noopener noreferrer" className={LINK}>
          github
        </a>
        <span aria-hidden="true" className="text-border">
          ·
        </span>
        <a href={FARCASTER} target="_blank" rel="noopener noreferrer" className={LINK}>
          farcaster
        </a>
      </div>
    </div>
  );
}
