"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, MessageCircle, User } from "lucide-react";
import { useSession } from "next-auth/react";

export default function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const username = (session?.user as { username?: string })?.username;

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const iconClass = (active: boolean) =>
    `transition-all duration-200 ${active ? "text-[#ff5a1f] drop-shadow-[0_0_8px_rgba(255,90,31,0.8)]" : "text-white/40"}`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div className="max-w-xl mx-auto px-3 pb-3 pointer-events-auto">
        {/* Glass bar */}
        <div className="relative rounded-2xl overflow-hidden"
          style={{
            background: "rgba(10,10,10,0.75)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 2px 0 rgba(255,255,255,0.05) inset",
          }}
        >
          <div className="flex items-center justify-around h-[62px] px-1">

            {/* Home */}
            <Link href="/feed" className="flex flex-col items-center justify-center w-12 h-12 gap-0.5 group">
              <Home
                size={23}
                strokeWidth={isActive("/feed") ? 2.5 : 1.8}
                fill={isActive("/feed") ? "currentColor" : "none"}
                className={iconClass(isActive("/feed"))}
              />
              {isActive("/feed") && (
                <span className="w-1 h-1 rounded-full bg-[#ff5a1f] shadow-[0_0_6px_rgba(255,90,31,0.9)]" />
              )}
            </Link>

            {/* Discover */}
            <Link href="/discover" className="flex flex-col items-center justify-center w-12 h-12 gap-0.5 group">
              <Compass
                size={23}
                strokeWidth={isActive("/discover") ? 2.5 : 1.8}
                className={iconClass(isActive("/discover"))}
              />
              {isActive("/discover") && (
                <span className="w-1 h-1 rounded-full bg-[#ff5a1f] shadow-[0_0_6px_rgba(255,90,31,0.9)]" />
              )}
            </Link>

            {/* New Post — center button */}
            <Link
              href="/post/new"
              className="flex items-center justify-center w-[46px] h-[46px] rounded-2xl relative"
              aria-label="New post"
              style={{
                background: "linear-gradient(135deg, #ff5a1f 0%, #ff3d00 100%)",
                boxShadow: "0 0 20px rgba(255,90,31,0.5), 0 4px 12px rgba(0,0,0,0.3), 0 1px 0 rgba(255,255,255,0.2) inset",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </Link>

            {/* Messages */}
            <Link href="/messages" className="flex flex-col items-center justify-center w-12 h-12 gap-0.5 group">
              <MessageCircle
                size={23}
                strokeWidth={isActive("/messages") ? 2.5 : 1.8}
                fill={isActive("/messages") ? "currentColor" : "none"}
                className={iconClass(isActive("/messages"))}
              />
              {isActive("/messages") && (
                <span className="w-1 h-1 rounded-full bg-[#ff5a1f] shadow-[0_0_6px_rgba(255,90,31,0.9)]" />
              )}
            </Link>

            {/* Profile */}
            <Link
              href={username ? `/${username}` : "/login"}
              className="flex flex-col items-center justify-center w-12 h-12 gap-0.5 group"
            >
              <User
                size={23}
                strokeWidth={pathname === `/${username}` ? 2.5 : 1.8}
                fill={pathname === `/${username}` ? "currentColor" : "none"}
                className={iconClass(pathname === `/${username}`)}
              />
              {pathname === `/${username}` && (
                <span className="w-1 h-1 rounded-full bg-[#ff5a1f] shadow-[0_0_6px_rgba(255,90,31,0.9)]" />
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
