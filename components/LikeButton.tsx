"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

interface Props {
  portfolioItemId: string;
  initialLiked: boolean;
  initialCount: number;
}

export default function LikeButton({ portfolioItemId, initialLiked, initialCount }: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (loading) return;
    setLoading(true);

    const newLiked = !liked;
    setLiked(newLiked);
    setCount((c) => c + (newLiked ? 1 : -1));

    await fetch("/api/likes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        portfolioItemId,
        action: newLiked ? "like" : "unlike",
      }),
    });

    setLoading(false);
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 text-muted hover:text-foreground transition-colors group"
      aria-label={liked ? "Unlike" : "Like"}
    >
      <Heart
        size={22}
        strokeWidth={liked ? 0 : 1.8}
        fill={liked ? "#ff5a1f" : "none"}
        stroke={liked ? "#ff5a1f" : "currentColor"}
        className="transition-all duration-150 group-active:scale-110"
      />
      {count > 0 && (
        <span className={`text-sm font-medium ${liked ? "text-accent" : ""}`}>{count}</span>
      )}
    </button>
  );
}
