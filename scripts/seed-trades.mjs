// scripts/seed-trades.mjs
// Calistir: node scripts/seed-trades.mjs

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

const UK_TRADES = [
  { name: "Plumber", slug: "plumber", sort_order: 1 },
  { name: "Electrician", slug: "electrician", sort_order: 2 },
  { name: "Carpenter", slug: "carpenter", sort_order: 3 },
  { name: "Painter & Decorator", slug: "painter-decorator", sort_order: 4 },
  { name: "Builder", slug: "builder", sort_order: 5 },
  { name: "Plasterer", slug: "plasterer", sort_order: 6 },
  { name: "Tiler", slug: "tiler", sort_order: 7 },
  { name: "Roofer", slug: "roofer", sort_order: 8 },
  { name: "Joiner", slug: "joiner", sort_order: 9 },
  { name: "Bricklayer", slug: "bricklayer", sort_order: 10 },
  { name: "Gas Engineer", slug: "gas-engineer", sort_order: 11 },
  { name: "Heating Engineer", slug: "heating-engineer", sort_order: 12 },
  { name: "Flooring Specialist", slug: "flooring", sort_order: 13 },
  { name: "Kitchen Fitter", slug: "kitchen-fitter", sort_order: 14 },
  { name: "Bathroom Fitter", slug: "bathroom-fitter", sort_order: 15 },
  { name: "Landscaper", slug: "landscaper", sort_order: 16 },
  { name: "Window Fitter", slug: "window-fitter", sort_order: 17 },
  { name: "Locksmith", slug: "locksmith", sort_order: 18 },
  { name: "Scaffolder", slug: "scaffolder", sort_order: 19 },
  { name: "Welder", slug: "welder", sort_order: 20 },
  { name: "HVAC Engineer", slug: "hvac", sort_order: 21 },
  { name: "Solar Panel Installer", slug: "solar", sort_order: 22 },
  { name: "Damp Specialist", slug: "damp-specialist", sort_order: 23 },
  { name: "Groundworker", slug: "groundworker", sort_order: 24 },
  { name: "Driveways & Paving", slug: "driveways-paving", sort_order: 25 },
];

async function seed() {
  console.log("Seeding trades...");
  for (const trade of UK_TRADES) {
    await sql`
      INSERT INTO trades (name, slug, sort_order)
      VALUES (${trade.name}, ${trade.slug}, ${trade.sort_order})
      ON CONFLICT DO NOTHING
    `;
  }
  console.log(`Done -- ${UK_TRADES.length} trades added.`);
}

seed().catch((e) => {
  console.error("Error:", e.message);
  process.exit(1);
});
