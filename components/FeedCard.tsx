"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, MapPin, MessageCircle, Bookmark } from "lucide-react";
import LikeButton from "./LikeButton";

interface Post {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  caption: string | null;
  createdAt: Date | null;
  likesCount: number;
  commentsCount?: number;
  userId: string;
  userName: string;
  userUsername: string;
  userAvatar: string | null;
  liked: boolean;
  locationName?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
}

export default function FeedCard({ post }: { post: Post }) {
  const thumb = post.thumbnailUrl ?? post.url;
  const timeAgo = post.createdAt
    ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
    : "";

  const mapUrl = post.locationLat && post.locationLng
    ? `https://www.google.com/maps/search/?api=1&query=${post.locationLat},${post.locationLng}`
    : post.locationName
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(post.locationName)}`
    : null;

  return (
    <article className="bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-3 py-3">
        <Link href={`/${post.userUsername}`} className="flex-shrink-0">
          {post.userAvatar ? (
            <img
              src={post.userAvatar}
              alt={post.userName}
              className="w-9 h-9 rounded-full object-cover"
              style={{ boxShadow: "0 0 0 2px rgba(255,90,31,0.6), 0 0 0 3px rgba(255,90,31,0.2)" }}
            />
          ) : (
            <div
              className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm"
              style={{ boxShadow: "0 0 0 2px rgba(255,90,31,0.6), 0 0 0 3px rgba(255,90,31,0.2)" }}
            >
              {post.userName.charAt(0).toUpperCase()}
            </div>
          )}
        </Link>
        <div className="flex-1 min-w-0">
          <Link
            href={`/${post.userUsername}`}
            className="font-semibold text-sm hover:opacity-70 transition-opacity leading-tight"
          >
            {post.userUsername}
          </Link>
          <div className="flex items-center gap-1.5 flex-wrap">
            {timeAgo && (
              <p className="text-xs text-muted leading-tight">{timeAgo}</p>
            )}
            {post.locationName && mapUrl && (
              <>
                <span className="text-xs text-muted">·</span>
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-0.5 text-xs text-accent hover:text-accent/70 transition-colors leading-tight"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MapPin size={11} />
                  {post.locationName}
                </a>
              </>
            )}
          </div>
        </div>
        <button className="w-8 h-8 flex items-center justify-center text-muted hover:text-foreground transition-colors">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Image — tapping opens post detail */}
      <Link href={`/post/${post.id}`}>
        <div className="aspect-square w-full bg-surface-2 overflow-hidden">
          <img
            src={thumb}
            alt={post.caption ?? ""}
            className="w-full h-full object-cover"
          />
        </div>
      </Link>

      {/* Actions */}
      <div className="px-3 pt-2.5 pb-1 flex items-center gap-1">
        <LikeButton
          portfolioItemId={post.id}
          initialLiked={post.liked}
          initialCount={post.likesCount}
        />
        <Link
          href={`/post/${post.id}`}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-muted hover:text-foreground"
        >
          <MessageCircle size={22} strokeWidth={1.8} />
          {(post.commentsCount ?? 0) > 0 && (
            <span className="text-sm font-medium">{post.commentsCount}</span>
          )}
        </Link>
        <button className="ml-auto flex items-center justify-center w-9 h-9 rounded-lg hover:bg-white/5 transition-colors text-muted hover:text-foreground">
          <Bookmark size={22} strokeWidth={1.8} />
        </button>
      </div>

      {/* Caption */}
      {post.caption && (
        <div className="px-3 pt-1 pb-3">
          <Link href={`/${post.userUsername}`} className="font-semibold text-sm mr-2 hover:opacity-70 transition-opacity">
            {post.userUsername}
          </Link>
          <span className="text-sm leading-relaxed text-foreground/80">{post.caption}</span>
        </div>
      )}

      {/* View comments link */}
      {(post.commentsCount ?? 0) > 0 && (
        <Link href={`/post/${post.id}`} className="block px-3 pb-3 -mt-1">
          <span className="text-xs text-muted hover:text-foreground transition-colors">
            View all {post.commentsCount} comment{post.commentsCount !== 1 ? "s" : ""}
          </span>
        </Link>
      )}

      <div className="h-px bg-border mx-0 mt-1" />
    </article>
  );
}
