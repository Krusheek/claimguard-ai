@echo off
echo === ClaimGuard AI - Quick Start ===
echo.
echo [1] Setting up Python backend...
cd backend
pip install -r requirements.txt
copy .env.example .env 2>nul
echo.
echo [2] Starting backend server...
start cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --reload --port 8000"
echo.
echo [3] Setting up React frontend...
cd ../frontend
call npm install
echo.
echo [4] Starting frontend dev server...
start cmd /k "cd /d %~dp0frontend && npm run dev"
echo.
echo === Both servers starting! ===
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo API Docs: http://localhost:8000/docs
pause
