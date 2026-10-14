"use client"

import { useActionState } from "react"
import { LifeBuoy, X } from "lucide-react"

import { renewRecoveryCode } from "@/app/famille/actions"
import { RecoveryCode } from "@/components/recovery-code"
import { Button } from "@/components/ui/button"
import { useOneTimeLink } from "@/hooks/use-one-time-link"

// Container: says whether the family has a recovery code, and makes a new one (which replaces the old one).
// The new code is shown once, until the parent closes it.
export function RecoveryCodePanel({ hasCode }: { hasCode: boolean }) {
  const [state, action, pending] = useActionState(renewRecoveryCode, null)
  const { visibleToken: code, dismiss } = useOneTimeLink(state?.code)

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground">
        {hasCode
          ? "Un code de secours existe. En générer un nouveau remplace l'ancien."
          : "Aucun code de secours pour l'instant. Sans lui, personne ne peut te redonner l'accès si tu perds ton lien."}
      </p>
      {state?.message && (
        <p
          role="alert"
          className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
        >
          {state.message}
        </p>
      )}
      {code && (
        <div className="relative rounded-lg bg-primary/10 p-4 ring-1 ring-primary/20 sm:p-5">
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            aria-label="Fermer"
            onClick={dismiss}
            className="absolute top-2 right-2 text-muted-foreground"
          >
            <X aria-hidden />
          </Button>
          <div className="flex flex-col gap-4">
            <h3 className="pr-10 font-heading text-lg leading-snug font-semibold sm:text-xl">
              Ton nouveau code de secours
            </h3>
            <RecoveryCode code={code} />
          </div>
        </div>
      )}
      <form action={action}>
        <Button
          type="submit"
          variant="outline"
          size="lg"
          className="h-11"
          disabled={pending}
        >
          <LifeBuoy aria-hidden />
          {pending
            ? "Génération…"
            : hasCode
              ? "Générer un nouveau code"
              : "Générer un code de secours"}
        </Button>
      </form>
    </div>
  )
}
