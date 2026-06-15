import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { employers } from "@/lib/db/schema";
import { ilike, or, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";

  const rows = await db
    .select({ id: employers.id, name: employers.name, city: employers.city, isVerified: employers.isVerified, logoUrl: employers.logoUrl })
    .from(employers)
    .where(q.length > 0 ? or(ilike(employers.name, `%${q}%`), ilike(employers.city, `%${q}%`)) : sql`1=1`)
    .orderBy(employers.name)
    .limit(20);

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { name, city } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Math.random().toString(36).slice(2, 6);

  const [created] = await db
    .insert(employers)
    .values({ name: name.trim(), slug, city: city?.trim() || null })
    .returning({ id: employers.id, name: employers.name, city: employers.city, isVerified: employers.isVerified, logoUrl: employers.logoUrl });

  return NextResponse.json(created, { status: 201 });
}
