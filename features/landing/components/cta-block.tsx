import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CTA_HREF, CTA_LABEL, CTA_MICRO } from "../data/content"

/** L'unique bouton principal de la page, avec sa ligne de réassurance. */
export function CtaBlock({
  onDark,
  className,
}: {
  onDark?: boolean
  className?: string
}) {
  return (
    <div className={className}>
      <Link
        href={CTA_HREF}
        className={buttonVariants({
          className: "h-12 w-full px-6 text-base font-semibold md:w-auto",
        })}
      >
        {CTA_LABEL}
      </Link>
      <p
        className={cn(
          "mt-3.5 text-sm",
          onDark ? "text-background/80" : "text-muted-foreground"
        )}
      >
        {CTA_MICRO}
      </p>
    </div>
  )
}
