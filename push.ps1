# Foliow — GitHub Push (2. Deneme)
$ErrorActionPreference = "Continue"
$projectPath = "C:\Users\south\OneDrive\Documents\Claude\Projects\sosyal medya foliow.co.uk"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  FOLIOW — GitHub Push" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $projectPath

# Git durumu kontrol
Write-Host "[1/3] Git durumu kontrol ediliyor..." -ForegroundColor Yellow
$gitStatus = git status 2>&1
Write-Host $gitStatus

# .git yoksa yeniden init et
if (-not (Test-Path ".git")) {
    Write-Host "  .git bulunamadi, baslatiliyor..." -ForegroundColor Red
    git config --global user.email "southdownsad@gmail.com"
    git config --global user.name "Kemal"
    git init -b main
    git add .
    git commit -m "Initial commit — Foliow MVP"
}

# Remote ayarla
Write-Host ""
Write-Host "[2/3] Remote ayarlanıyor..." -ForegroundColor Yellow
git remote remove origin 2>$null
git remote add origin https://github.com/signageworks/foliow.git
Write-Host "  Remote: https://github.com/signageworks/foliow.git" -ForegroundColor Green

# Commit yoksa ekle
$commitCount = (git rev-list --count HEAD 2>&1)
if ($commitCount -eq 0 -or $LASTEXITCODE -ne 0) {
    Write-Host "  Commit ekleniyor..." -ForegroundColor Yellow
    git add .
    git commit -m "Initial commit — Foliow MVP"
}

# Push
Write-Host ""
Write-Host "[3/3] GitHub'a gonderiliyor..." -ForegroundColor Yellow
Write-Host "  (Tarayici acilabilir — GitHub girisini onaylayin)" -ForegroundColor White
Write-Host ""
git push -u origin main 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "BASARILI! Kod GitHub'a yuklendi." -ForegroundColor Green
    Write-Host "Simdi Vercel deploy edebilirsiniz." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "HATA! Push basarisiz." -ForegroundColor Red
    Write-Host "GitHub Desktop ile deneyin:" -ForegroundColor Yellow
    Write-Host "  1. GitHub Desktop ac" -ForegroundColor White
    Write-Host "  2. File > Add Local Repository" -ForegroundColor White
    Write-Host "  3. Bu klasoru sec: $projectPath" -ForegroundColor White
    Write-Host "  4. Publish Repository" -ForegroundColor White
}

Write-Host ""
Write-Host "Cikis icin Enter'a bas..."
Read-Host
