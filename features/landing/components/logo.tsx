type LogoProps = {
  className?: string
  /** Nom accessible. Sans lui, le logo est décoratif (le lien ou le texte autour doit alors se nommer). */
  label?: string
}

const INK = "#1F2540"

/** Logo Lini : le mot « lini » dessiné au trait, dont le « n » est une maison, avec sa porte. */
export function Logo({ className, label }: LogoProps) {
  return (
    <svg
      viewBox="156 14 208 118"
      className={className}
      {...(label
        ? { role: "img", "aria-label": label }
        : { "aria-hidden": true })}
    >
      <g
        fill="none"
        stroke={INK}
        strokeWidth={12}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M176 34V112" />
        <path d="M214 62V112" />
        <path d="M342 62V112" />
      </g>
      <path d="M256 118V86a20 20 0 0 1 40 0V118Z" fill="#E4EBFD" />
      <path
        d="M250 112V86a26 26 0 0 1 52 0V112"
        fill="none"
        stroke={INK}
        strokeWidth={12}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x={244} y={56} width={12} height={46} rx={3.5} fill={INK} />
      <path d="M268.5 118V101a7.5 7.5 0 0 1 15 0V118Z" fill="#F2A93B" />
      <circle cx={280.6} cy={109} r={1.1} fill={INK} />
      <circle cx={214} cy={36} r={8} fill="#3D6DF2" />
      <circle cx={342} cy={36} r={8} fill="#F2A93B" />
    </svg>
  )
}
