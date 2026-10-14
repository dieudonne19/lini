"use client"

import { useActionState } from "react"

import { manageMember } from "@/app/famille/actions"
import { MemberActions } from "@/components/member-actions"
import { MemberList } from "@/components/member-list"
import { PersonalLinkCard } from "@/components/personal-link-card"
import { SecondParentBanner } from "@/components/second-parent-banner"
import { useCopy } from "@/hooks/use-copy"
import { useOneTimeLink } from "@/hooks/use-one-time-link"
import { personalLink } from "@/lib/links"
import type { MemberView } from "@/lib/members"

type ManageMembersProps = {
  members: MemberView[]
  currentMemberId: string
}

// Container: the member list with management actions, the second-parent banner and regenerated links.
export function ManageMembers({
  members,
  currentMemberId,
}: ManageMembersProps) {
  const [state, action, pending] = useActionState(manageMember, null)
  const { copied, copy } = useCopy()
  const { visibleToken, dismiss } = useOneTimeLink(state?.token)
  const parentCount = members.filter((m) => m.role === "parent").length
  const newLink = visibleToken
    ? personalLink(window.location.origin, visibleToken)
    : undefined

  return (
    <div className="flex flex-col gap-6">
      {parentCount === 1 && <SecondParentBanner />}
      {state?.message && (
        <p
          role="alert"
          className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
        >
          {state.message}
        </p>
      )}
      {newLink && (
        <PersonalLinkCard
          title={`Nouveau lien de ${state?.memberName}`}
          link={newLink}
          copied={copied}
          onCopy={() => copy(newLink)}
          onDismiss={dismiss}
        >
          L&apos;ancien lien ne fonctionne plus. Envoie-lui ce nouveau lien : il
          ne s&apos;affichera plus.
        </PersonalLinkCard>
      )}
      <MemberList
        members={members}
        renderActions={(member) => (
          <MemberActions
            member={member}
            isLastParent={member.role === "parent" && parentCount === 1}
            isSelf={member.id === currentMemberId}
            action={action}
            pending={pending}
          />
        )}
      />
    </div>
  )
}
