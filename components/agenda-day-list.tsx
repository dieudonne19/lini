import { AgendaItemRow } from "@/components/agenda-item-row"
import type { AgendaDay } from "@/lib/agenda"

// Pure: the occurrences of the days that have something to show, one row each between thin lines, in date order.
// The date is written on the first row of each day.
function AgendaDayList({ days }: { days: AgendaDay[] }) {
  return (
    <ul className="divide-y border-y">
      {days.flatMap((day) =>
        day.items.map((item, index) => (
          <AgendaItemRow
            key={`${item.activity.id}-${item.startsAt.getTime()}`}
            item={item}
            showDate={index === 0}
          />
        ))
      )}
    </ul>
  )
}

export { AgendaDayList }
