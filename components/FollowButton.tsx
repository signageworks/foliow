"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  targetUserId: string;
  initialFollowing: boolean;
}

export default function FollowButton({ targetUserId, initialFollowing }: Props) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggle = async () => {
    setLoading(true);
    const action = following ? "unfollow" : "follow";
    setFollowing(!following);

    await fetch("/api/follows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId, action }),
    });

    setLoading(false);
    router.refresh();
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 ${
        following
          ? "bg-surface border border-border text-foreground hover:border-red-400 hover:text-red-400"
          : "bg-accent text-white hover:bg-accent/90"
      }`}
    >
      {loading ? "..." : following ? "Following" : "Follow"}
    </button>
  );
}
