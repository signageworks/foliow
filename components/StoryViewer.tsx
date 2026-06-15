"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import Link from "next/link";

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
  initialIndex: number;
  onClose: () => void;
}

const STORY_DURATION = 5000;

export default function StoryViewer({ stories, initialIndex, onClose }: Props) {
  const [index, setIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const story = stories[index];

  useEffect(() => {
    setProgress(0);
    const start = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / STORY_DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(timerRef.current!);
        if (index < stories.length - 1) {
          setIndex((i) => i + 1);
        } else {
          onClose();
        }
      }
    }, 50);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [index]);

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const x = e.clientX;
    const w = e.currentTarget.clientWidth;
    if (x < w / 3) {
      // Prev
      if (index > 0) setIndex((i) => i - 1);
    } else if (x > (w * 2) / 3) {
      // Next
      if (index < stories.length - 1) setIndex((i) => i + 1);
      else onClose();
    }
  };

  if (!story) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.95)" }}
    >
      <div
        className="relative w-full max-w-sm h-full max-h-[100dvh] overflow-hidden"
        style={{ background: "#111" }}
        onClick={handleTap}
      >
        {/* Progress bars */}
        <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 p-3 pt-4">
          {stories.map((_, i) => (
            <div
              key={i}
              className="flex-1 h-[2.5px] rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.25)" }}
            >
              <div
                className="h-full rounded-full transition-none"
                style={{
                  width: i < index ? "100%" : i === index ? `${progress}%` : "0%",
                  background: "rgba(255,255,255,0.9)",
                }}
              />
            </div>
          ))}
        </div>

        {/* User info */}
        <div className="absolute top-10 left-0 right-0 z-10 flex items-center gap-2 px-4 pt-2">
          <Link href={`/${story.userUsername}`} onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
            {story.userAvatar ? (
              <img
                src={story.userAvatar}
                alt={story.userName}
                className="w-9 h-9 rounded-full object-cover"
                style={{ border: "2px solid rgba(255,255,255,0.6)" }}
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm border-2 border-white/60">
                {story.userName.charAt(0).toUpperCase()}
              </div>
            )}
          </Link>
          <Link href={`/${story.userUsername}`} onClick={(e) => e.stopPropagation()}>
            <span className="font-semibold text-white text-sm">{story.userUsername}</span>
          </Link>
        </div>

        {/* Close button */}
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="absolute top-10 right-4 z-20 w-9 h-9 flex items-center justify-center rounded-full"
          style={{ background: "rgba(0,0,0,0.4)" }}
        >
          <X size={18} className="text-white" />
        </button>

        {/* Media */}
        {story.mediaType === "video" ? (
          <video
            src={story.mediaUrl}
            className="w-full h-full object-contain"
            autoPlay
            muted
            playsInline
          />
        ) : (
          <img
            src={story.mediaUrl}
            alt=""
            className="w-full h-full object-contain"
            draggable={false}
          />
        )}
      </div>
    </div>
  );
}
