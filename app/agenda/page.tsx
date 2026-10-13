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
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col gap-8 px-4 py-12">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Mon agenda</h1>
        <Link
          href="/agenda/nouvelle"
          className={buttonVariants({ size: "lg", className: "h-11" })}
        >
          Ajouter une activité
        </Link>
      </div>
      <AgendaView activities={activities} />
    </main>
  )
}
