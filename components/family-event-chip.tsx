import Link from "next/link"

import type { ScheduleEvent } from "@/lib/schedule"

// Pure: a confirmed family event, in relief (filled with the main color) so it stands out from activities.
// It is a link to the event's page, where the family answers.
function FamilyEventChip({ event }: { event: ScheduleEvent }) {
  return (
    <Link
      href={`/evenements/${event.id}`}
      className="block rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground hover:opacity-90"
    >
      <span className="block font-semibold break-words">{event.title}</span>
      {event.place && <span className="block opacity-90">{event.place}</span>}
    </Link>
  )
}

export { FamilyEventChip }
