import { readableTextColor } from "@/lib/colors"

// Colored circle with the member's initial. Decorative: the name always sits next to it.
// The thin border keeps the dark colors visible on a dark background.
function MemberAvatar({ name, color }: { name: string; color: string }) {
  return (
    <span
      aria-hidden
      style={{ backgroundColor: color, color: readableTextColor(color) }}
      className="flex size-10 shrink-0 items-center justify-center rounded-full border border-foreground/20 text-xl font-bold"
    >
      {name.charAt(0).toUpperCase()}
    </span>
  )
}

export { MemberAvatar }
