import type { AgendaItem } from "@/lib/agenda"
import { formatRepeat, formatTimeRange } from "@/lib/format-date"

// Pure: one occurrence. The owner sees the title even when the activity is private.
function AgendaItemRow({ item }: { item: AgendaItem }) {
  const { activity } = item
  const repeat = formatRepeat(activity)
  return (
    <li className="flex gap-4 py-3">
      <p className="w-28 shrink-0 text-sm text-muted-foreground tabular-nums">
        {formatTimeRange(item)}
      </p>
      <div className="min-w-0">
        <p className="font-medium break-words">{activity.title}</p>
        {(activity.isPrivate || repeat) && (
          <p className="text-sm text-muted-foreground">
            {activity.isPrivate && "Privée"}
            {activity.isPrivate && repeat && " · "}
            {repeat}
          </p>
        )}
      </div>
    </li>
  )
}

export { AgendaItemRow }
