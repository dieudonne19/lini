import { AgendaItemRow } from "@/components/agenda-item-row"
import type { AgendaDay } from "@/lib/agenda"
import { formatDayHeading } from "@/lib/format-date"

// Pure: days that have something to show, each with its occurrences, in the member's color.
function AgendaDayList({
  days,
  today,
  color,
}: {
  days: AgendaDay[]
  today: Date
  color: string
}) {
  return (
    <div className="flex flex-col gap-8">
      {days.map((day) => (
        <section key={day.date.getTime()}>
          <h2 className="text-lg font-semibold">
            {formatDayHeading(day.date, today)}
          </h2>
          <ul className="mt-3 flex flex-col gap-3">
            {day.items.map((item) => (
              <AgendaItemRow
                key={`${item.activity.id}-${item.startsAt.getTime()}`}
                item={item}
                color={color}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

export { AgendaDayList }
