import Link from "next/link"

import { getSessionMember } from "@/app/session"
import { FirstRun } from "@/components/first-run"
import { buttonVariants } from "@/components/ui/button"

export const metadata = { title: "Commencer" }

// The way in: a visitor creates their family. A signed-in member is not redirected (the page refreshes right after
// the family is created and must keep the one-time link and the recovery code).
export default async function Page() {
  const member = await getSessionMember()

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
      <FirstRun canCreate={!member}>
        <div className="flex flex-col items-start gap-4">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Tu es déjà connecté
          </h1>
          <Link
            href="/"
            className={buttonVariants({ size: "lg", className: "h-11" })}
          >
            Ouvrir la semaine
          </Link>
        </div>
      </FirstRun>
    </main>
  )
}
