import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { messages, conversations } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");
  if (!conversationId)
    return NextResponse.json({ error: "conversationId required" }, { status: 400 });

  const rows = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt))
    .limit(200);

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { conversationId, body } = await req.json();
  if (!conversationId || !body?.trim())
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const senderId = session.user.id as string;

  const [msg] = await db
    .insert(messages)
    .values({ conversationId, senderId, body: body.trim() })
    .returning();

  // Update lastMessageAt
  await db
    .update(conversations)
    .set({ lastMessageAt: new Date() })
    .where(eq(conversations.id, conversationId));

  return NextResponse.json(msg, { status: 201 });
}
