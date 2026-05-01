@echo off
setlocal EnableDelayedExpansion

TITLE Apn-E-Dukaan Launcher
COLOR 0A

echo ===================================================
echo       Apn-E-Dukaan Automatic Startup Script
echo ===================================================
echo.

:: 1. Navigate to project directory automatically
set "PROJECT_ROOT=%~dp0"
set "BACKEND_DIR=%PROJECT_ROOT%backend"
set "FRONTEND_DIR=%PROJECT_ROOT%frontend"

if not exist "%BACKEND_DIR%\manage.py" (
    echo [ERROR] manage.py not found! Are you sure the backend folder exists at %BACKEND_DIR%?
    goto :error
)

cd /d "%BACKEND_DIR%"
echo [INFO] Working Directory: %CD%

:: 2. Check if Python is installed
python --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Python is not installed or not added to PATH.
    echo Please install Python 3.8+ and try again.
    goto :error
)
echo [OK] Python is installed.

:: 3. Activate virtual environment
set "VENV_DIR=%BACKEND_DIR%\venv"
if not exist "%VENV_DIR%\Scripts\activate.bat" (
    echo [INFO] Virtual environment not found. Creating one...
    python -m venv "%VENV_DIR%"
    if !ERRORLEVEL! neq 0 (
        echo [ERROR] Failed to create virtual environment.
        goto :error
    )
    echo [OK] Virtual environment created successfully.
)

echo [INFO] Activating virtual environment...
call "%VENV_DIR%\Scripts\activate.bat"
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to activate virtual environment.
    goto :error
)

:: 4. Check and install backend dependencies
if exist "requirements.txt" (
    echo [INFO] Checking backend dependencies...
    python -m pip install --upgrade pip >nul 2>&1
    pip install -r requirements.txt
    if !ERRORLEVEL! neq 0 (
        echo [ERROR] Failed to install backend requirements.
        goto :error
    )
    echo [OK] Backend dependencies installed/verified.
) else (
    echo [WARNING] requirements.txt not found. Skipping backend dependency installation.
)

:: 5. Check and install frontend dependencies
if exist "%FRONTEND_DIR%\package.json" (
    echo [INFO] Checking Node.js...
    node -v >nul 2>&1
    if !ERRORLEVEL! neq 0 (
        echo [ERROR] Node.js is not installed or not added to PATH.
        echo Please install Node.js and try again.
        goto :error
    )
    echo [OK] Node.js is installed.
    
    if not exist "%FRONTEND_DIR%\node_modules" (
        echo [INFO] Installing frontend dependencies...
        cd /d "%FRONTEND_DIR%"
        call npm install
        cd /d "%BACKEND_DIR%"
    ) else (
        echo [OK] Frontend dependencies already installed.
    )
)

:: 6. Validate project structure before launch (check media)
if not exist "media" (
    mkdir media
)
if not exist "media\products" (
    mkdir media\products
)
echo [OK] Media directories validated.

:: 7. Database Migrations
echo [INFO] Running database migrations...
python manage.py makemigrations
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to create migrations.
    goto :error
)
python manage.py migrate
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to apply migrations.
    goto :error
)
echo [OK] Database is up-to-date.

:: 8. Collect static files
echo [INFO] Collecting static files...
python manage.py collectstatic --noinput >nul 2>&1
echo [OK] Static files collected (if configured).

:: 9. Check / Create Superuser Prompt
echo [INFO] Checking for admin superuser...
python -c "import os; import django; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings'); django.setup(); from django.contrib.auth import get_user_model; User = get_user_model(); print('EXISTS' if User.objects.filter(is_superuser=True).exists() else 'MISSING')" > superuser_check.tmp

set /p SU_STATUS=<superuser_check.tmp
del superuser_check.tmp

if "%SU_STATUS%"=="MISSING" (
    echo [WARNING] No superuser found!
    set /p CREATE_SU="Do you want to create an admin superuser now? (Y/N): "
    if /I "!CREATE_SU!"=="Y" (
        python manage.py createsuperuser
    )
) else (
    echo [OK] Superuser already exists.
)

:: 10. Kill existing servers on ports 8000 and 5173
echo [INFO] Checking for conflicting processes on Ports 8000 and 5173...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do (
    if "%%a" neq "0" (
        echo [INFO] Killing process %%a currently using port 8000...
        taskkill /F /PID %%a >nul 2>&1
    )
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
    if "%%a" neq "0" (
        echo [INFO] Killing process %%a currently using port 5173...
        taskkill /F /PID %%a >nul 2>&1
    )
)

:: 11. Start Servers and Open Browser
echo ===================================================
echo       Project Ready to Launch!
echo ===================================================
echo [INFO] Launching Django Backend Server on localhost:8000
echo [INFO] Launching React Frontend Server on localhost:5173

if exist "%FRONTEND_DIR%\package.json" (
    start "Apn-E-Dukaan Frontend" cmd /c "cd /d %FRONTEND_DIR% && npm run dev"
)

echo [INFO] Opening default browser...
:: Wait 3 seconds before opening browser to ensure servers are up
ping 127.0.0.1 -n 3 > nul
start "" http://localhost:5173

echo [INFO] Backend Server logs below. Press Ctrl+C to stop both servers.
echo ===================================================
python manage.py runserver 8000

:: If server crashes or stops
goto :eof

:error
echo.
echo ===================================================
echo [FAILURE] Script encountered an error and stopped.
echo ===================================================
pause
exit /b 1
