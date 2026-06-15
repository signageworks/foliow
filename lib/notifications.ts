/**
 * Notification dispatch logic.
 *
 * When a user changes employer we:
 *  1. Close the current employment history row
 *  2. Open a new row
 *  3. Fan-out a notification to every follower
 *
 * This runs server-side (API route / Server Action).
 */
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  follows,
  notifications,
  employmentHistory,
  users,
} from "@/lib/db/schema";

interface EmployerChangeParams {
  userId: string;
  newEmployerId: string | null;
  newEmployerName: string;
}

export async function handleEmployerChange({
  userId,
  newEmployerId,
  newEmployerName,
}: EmployerChangeParams) {
  // 1. Close the previous current role
  await db
    .update(employmentHistory)
    .set({ isCurrent: false, endedAt: new Date() })
    .where(
      and(
        eq(employmentHistory.userId, userId),
        eq(employmentHistory.isCurrent, true)
      )
    );

  // 2. Open a new employment history row
  await db.insert(employmentHistory).values({
    userId,
    employerId: newEmployerId,
    employerName: newEmployerName,
    isCurrent: true,
  });

  // 3. Update the user's denormalised currentEmployerId
  await db
    .update(users)
    .set({
      currentEmployerId: newEmployerId,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  // 4. Fetch all follower IDs
  const followerRows = await db
    .select({ followerId: follows.followerId })
    .from(follows)
    .where(eq(follows.followingId, userId));

  if (followerRows.length === 0) return;

  // 5. Fan-out notifications (batch insert)
  await db.insert(notifications).values(
    followerRows.map(({ followerId }) => ({
      recipientId: followerId,
      type: "employer_changed" as const,
      data: {
        actorId: userId,
        newEmployerId,
        newEmployerName,
      },
    }))
  );
}
