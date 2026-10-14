import { redirect } from "next/navigation"

import { getSessionMember } from "@/app/session"
import { NewActivityPanel } from "@/components/new-activity-panel"

export default async function Page() {
  if (!(await getSessionMember())) redirect("/")

  return (
    <main className="mx-auto flex flex-1 w-full max-w-5xl flex-col gap-8 px-4 py-10 *:max-w-md">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Ajouter une activité
      </h1>
      <NewActivityPanel />
    </main>
  )
}
