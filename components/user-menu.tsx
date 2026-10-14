"use client"

import { ChevronDown, LogOut } from "lucide-react"

import { MemberAvatar } from "@/components/member-avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Role } from "@/lib/generated/prisma/client"

const ROLE_LABELS: Record<Role, string> = { parent: "Parent", child: "Enfant" }

type UserMenuProps = {
  name: string
  color: string
  role: Role
  logoutAction: () => void
}

// Who is signed in on this device (avatar, name, role), as the button of a menu. The menu repeats the user's
// card and holds the account actions. Settings, help and the way back to the landing page go here, as
// <DropdownMenuItem render={<Link href="…" />}> before the separator, when their pages exist.
function UserMenu({ name, color, role, logoutAction }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Menu de ${name}`}
        className="group flex min-h-11 items-center gap-2 rounded-lg px-1.5 py-1 transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:bg-muted"
      >
        <MemberAvatar name={name} color={color} />
        <span className="text-left leading-tight">
          <span className="block max-w-28 truncate text-sm font-semibold sm:max-w-40">
            {name}
          </span>
          <span className="block text-xs text-muted-foreground">
            {ROLE_LABELS[role]}
          </span>
        </span>
        <ChevronDown
          aria-hidden
          className="size-4 text-muted-foreground transition-transform group-data-[popup-open]:rotate-180"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="flex items-center gap-3 p-3">
          <MemberAvatar name={name} color={color} />
          <p className="min-w-0 leading-tight">
            <span className="block truncate font-semibold">{name}</span>
            <span className="block text-sm text-muted-foreground">
              {ROLE_LABELS[role]}
            </span>
          </p>
        </div>
        <DropdownMenuSeparator />
        {/* The menu must not close on click: it would remove the form before the browser submits it. */}
        <form action={logoutAction}>
          <DropdownMenuItem
            render={<button type="submit" />}
            nativeButton
            closeOnClick={false}
            className="min-h-11 w-full text-base"
          >
            <LogOut aria-hidden />
            Se déconnecter
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { UserMenu }
