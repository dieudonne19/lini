"use client"

import { useActionState } from "react"

import { createFamily } from "@/app/actions"
import { CreateFamilyForm } from "@/components/create-family-form"
import { PersonalLinkCard } from "@/components/personal-link-card"
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
  const [state, action, pending] = useActionState(createFamily, null)
  const { copied, copy } = useCopy()

  if (state?.token) {
    const link = personalLink(window.location.origin, state.token)
    return (
      <PersonalLinkCard
        title="Ta famille est créée"
        headingLevel="h1"
        link={link}
        copied={copied}
        onCopy={() => copy(link)}
        continueLabel="Ouvrir l'agenda"
        onContinue={() => window.location.reload()}
      >
        Voici ton lien personnel. Il te connecte sans mot de passe et ne
        s&apos;affichera plus : copie-le maintenant. Quiconque a ce lien est
        toi, ne le partage pas.
      </PersonalLinkCard>
    )
  }
  if (!canCreate) return children
  return <CreateFamilyForm action={action} pending={pending} state={state} />
}
