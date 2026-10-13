import { FamilyEventChip } from "@/components/family-event-chip"
import { MemberAvatar } from "@/components/member-avatar"
import { WeekItem } from "@/components/week-item"
import { formatDayHeading } from "@/lib/format-date"
import type { Week } from "@/lib/week"

// Pure: the same week as a list, one section per day, for narrow screens where seven columns do not fit.
// Each activity is preceded by the member it belongs to. Hidden from the `md` breakpoint up.
function WeekDayList({ week, today }: { week: Week; today: Date }) {
  return (
    <div className="flex flex-col gap-6 md:hidden">
      {week.days.map((day, index) => {
        const entries = week.rows.flatMap(({ member, days }) =>
          days[index].map((item) => ({ member, item }))
        )
        const events = week.events[index]
        return (
          <section key={day.getTime()}>
            <h2 className="mb-2 text-base font-semibold">
              {formatDayHeading(day, today)}
            </h2>
            {entries.length === 0 && events.length === 0 ? (
              <p className="text-sm text-muted-foreground">Rien de prévu</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {events.map((event) => (
                  <li key={event.id}>
                    <FamilyEventChip event={event} />
                  </li>
                ))}
                {entries.map(({ member, item }) => (
                  <li
                    key={`${item.activity.id}-${item.startsAt.getTime()}`}
                    className="flex items-start gap-2"
                  >
                    <MemberAvatar name={member.name} color={member.color} />
                    <div className="min-w-0 flex-1">
                      <p className="mb-0.5 text-sm font-medium">
                        {member.name}
                      </p>
                      <WeekItem item={item} color={member.color} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )
      })}
    </div>
  )
}

export { WeekDayList }
