import { redirect } from "next/navigation"

import { getSessionMember } from "@/app/session"
import { EventsView } from "@/components/events-view"
import { listEvents } from "@/lib/events"

// The events of the family: what a parent has to validate (or what a child proposed), then the upcoming and
// the past ones. The domain applies who may see what.
export default async function Page() {
  const member = await getSessionMember()
  if (!member) redirect("/")

  const { proposals, upcoming, past } = await listEvents(member)
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-10 *:max-w-2xl">
      <EventsView
        proposals={proposals}
        upcoming={upcoming}
        past={past}
        isParent={member.role === "parent"}
      />
    </main>
  )
}
