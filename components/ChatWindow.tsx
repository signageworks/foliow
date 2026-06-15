"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Send, ArrowLeft } from "lucide-react";

interface OtherUser {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
}

interface ChatMsg {
  id: string;
  body: string;
  senderId: string;
  createdAt: Date | null;
  readAt: Date | null;
}

interface Props {
  conversationId: string;
  myId: string;
  otherUser: OtherUser;
  initialMessages: ChatMsg[];
}

export default function ChatWindow({ conversationId, myId, otherUser, initialMessages }: Props) {
  const [msgs, setMsgs] = useState<ChatMsg[]>(initialMessages);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on mount and new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  // Poll for new messages every 3 seconds
  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/messages?conversationId=${conversationId}`);
      if (res.ok) {
        const data = await res.json();
        setMsgs(data);
      }
    } catch {}
  }, [conversationId]);

  useEffect(() => {
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [poll]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || sending) return;
    setSending(true);
    const text = body.trim();
    setBody("");
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, body: text }),
      });
      if (res.ok) {
        await poll();
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto flex flex-col h-[100dvh]">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 h-14 flex-shrink-0"
        style={{
          background: "rgba(10,10,10,0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Link
          href="/messages"
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/8 transition-colors text-muted hover:text-foreground"
        >
          <ArrowLeft size={20} />
        </Link>
        <Link href={`/${otherUser.username}`} className="flex items-center gap-2.5 flex-1 min-w-0">
          {otherUser.avatarUrl ? (
            <img src={otherUser.avatarUrl} alt={otherUser.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm flex-shrink-0">
              {otherUser.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-sm leading-tight truncate">{otherUser.username}</p>
          </div>
        </Link>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {msgs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted text-sm">Say hello to {otherUser.username}!</p>
          </div>
        )}
        {msgs.map((m) => {
          const isMine = m.senderId === myId;
          return (
            <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                style={
                  isMine
                    ? {
                        background: "linear-gradient(135deg, #ff5a1f, #ff3d00)",
                        borderBottomRightRadius: "6px",
                        boxShadow: "0 2px 12px rgba(255,90,31,0.3)",
                      }
                    : {
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderBottomLeftRadius: "6px",
                      }
                }
              >
                <p className="text-white">{m.body}</p>
                {m.createdAt && (
                  <p className={`text-[11px] mt-1 ${isMine ? "text-white/60" : "text-muted"}`}>
                    {formatDistanceToNow(new Date(m.createdAt), { addSuffix: true })}
                  </p>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="flex-shrink-0 px-4 py-3"
        style={{
          background: "rgba(10,10,10,0.95)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Message..."
            className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent/60 transition-colors"
            disabled={sending}
            maxLength={1000}
          />
          <button
            type="submit"
            disabled={!body.trim() || sending}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-30 flex-shrink-0"
            style={{
              background: body.trim() ? "linear-gradient(135deg, #ff5a1f, #ff3d00)" : "rgba(255,255,255,0.08)",
              boxShadow: body.trim() ? "0 0 16px rgba(255,90,31,0.4)" : "none",
            }}
          >
            <Send size={16} className="text-white" />
          </button>
        </form>
      </div>
    </div>
  );
}
