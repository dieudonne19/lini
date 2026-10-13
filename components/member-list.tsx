import { MemberAvatar } from "@/components/member-avatar"
import type { MemberView } from "@/lib/members"

const ROLE_LABELS = { parent: "Parent", child: "Enfant" } as const

// Pure: shows exactly the fields it receives (the phone only arrives for parents).
function MemberList({ members }: { members: MemberView[] }) {
  return (
    <ul className="divide-y divide-border">
      {members.map(({ id, name, color, role, phone }) => (
        <li key={id} className="flex items-center gap-3 py-3">
          <MemberAvatar name={name} color={color} />
          <div className="min-w-0">
            <p className="truncate font-medium">{name}</p>
            <p className="text-sm text-muted-foreground">
              {ROLE_LABELS[role]}
              {phone ? ` · ${phone}` : ""}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}

export { MemberList }
