import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { trades } from "@/lib/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  const list = await db
    .select({ id: trades.id, name: trades.name })
    .from(trades)
    .orderBy(asc(trades.sortOrder), asc(trades.name));

  return NextResponse.json(list);
}
