@echo off
echo ========================================================
echo Starting NTRO Log Preprocessor - FastAPI Backend Server
echo Port: 8000 (Air-Gapped Local Mode)
echo ========================================================
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
