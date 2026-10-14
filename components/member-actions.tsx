import { Button } from "@/components/ui/button"
import type { MemberView } from "@/lib/members"

type MemberActionsProps = {
  member: MemberView
  // True when this member is the family's only parent: they cannot be removed or made a child.
  isLastParent: boolean
  // True when this member is the one using the app.
  isSelf: boolean
  action: (formData: FormData) => void
  pending: boolean
}

const OPTION_CLASS = "h-11 justify-start"

// Pure: native <details> disclosures, so no state is needed. The submit buttons carry the intent.
function MemberActions({
  member,
  isLastParent,
  isSelf,
  action,
  pending,
}: MemberActionsProps) {
  const makeParent = member.role === "child"
  return (
    <details>
      <summary className="inline-flex h-11 cursor-pointer items-center text-sm font-medium underline-offset-4 hover:underline">
        Gérer {member.name}
      </summary>
      <form action={action} className="mt-2 flex flex-col gap-2">
        <input type="hidden" name="memberId" value={member.id} />
        <Button
          type="submit"
          name="intent"
          value="regenerate"
          variant="outline"
          className={OPTION_CLASS}
          disabled={pending}
        >
          Régénérer le lien
        </Button>
        {isLastParent ? (
          <p className="text-sm text-muted-foreground">
            {member.name} est le seul parent : ajoute d&apos;abord un deuxième
            parent pour pouvoir le retirer ou le passer en enfant.
          </p>
        ) : (
          <>
            <Button
              type="submit"
              name="intent"
              value={makeParent ? "make-parent" : "make-child"}
              variant="outline"
              className={OPTION_CLASS}
              disabled={pending}
            >
              {makeParent ? "Passer en parent" : "Passer en enfant"}
            </Button>
            <details>
              <summary className="inline-flex h-11 cursor-pointer items-center text-sm font-medium text-destructive underline-offset-4 hover:underline">
                Retirer de la famille
              </summary>
              <div className="mt-2 flex flex-col gap-3 rounded-lg bg-destructive/10 p-3">
                <p className="text-sm">
                  Retirer {member.name} supprime ses activités, ses propositions
                  et ses réponses. Son lien ne fonctionnera plus.
                  {isSelf ? " Tu perdras aussi ton propre accès." : ""} Cette
                  action est définitive.
                </p>
                <Button
                  type="submit"
                  name="intent"
                  value="remove"
                  variant="destructive"
                  className={OPTION_CLASS}
                  disabled={pending}
                >
                  Retirer {member.name}
                </Button>
              </div>
            </details>
          </>
        )}
      </form>
    </details>
  )
}

export { MemberActions }
