import { Suspense } from "react"
import type { Metadata } from "next"

import { getSessionMember } from "@/app/session"
import { CalendarSkeleton } from "@/components/calendar-skeleton"
import { MonthView } from "@/components/month-view"
import { WeekPromos } from "@/components/week-promos"
import { WeekView } from "@/components/week-view"
import {
  monthWindow,
  parseMonthParam,
  parseWeekParam,
  weekWindow,
} from "@/lib/calendar-params"
import { LandingPage, SITE_DESCRIPTION, SITE_TITLE } from "@/features/landing"
import { isOnlyParent } from "@/lib/members"
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

// A member sees the week; a visitor sees the landing page and gets its title and description. The layout's title
// template does not apply to the page of its own segment, so the suffix is written out. The openGraph and twitter
// of a page replace the layout's whole objects, so they are written out again.
export async function generateMetadata(): Promise<Metadata> {
  if (await getSessionMember()) return { title: "Semaine · Lini" }
  return {
    title: { absolute: SITE_TITLE },
    description: SITE_DESCRIPTION,
    openGraph: {
      type: "website",
      siteName: "Lini",
      locale: "fr_FR",
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
    },
  }
}

// A signed-in member lands on the week of the family. A visitor without a session gets the landing page; its
// button leads to /commencer, the way in (create the family, or open a personal link).
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ du?: string; mois?: string }>
}) {
  const member = await getSessionMember()
  if (!member) return <LandingPage />

  const { du, mois } = await searchParams
  const month = parseMonthParam(mois)
  const monday = month ? undefined : parseWeekParam(du)

  return (
    <>
      <WeekPromos soloParent={await isOnlyParent(member)} />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8">
        <Suspense
          key={month ?? monday ?? "current-week"}
          fallback={<CalendarSkeleton />}
        >
          <CalendarData member={member} month={month} monday={monday} />
        </Suspense>
      </main>
    </>
  )
}
