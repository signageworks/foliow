import { Metadata } from "next";
import { db } from "@/lib/db";
import { users, trades, portfolioItems } from "@/lib/db/schema";
import { eq, ilike, or, desc } from "drizzle-orm";
import Link from "next/link";
import { Search } from "lucide-react";

export const metadata: Metadata = { title: "Discover" };

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function DiscoverPage({ searchParams }: Props) {
  const { q } = await searchParams;

  const allTrades = await db
    .select({ id: trades.id, name: trades.name, slug: trades.slug })
    .from(trades)
    .orderBy(trades.sortOrder)
    .limit(20);

  const allUsers = await db
    .select({
      id: users.id,
      name: users.name,
      username: users.username,
      avatarUrl: users.avatarUrl,
      city: users.city,
      portfolioCount: users.portfolioCount,
      isVerified: users.isVerified,
      tradeName: trades.name,
    })
    .from(users)
    .leftJoin(trades, eq(users.tradeId, trades.id))
    .where(
      q
        ? or(
            ilike(users.name, `%${q}%`),
            ilike(users.username, `%${q}%`),
            ilike(users.city, `%${q}%`)
          )
        : undefined
    )
    .orderBy(desc(users.portfolioCount))
    .limit(48);

  const recentPhotos = !q
    ? await db
        .select({
          id: portfolioItems.id,
          url: portfolioItems.url,
          thumbnailUrl: portfolioItems.thumbnailUrl,
          username: users.username,
        })
        .from(portfolioItems)
        .innerJoin(users, eq(portfolioItems.userId, users.id))
        .orderBy(desc(portfolioItems.createdAt))
        .limit(18)
    : [];

  return (
    <div className="max-w-xl mx-auto">
      {/* Search bar */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Link
            href="/feed"
            className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-full hover:bg-surface transition-colors text-muted hover:text-foreground"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
          </Link>
          <form method="GET" className="flex-1">
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
              />
              <input
                name="q"
                defaultValue={q ?? ""}
                placeholder="Search tradespeople, cities..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-surface border border-border text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors text-sm"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Trade chips */}
      {!q && allTrades.length > 0 && (
        <div className="px-4 py-3 flex gap-2 overflow-x-auto scrollbar-none">
          {allTrades.map((t) => (
            <Link
              key={t.id}
              href={`/discover?q=${encodeURIComponent(t.name)}`}
              className="flex-shrink-0 px-3 py-1.5 rounded-full bg-surface border border-border text-xs font-medium text-muted hover:border-accent hover:text-accent transition-colors"
            >
              {t.name}
            </Link>
          ))}
        </div>
      )}

      {q ? (
        <div className="px-4 pt-2 pb-6">
          <p className="text-xs text-muted mb-3">
            {allUsers.length} result{allUsers.length !== 1 ? "s" : ""} for &quot;{q}&quot;
          </p>
          {allUsers.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted text-sm">No tradespeople found.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {allUsers.map((user) => (
                <Link
                  key={user.id}
                  href={`/${user.username}`}
                  className="flex items-center gap-3 py-2.5 hover:opacity-70 transition-opacity"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold flex-shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-sm">{user.username}</span>
                      {user.isVerified && (
                        <span className="w-3.5 h-3.5 rounded-full bg-accent flex items-center justify-center">
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="white"><path d="M20 6L9 17l-5-5"/></svg>
                        </span>
                      )}
                    </div>
                    {(user.tradeName || user.city) && (
                      <p className="text-xs text-muted">
                        {[user.tradeName, user.city].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted flex-shrink-0">{user.portfolioCount ?? 0} posts</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="pt-[3px]">
          {recentPhotos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center px-4">
              <p className="text-muted text-sm">No posts yet. Be the first to share your work!</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-[3px]">
              {recentPhotos.map((photo, i) => (
                <Link
                  key={photo.id}
                  href={`/${photo.username}`}
                  className={`relative bg-surface-2 overflow-hidden group aspect-square ${
                    i % 7 === 0 ? "col-span-2 row-span-2" : ""
                  }`}
                >
                  <img
                    src={photo.thumbnailUrl ?? photo.url}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
