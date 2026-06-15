"use client";

import Link from "next/link";

interface Post {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  caption: string | null;
}

interface Props {
  posts: Post[];
}

export default function ProfileGrid({ posts }: Props) {
  return (
    <div className="grid grid-cols-3 gap-[3px]">
      {posts.map((item) => {
        const thumb = item.thumbnailUrl ?? item.url;
        return (
          <Link
            key={item.id}
            href={`/post/${item.id}`}
            className="aspect-square bg-surface-2 relative overflow-hidden group block"
          >
            <img
              src={thumb}
              alt={item.caption ?? ""}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          </Link>
        );
      })}
    </div>
  );
}
