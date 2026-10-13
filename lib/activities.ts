import { db } from "@/lib/db"
import type { ActivityInput } from "@/lib/schemas"

// A member manages only their own activities, even a parent: every query filters on memberId, so
// another member's activity is simply "not found". Reading other members' activities (with the title
// of private ones hidden) is a separate, single function added with the week view.

export function createActivity(memberId: string, input: ActivityInput) {
  return db.activity.create({ data: { ...input, memberId } })
}

export function listOwnActivities(memberId: string) {
  return db.activity.findMany({
    where: { memberId },
    orderBy: { startsAt: "asc" },
  })
}

// Updates the whole series. Returns false when the member has no such activity.
export async function updateActivity(
  memberId: string,
  activityId: string,
  input: ActivityInput
) {
  const { count } = await db.activity.updateMany({
    where: { id: activityId, memberId },
    data: input,
  })
  return count > 0
}

// Deletes the whole series. Returns false when the member has no such activity.
export async function deleteActivity(memberId: string, activityId: string) {
  const { count } = await db.activity.deleteMany({
    where: { id: activityId, memberId },
  })
  return count > 0
}
