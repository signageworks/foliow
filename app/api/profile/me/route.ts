import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, employers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [user] = await db
    .select({
      name: users.name,
      bio: users.bio,
      city: users.city,
      tradeId: users.tradeId,
      avatarUrl: users.avatarUrl,
      currentEmployerId: users.currentEmployerId,
      currentEmployerName: employers.name,
    })
    .from(users)
    .leftJoin(employers, eq(users.currentEmployerId, employers.id))
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(user);
}
