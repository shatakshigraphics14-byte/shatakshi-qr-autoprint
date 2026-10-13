@echo off
cd /d "%~dp0"
if not exist .env (
  copy .env.example .env >nul
  echo .env ban gayi. Kripya .env kholkar ADMIN_PASSWORD badlein, phir dobara chalayein.
  notepad .env
  pause
  exit /b 1
)
if not exist node_modules (
  echo Dependencies install ho rahi hain...
  call npm install
  if errorlevel 1 pause & exit /b 1
)
call npm run dev
pause
