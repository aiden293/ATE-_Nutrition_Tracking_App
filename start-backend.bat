@echo off
REM Backend Switcher Script for Windows
REM Easily switch between Node.js and Python backends

SET BACKEND_TYPE=%1

IF "%BACKEND_TYPE%"=="" (
    SET BACKEND_TYPE=node
)

IF /I "%BACKEND_TYPE%"=="node" GOTO NODE
IF /I "%BACKEND_TYPE%"=="nodejs" GOTO NODE
IF /I "%BACKEND_TYPE%"=="js" GOTO NODE
IF /I "%BACKEND_TYPE%"=="python" GOTO PYTHON
IF /I "%BACKEND_TYPE%"=="py" GOTO PYTHON

:USAGE
echo Usage: start-backend.bat [node^|python]
echo.
echo Examples:
echo   start-backend.bat node    # Start Node.js backend (port 5000)
echo   start-backend.bat python  # Start Python backend (port 5001)
exit /b 1

:NODE
echo Starting Node.js backend on port 5000...
cd backend\nodejs
node server.js
exit /b 0

:PYTHON
echo Starting Python backend on port 5001...
cd backend

REM Check if virtual environment exists
IF NOT EXIST "venv\" (
    echo Creating Python virtual environment...
    python -m venv venv
    call venv\Scripts\activate.bat
    pip install -r requirements.txt
) ELSE (
    call venv\Scripts\activate.bat
)

python server.py
exit /b 0
