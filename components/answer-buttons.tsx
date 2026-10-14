import { AnswerIcon } from "@/components/answer-icon"
import { Button } from "@/components/ui/button"
import { ANSWER_LABELS } from "@/lib/event-labels"
import type { RsvpStatus } from "@/lib/generated/prisma/client"

type AnswerButtonsProps = {
  current: RsvpStatus
  // A form action: the button that is pressed carries the answer.
  action: (formData: FormData) => void
  pending: boolean
}

// Pure: "Je viens", "Je ne viens pas", "Peut-être". The current answer is filled and announced as pressed,
// so it does not rely on color alone.
function AnswerButtons({ current, action, pending }: AnswerButtonsProps) {
  return (
    <form action={action} className="flex flex-wrap gap-2">
      {(Object.keys(ANSWER_LABELS) as (keyof typeof ANSWER_LABELS)[]).map(
        (answer) => (
          <Button
            key={answer}
            type="submit"
            name="answer"
            value={answer}
            variant={current === answer ? "default" : "outline"}
            aria-pressed={current === answer}
            className="h-11"
            disabled={pending}
          >
            <AnswerIcon status={answer} />
            {ANSWER_LABELS[answer]}
          </Button>
        )
      )}
    </form>
  )
}

export { AnswerButtons }
