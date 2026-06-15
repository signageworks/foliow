import { neon } from '@neondatabase/serverless';
import { existsSync, readFileSync } from 'fs';

if (existsSync('.env.local')) {
  const lines = readFileSync('.env.local', 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
}

const sql = neon(process.env.DATABASE_URL);

try {
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS image text`;
  console.log('✓ image column ensured');

  await sql`ALTER TABLE portfolio_items ADD COLUMN IF NOT EXISTS location_name varchar(200)`;
  await sql`ALTER TABLE portfolio_items ADD COLUMN IF NOT EXISTS location_lat double precision`;
  await sql`ALTER TABLE portfolio_items ADD COLUMN IF NOT EXISTS location_lng double precision`;
  await sql`ALTER TABLE portfolio_items ADD COLUMN IF NOT EXISTS comments_count integer NOT NULL DEFAULT 0`;
  console.log('✓ portfolio_items columns ensured');

  // Add new_comment to notification_type enum
  await sql`
    DO $$ BEGIN
      ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'new_comment';
    EXCEPTION WHEN others THEN NULL;
    END $$
  `;
  console.log('✓ notification_type enum updated');

  // Create comments table
  await sql`
    CREATE TABLE IF NOT EXISTS comments (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      portfolio_item_id uuid NOT NULL REFERENCES portfolio_items(id) ON DELETE CASCADE,
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      body text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS comments_item_idx ON comments(portfolio_item_id)`;
  await sql`CREATE INDEX IF NOT EXISTS comments_user_idx ON comments(user_id)`;
  console.log('✓ comments table ensured');

  // Create stories table
  await sql`
    CREATE TABLE IF NOT EXISTS stories (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      media_url text NOT NULL,
      media_type varchar(10) NOT NULL DEFAULT 'image',
      expires_at timestamptz NOT NULL,
      views_count integer NOT NULL DEFAULT 0,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS stories_user_idx ON stories(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS stories_expires_idx ON stories(expires_at)`;
  console.log('✓ stories table ensured');

} catch (e) {
  console.error('Migration error:', e.message);
  process.exit(1);
}

console.log('DB migrations complete.');
