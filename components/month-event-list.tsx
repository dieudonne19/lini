import { formatEventWhen } from "@/lib/format-date"
import type { ScheduleEvent } from "@/lib/schedule"

// Pure: the family events of the month in full (the grid only has room for a short title).
function MonthEventList({ events }: { events: ScheduleEvent[] }) {
  if (events.length === 0) return null
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-base font-semibold">Événements du mois</h2>
      <ul className="flex flex-col gap-2">
        {events.map((event) => (
          <li
            key={event.id}
            className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
          >
            <p className="font-semibold break-words">{event.title}</p>
            <p className="opacity-90">
              {formatEventWhen(event)}
              {event.place ? ` · ${event.place}` : ""}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}

export { MonthEventList }
