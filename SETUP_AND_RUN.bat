@echo off
setlocal
cd /d "%~dp0"

echo ==========================================
echo   PLAYFORGE - setup and launch
echo ==========================================

where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js was not found.
  echo Install Node.js 20 or newer from https://nodejs.org/ and try again.
  pause
  exit /b 1
)
where npm >nul 2>nul
if errorlevel 1 (
  echo ERROR: npm was not found. Reinstall Node.js and ensure npm is included.
  pause
  exit /b 1
)

if not exist package.json (
  echo ERROR: package.json was not found. Open the extracted playforge project folder.
  pause
  exit /b 1
)

if not exist "node_modules\react\package.json" goto install
if not exist "node_modules\react-dom\package.json" goto install
if not exist "node_modules\framer-motion\package.json" goto install
if not exist "node_modules\canvas-confetti\package.json" goto install
if not exist "node_modules\lucide-react\package.json" goto install
if not exist "node_modules\vite\package.json" goto install
if not exist "node_modules\@vitejs\plugin-react\package.json" goto install
goto ready

:install
echo.
echo Required packages are missing. Installing them now...
echo This requires an internet connection on the first run.
echo.
call npm install --no-audit --no-fund
if errorlevel 1 (
  echo.
  echo ERROR: npm could not install dependencies.
  echo Check your internet connection, then run these commands in this folder:
  echo   npm config get registry
  echo   npm ping
  echo   npm install
  echo.
  echo If npm ping fails, this is a network/DNS/proxy issue, not an App.tsx code error.
  pause
  exit /b 1
)

:ready
echo.
echo Starting PLAYFORGE. Keep this window open while using the app.
echo Open the localhost URL shown below, usually http://localhost:5173
call npm run dev
pause
