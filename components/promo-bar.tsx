import type { LucideIcon } from "lucide-react"

type PromoBarProps = {
  icon: LucideIcon
  // The sentence of the invitation.
  children: React.ReactNode
  // What the person can do right there. Absent when the sentence itself holds the steps.
  action?: { label: string; onClick: () => void; pending?: boolean }
  onLater: () => void
  message?: string
}

// Pure: a thin strip across the whole width, just under the header, that invites the person to do one thing
// (turn on notifications, install the app): the sentence, the action as a link, and "Plus tard" on the right.
function PromoBar({
  icon: Icon,
  children,
  action,
  onLater,
  message,
}: PromoBarProps) {
  return (
    <div className="border-b bg-card">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-4 gap-y-0 px-4 py-1">
        <div className="flex min-h-11 flex-1 items-center gap-3 sm:flex-none">
          <Icon aria-hidden className="size-5 shrink-0" />
          <p>{children}</p>
        </div>
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            disabled={action.pending}
            className="inline-flex min-h-11 items-center rounded-md font-semibold underline underline-offset-4 outline-none hover:no-underline focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
          >
            {action.pending ? "Un instant…" : action.label}
          </button>
        )}
        <button
          type="button"
          onClick={onLater}
          className="ml-auto inline-flex min-h-11 items-center rounded-md text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
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
