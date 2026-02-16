@echo off
echo ========================================
echo   Pre-Push Security Check
echo ========================================
echo.
echo Checking for sensitive data...
echo.

cd /d %~dp0

REM Check if .env exists and warn
if exist .env (
    echo [WARNING] .env file found!
    echo.
    echo Checking if .env is in .gitignore...
    findstr /C:".env" .gitignore >nul
    if errorlevel 1 (
        echo [ERROR] .env is NOT in .gitignore!
        echo Please add it before pushing!
        pause
        exit /b 1
    ) else (
        echo [OK] .env is in .gitignore
    )
) else (
    echo [OK] No .env file found
)

echo.
echo Checking for node_modules...
if exist node_modules (
    findstr /C:"node_modules" .gitignore >nul
    if errorlevel 1 (
        echo [ERROR] node_modules is NOT in .gitignore!
        pause
        exit /b 1
    ) else (
        echo [OK] node_modules is in .gitignore
    )
) else (
    echo [OK] No node_modules found
)

echo.
echo Checking for sensitive files...
if exist server\credentials.json (
    echo [WARNING] credentials.json found!
)
if exist server\secrets.json (
    echo [WARNING] secrets.json found!
)

echo.
echo ========================================
echo   Security Check Complete
echo ========================================
echo.
echo Files that will be pushed:
echo.
git status 2>nul
if errorlevel 1 (
    echo [INFO] Git not initialized yet
    echo Run: git init
) else (
    echo.
    echo Review the files above carefully!
)

echo.
echo ========================================
echo   Ready to push?
echo ========================================
echo.
echo If everything looks good, run:
echo   PUSH-TO-GITHUB.bat
echo.
pause
