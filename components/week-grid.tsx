import { FamilyEventChip } from "@/components/family-event-chip"
import { MemberAvatar } from "@/components/member-avatar"
import { WeekItem } from "@/components/week-item"
import { toIsoDate } from "@/lib/calendar-dates"
import { formatShortDay } from "@/lib/format-date"
import type { Week } from "@/lib/week"

// Pure: members in rows, the seven days in columns. A table, so a screen reader announces
// the member and the day of each cell. Hidden under the `md` breakpoint (the list is shown instead).
function WeekGrid({ week, today }: { week: Week; today: Date }) {
  const todayKey = toIsoDate(today)
  const hasEvents = week.events.some((events) => events.length > 0)
  const cellClass = (day: Date) =>
    `align-top border-t border-border p-1.5 ${toIsoDate(day) === todayKey ? "bg-muted/60" : ""}`

  return (
    <table className="hidden w-full table-fixed border-collapse md:table">
      <thead>
        <tr>
          <th scope="col" className="w-36 p-1.5 text-left text-sm font-medium">
            <span className="sr-only">Membre</span>
          </th>
          {week.days.map((day) => {
            const isToday = toIsoDate(day) === todayKey
            return (
              <th
                key={day.getTime()}
                scope="col"
                aria-current={isToday ? "date" : undefined}
                className={`p-1.5 text-left text-sm ${isToday ? "font-bold" : "font-medium text-muted-foreground"}`}
              >
                {formatShortDay(day)}
              </th>
            )
          })}
        </tr>
      </thead>
      <tbody>
        {hasEvents && (
          <tr>
            <th
              scope="row"
              className="border-t border-border p-1.5 text-left align-top text-sm font-medium"
            >
              Famille
            </th>
            {week.days.map((day, index) => (
              <td key={day.getTime()} className={cellClass(day)}>
                <div className="flex flex-col gap-1">
                  {week.events[index].map((event) => (
                    <FamilyEventChip key={event.id} event={event} />
                  ))}
                </div>
              </td>
            ))}
          </tr>
        )}
        {week.rows.map(({ member, days }) => (
          <tr key={member.id}>
            <th
              scope="row"
              className="border-t border-border p-1.5 text-left align-top font-medium"
            >
              <span className="flex items-center gap-2">
                <MemberAvatar name={member.name} color={member.color} />
                <span className="min-w-0 break-words">{member.name}</span>
              </span>
            </th>
            {days.map((items, index) => (
              <td
                key={week.days[index].getTime()}
                className={cellClass(week.days[index])}
              >
                <div className="flex flex-col gap-1">
                  {items.map((item) => (
                    <WeekItem
                      key={`${item.activity.id}-${item.startsAt.getTime()}`}
                      item={item}
                      color={member.color}
                    />
                  ))}
                </div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export { WeekGrid }
