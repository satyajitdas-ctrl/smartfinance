Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "       FinWise AI - Intelligent Personal Finance" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$root = $PSScriptRoot

Write-Host "`n[1/3] Starting FastAPI Backend on http://127.0.0.1:8000 ..." -ForegroundColor Green
Start-Process cmd -ArgumentList "/k cd /d `"$root\backend`" && python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

Write-Host "[2/3] Starting React Vite Frontend on http://127.0.0.1:5173 ..." -ForegroundColor Green
Start-Process cmd -ArgumentList "/k cd /d `"$root\frontend`" && npm run dev -- --host 127.0.0.1 --port 5173"

Write-Host "[3/3] Opening browser at http://127.0.0.1:5173 ..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
Start-Process "http://127.0.0.1:5173"

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "FinWise AI is running locally!" -ForegroundColor Green
Write-Host "Web Application: http://127.0.0.1:5173" -ForegroundColor White
Write-Host "API Swagger Docs: http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "Demo Email:    satyajit@example.com" -ForegroundColor White
Write-Host "Demo Password: SecurePassword123!" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Cyan
