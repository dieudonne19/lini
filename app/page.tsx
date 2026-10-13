import { Suspense } from "react"

import { getSessionMember } from "@/app/session"
import { CalendarSkeleton } from "@/components/calendar-skeleton"
import { FirstRun } from "@/components/first-run"
import { LinkRequired } from "@/components/link-required"
import { MonthView } from "@/components/month-view"
import { WeekView } from "@/components/week-view"
import {
  monthWindow,
  parseMonthParam,
  parseWeekParam,
  weekWindow,
} from "@/lib/calendar-params"
import { hasFamily } from "@/lib/families"
import { listFamilySchedule } from "@/lib/schedule"

type Member = NonNullable<Awaited<ReturnType<typeof getSessionMember>>>

// Reads the family's schedule around the period asked for: the month `month` ("2026-10") when there is one,
// otherwise the week starting `monday` (the current week by default). The period itself is laid out in the browser.
async function CalendarData({
  member,
  month,
  monday,
}: {
  member: Member
  month: string | undefined
  monday: string | undefined
}) {
  if (month) {
    const schedule = await listFamilySchedule(member, monthWindow(month))
    return <MonthView schedule={schedule} month={month} />
  }
  const schedule = await listFamilySchedule(
    member,
    weekWindow(monday, new Date())
  )
  return <WeekView schedule={schedule} monday={monday} />
}

// A signed-in member lands on the week of the family. Without a link: ask for one, or create the family.
// The same <main> and FirstRun stay mounted when the family has just been created (the one-time link stays).
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ du?: string; mois?: string }>
}) {
  const member = await getSessionMember()
  const canCreate = !member && !(await hasFamily())
  const { du, mois } = await searchParams
  const month = parseMonthParam(mois)
  const monday = month ? undefined : parseWeekParam(du)

  return (
    <main
      className={`mx-auto flex w-full flex-1 flex-col px-4 ${member ? "max-w-5xl py-8" : "max-w-md justify-center py-12"}`}
    >
      <FirstRun canCreate={canCreate}>
        {member ? (
          <Suspense
            key={month ?? monday ?? "current-week"}
            fallback={<CalendarSkeleton />}
          >
            <CalendarData member={member} month={month} monday={monday} />
          </Suspense>
        ) : (
          <LinkRequired />
        )}
      </FirstRun>
    </main>
  )
}
