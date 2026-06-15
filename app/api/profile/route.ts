import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, bio, city, tradeId, avatarUrl } = body;

  if (!name || name.trim().length === 0) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {
    name: name.trim(),
    bio: bio?.trim() || null,
    city: city?.trim() || null,
    tradeId: tradeId || null,
    updatedAt: new Date(),
  };

  if (avatarUrl) {
    updateData.avatarUrl = avatarUrl;
  }

  await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, session.user.id));

  return NextResponse.json({ ok: true });
}
