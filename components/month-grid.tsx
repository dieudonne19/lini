import { MonthDayCell } from "@/components/month-day-cell"
import { formatWeekday } from "@/lib/format-date"
import type { MonthDay } from "@/lib/month"

// Pure: the month as a table of whole weeks from Monday.
function MonthGrid({ weeks, today }: { weeks: MonthDay[][]; today: Date }) {
  return (
    <table className="w-full table-fixed border-collapse">
      <caption className="sr-only">
        Chaque jour ouvre la semaine correspondante
      </caption>
      <thead>
        <tr>
          {weeks[0].map(({ date }) => (
            <th
              key={date.getDay()}
              scope="col"
              className="p-1 text-center text-xs font-medium text-muted-foreground sm:text-sm"
            >
              {formatWeekday(date)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {weeks.map((week) => (
          <tr key={week[0].date.getTime()}>
            {week.map((day) => (
              <td
                key={day.date.getTime()}
                className="border border-border p-0 align-top"
              >
                <MonthDayCell day={day} today={today} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export { MonthGrid }
