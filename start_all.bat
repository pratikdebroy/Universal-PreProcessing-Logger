@echo off
echo ========================================================
echo Launching NTRO Universal Adaptive Log Preprocessor
echo Smart India Hackathon 2026 (SIH26156)
echo ========================================================
start "NTRO Backend (FastAPI)" cmd /c "start_backend.bat"
timeout /t 3 /nobreak >nul
start "NTRO Frontend (React Vite)" cmd /c "start_frontend.bat"
timeout /t 3 /nobreak >nul
echo System started! Open http://localhost:5173 in your browser.
