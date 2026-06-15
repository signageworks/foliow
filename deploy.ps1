# Foliow — GitHub Push Script
# PowerShell olarak calistir

$ErrorActionPreference = "Stop"
$projectPath = "C:\Users\south\OneDrive\Documents\Claude\Projects\sosyal medya foliow.co.uk"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  FOLIOW — GitHub Deploy" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $projectPath

# 1. Bozuk .git klasorunu temizle
Write-Host "[1/4] Eski .git temizleniyor..." -ForegroundColor Yellow
if (Test-Path ".git") {
    Remove-Item -Recurse -Force ".git"
    Write-Host "  OK: .git silindi" -ForegroundColor Green
}

# 2. Git ayarla
Write-Host "[2/4] Git baslatiliyor..." -ForegroundColor Yellow
git config --global user.email "southdownsad@gmail.com"
git config --global user.name "Kemal"
git init -b main
git add .
git commit -m "Initial commit — Foliow MVP"
Write-Host "  OK: Commit tamam" -ForegroundColor Green

# 3. GitHub repo
Write-Host ""
Write-Host "[3/4] Simdi GitHub'da repo olustur:" -ForegroundColor Yellow
Write-Host "  → https://github.com/new" -ForegroundColor White
Write-Host "  → Repository name: foliow" -ForegroundColor White
Write-Host "  → Private sec → Create repository" -ForegroundColor White
Write-Host ""
$repoUrl = Read-Host "GitHub repo URL'sini gir (ornek: https://github.com/kullaniciadi/foliow.git)"

# 4. Push
Write-Host "[4/4] GitHub'a gonderiliyor..." -ForegroundColor Yellow
git remote add origin $repoUrl
git push -u origin main
Write-Host ""
Write-Host "BASARILI! Simdi Vercel'e deploy et:" -ForegroundColor Green
Write-Host "  → https://vercel.com/new" -ForegroundColor White
Write-Host "  → Import Git Repository → foliow" -ForegroundColor White
Write-Host ""
Read-Host "Tamamlandi, cikis icin Enter'a bas"
