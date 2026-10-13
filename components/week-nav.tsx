import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"

type WeekNavProps = {
  label: string
  previousHref: string
  nextHref: string
  todayHref: string
  isCurrentWeek: boolean
}

const iconLink = buttonVariants({ variant: "outline", className: "size-11" })

// Pure: the displayed week and the links to the previous, next and current week.
function WeekNav({
  label,
  previousHref,
  nextHref,
  todayHref,
  isCurrentWeek,
}: WeekNavProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-semibold tracking-tight">{label}</h1>
      <nav aria-label="Changer de semaine" className="flex items-center gap-2">
        <Link
          href={previousHref}
          aria-label="Semaine précédente"
          className={iconLink}
        >
          <ChevronLeft aria-hidden />
        </Link>
        {!isCurrentWeek && (
          <Link
            href={todayHref}
            className={buttonVariants({
              variant: "outline",
              className: "h-11",
            })}
          >
            Aujourd&apos;hui
          </Link>
        )}
        <Link
          href={nextHref}
          aria-label="Semaine suivante"
          className={iconLink}
        >
          <ChevronRight aria-hidden />
        </Link>
      </nav>
    </div>
  )
}

export { WeekNav }
