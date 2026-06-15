"use client";

import { useState } from "react";
import Link from "next/link";
import StoryViewer from "./StoryViewer";

interface StoryUser {
  id: string;
  userId: string;
  mediaUrl: string;
  mediaType: string;
  expiresAt: Date;
  userName: string;
  userUsername: string;
  userAvatar: string | null;
}

interface Props {
  stories: StoryUser[];
  currentUserId: string;
}

export default function StoriesBar({ stories, currentUserId }: Props) {
  const [viewingIndex, setViewingIndex] = useState<number | null>(null);

  return (
    <>
      <div
        className="flex gap-3 px-4 py-3 overflow-x-auto scrollbar-none"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        {/* Add story button for current user */}
        <Link href="/post/new?story=1" className="flex flex-col items-center gap-1.5 flex-shrink-0">
          <div
            className="w-[62px] h-[62px] rounded-full flex items-center justify-center relative"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1.5px dashed rgba(255,255,255,0.15)",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <span className="text-[11px] text-muted text-center w-16 truncate">Your story</span>
        </Link>

        {/* Story avatars */}
        {stories.map((story, i) => (
          <button
            key={story.id}
            onClick={() => setViewingIndex(i)}
            className="flex flex-col items-center gap-1.5 flex-shrink-0"
          >
            <div className="relative w-[62px] h-[62px]">
              {/* Gradient ring */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: "linear-gradient(135deg, #ff5a1f, #ff9a5c, #ff5a1f)",
                  padding: "2px",
                }}
              >
                <div
                  className="w-full h-full rounded-full overflow-hidden"
                  style={{ border: "2px solid #0a0a0a" }}
                >
                  {story.userAvatar ? (
                    <img
                      src={story.userAvatar}
                      alt={story.userName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-accent/20 flex items-center justify-center text-accent font-bold text-lg">
                      {story.userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <span className="text-[11px] text-foreground/70 text-center w-16 truncate">
              {story.userUsername}
            </span>
          </button>
        ))}
      </div>

      {/* Story viewer overlay */}
      {viewingIndex !== null && (
        <StoryViewer
          stories={stories}
          initialIndex={viewingIndex}
          onClose={() => setViewingIndex(null)}
        />
      )}
    </>
  );
}
