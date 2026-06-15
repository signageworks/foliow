import { db } from "../lib/db";
import { trades } from "../lib/db/schema";
import { sql } from "drizzle-orm";

const UK_TRADES = [
  { name: "Plumber", slug: "plumber", sortOrder: 1 },
  { name: "Electrician", slug: "electrician", sortOrder: 2 },
  { name: "Carpenter", slug: "carpenter", sortOrder: 3 },
  { name: "Painter & Decorator", slug: "painter-decorator", sortOrder: 4 },
  { name: "Builder", slug: "builder", sortOrder: 5 },
  { name: "Plasterer", slug: "plasterer", sortOrder: 6 },
  { name: "Tiler", slug: "tiler", sortOrder: 7 },
  { name: "Roofer", slug: "roofer", sortOrder: 8 },
  { name: "Joiner", slug: "joiner", sortOrder: 9 },
  { name: "Bricklayer", slug: "bricklayer", sortOrder: 10 },
  { name: "Gas Engineer", slug: "gas-engineer", sortOrder: 11 },
  { name: "Heating Engineer", slug: "heating-engineer", sortOrder: 12 },
  { name: "Flooring Specialist", slug: "flooring", sortOrder: 13 },
  { name: "Kitchen Fitter", slug: "kitchen-fitter", sortOrder: 14 },
  { name: "Bathroom Fitter", slug: "bathroom-fitter", sortOrder: 15 },
  { name: "Landscaper", slug: "landscaper", sortOrder: 16 },
  { name: "Window Fitter", slug: "window-fitter", sortOrder: 17 },
  { name: "Locksmith", slug: "locksmith", sortOrder: 18 },
  { name: "Scaffolder", slug: "scaffolder", sortOrder: 19 },
  { name: "Welder", slug: "welder", sortOrder: 20 },
  { name: "HVAC Engineer", slug: "hvac", sortOrder: 21 },
  { name: "Solar Panel Installer", slug: "solar", sortOrder: 22 },
  { name: "Damp Specialist", slug: "damp-specialist", sortOrder: 23 },
  { name: "Groundworker", slug: "groundworker", sortOrder: 24 },
  { name: "Driveways & Paving", slug: "driveways-paving", sortOrder: 25 },
];

async function seed() {
  console.log("Seeding trades...");
  await db
    .insert(trades)
    .values(UK_TRADES)
    .onConflictDoNothing();
  console.log(`✅ ${UK_TRADES.length} trades inserted.`);
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
