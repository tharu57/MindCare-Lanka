@echo off
REM ========================================
REM    MindCare Platform Configuration
REM ========================================
REM
REM This file allows you to customize paths for your system
REM Copy this file and modify the paths below if needed
REM
REM ========================================

REM Python Configuration
REM Uncomment and modify ONE of these lines based on your Python installation:

REM Option 1: Use 'py' command (Windows Python Launcher - RECOMMENDED)
set PYTHON_CMD=py

REM Option 2: Custom Python path (uncomment and modify)
REM set PYTHON_CMD=C:\YourPythonPath\python.exe

REM Option 3: Use Python from PATH
REM set PYTHON_CMD=python

REM Option 4: Specific Python version (uncomment and modify)
REM set PYTHON_CMD=C:\Python311\python.exe
REM set PYTHON_CMD=C:\Users\%USERNAME%\AppData\Local\Programs\Python\Python311\python.exe

REM ========================================

REM Node.js Configuration
REM Uncomment and modify if Node.js is not in PATH:

REM set NODE_CMD=C:\Program Files\nodejs\node.exe
REM set NPM_CMD=C:\Program Files\nodejs\npm.cmd

REM ========================================

REM Database Configuration
REM Uncomment if you're using a different database setup:

REM set DATABASE_HOST=localhost
REM set DATABASE_PORT=3306
REM set DATABASE_NAME=mindcare

REM ========================================

REM Port Configuration (optional - change if ports are in use)
REM set BACKEND_PORT=5000
REM set PATIENT_APP_PORT=5173
REM set ADMIN_APP_PORT=5174
REM set DOCTOR_APP_PORT=5175

REM ========================================

REM Auto-install packages (set to 0 to disable)
set AUTO_INSTALL_PACKAGES=1

REM ========================================

echo Configuration loaded:
echo - Python: %PYTHON_CMD%
echo - Auto-install packages: %AUTO_INSTALL_PACKAGES%
if defined NODE_CMD echo - Node.js: %NODE_CMD%
if defined NPM_CMD echo - NPM: %NPM_CMD%
echo.
echo Note: Using 'py' command (Windows Python Launcher)
echo This should work with Python 3.13.7 on your system
echo.
echo To modify these settings, edit this file.
echo.
pause
