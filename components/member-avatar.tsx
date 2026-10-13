import { readableTextColor } from "@/lib/colors"

const SIZES = {
  md: "size-10 text-xl",
  // A dot with an initial, for the busy members of a day in the month grid.
  sm: "size-5 text-xs",
} as const

// Colored circle with the member's initial. Decorative: the name always sits next to it (or in the label of
// the element that holds it). The thin border keeps the dark colors visible on a dark background.
function MemberAvatar({
  name,
  color,
  size = "md",
}: {
  name: string
  color: string
  size?: keyof typeof SIZES
}) {
  return (
    <span
      aria-hidden
      style={{ backgroundColor: color, color: readableTextColor(color) }}
      className={`flex shrink-0 items-center justify-center rounded-full border border-foreground/20 font-bold ${SIZES[size]}`}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  )
}

export { MemberAvatar }
