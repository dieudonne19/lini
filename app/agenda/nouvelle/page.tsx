import { redirect } from "next/navigation"

import { getSessionMember } from "@/app/session"
import { NewActivityPanel } from "@/components/new-activity-panel"

export const metadata = { title: "Ajouter une activité" }

export default async function Page() {
  if (!(await getSessionMember())) redirect("/")

  return (
    <main className="mx-auto flex w-full max-w-120 flex-1 flex-col gap-8 px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Ajouter une activité
      </h1>
      <NewActivityPanel />
    </main>
  )
}
