import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { portfolioItems, users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { url, thumbnailUrl, caption, locationName, locationLat, locationLng } = await req.json();

  if (!url) return NextResponse.json({ error: "URL required" }, { status: 400 });

  const userId = session.user.id as string;

  const [item] = await db
    .insert(portfolioItems)
    .values({
      userId,
      type: "image",
      url,
      thumbnailUrl: thumbnailUrl ?? url,
      caption: caption ?? null,
      locationName: locationName ?? null,
      locationLat: locationLat ?? null,
      locationLng: locationLng ?? null,
    })
    .returning({ id: portfolioItems.id });

  // portfolioCount artır
  await db
    .update(users)
    .set({ portfolioCount: sql`${users.portfolioCount} + 1` })
    .where(eq(users.id, userId));

  return NextResponse.json({ success: true, id: item.id }, { status: 201 });
}
