import { Suspense } from "react"
import type { Metadata } from "next"

import { getSessionMember } from "@/app/session"
import { CalendarSkeleton } from "@/components/calendar-skeleton"
import { MonthView } from "@/components/month-view"
import { WeekView } from "@/components/week-view"
import {
  monthWindow,
  parseMonthParam,
  parseWeekParam,
  weekWindow,
} from "@/lib/calendar-params"
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

// A member sees the week; a visitor gets the default title of the site. The layout's title template does not
// apply to the page of its own segment, so the suffix is written out.
export async function generateMetadata(): Promise<Metadata> {
  return (await getSessionMember()) ? { title: "Semaine · Lini" } : {}
}

// A signed-in member lands on the week of the family. A visitor without a session gets the landing page,
// which is empty for now: the way in (create the family, open a personal link) lives at /commencer.
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ du?: string; mois?: string }>
}) {
  const member = await getSessionMember()
  if (!member) return <main className="flex-1" />

  const { du, mois } = await searchParams
  const month = parseMonthParam(mois)
  const monday = month ? undefined : parseWeekParam(du)

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8">
      <Suspense
        key={month ?? monday ?? "current-week"}
        fallback={<CalendarSkeleton />}
      >
        <CalendarData member={member} month={month} monday={monday} />
      </Suspense>
    </main>
  )
}
