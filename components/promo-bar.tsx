import type { LucideIcon } from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils"

type PromoBarProps = {
  icon: LucideIcon
  // The sentence of the invitation.
  children: React.ReactNode
  // What the person can do right there: a button, or a link to another page. Absent when the sentence holds the steps.
  action?: {
    label: string
    onClick?: () => void
    href?: string
    pending?: boolean
  }
  onLater: () => void
  message?: string
  // "warning" is the soft orange of an important message (safety); "neutral" is the plain white strip.
  tone?: "neutral" | "warning"
}

// Pure: a thin strip across the whole width, just under the header, that invites the person to do one thing
// (add a second parent, turn on notifications, install the app): the sentence, the action as an underlined link, and
// "Plus tard" on the right. On hover the action takes a white background; the focus ring is the usual blue one.
function PromoBar({
  icon: Icon,
  children,
  action,
  onLater,
  message,
  tone = "neutral",
}: PromoBarProps) {
  const warning = tone === "warning"
  const actionClass = cn(
    "inline-flex min-h-11 items-center rounded-md px-2 font-semibold underline underline-offset-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50",
    warning ? "hover:bg-card" : "hover:no-underline"
  )

  return (
    <div
      className={cn(
        "border-b",
        warning ? "bg-warning text-warning-foreground" : "bg-card"
      )}
    >
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-2 gap-y-0 px-4 py-1">
        <div className="flex min-h-11 flex-1 items-center gap-3 sm:flex-none">
          <Icon aria-hidden className="size-5 shrink-0" />
          <p>{children}</p>
        </div>
        {action?.href ? (
          <Link href={action.href} className={actionClass}>
            {action.label}
          </Link>
        ) : (
          action && (
            <button
              type="button"
              onClick={action.onClick}
              disabled={action.pending}
              className={actionClass}
            >
              {action.pending ? "Un instant…" : action.label}
            </button>
          )
        )}
        <button
          type="button"
          onClick={onLater}
          className={cn(
            "ml-auto inline-flex min-h-11 items-center rounded-md px-2 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
            warning
              ? "hover:underline"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Plus tard
        </button>
      </div>
      {message && (
        <p
          role="alert"
          className="mx-auto w-full max-w-5xl px-4 pb-2 text-sm font-medium text-destructive"
        >
          {message}
        </p>
      )}
    </div>
  )
}

export { PromoBar }
