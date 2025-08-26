@echo off
echo ========================================
echo    MindCare Platform Startup Script
echo ========================================
echo.
echo Starting all MindCare services...
echo.

echo [1/4] Starting Flask Backend...
echo    - API Server: http://localhost:5000
echo    - Health Check: http://localhost:5000/health
echo    - Test Endpoint: http://localhost:5000/api/test

REM Simple Python detection - avoid complex variable expansion
echo Checking for Python installation...

REM Try py command first (Windows Python Launcher)
py --version >nul 2>&1
if %errorlevel% == 0 (
    set PYTHON_CMD=py
    echo Found Python using 'py' command
    goto :python_found
)

REM Try python command
python --version >nul 2>&1
if %errorlevel% == 0 (
    set PYTHON_CMD=python
    echo Found Python using 'python' command
    goto :python_found
)

REM Try common Python locations
if exist "C:\Python313\python.exe" (
    set PYTHON_CMD=C:\Python313\python.exe
    echo Found Python 3.13 at: C:\Python313\python.exe
    goto :python_found
)

if exist "C:\Python312\python.exe" (
    set PYTHON_CMD=C:\Python312\python.exe
    echo Found Python 3.12 at: C:\Python312\python.exe
    goto :python_found
)

if exist "C:\Python311\python.exe" (
    set PYTHON_CMD=C:\Python311\python.exe
    echo Found Python 3.11 at: C:\Python311\python.exe
    goto :python_found
)

if exist "C:\Python310\python.exe" (
    set PYTHON_CMD=C:\Python310\python.exe
    echo Found Python 3.10 at: C:\Python310\python.exe
    goto :python_found
)

if exist "C:\Python39\python.exe" (
    set PYTHON_CMD=C:\Python39\python.exe
    echo Found Python 3.9 at: C:\Python39\python.exe
    goto :python_found
)

REM If we get here, Python was not found
echo.
echo ERROR: Python not found!
echo.
echo Please install Python 3.9+ from: https://www.python.org/downloads/
echo Or check if Python is installed in a custom location.
echo.
pause
exit /b 1

:python_found
echo.
echo Using Python: %PYTHON_CMD%
%PYTHON_CMD% --version
echo.

REM Check if required packages are installed
echo Checking required Python packages...
%PYTHON_CMD% -c "import flask" >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo WARNING: Flask not found!
    echo Installing required packages...
    %PYTHON_CMD% -m pip install -r "Mindcare_admin_backend\requirements.txt"
    if %errorlevel% neq 0 (
        echo Failed to install packages. Please install manually:
        echo %PYTHON_CMD% -m pip install flask flask-cors mysql-connector-python PyJWT bcrypt
        pause
    )
)

echo Starting Flask backend with py command...
start "Flask Backend" cmd /k "cd /d "%~dp0Mindcare_admin_backend\Mindcare_admin_backend" && py app.py"

echo [2/4] Starting Patient App...
echo    - Frontend: http://localhost:5173
echo    - Purpose: Patient portal for booking appointments

REM Check if Node.js is available
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo Found Node.js, starting Patient App...
    start "Patient App" cmd /k "cd /d "%~dp0Mincare-main\Mincare-main" && npm run dev"
) else (
    echo WARNING: Node.js not found! Patient App will not start.
    echo Please install Node.js from: https://nodejs.org/
)

echo [3/4] Starting Admin App...
echo    - Frontend: http://localhost:5174
echo    - Purpose: Administrative dashboard

if exist "MindCare_Admin-main\MindCare_Admin-main\package.json" (
    echo Starting Admin App...
    start "Admin App" cmd /k "cd /d "%~dp0MindCare_Admin-main\MindCare_Admin-main" && npm run dev"
) else (
    echo WARNING: Admin App directory not found!
)

echo [4/4] Starting Doctor App...
echo    - Frontend: http://localhost:5175
echo    - Purpose: Doctor/ therapist portal

if exist "Mindcare_Doctor-main\Mindcare_Doctor-main\package.json" (
    echo Starting Doctor App...
    start "Doctor App" cmd /k "cd /d "%~dp0Mindcare_Doctor-main\Mindcare_Doctor-main" && npm run dev"
) else (
    echo WARNING: Doctor App directory not found!
)

echo.
echo ========================================
echo All services are starting...
echo Check the new command windows!
echo ========================================
echo.
echo Access URLs:
echo.
echo Backend API: http://localhost:5000
echo Patient App: http://localhost:5173
echo Admin App: http://localhost:5174
echo Doctor App: http://localhost:5175
echo.
echo Note: Make sure WAMP is running (green icon)
echo.
pause
