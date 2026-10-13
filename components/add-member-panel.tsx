"use client"

import { useActionState, useState } from "react"

import { addMember } from "@/app/famille/actions"
import { AddMemberForm } from "@/components/add-member-form"
import { PersonalLinkCard } from "@/components/personal-link-card"
import { useCopy } from "@/hooks/use-copy"
import { personalLink } from "@/lib/links"

// Container: the form, then the new member's one-time link until the parent moves on.
export function AddMemberPanel() {
  const [state, action, pending] = useActionState(addMember, null)
  const { copied, copy } = useCopy()
  const [dismissedToken, setDismissedToken] = useState<string>()

  if (state?.token && state.token !== dismissedToken) {
    const link = personalLink(window.location.origin, state.token)
    return (
      <PersonalLinkCard
        title={`Lien de ${state.memberName}`}
        link={link}
        copied={copied}
        onCopy={() => copy(link)}
        continueLabel="Ajouter un autre membre"
        onContinue={() => setDismissedToken(state.token)}
      >
        Envoie-lui ce lien : il ne s&apos;affichera plus. Quiconque l&apos;a est{" "}
        {state.memberName}.
      </PersonalLinkCard>
    )
  }
  return (
    <AddMemberForm
      action={action}
      pending={pending}
      state={state?.token ? null : state}
    />
  )
}
