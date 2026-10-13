import { formatTimeRange } from "@/lib/format-date"
import type { ScheduleItem } from "@/lib/week"

type WeekItemProps = {
  item: ScheduleItem
  color: string
}

// Pure: one occurrence in the week. Another member's private activity is "Occupé": it was never given a title.
// The member's color is a left border; the member is always named by the row or the list around it.
function WeekItem({ item, color }: WeekItemProps) {
  const { activity } = item
  const isBusy = activity.kind === "busy"
  return (
    <div
      style={{ borderLeftColor: color }}
      className={`rounded-md border-l-4 px-2 py-1 text-xs ${isBusy ? "bg-muted text-muted-foreground" : "bg-secondary"}`}
    >
      <p className="text-muted-foreground tabular-nums">
        {formatTimeRange(item)}
      </p>
      <p className={`font-medium break-words ${isBusy ? "italic" : ""}`}>
        {isBusy ? "Occupé" : activity.title}
      </p>
      {activity.kind === "full" && activity.isPrivate && (
        <p className="text-muted-foreground">Privée</p>
      )}
    </div>
  )
}

export { WeekItem }
