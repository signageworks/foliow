import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { portfolioLikes, portfolioItems, notifications, users } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { portfolioItemId, action } = await req.json();
  if (!portfolioItemId || !action)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const userId = session.user.id as string;

  if (action === "like") {
    await db
      .insert(portfolioLikes)
      .values({ userId, portfolioItemId })
      .onConflictDoNothing();

    await db
      .update(portfolioItems)
      .set({ likesCount: sql`${portfolioItems.likesCount} + 1` })
      .where(eq(portfolioItems.id, portfolioItemId));

    // Bildirim gonder (kendi postunu begenmiyorsa)
    const [item] = await db
      .select({ userId: portfolioItems.userId })
      .from(portfolioItems)
      .where(eq(portfolioItems.id, portfolioItemId))
      .limit(1);

    if (item && item.userId !== userId) {
      const [actor] = await db
        .select({ name: users.name, username: users.username, avatarUrl: users.avatarUrl })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      await db.insert(notifications).values({
        recipientId: item.userId,
        type: "portfolio_liked",
        data: {
          actorId: userId,
          actorName: actor?.name ?? "Someone",
          actorUsername: actor?.username ?? "",
          actorAvatar: actor?.avatarUrl ?? "",
          portfolioItemId,
        },
      });
    }
  } else {
    await db
      .delete(portfolioLikes)
      .where(
        and(
          eq(portfolioLikes.userId, userId),
          eq(portfolioLikes.portfolioItemId, portfolioItemId)
        )
      );

    await db
      .update(portfolioItems)
      .set({ likesCount: sql`GREATEST(${portfolioItems.likesCount} - 1, 0)` })
      .where(eq(portfolioItems.id, portfolioItemId));
  }

  return NextResponse.json({ success: true });
}
