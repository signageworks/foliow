$projectPath = "C:\Users\south\OneDrive\Documents\Claude\Projects\sosyal medya foliow.co.uk"

Write-Host "== FOLIOW GitHub Push ==" -ForegroundColor Cyan
Set-Location $projectPath
Write-Host "Konum: $(Get-Location)" -ForegroundColor Gray

# Bozuk .git'i sil
if (Test-Path ".git") {
    Write-Host "Bozuk .git siliniyor..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force ".git" -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
    if (Test-Path ".git") {
        Write-Host "UYARI: .git silinemedi, zorla deneniyor..." -ForegroundColor Red
        cmd /c "rmdir /s /q .git"
        Start-Sleep -Seconds 2
    }
    Write-Host "Silindi." -ForegroundColor Green
}

# Git kur
Write-Host "Git baslatiliyor..." -ForegroundColor Yellow
git config --global user.email "southdownsad@gmail.com"
git config --global user.name "Kemal"
git init -b main
Write-Host "Init tamam." -ForegroundColor Green

# Tum dosyalari ekle (node_modules ve .next haric)
Write-Host "Dosyalar ekleniyor..." -ForegroundColor Yellow
git add .
git status --short

Write-Host "Commit yapiliyor..." -ForegroundColor Yellow
git commit -m "Initial commit - Foliow MVP"
Write-Host "Commit tamam." -ForegroundColor Green

# Remote ekle ve push
Write-Host ""
Write-Host "GitHub'a gonderiliyor..." -ForegroundColor Yellow
git remote add origin https://github.com/signageworks/foliow.git
git push -u origin main --force

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "BASARILI! GitHub'a yuklendi." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Push basarisiz. Yukaridaki hatayi bana gosterin." -ForegroundColor Red
}
