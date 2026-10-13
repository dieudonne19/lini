import { startOfWeek, toIsoDate, toIsoMonth } from "@/lib/calendar-dates"

// Addresses of the calendar views. The week view is `/` or `/?du=<a day of the week>`,
// the month view is `/?mois=<year-month>`.

export const weekHref = (day: Date) => `/?du=${toIsoDate(day)}`

export const monthHref = (day: Date) => `/?mois=${toIsoMonth(day)}`

// The week to open from a month (its first day is `month`): the current week when it is the current
// month, otherwise the week holding the 1st.
export function weekHrefForMonth(month: Date, today: Date) {
  const isCurrentMonth =
    month.getFullYear() === today.getFullYear() &&
    month.getMonth() === today.getMonth()
  return isCurrentMonth ? "/" : weekHref(startOfWeek(month))
}
