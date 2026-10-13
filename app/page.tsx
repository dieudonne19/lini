import { Suspense } from "react"

import { getSessionMember } from "@/app/session"
import { FirstRun } from "@/components/first-run"
import { LinkRequired } from "@/components/link-required"
import { WeekSkeleton } from "@/components/week-skeleton"
import { WeekView } from "@/components/week-view"
import { parseWeekParam, weekWindow } from "@/lib/calendar-params"
import { hasFamily } from "@/lib/families"
import { listFamilySchedule } from "@/lib/schedule"

type Member = NonNullable<Awaited<ReturnType<typeof getSessionMember>>>

// Reads the week asked for and the family's schedule around it; the week itself is laid out in the browser.
async function WeekData({
  member,
  monday,
}: {
  member: Member
  monday: string | undefined
}) {
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
  searchParams: Promise<{ du?: string }>
}) {
  const member = await getSessionMember()
  const canCreate = !member && !(await hasFamily())
  const monday = parseWeekParam((await searchParams).du)

  return (
    <main
      className={`mx-auto flex w-full flex-1 flex-col px-4 ${member ? "max-w-5xl py-8" : "max-w-md justify-center py-12"}`}
    >
      <FirstRun canCreate={canCreate}>
        {member ? (
          <Suspense key={monday ?? "current"} fallback={<WeekSkeleton />}>
            <WeekData member={member} monday={monday} />
          </Suspense>
        ) : (
          <LinkRequired />
        )}
      </FirstRun>
    </main>
  )
}
