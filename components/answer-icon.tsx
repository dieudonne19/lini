import { CircleCheck, CircleHelp, CircleX, Hourglass } from "lucide-react"

import type { RsvpStatus } from "@/lib/generated/prisma/client"
import { cn } from "@/lib/utils"

const ICONS = {
  yes: CircleCheck,
  maybe: CircleHelp,
  no: CircleX,
  pending: Hourglass,
} as const

// Pure: the icon of an answer to an event. Decorative: the answer is always written next to it.
function AnswerIcon({
  status,
  className,
}: {
  status: RsvpStatus
  className?: string
}) {
  const Icon = ICONS[status]
  return <Icon aria-hidden className={cn("shrink-0", className)} />
}

export { AnswerIcon }
