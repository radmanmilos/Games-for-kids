@echo off
rem Wrapper to run the AI startup PowerShell script from project root
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\ai_startup.ps1"
pause
