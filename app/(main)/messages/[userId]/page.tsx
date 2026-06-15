import { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { conversations, messages, users } from "@/lib/db/schema";
import { eq, or, and, desc } from "drizzle-orm";
import ChatWindow from "@/components/ChatWindow";

export const metadata: Metadata = { title: "Chat" };

interface Props {
  params: Promise<{ userId: string }>;
}

export default async function ChatPage({ params }: Props) {
  const { userId: otherUserId } = await params;
  const session = await auth();
  const myId = session?.user?.id as string;

  if (otherUserId === myId) notFound();

  const [otherUser] = await db
    .select({ id: users.id, name: users.name, username: users.username, avatarUrl: users.avatarUrl })
    .from(users)
    .where(eq(users.id, otherUserId))
    .limit(1);

  if (!otherUser) notFound();

  // Find or get conversation
  const [conv] = await db
    .select()
    .from(conversations)
    .where(
      or(
        and(eq(conversations.participantAId, myId), eq(conversations.participantBId, otherUserId)),
        and(eq(conversations.participantAId, otherUserId), eq(conversations.participantBId, myId))
      )
    )
    .limit(1);

  let convId = conv?.id;
  if (!convId) {
    // Create conversation
    const [newConv] = await db
      .insert(conversations)
      .values({ participantAId: myId, participantBId: otherUserId })
      .returning();
    convId = newConv.id;
  }

  const initialMessages = await db
    .select({
      id: messages.id,
      body: messages.body,
      senderId: messages.senderId,
      createdAt: messages.createdAt,
      readAt: messages.readAt,
    })
    .from(messages)
    .where(eq(messages.conversationId, convId))
    .orderBy(desc(messages.createdAt))
    .limit(100);

  return (
    <ChatWindow
      conversationId={convId}
      myId={myId}
      otherUser={otherUser}
      initialMessages={initialMessages.reverse()}
    />
  );
}
