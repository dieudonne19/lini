"use client"

import { useRouter } from "next/navigation"
import { useActionState } from "react"

import { createFamily } from "@/app/actions"
import { CreateFamilyForm } from "@/components/create-family-form"
import { PersonalLinkCard } from "@/components/personal-link-card"
import { RecoveryCode } from "@/components/recovery-code"
import { useCopy } from "@/hooks/use-copy"
import { personalLink } from "@/lib/links"

// Container: picks the screen and wires state to the presentational components.
// Creation form while no family exists, the one-time link right after creation, `children` otherwise.
// One instance keeps the link on screen across the refresh that follows the Server Action.
export function FirstRun({
  canCreate,
  children,
}: {
  canCreate: boolean
  children: React.ReactNode
}) {
  const router = useRouter()
  const [state, action, pending] = useActionState(createFamily, null)
  const { copied, copy } = useCopy()

  if (state?.token) {
    const link = personalLink(window.location.origin, state.token)
    // The page behind is the (wide) week by now: keep the card in a narrow column.
    return (
      <div className="mx-auto w-full max-w-md py-8">
        <PersonalLinkCard
          title="Ta famille est créée"
          headingLevel="h1"
          link={link}
          copied={copied}
          onCopy={() => copy(link)}
          footer={
            state.recoveryCode && <RecoveryCode code={state.recoveryCode} />
          }
          continueLabel="Ouvrir la semaine"
          onContinue={() => router.push("/")}
        >
          Voici ton lien personnel. Il te connecte sans mot de passe. Voici
          aussi ton code de secours, pour le jour où tu le perds. Ni l&apos;un
          ni l&apos;autre ne s&apos;affichera plus : copie-les maintenant.
          Quiconque a ce lien est toi, ne le partage pas.
        </PersonalLinkCard>
      </div>
    )
  }
  if (!canCreate) return children
  return <CreateFamilyForm action={action} pending={pending} state={state} />
}
