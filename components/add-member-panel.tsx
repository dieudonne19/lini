"use client"

import { useActionState } from "react"

import { addMember } from "@/app/famille/actions"
import { AddMemberForm } from "@/components/add-member-form"
import { PersonalLinkCard } from "@/components/personal-link-card"
import { useCopy } from "@/hooks/use-copy"
import { useOneTimeLink } from "@/hooks/use-one-time-link"
import { personalLink } from "@/lib/links"

// Container: the form, then the new member's one-time link until the parent moves on.
export function AddMemberPanel() {
  const [state, action, pending] = useActionState(addMember, null)
  const { copied, copy } = useCopy()
  const { visibleToken, dismiss } = useOneTimeLink(state?.token)

  if (visibleToken) {
    const link = personalLink(window.location.origin, visibleToken)
    return (
      <PersonalLinkCard
        title={`Lien de ${state?.memberName}`}
        link={link}
        copied={copied}
        onCopy={() => copy(link)}
        continueLabel="Ajouter un autre membre"
        onContinue={dismiss}
      >
        Envoie-lui ce lien : il ne s&apos;affichera plus. Quiconque l&apos;a est{" "}
        {state?.memberName}.
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
