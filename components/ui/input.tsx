import { cn } from "@/lib/utils"

// `invalid` sets aria-invalid; the caller links the error message with aria-describedby.
function Input({ className, invalid, ...props }: React.ComponentProps<"input"> & { invalid?: boolean }) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={cn(
        "h-11 w-full rounded-lg border border-input bg-card px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
