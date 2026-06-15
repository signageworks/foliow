/**
 * Seed script — populates reference data (trades).
 * Run with: npx tsx lib/db/seed.ts
 */
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

// .env.local yükle
const envPath = resolve(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  const lines = readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}

import { db } from "./index";
import { trades } from "./schema";

const TRADES = [
  { name: "Hairdresser", slug: "hairdresser", icon: "scissors", sortOrder: 1 },
  { name: "Barber", slug: "barber", icon: "scissors", sortOrder: 2 },
  { name: "Tattoo Artist", slug: "tattoo-artist", icon: "pen-tool", sortOrder: 3 },
  { name: "Nail Technician", slug: "nail-technician", icon: "sparkles", sortOrder: 4 },
  { name: "Makeup Artist", slug: "makeup-artist", icon: "palette", sortOrder: 5 },
  { name: "Carpenter", slug: "carpenter", icon: "hammer", sortOrder: 6 },
  { name: "Joiner", slug: "joiner", icon: "hammer", sortOrder: 7 },
  { name: "Bricklayer", slug: "bricklayer", icon: "layers", sortOrder: 8 },
  { name: "Electrician", slug: "electrician", icon: "zap", sortOrder: 9 },
  { name: "Plumber", slug: "plumber", icon: "wrench", sortOrder: 10 },
  { name: "Plasterer", slug: "plasterer", icon: "paintbrush", sortOrder: 11 },
  { name: "Painter & Decorator", slug: "painter-decorator", icon: "paintbrush", sortOrder: 12 },
  { name: "Signwriter", slug: "signwriter", icon: "type", sortOrder: 13 },
  { name: "Vehicle Wrapper", slug: "vehicle-wrapper", icon: "car", sortOrder: 14 },
  { name: "Welder", slug: "welder", icon: "flame", sortOrder: 15 },
  { name: "Fabricator", slug: "fabricator", icon: "cog", sortOrder: 16 },
  { name: "Flooring Specialist", slug: "flooring-specialist", icon: "grid", sortOrder: 17 },
  { name: "Tiler", slug: "tiler", icon: "grid", sortOrder: 18 },
  { name: "Roofer", slug: "roofer", icon: "home", sortOrder: 19 },
  { name: "Glazier", slug: "glazier", icon: "square", sortOrder: 20 },
  { name: "Baker", slug: "baker", icon: "chef-hat", sortOrder: 21 },
  { name: "Chef", slug: "chef", icon: "chef-hat", sortOrder: 22 },
  { name: "Mechanic", slug: "mechanic", icon: "wrench", sortOrder: 23 },
  { name: "Body Repair Technician", slug: "body-repair-technician", icon: "car", sortOrder: 24 },
  { name: "Upholsterer", slug: "upholsterer", icon: "sofa", sortOrder: 25 },
] as const;

async function seed() {
  console.log("🌱 Seeding trades...");

  await db
    .insert(trades)
    .values(TRADES.map((t) => ({ ...t })))
    .onConflictDoNothing();

  console.log(`✅ Inserted ${TRADES.length} trades`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
