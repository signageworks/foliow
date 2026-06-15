"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface Post {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  caption: string | null;
}

interface Props {
  post: Post;
  onClose: () => void;
}

export default function PostModal({ post, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-white/80 hover:text-white transition-colors z-10"
      >
        <X size={26} />
      </button>

      <div
        className="relative w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={post.url}
          alt={post.caption ?? ""}
          className="w-full object-contain max-h-[85vh]"
        />
        {post.caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 pt-10 pb-4">
            <p className="text-sm text-white leading-relaxed">{post.caption}</p>
          </div>
        )}
      </div>
    </div>
  );
}
