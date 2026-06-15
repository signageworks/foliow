import Link from "next/link";
import { Compass } from "lucide-react";

export default function EmptyFeed() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
        <Compass size={32} className="text-accent" />
      </div>
      <h2 className="text-lg font-semibold mb-2">Your feed is empty</h2>
      <p className="text-muted text-sm max-w-xs mb-6">
        Follow tradespeople to see their latest work here.
      </p>
      <Link
        href="/discover"
        className="bg-accent hover:bg-accent/90 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
      >
        Discover tradespeople
      </Link>
    </div>
  );
}
