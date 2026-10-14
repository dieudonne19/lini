"use client"

import { useActionState } from "react"
import { useRouter } from "next/navigation"

import { recoverAccess } from "@/app/secours/actions"
import { PersonalLinkCard } from "@/components/personal-link-card"
import { RecoverAccessForm } from "@/components/recover-access-form"
import { RecoveryCode } from "@/components/recovery-code"
import { useCopy } from "@/hooks/use-copy"
import { personalLink } from "@/lib/links"

// Container: the form, then, once the parent is signed in again, the new link and the new code (shown once).
// The same instance stays mounted across the refresh that follows the Server Action, so they stay on screen.
export function RecoverAccess() {
  const router = useRouter()
  const [state, action, pending] = useActionState(recoverAccess, null)
  const { copied, copy } = useCopy()

  if (state?.token && state.recoveryCode) {
    const link = personalLink(window.location.origin, state.token)
    return (
      <PersonalLinkCard
        title={`Bon retour, ${state.memberName}`}
        headingLevel="h1"
        link={link}
        copied={copied}
        onCopy={() => copy(link)}
        footer={<RecoveryCode code={state.recoveryCode} />}
        continueLabel="Ouvrir la semaine"
        onContinue={() => router.push("/")}
      >
        Ton ancien lien et ton ancien code ne fonctionnent plus. Voici ton
        nouveau lien et ton nouveau code : ils ne s&apos;afficheront plus,
        copie-les maintenant.
      </PersonalLinkCard>
    )
  }
  return (
    <RecoverAccessForm
      action={action}
      pending={pending}
      message={state?.message}
      name={state?.name}
    />
  )
}
