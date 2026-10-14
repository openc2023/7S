@echo off
chcp 65001 >nul
setlocal
pushd "%~dp0"
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\manage.ps1" -Action Menu
if errorlevel 1 pause
popd
endlocal
