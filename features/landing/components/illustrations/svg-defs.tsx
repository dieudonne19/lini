/**
 * Formes partagées par toutes les illustrations (personnage, confettis, cœur, étoile).
 * À rendre UNE seule fois par page, avant les illustrations (voir landing-page.tsx).
 * Les illustrations les appellent avec <use href="#lini-…" />.
 */
export function SvgDefs() {
  return (
    <svg
      width="0"
      height="0"
      className="absolute"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* Personnage : couleurs via les variables CSS --c (vêtement) et --s (peau). */}
        <g id="lini-peg">
          <path
            d="M-22 0V-34a22 22 0 0 1 44 0V0Z"
            fill="var(--c)"
            stroke="#1F2540"
            strokeWidth={5}
            strokeLinejoin="round"
          />
          <circle
            cy={-68}
            r={16}
            fill="var(--s)"
            stroke="#1F2540"
            strokeWidth={5}
          />
          <path d="M-16 -70A16 16 0 0 1 16 -70Q0 -78 -16 -70Z" fill="#1F2540" />
          <circle cx={-6} cy={-64} r={2.4} fill="#1F2540" />
          <circle cx={6} cy={-64} r={2.4} fill="#1F2540" />
          <path
            d="M-5 -58Q0 -53 5 -58"
            fill="none"
            stroke="#1F2540"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        </g>

        {/* Confettis : rectangle, rond, triangle, vaguelette. */}
        <g id="lini-cf-r">
          <rect x={-7} y={-3} width={14} height={6} rx={2} />
        </g>
        <g id="lini-cf-c">
          <circle r={4.5} />
        </g>
        <g id="lini-cf-t">
          <path d="M0-7L7 5H-7Z" strokeWidth={2} strokeLinejoin="round" />
        </g>
        <g id="lini-cf-s">
          <path
            d="M-10 0q5-8 10 0t10 0"
            fill="none"
            strokeWidth={3.5}
            strokeLinecap="round"
          />
        </g>

        <g id="lini-heart">
          <path d="M0 11C-20-3-13-18 0-8C13-18 20-3 0 11Z" />
        </g>
        <g id="lini-star">
          <path d="M0-10Q1.5-1.5 10 0Q1.5 1.5 0 10Q-1.5 1.5-10 0Q-1.5-1.5 0-10Z" />
        </g>
      </defs>
    </svg>
  )
}
