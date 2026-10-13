import { MemberAvatar } from "@/components/member-avatar"
import type { MemberView } from "@/lib/members"

const ROLE_LABELS = { parent: "Parent", child: "Enfant" } as const

type MemberListProps = {
  members: MemberView[]
  // Optional slot under each member, e.g. management actions.
  renderActions?: (member: MemberView) => React.ReactNode
}

// Pure: shows exactly the fields it receives (the phone only arrives for parents).
function MemberList({ members, renderActions }: MemberListProps) {
  return (
    <ul className="divide-y divide-border">
      {members.map((member) => (
        <li key={member.id} className="flex flex-col gap-3 py-3">
          <div className="flex items-center gap-3">
            <MemberAvatar name={member.name} color={member.color} />
            <div className="min-w-0">
              <p className="truncate font-medium">{member.name}</p>
              <p className="text-sm text-muted-foreground">
                {ROLE_LABELS[member.role]}
                {member.phone ? ` · ${member.phone}` : ""}
              </p>
            </div>
          </div>
          {renderActions?.(member)}
        </li>
      ))}
    </ul>
  )
}

export { MemberList }
