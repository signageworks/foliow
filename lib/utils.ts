import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow } from "date-fns";

/** Tailwind class merging helper */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "2 hours ago", "3 days ago" etc. */
export function timeAgo(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

/** Convert a name to a URL-safe slug */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Generate a unique username from a name (base — collision handling is in the API) */
export function generateUsername(name: string): string {
  const base = slugify(name).replace(/-/g, "");
  const suffix = Math.floor(Math.random() * 9000) + 1000;
  return `${base}${suffix}`;
}

/** Format a UK postcode to uppercase with correct spacing */
export function formatPostcode(raw: string): string {
  const clean = raw.toUpperCase().replace(/\s/g, "");
  if (clean.length < 5) return clean;
  return `${clean.slice(0, -3)} ${clean.slice(-3)}`;
}

/** Abbreviate large numbers: 1200 → 1.2k */
export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

/** Build a public profile URL */
export function profileUrl(username: string): string {
  return `/${username}`;
}
