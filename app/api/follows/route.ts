import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { follows, users, notifications } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { targetUserId, action } = await req.json();
  if (!targetUserId || !action)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const followerId = session.user.id as string;

  if (action === "follow") {
    await db
      .insert(follows)
      .values({ followerId, followingId: targetUserId })
      .onConflictDoNothing();

    await db
      .update(users)
      .set({ followersCount: sql`${users.followersCount} + 1` })
      .where(eq(users.id, targetUserId));

    await db
      .update(users)
      .set({ followingCount: sql`${users.followingCount} + 1` })
      .where(eq(users.id, followerId));

    // Bildirim gonder
    const [actor] = await db
      .select({ name: users.name, username: users.username, avatarUrl: users.avatarUrl })
      .from(users)
      .where(eq(users.id, followerId))
      .limit(1);

    await db.insert(notifications).values({
      recipientId: targetUserId,
      type: "new_follower",
      data: {
        actorId: followerId,
        actorName: actor?.name ?? "Someone",
        actorUsername: actor?.username ?? "",
        actorAvatar: actor?.avatarUrl ?? "",
      },
    });
  } else {
    await db
      .delete(follows)
      .where(
        and(
          eq(follows.followerId, followerId),
          eq(follows.followingId, targetUserId)
        )
      );

    await db
      .update(users)
      .set({ followersCount: sql`GREATEST(${users.followersCount} - 1, 0)` })
      .where(eq(users.id, targetUserId));

    await db
      .update(users)
      .set({ followingCount: sql`GREATEST(${users.followingCount} - 1, 0)` })
      .where(eq(users.id, followerId));
  }

  return NextResponse.json({ success: true });
}
