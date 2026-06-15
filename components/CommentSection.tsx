"use client";

import { useState, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Send } from "lucide-react";

interface Comment {
  id: string;
  body: string;
  createdAt: Date | null;
  userId: string;
  userName: string;
  userUsername: string;
  userAvatar: string | null;
}

interface Props {
  postId: string;
  initialComments: Comment[];
  currentUserId: string | null;
}

export default function CommentSection({ postId, initialComments, currentUserId }: Props) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portfolioItemId: postId, body }),
      });
      if (res.ok) {
        const newComment = await res.json();
        setComments((prev) => [newComment, ...prev]);
        setBody("");
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Comment list */}
      <div className="px-4 pt-4 space-y-4 pb-4">
        {comments.length === 0 ? (
          <p className="text-muted text-sm text-center py-8">No comments yet. Be the first!</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <Link href={`/${c.userUsername}`} className="flex-shrink-0">
                {c.userAvatar ? (
                  <img
                    src={c.userAvatar}
                    alt={c.userName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold">
                    {c.userName.charAt(0).toUpperCase()}
                  </div>
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <div
                  className="rounded-2xl rounded-tl-sm px-3 py-2.5"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <Link href={`/${c.userUsername}`} className="font-semibold text-xs text-accent mr-1 hover:opacity-70 transition-opacity">
                    {c.userUsername}
                  </Link>
                  <span className="text-sm text-foreground/90 leading-snug">{c.body}</span>
                </div>
                <p className="text-[11px] text-muted mt-1 ml-1">
                  {c.createdAt ? formatDistanceToNow(new Date(c.createdAt), { addSuffix: true }) : ""}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Comment input — sticky at bottom */}
      {currentUserId && (
        <div
          className="sticky bottom-16 left-0 right-0 px-4 py-3"
          style={{
            background: "rgba(10,10,10,0.9)",
            backdropFilter: "blur(20px)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              ref={inputRef}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent/60 transition-colors"
              disabled={sending}
              maxLength={500}
            />
            <button
              type="submit"
              disabled={!body.trim() || sending}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all disabled:opacity-30"
              style={{
                background: body.trim() ? "linear-gradient(135deg, #ff5a1f, #ff3d00)" : "rgba(255,255,255,0.1)",
                boxShadow: body.trim() ? "0 0 16px rgba(255,90,31,0.4)" : "none",
              }}
            >
              <Send size={16} className="text-white" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
