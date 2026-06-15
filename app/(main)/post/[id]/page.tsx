import { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { portfolioItems, users, portfolioLikes, comments } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { MapPin } from "lucide-react";
import LikeButton from "@/components/LikeButton";
import CommentSection from "@/components/CommentSection";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Post" };

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user?.id as string;

  const [post] = await db
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
    .where(eq(portfolioItems.id, id))
    .limit(1);

  if (!post) notFound();

  const [likeRow] = userId
    ? await db
        .select({ portfolioItemId: portfolioLikes.portfolioItemId })
        .from(portfolioLikes)
        .where(eq(portfolioLikes.userId, userId))
        .limit(1)
    : [null];

  const liked = !!likeRow;

  const postComments = await db
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
    .where(eq(comments.portfolioItemId, id))
    .orderBy(desc(comments.createdAt))
    .limit(100);

  const mapUrl = post.locationLat && post.locationLng
    ? `https://www.google.com/maps/search/?api=1&query=${post.locationLat},${post.locationLng}`
    : post.locationName
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(post.locationName)}`
    : null;

  const timeAgo = post.createdAt
    ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
    : "";

  return (
    <div className="max-w-xl mx-auto min-h-screen flex flex-col">
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
        <h1 className="font-bold text-base">Post</h1>
      </div>

      {/* User row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <Link href={`/${post.userUsername}`} className="flex-shrink-0">
          {post.userAvatar ? (
            <img
              src={post.userAvatar}
              alt={post.userName}
              className="w-10 h-10 rounded-full object-cover"
              style={{ boxShadow: "0 0 0 2px rgba(255,90,31,0.6)" }}
            />
          ) : (
            <div
              className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm"
              style={{ boxShadow: "0 0 0 2px rgba(255,90,31,0.6)" }}
            >
              {post.userName.charAt(0).toUpperCase()}
            </div>
          )}
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/${post.userUsername}`} className="font-semibold text-sm hover:opacity-70 transition-opacity">
            {post.userUsername}
          </Link>
          <div className="flex items-center gap-1.5">
            <p className="text-xs text-muted">{timeAgo}</p>
            {post.locationName && mapUrl && (
              <>
                <span className="text-xs text-muted">·</span>
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-0.5 text-xs text-accent hover:text-accent/70 transition-colors"
                >
                  <MapPin size={11} />
                  {post.locationName}
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Image */}
      <div className="w-full aspect-square bg-surface-2 overflow-hidden">
        <img
          src={post.thumbnailUrl ?? post.url}
          alt={post.caption ?? ""}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Actions */}
      <div className="px-4 pt-3 pb-2">
        <LikeButton
          portfolioItemId={post.id}
          initialLiked={liked}
          initialCount={post.likesCount}
        />
      </div>

      {/* Caption */}
      {post.caption && (
        <div className="px-4 pb-3">
          <Link href={`/${post.userUsername}`} className="font-semibold text-sm mr-2 hover:opacity-70 transition-opacity">
            {post.userUsername}
          </Link>
          <span className="text-sm leading-relaxed text-foreground/80">{post.caption}</span>
        </div>
      )}

      <div className="h-px bg-border/50 mx-4" />

      {/* Comments */}
      <div className="flex-1">
        <CommentSection
          postId={post.id}
          initialComments={postComments}
          currentUserId={userId}
        />
      </div>
    </div>
  );
}
