import Link from "next/link"

import { getSessionMember } from "@/app/session"
import { FirstRun } from "@/components/first-run"
import { LinkRequired } from "@/components/link-required"
import { buttonVariants } from "@/components/ui/button"
import { hasFamily } from "@/lib/families"

export const metadata = { title: "Commencer" }

// The way in: create the family while none exists, otherwise ask for a personal link. A signed-in member is
// not redirected (the page refreshes right after the family is created and must keep the one-time link).
export default async function Page() {
  const member = await getSessionMember()
  const canCreate = !member && !(await hasFamily())

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
      <FirstRun canCreate={canCreate}>
        {member ? (
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
        ) : (
          <LinkRequired />
        )}
      </FirstRun>
    </main>
  )
}
