import { AgendaItemRow } from "@/components/agenda-item-row"
import type { AgendaDay } from "@/lib/agenda"
import { formatDayHeading } from "@/lib/format-date"

// Pure: days that have something to show, each with its occurrences.
function AgendaDayList({ days, today }: { days: AgendaDay[]; today: Date }) {
  return (
    <div className="flex flex-col gap-8">
      {days.map((day) => (
        <section key={day.date.getTime()}>
          <h2 className="text-base font-semibold">
            {formatDayHeading(day.date, today)}
          </h2>
          <ul className="divide-y divide-border">
            {day.items.map((item) => (
              <AgendaItemRow
                key={`${item.activity.id}-${item.startsAt.getTime()}`}
                item={item}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

export { AgendaDayList }
