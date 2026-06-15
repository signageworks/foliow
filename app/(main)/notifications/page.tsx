import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifications, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { formatDistanceToNow } from "date-fns";
import { Heart, UserPlus, Star, Bell, MessageCircle } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = { title: "Notifications" };

function NotifIcon({ type }: { type: string }) {
  const base = "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0";
  if (type === "new_follower")
    return <div className={`${base} bg-blue-500/15`}><UserPlus size={17} className="text-blue-400" /></div>;
  if (type === "portfolio_liked")
    return <div className={`${base} bg-red-500/15`}><Heart size={17} className="text-red-400" fill="currentColor" /></div>;
  if (type === "review_received")
    return <div className={`${base} bg-yellow-500/15`}><Star size={17} className="text-yellow-400" fill="currentColor" /></div>;
  if (type === "new_comment")
    return <div className={`${base} bg-accent/15`}><MessageCircle size={17} className="text-accent" fill="currentColor" /></div>;
  return <div className={`${base} bg-white/5`}><Bell size={17} className="text-muted" /></div>;
}

function notifMessage(type: string, data: Record<string, string>): { text: string; href?: string } {
  switch (type) {
    case "new_follower":
      return {
        text: `${data.actorName ?? "Someone"} started following you.`,
        href: data.actorUsername ? `/${data.actorUsername}` : undefined,
      };
    case "portfolio_liked":
      return {
        text: `${data.actorName ?? "Someone"} liked your post.`,
        href: data.portfolioItemId ? `/post/${data.portfolioItemId}` : data.actorUsername ? `/${data.actorUsername}` : undefined,
      };
    case "review_received":
      return {
        text: `${data.actorName ?? "Someone"} left you a review.`,
        href: data.actorUsername ? `/${data.actorUsername}` : undefined,
      };
    case "new_comment":
      return {
        text: `${data.actorName ?? "Someone"} commented: "${data.commentPreview ?? ""}"`,
        href: data.portfolioItemId ? `/post/${data.portfolioItemId}` : undefined,
      };
    default:
      return { text: "You have a new notification." };
  }
}

export default async function NotificationsPage() {
  const session = await auth();
  const userId = session?.user?.id as string;

  const notifs = await db
    .select()
    .from(notifications)
    .where(eq(notifications.recipientId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(60);

  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <div
        className="sticky top-0 z-10 flex items-center gap-3 px-4 h-14"
        style={{
          background: "rgba(10,10,10,0.9)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Link
          href="/feed"
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/8 transition-colors text-muted hover:text-foreground"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </Link>
        <h1 className="font-bold text-xl">Notifications</h1>
      </div>

      {notifs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
            style={{
              background: "linear-gradient(135deg, rgba(255,90,31,0.15), rgba(255,90,31,0.05))",
              border: "1px solid rgba(255,90,31,0.2)",
              boxShadow: "0 0 40px rgba(255,90,31,0.1)",
            }}
          >
            <Bell size={32} className="text-accent" />
          </div>
          <h2 className="text-xl font-bold mb-2">No notifications yet</h2>
          <p className="text-muted text-sm max-w-xs leading-relaxed">
            When someone follows you, likes or comments on your work, you&apos;ll see it here.
          </p>
        </div>
      ) : (
        <div>
          {notifs.map((n) => {
            const data = (n.data ?? {}) as Record<string, string>;
            const { text, href } = notifMessage(n.type, data);
            const isUnread = !n.readAt;
            const timeAgo = formatDistanceToNow(new Date(n.createdAt), { addSuffix: true });

            const inner = (
              <div
                className={`flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-white/4 ${isUnread ? "bg-accent/4" : ""}`}
                style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
              >
                {/* Actor avatar or icon */}
                {data.actorAvatar ? (
                  <img
                    src={data.actorAvatar}
                    alt={data.actorName ?? ""}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    style={{ boxShadow: isUnread ? "0 0 0 2px rgba(255,90,31,0.5)" : "none" }}
                  />
                ) : (
                  <NotifIcon type={n.type} />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-snug ${isUnread ? "text-foreground" : "text-foreground/80"}`}>
                    {text}
                  </p>
                  <p className="text-xs text-muted mt-0.5">{timeAgo}</p>
                </div>
                {isUnread && (
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: "#ff5a1f", boxShadow: "0 0 6px rgba(255,90,31,0.7)" }}
                  />
                )}
              </div>
            );

            return href ? (
              <Link key={n.id} href={href} className="block">
                {inner}
              </Link>
            ) : (
              <div key={n.id}>{inner}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
