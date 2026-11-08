@echo off
title FinWise AI - Local Launcher
echo ========================================================
echo        FinWise AI - Intelligent Personal Finance
echo ========================================================
echo.
echo [1/3] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "FinWise AI - Backend API" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

echo [2/3] Starting React Vite Frontend on http://127.0.0.1:5173 ...
start "FinWise AI - Frontend UI" cmd /k "cd /d %~dp0frontend && npm run dev -- --host 127.0.0.1 --port 5173"

echo [3/3] Opening application in Google Chrome...
timeout /t 3 /nobreak >nul
if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" http://127.0.0.1:5173
) else if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" http://127.0.0.1:5173
) else (
    start http://127.0.0.1:5173
)

echo.
echo ========================================================
echo FinWise AI is now running locally!
echo - Web App:        http://127.0.0.1:5173
echo - API Docs:       http://127.0.0.1:8000/docs
echo - Demo Email:     satyajit@example.com
echo - Demo Password:  SecurePassword123!
echo ========================================================
pause
