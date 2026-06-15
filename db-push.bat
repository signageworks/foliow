@echo off
cd /d "C:\Users\south\OneDrive\Documents\Claude\Projects\sosyal medya foliow.co.uk"
echo == image kolonu ekleniyor ==
node scripts/ensure-db.mjs
echo == Neon DB schema guncelleniyor ==
npx drizzle-kit push --force
echo == Tamamlandi ==
pause
