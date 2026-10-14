import { ChevronRight } from "lucide-react"

import { MemberAvatar } from "@/components/member-avatar"
import type { MemberView } from "@/lib/members"
import { cn } from "@/lib/utils"

type MemberListProps = {
  members: MemberView[]
  currentMemberId: string
  // Opened under a member's row: what a parent can do with that member.
  renderActions: (member: MemberView) => React.ReactNode
  // The last row of the children: the way to add one.
  addChild: React.ReactNode
}

// The vertical line that joins the avatars. Every row carries its own piece, drawn behind the avatar: from the middle
// of the row (the first one) or from its top, down to the bottom of the row (the last one stops at its middle).
const RAIL =
  "relative before:absolute before:left-[17px] before:w-px before:bg-border"
const RAIL_FULL = cn(RAIL, "before:inset-y-0")
const RAIL_FROM_MIDDLE = cn(RAIL, "before:top-1/2 before:bottom-0")
const RAIL_TO_MIDDLE = cn(RAIL, "before:top-0 before:bottom-1/2")

// Pure: the family as a tree. "Parents" then "Enfants", each member a row that opens its management underneath, and
// the way to add a child at the end. Shows exactly the fields it receives (the phone only arrives for parents).
function MemberList({
  members,
  currentMemberId,
  renderActions,
  addChild,
}: MemberListProps) {
  const parents = members.filter((member) => member.role === "parent")
  const children = members.filter((member) => member.role === "child")

  const row = (member: MemberView, rail: string) => (
    <li key={member.id} className={rail}>
      <details className="group">
        <summary className="flex min-h-14 cursor-pointer list-none items-center gap-4 rounded-lg py-2 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
          <span className="relative flex">
            <MemberAvatar name={member.name} color={member.color} size="row" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="sr-only">Gérer </span>
            <span className="font-medium break-words">{member.name}</span>
            {member.id === currentMemberId && (
              <span className="ml-2 text-sm text-muted-foreground">(toi)</span>
            )}
            {member.phone && (
              <span className="block text-sm text-muted-foreground">
                {member.phone}
              </span>
            )}
          </span>
          <ChevronRight
            aria-hidden
            className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-90"
          />
        </summary>
        <div className="pb-4 pl-13">{renderActions(member)}</div>
      </details>
    </li>
  )

  return (
    <div className="flex flex-col">
      <h2 className="pl-13 text-xl font-semibold">Parents</h2>
      <ul className="mt-2">
        {parents.map((member, index) =>
          row(member, index === 0 ? RAIL_FROM_MIDDLE : RAIL_FULL)
        )}
      </ul>

      <div className={cn(RAIL_FULL, "pt-6 pl-13")}>
        <h2 className="text-xl font-semibold">Enfants</h2>
        <p className="mt-1 text-muted-foreground">
          Ils proposent des événements, et tu les valides ou les refuses.
        </p>
      </div>
      <ul className="mt-2">
        {children.map((member) => row(member, RAIL_FULL))}
        <li className={RAIL_TO_MIDDLE}>{addChild}</li>
      </ul>
    </div>
  )
}

export { MemberList }
