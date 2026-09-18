@echo off
echo === ClaimGuard AI - Full Stack Quick Start ===
echo.
echo [1] Setting up Python backend...
cd backend
pip install -r requirements.txt
copy .env.example .env 2>nul
echo.
echo [2] Starting backend server...
start cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --reload --port 8000"
echo.
echo [3] Setting up Admin Dashboard...
cd ../frontend
call npm install
echo.
echo [4] Starting Admin Dashboard...
start cmd /k "cd /d %~dp0frontend && npm run dev"
echo.
echo [5] Setting up Patient Portal...
cd ../frontend-portal
call npm install
echo.
echo [6] Starting Patient Portal...
start cmd /k "cd /d %~dp0frontend-portal && npm run dev"
echo.
echo === All servers starting! ===
echo Backend API:      http://localhost:8000
echo API Docs:         http://localhost:8000/docs
echo Admin Dashboard:  http://localhost:3000
echo Patient Portal:   http://localhost:5174
echo.
pause
