import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"

type PeriodNavProps = {
  label: string
  previousHref: string
  previousLabel: string
  nextHref: string
  nextLabel: string
  // Link back to the current period, shown only when another period is displayed.
  currentHref: string
  currentLabel: string
  isCurrent: boolean
}

const iconLink = buttonVariants({ variant: "outline", className: "size-11" })

// Pure: the displayed period (a week or a month) and the links to the previous, next and current one.
function PeriodNav({
  label,
  previousHref,
  previousLabel,
  nextHref,
  nextLabel,
  currentHref,
  currentLabel,
  isCurrent,
}: PeriodNavProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-semibold tracking-tight">{label}</h1>
      <nav aria-label="Changer de période" className="flex items-center gap-2">
        <Link
          href={previousHref}
          aria-label={previousLabel}
          className={iconLink}
        >
          <ChevronLeft aria-hidden />
        </Link>
        {!isCurrent && (
          <Link
            href={currentHref}
            className={buttonVariants({
              variant: "outline",
              className: "h-11",
            })}
          >
            {currentLabel}
          </Link>
        )}
        <Link href={nextHref} aria-label={nextLabel} className={iconLink}>
          <ChevronRight aria-hidden />
        </Link>
      </nav>
    </div>
  )
}

export { PeriodNav }
