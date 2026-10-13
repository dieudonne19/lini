import type { ScheduleEvent } from "@/lib/schedule"

// Pure: a confirmed family event, in relief (filled with the main color) so it stands out from activities.
function FamilyEventChip({ event }: { event: ScheduleEvent }) {
  return (
    <div className="rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground">
      <p className="font-semibold break-words">{event.title}</p>
      {event.place && <p className="opacity-90">{event.place}</p>}
    </div>
  )
}

export { FamilyEventChip }
