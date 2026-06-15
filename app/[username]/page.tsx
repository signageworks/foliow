import { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { users, trades, employers, portfolioItems, follows } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import FollowButton from "@/components/FollowButton";
import ProfileGrid from "@/components/ProfileGrid";
import Link from "next/link";
import { MapPin, Briefcase, Grid3X3, Settings, MessageCircle } from "lucide-react";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const [user] = await db
    .select({ name: users.name, bio: users.bio })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);
  if (!user) return { title: "Not found" };
  return {
    title: user.name,
    description: user.bio ?? `${user.name}'s portfolio on Foliow`,
  };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const session = await auth();
  const currentUserId = session?.user?.id as string | undefined;

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      username: users.username,
      avatarUrl: users.avatarUrl,
      bio: users.bio,
      city: users.city,
      followersCount: users.followersCount,
      followingCount: users.followingCount,
      portfolioCount: users.portfolioCount,
      isVerified: users.isVerified,
      tradeId: users.tradeId,
      currentEmployerId: users.currentEmployerId,
    })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (!user) notFound();

  const tradeName = user.tradeId
    ? await db.select({ name: trades.name }).from(trades).where(eq(trades.id, user.tradeId)).limit(1).then((r) => r[0]?.name)
    : null;

  const employerName = user.currentEmployerId
    ? await db.select({ name: employers.name }).from(employers).where(eq(employers.id, user.currentEmployerId)).limit(1).then((r) => r[0]?.name)
    : null;

  const isOwnProfile = currentUserId === user.id;

  let isFollowing = false;
  if (currentUserId && !isOwnProfile) {
    const [row] = await db
      .select({ id: follows.followerId })
      .from(follows)
      .where(and(eq(follows.followerId, currentUserId), eq(follows.followingId, user.id)))
      .limit(1);
    isFollowing = !!row;
  }

  const portfolio = await db
    .select({
      id: portfolioItems.id,
      url: portfolioItems.url,
      thumbnailUrl: portfolioItems.thumbnailUrl,
      caption: portfolioItems.caption,
    })
    .from(portfolioItems)
    .where(eq(portfolioItems.userId, user.id))
    .orderBy(desc(portfolioItems.createdAt))
    .limit(30);

  return (
    <div className="max-w-xl mx-auto">
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 h-14 sticky top-0 z-10"
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
        <div className="flex items-center gap-1.5">
          <h1 className="font-bold text-base">{user.username}</h1>
          {user.isVerified && (
            <span className="w-4 h-4 rounded-full bg-accent flex items-center justify-center">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="white"><path d="M20 6L9 17l-5-5"/></svg>
            </span>
          )}
        </div>
        {isOwnProfile ? (
          <Link
            href="/profile/edit"
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/8 transition-colors text-muted hover:text-foreground"
          >
            <Settings size={20} />
          </Link>
        ) : (
          <div className="w-9" />
        )}
      </div>

      {/* Profile Header */}
      <div className="px-4 pt-5 pb-4">
        <div className="flex items-center gap-5 mb-4">
          <div className="flex-shrink-0">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover"
                style={{
                  boxShadow: "0 0 0 3px rgba(255,90,31,0.5), 0 0 0 5px rgba(255,90,31,0.15), 0 0 24px rgba(255,90,31,0.2)"
                }}
              />
            ) : (
              <div
                className="w-24 h-24 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-4xl"
                style={{
                  boxShadow: "0 0 0 3px rgba(255,90,31,0.5), 0 0 0 5px rgba(255,90,31,0.15)"
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex flex-1 justify-around">
            <div className="flex flex-col items-center gap-0.5">
              <p className="font-bold text-xl leading-tight">{user.portfolioCount ?? 0}</p>
              <p className="text-xs text-muted">posts</p>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <p className="font-bold text-xl leading-tight">{user.followersCount ?? 0}</p>
              <p className="text-xs text-muted">followers</p>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <p className="font-bold text-xl leading-tight">{user.followingCount ?? 0}</p>
              <p className="text-xs text-muted">following</p>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <p className="font-bold text-sm">{user.name}</p>
          {(tradeName || employerName || user.city) && (
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
              {tradeName && (
                <span className="flex items-center gap-1 text-xs text-muted">
                  <Briefcase size={11} />
                  {tradeName}
                </span>
              )}
              {employerName && <span className="text-xs text-muted">@ {employerName}</span>}
              {user.city && (
                <span className="flex items-center gap-1 text-xs text-muted">
                  <MapPin size={11} />
                  {user.city}
                </span>
              )}
            </div>
          )}
          {user.bio && (
            <p className="text-sm mt-1.5 leading-relaxed text-foreground/90">{user.bio}</p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          {isOwnProfile ? (
            <Link
              href="/profile/edit"
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-center transition-colors"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              Edit profile
            </Link>
          ) : (
            <>
              <div className="flex-1">
                <FollowButton targetUserId={user.id} initialFollowing={isFollowing} />
              </div>
              <Link
                href={`/messages/${user.id}`}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <MessageCircle size={15} />
                Message
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Portfolio Grid */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex">
          <div className="flex-1 flex items-center justify-center gap-2 py-3" style={{ borderBottom: "2px solid #ff5a1f" }}>
            <Grid3X3 size={15} strokeWidth={2} className="text-accent" />
            <span className="text-xs font-semibold tracking-wide uppercase text-accent">Posts</span>
          </div>
        </div>

        {portfolio.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-16 h-16 rounded-full border-2 border-border flex items-center justify-center mb-4">
              <Grid3X3 size={28} className="text-muted" />
            </div>
            <p className="font-bold text-lg mb-1">No Posts Yet</p>
            <p className="text-muted text-sm mb-6">Share your work to showcase your skills</p>
            {isOwnProfile && (
              <Link
                href="/post/new"
                className="px-6 py-2.5 text-white text-sm font-semibold rounded-full transition-colors"
                style={{ background: "linear-gradient(135deg, #ff5a1f, #ff3d00)", boxShadow: "0 0 16px rgba(255,90,31,0.4)" }}
              >
                Share your first post
              </Link>
            )}
          </div>
        ) : (
          <div className="pt-[3px]">
            <ProfileGrid posts={portfolio} />
          </div>
        )}
      </div>
    </div>
  );
}
