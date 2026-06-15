import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { stories, users } from "@/lib/db/schema";
import { eq, gt, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  const now = new Date();
  const rows = await db
    .select({
      id: stories.id,
      userId: stories.userId,
      mediaUrl: stories.mediaUrl,
      mediaType: stories.mediaType,
      expiresAt: stories.expiresAt,
      createdAt: stories.createdAt,
      userName: users.name,
      userUsername: users.username,
      userAvatar: users.avatarUrl,
    })
    .from(stories)
    .innerJoin(users, eq(stories.userId, users.id))
    .where(userId ? eq(stories.userId, userId) : gt(stories.expiresAt, now))
    .orderBy(desc(stories.createdAt))
    .limit(100);

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { mediaUrl, mediaType } = await req.json();
  if (!mediaUrl)
    return NextResponse.json({ error: "mediaUrl required" }, { status: 400 });

  const userId = session.user.id as string;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  const [story] = await db
    .insert(stories)
    .values({ userId, mediaUrl, mediaType: mediaType ?? "image", expiresAt })
    .returning();

  return NextResponse.json(story, { status: 201 });
}
