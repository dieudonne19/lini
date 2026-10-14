import { Plus } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

import { getSessionMember } from "@/app/session"
import { AgendaView } from "@/components/agenda-view"
import { buttonVariants } from "@/components/ui/button"
import { listOwnActivities } from "@/lib/activities"

// Every member sees their own agenda. Only the fields the screen needs are sent to the browser.
export default async function Page() {
  const member = await getSessionMember()
  if (!member) redirect("/")

  const activities = (await listOwnActivities(member.id)).map(
    ({
      id,
      title,
      startsAt,
      endsAt,
      allDay,
      isPrivate,
      repeat,
      repeatUntil,
    }) => ({
      id,
      title,
      startsAt,
      endsAt,
      allDay,
      isPrivate,
      repeat,
      repeatUntil,
    })
  )

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10 *:max-w-md">
      <div className="flex w-full flex-col justify-between gap-4 md:flex-row">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Mon agenda
        </h1>
        <Link
          href="/agenda/nouvelle"
          className={buttonVariants({ size: "lg", className: "h-11" })}
        >
          <Plus aria-hidden />
          Ajouter une activité
        </Link>
      </div>
      <AgendaView activities={activities} color={member.color} />
    </main>
  )
}
