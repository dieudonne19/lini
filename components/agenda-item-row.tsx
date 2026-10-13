import Link from "next/link"

import type { AgendaItem } from "@/lib/agenda"
import { formatRepeat, formatTimeRange } from "@/lib/format-date"

// Pure: one occurrence. The owner sees the title even when the activity is private.
// "Modifier" opens the whole activity (a repeating one is edited as a series).
function AgendaItemRow({ item }: { item: AgendaItem }) {
  const { activity } = item
  const repeat = formatRepeat(activity)
  return (
    <li className="flex items-start gap-4 py-3">
      <p className="w-28 shrink-0 text-sm text-muted-foreground tabular-nums">
        {formatTimeRange(item)}
      </p>
      <div className="min-w-0 flex-1">
        <p className="font-medium break-words">{activity.title}</p>
        {(activity.isPrivate || repeat) && (
          <p className="text-sm text-muted-foreground">
            {activity.isPrivate && "Privée"}
            {activity.isPrivate && repeat && " · "}
            {repeat}
          </p>
        )}
      </div>
      <Link
        href={`/agenda/${activity.id}`}
        aria-label={`Modifier ${activity.title}`}
        className="-my-3 inline-flex min-h-11 shrink-0 items-center text-sm font-medium underline-offset-4 hover:underline"
      >
        Modifier
      </Link>
    </li>
  )
}

export { AgendaItemRow }
