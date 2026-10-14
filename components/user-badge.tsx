import { LogOut } from "lucide-react"

import { MemberAvatar } from "@/components/member-avatar"
import { Button } from "@/components/ui/button"
import type { Role } from "@/lib/generated/prisma/client"

const ROLE_LABELS: Record<Role, string> = { parent: "Parent", child: "Enfant" }

type UserBadgeProps = {
  name: string
  color: string
  role: Role
  logoutAction: () => void
}

// Pure: who is signed in on this device (avatar in their color, name, role) and the way to sign out.
function UserBadge({ name, color, role, logoutAction }: UserBadgeProps) {
  return (
    <div className="flex items-center gap-2">
      <MemberAvatar name={name} color={color} />
      <p className="leading-tight">
        <span className="block max-w-28 truncate text-sm font-semibold sm:max-w-40">
          {name}
        </span>
        <span className="block text-xs text-muted-foreground">
          {ROLE_LABELS[role]}
        </span>
      </p>
      <form action={logoutAction}>
        <Button
          type="submit"
          variant="ghost"
          size="icon-lg"
          aria-label="Se déconnecter"
          title="Se déconnecter"
          className="text-muted-foreground"
        >
          <LogOut aria-hidden />
        </Button>
      </form>
    </div>
  )
}

export { UserBadge }
