"use client"

import { usePathname } from "next/navigation"

import { AppNav } from "@/components/app-nav"

// Container: gives the pure navigation the current path.
export function AppNavContainer(props: {
  canManageFamily: boolean
  variant?: "top" | "bottom"
  className?: string
}) {
  return <AppNav currentPath={usePathname()} {...props} />
}
