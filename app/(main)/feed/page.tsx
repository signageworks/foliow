import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { portfolioItems, users, follows, portfolioLikes, stories } from "@/lib/db/schema";
import { eq, inArray, desc, gt, ne } from "drizzle-orm";
import FeedCard from "@/components/FeedCard";
import StoriesBar from "@/components/StoriesBar";
import Link from "next/link";
import { Bell } from "lucide-react";

export const metadata: Metadata = { title: "Feed" };

export default async function FeedPage() {
  const session = await auth();
  const userId = session?.user?.id as string;

  const followedRows = await db
    .select({ followingId: follows.followingId })
    .from(follows)
    .where(eq(follows.followerId, userId));

  const followedIds = followedRows.map((r) => r.followingId);

  // Fetch posts: from followed users, or trending if no follows
  const posts =
    followedIds.length > 0
      ? await db
          .select({
            id: portfolioItems.id,
            url: portfolioItems.url,
            thumbnailUrl: portfolioItems.thumbnailUrl,
            caption: portfolioItems.caption,
            createdAt: portfolioItems.createdAt,
            likesCount: portfolioItems.likesCount,
            commentsCount: portfolioItems.commentsCount,
            locationName: portfolioItems.locationName,
            locationLat: portfolioItems.locationLat,
            locationLng: portfolioItems.locationLng,
            userId: portfolioItems.userId,
            userName: users.name,
            userUsername: users.username,
            userAvatar: users.avatarUrl,
          })
          .from(portfolioItems)
          .innerJoin(users, eq(portfolioItems.userId, users.id))
          .where(inArray(portfolioItems.userId, followedIds))
          .orderBy(desc(portfolioItems.createdAt))
          .limit(30)
      : await db
          .select({
            id: portfolioItems.id,
            url: portfolioItems.url,
            thumbnailUrl: portfolioItems.thumbnailUrl,
            caption: portfolioItems.caption,
            createdAt: portfolioItems.createdAt,
            likesCount: portfolioItems.likesCount,
            commentsCount: portfolioItems.commentsCount,
            locationName: portfolioItems.locationName,
            locationLat: portfolioItems.locationLat,
            locationLng: portfolioItems.locationLng,
            userId: portfolioItems.userId,
            userName: users.name,
            userUsername: users.username,
            userAvatar: users.avatarUrl,
          })
          .from(portfolioItems)
          .innerJoin(users, eq(portfolioItems.userId, users.id))
          .where(ne(portfolioItems.userId, userId))
          .orderBy(desc(portfolioItems.likesCount), desc(portfolioItems.createdAt))
          .limit(30);

  const likedRows =
    posts.length > 0
      ? await db
          .select({ portfolioItemId: portfolioLikes.portfolioItemId })
          .from(portfolioLikes)
          .where(eq(portfolioLikes.userId, userId))
      : [];

  const likedSet = new Set(likedRows.map((r) => r.portfolioItemId));
  const postsWithLiked = posts.map((p) => ({ ...p, liked: likedSet.has(p.id) }));

  // Active stories (not expired) from followed users + self
  const now = new Date();
  const storyUserIds = [...followedIds, userId];
  const activeStories = storyUserIds.length > 0
    ? await db
        .select({
          id: stories.id,
          userId: stories.userId,
          mediaUrl: stories.mediaUrl,
          mediaType: stories.mediaType,
          expiresAt: stories.expiresAt,
          userName: users.name,
          userUsername: users.username,
          userAvatar: users.avatarUrl,
        })
        .from(stories)
        .innerJoin(users, eq(stories.userId, users.id))
        .where(inArray(stories.userId, storyUserIds))
        .orderBy(desc(stories.createdAt))
        .limit(50)
    : [];

  // Group stories by user (most recent story per user)
  const storyMap = new Map<string, typeof activeStories[0]>();
  for (const s of activeStories) {
    if (new Date(s.expiresAt) > now && !storyMap.has(s.userId)) {
      storyMap.set(s.userId, s);
    }
  }
  const storyUsers = Array.from(storyMap.values());

  const isTrending = followedIds.length === 0 && postsWithLiked.length > 0;

  return (
    <div className="max-w-xl mx-auto">
      {/* Top bar — glassmorphism */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between px-4 h-14"
        style={{
          background: "rgba(10,10,10,0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <span
          className="font-black text-2xl tracking-tight"
          style={{
            background: "linear-gradient(90deg, #ff5a1f, #ff9a5c)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          foliow
        </span>
        <div className="flex items-center gap-1">
          <Link
            href="/notifications"
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/8 transition-colors text-muted hover:text-foreground"
          >
            <Bell size={22} strokeWidth={1.8} />
          </Link>
        </div>
      </div>

      {/* Stories */}
      {storyUsers.length > 0 && (
        <StoriesBar stories={storyUsers} currentUserId={userId} />
      )}

      {/* Trending label */}
      {isTrending && (
        <div className="px-4 py-2 flex items-center gap-2">
          <div className="h-px flex-1 bg-white/5" />
          <span className="text-xs text-muted font-medium tracking-wider uppercase">Trending work</span>
          <div className="h-px flex-1 bg-white/5" />
        </div>
      )}

      {postsWithLiked.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center px-6">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
            style={{
              background: "linear-gradient(135deg, rgba(255,90,31,0.15), rgba(255,90,31,0.05))",
              border: "1px solid rgba(255,90,31,0.2)",
              boxShadow: "0 0 40px rgba(255,90,31,0.1)",
            }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ff5a1f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Discover tradespeople</h2>
          <p className="text-muted text-sm max-w-xs mb-6 leading-relaxed">
            Follow tradespeople to see their latest work here.
          </p>
          <Link
            href="/discover"
            className="font-semibold px-6 py-3 rounded-2xl text-white text-sm transition-all"
            style={{
              background: "linear-gradient(135deg, #ff5a1f, #ff3d00)",
              boxShadow: "0 0 20px rgba(255,90,31,0.4), 0 4px 12px rgba(0,0,0,0.3)",
            }}
          >
            Discover tradespeople
          </Link>
        </div>
      ) : (
        <div>
          {postsWithLiked.map((post) => (
            <FeedCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
