@echo off
echo Foliow Deploy baslatiliyor...
powershell -ExecutionPolicy Bypass -File "%~dp0deploy.ps1"
pause
