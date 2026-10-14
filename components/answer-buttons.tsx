import { AnswerIcon } from "@/components/answer-icon"
import { ANSWER_LABELS } from "@/lib/event-labels"
import type { RsvpStatus } from "@/lib/generated/prisma/client"
import { cn } from "@/lib/utils"

type AnswerButtonsProps = {
  current: RsvpStatus
  // A form action: the button that is pressed carries the answer.
  action: (formData: FormData) => void
  pending: boolean
}

// Pure: "Je viens", "Je ne viens pas", "Peut-être" as one segmented control on a white track. The current answer is
// filled and announced as pressed, so it does not rely on color alone. On a narrow screen the icon sits above the words.
function AnswerButtons({ current, action, pending }: AnswerButtonsProps) {
  return (
    <form
      action={action}
      className="grid grid-cols-3 gap-1 rounded-lg bg-card p-1"
    >
      {(Object.keys(ANSWER_LABELS) as (keyof typeof ANSWER_LABELS)[]).map(
        (answer) => (
          <button
            key={answer}
            type="submit"
            name="answer"
            value={answer}
            aria-pressed={current === answer}
            disabled={pending}
            className={cn(
              "flex min-h-12 flex-col items-center justify-center gap-1 rounded-md px-2 py-2 text-center text-sm leading-tight font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 sm:flex-row sm:gap-2 sm:text-base",
              current === answer
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )}
          >
            <AnswerIcon status={answer} className="size-5" />
            {ANSWER_LABELS[answer]}
          </button>
        )
      )}
    </form>
  )
}

export { AnswerButtons }
