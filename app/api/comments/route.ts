import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { comments, portfolioItems, notifications, users } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("postId");
  if (!postId) return NextResponse.json({ error: "postId required" }, { status: 400 });

  const rows = await db
    .select({
      id: comments.id,
      body: comments.body,
      createdAt: comments.createdAt,
      userId: comments.userId,
      userName: users.name,
      userUsername: users.username,
      userAvatar: users.avatarUrl,
    })
    .from(comments)
    .innerJoin(users, eq(comments.userId, users.id))
    .where(eq(comments.portfolioItemId, postId))
    .orderBy(desc(comments.createdAt))
    .limit(50);

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { portfolioItemId, body } = await req.json();
  if (!portfolioItemId || !body?.trim())
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const userId = session.user.id as string;

  const [comment] = await db
    .insert(comments)
    .values({ portfolioItemId, userId, body: body.trim() })
    .returning();

  // Increment commentsCount
  await db
    .update(portfolioItems)
    .set({ commentsCount: sql`${portfolioItems.commentsCount} + 1` })
    .where(eq(portfolioItems.id, portfolioItemId));

  // Send notification to post owner (not self)
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
      type: "new_comment",
      data: {
        actorId: userId,
        actorName: actor?.name ?? "Someone",
        actorUsername: actor?.username ?? "",
        actorAvatar: actor?.avatarUrl ?? "",
        portfolioItemId,
        commentPreview: body.trim().slice(0, 60),
      },
    });
  }

  return NextResponse.json(comment, { status: 201 });
}
