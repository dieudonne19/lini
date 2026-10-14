import { Lock, Repeat } from "lucide-react"
import Link from "next/link"

import type { AgendaItem } from "@/lib/agenda"
import { formatRepeat, formatTimeRange } from "@/lib/format-date"

const tagClass =
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium [&_svg]:size-3.5"

// Pure: one occurrence, as a card. It speaks the same language as the week view: the member's color is a left
// border and a light tint, and the cards share the event cards' relief and title font. The whole card opens the
// activity ("Modifier" edits the whole series when it repeats). The owner sees the title even when it is private.
function AgendaItemRow({ item, color }: { item: AgendaItem; color: string }) {
  const { activity } = item
  const repeat = formatRepeat(activity)
  return (
    <li
      style={{
        borderLeftColor: color,
        backgroundColor: `color-mix(in oklab, ${color} 12%, var(--card))`,
      }}
      className="group relative flex flex-col gap-1 rounded-lg border-l-4 p-4 shadow-sm ring-1 ring-foreground/5 transition-shadow hover:shadow-md"
    >
      <p className="text-sm font-semibold tabular-nums">
        {formatTimeRange(item)}
      </p>
      <Link
        href={`/agenda/${activity.id}`}
        aria-label={`Modifier ${activity.title}`}
        className="w-fit font-heading text-lg leading-snug font-semibold break-words group-hover:underline after:absolute after:inset-0 after:rounded-lg focus-visible:outline-none focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
      >
        {activity.title}
      </Link>
      {(activity.isPrivate || repeat) && (
        <ul className="mt-1 flex flex-wrap gap-1.5">
          {activity.isPrivate && (
            <li className={`${tagClass} bg-secondary`}>
              <Lock aria-hidden />
              Privée
            </li>
          )}
          {repeat && (
            <li className={`${tagClass} bg-card text-muted-foreground`}>
              <Repeat aria-hidden />
              {repeat}
            </li>
          )}
        </ul>
      )}
    </li>
  )
}

export { AgendaItemRow }
