import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { hashSync } from "bcrypt-ts";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, username, password } = body;

    // --- Validation ---
    if (!name || !email || !username || !password) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    if (!/^[a-z0-9_-]{3,30}$/.test(username)) {
      return NextResponse.json(
        { error: "Username must be 3–30 characters, lowercase letters, numbers, _ or - only." },
        { status: 400 }
      );
    }

    // --- Check duplicates ---
    const existing = await db
      .select({ id: users.id, email: users.email, username: users.username })
      .from(users)
      .where(or(eq(users.email, email.toLowerCase()), eq(users.username, username.toLowerCase())))
      .limit(1);

    if (existing.length > 0) {
      if (existing[0].email === email.toLowerCase()) {
        return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
      }
      return NextResponse.json({ error: "This username is already taken." }, { status: 409 });
    }

    // --- Hash password ---
    const hashedPassword = hashSync(password, 12);

    // --- Insert user via raw SQL (avoids Drizzle including unmigrated columns) ---
    const result = await db.execute(sql`
      INSERT INTO users (id, name, username, email, password_hash, account_type)
      VALUES (gen_random_uuid(), ${name}, ${username.toLowerCase()}, ${email.toLowerCase()}, ${hashedPassword}, 'individual')
      RETURNING id, username
    `);

    const newUser = (result as any).rows?.[0] ?? (result as any)[0];

    return NextResponse.json(
      { success: true, username: newUser.username },
      { status: 201 }
    );
  } catch (err) {
    console.error("[register] error:", err);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}
