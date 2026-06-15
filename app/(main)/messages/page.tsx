import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { conversations, messages, users } from "@/lib/db/schema";
import { eq, or, desc } from "drizzle-orm";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage() {
  const session = await auth();
  const userId = session?.user?.id as string;

  // Get all conversations where user is participant
  const convRows = await db
    .select({
      id: conversations.id,
      participantAId: conversations.participantAId,
      participantBId: conversations.participantBId,
      lastMessageAt: conversations.lastMessageAt,
    })
    .from(conversations)
    .where(or(eq(conversations.participantAId, userId), eq(conversations.participantBId, userId)))
    .orderBy(desc(conversations.lastMessageAt))
    .limit(30);

  // For each conversation, get the other user's info + last message
  const convDetails = await Promise.all(
    convRows.map(async (c) => {
      const otherId = c.participantAId === userId ? c.participantBId : c.participantAId;
      const [otherUser] = await db
        .select({ id: users.id, name: users.name, username: users.username, avatarUrl: users.avatarUrl })
        .from(users)
        .where(eq(users.id, otherId))
        .limit(1);

      const [lastMsg] = await db
        .select({ body: messages.body, senderId: messages.senderId, createdAt: messages.createdAt, readAt: messages.readAt })
        .from(messages)
        .where(eq(messages.conversationId, c.id))
        .orderBy(desc(messages.createdAt))
        .limit(1);

      return { ...c, otherUser, lastMsg };
    })
  );

  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between px-4 h-14"
        style={{
          background: "rgba(10,10,10,0.9)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <h1 className="font-bold text-xl">Messages</h1>
        <Link
          href="/discover"
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/8 transition-colors text-muted"
          title="New message"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
        </Link>
      </div>

      {convDetails.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
            style={{
              background: "linear-gradient(135deg, rgba(255,90,31,0.15), rgba(255,90,31,0.05))",
              border: "1px solid rgba(255,90,31,0.2)",
              boxShadow: "0 0 40px rgba(255,90,31,0.1)",
            }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ff5a1f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">No messages yet</h2>
          <p className="text-muted text-sm max-w-xs mb-6 leading-relaxed">
            Start a conversation with a tradesperson you follow.
          </p>
          <Link
            href="/discover"
            className="font-semibold px-6 py-3 rounded-2xl text-white text-sm"
            style={{
              background: "linear-gradient(135deg, #ff5a1f, #ff3d00)",
              boxShadow: "0 0 20px rgba(255,90,31,0.4)",
            }}
          >
            Find people
          </Link>
        </div>
      ) : (
        <div>
          {convDetails.map(({ id, otherUser, lastMsg }) => {
            if (!otherUser) return null;
            const isUnread = lastMsg && lastMsg.senderId !== userId && !lastMsg.readAt;
            return (
              <Link
                key={id}
                href={`/messages/${otherUser.id}`}
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/4 transition-colors"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {otherUser.avatarUrl ? (
                    <img
                      src={otherUser.avatarUrl}
                      alt={otherUser.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-lg">
                      {otherUser.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {isUnread && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-accent border-2 border-background" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${isUnread ? "font-bold text-foreground" : "font-medium text-foreground/80"}`}>
                      {otherUser.username}
                    </span>
                    {lastMsg?.createdAt && (
                      <span className="text-[11px] text-muted flex-shrink-0 ml-2">
                        {formatDistanceToNow(new Date(lastMsg.createdAt), { addSuffix: false })}
                      </span>
                    )}
                  </div>
                  {lastMsg && (
                    <p className={`text-xs truncate mt-0.5 ${isUnread ? "text-foreground/80" : "text-muted"}`}>
                      {lastMsg.senderId === userId ? "You: " : ""}{lastMsg.body}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
