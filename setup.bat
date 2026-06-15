@echo off
echo.
echo  ========================================
echo   Foliow - Kurulum Basliyor
echo  ========================================
echo.

echo [1/3] Paketler yukleniyor (npm install)...
call npm install
if %errorlevel% neq 0 (
  echo HATA: npm install basarisiz oldu.
  pause
  exit /b 1
)

echo.
echo [2/3] Veritabani tablolari olusturuluyor...
call npm run db:push
if %errorlevel% neq 0 (
  echo HATA: db:push basarisiz oldu. .env.local dosyasini kontrol et.
  pause
  exit /b 1
)

echo.
echo [3/3] Meslekler yukleniyor (seed)...
call npx tsx lib/db/seed.ts
if %errorlevel% neq 0 (
  echo UYARI: Seed basarisiz - devam ediliyor.
)

echo.
echo  ========================================
echo   Kurulum tamamlandi!
echo   Simdi: npm run dev
echo  ========================================
echo.
pause
