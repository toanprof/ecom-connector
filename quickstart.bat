@echo off
echo ============================================================
echo ecom-connector Quick Start
echo ============================================================
echo.

:menu
echo Choose setup method:
echo.
echo 1. Auto-setup with Python (Recommended)
echo 2. Auto-setup with Node.js (Manual copy needed)
echo 3. View instructions only
echo 4. Exit
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto python_setup
if "%choice%"=="2" goto node_setup
if "%choice%"=="3" goto instructions
if "%choice%"=="4" goto end

echo Invalid choice. Please try again.
echo.
goto menu

:python_setup
echo.
echo Running Python auto-setup...
echo.
python --version >nul 2>&1
if errorlevel 1 (
    echo Python not found! Please install Python 3.x
    echo Download from: https://www.python.org/downloads/
    pause
    goto menu
)
python extract-source.py
if errorlevel 1 (
    echo.
    echo Setup failed! Please check errors above.
    pause
    goto menu
)
goto npm_install

:node_setup
echo.
echo Running Node.js setup...
echo.
node --version >nul 2>&1
if errorlevel 1 (
    echo Node.js not found! Please install Node.js
    echo Download from: https://nodejs.org/
    pause
    goto menu
)
node setup.js
echo.
echo ============================================================
echo IMPORTANT: Source files need to be copied manually
echo ============================================================
echo.
echo Please follow these steps:
echo 1. Open SOURCE_CODE.md
echo 2. Copy each code section to its respective file
echo 3. Open SOURCE_CODE_PART2.md
echo 4. Copy remaining code sections
echo.
echo See SETUP_COMPLETE.md for detailed instructions
echo.
pause
goto npm_install

:npm_install
echo.
echo ============================================================
echo Installing NPM dependencies...
echo ============================================================
echo.
call npm install
if errorlevel 1 (
    echo.
    echo npm install failed! Please check errors above.
    pause
    goto menu
)

echo.
echo ============================================================
echo Building TypeScript...
echo ============================================================
echo.
call npm run build
if errorlevel 1 (
    echo.
    echo Build failed! Make sure all source files are in place.
    echo See SETUP_COMPLETE.md for file locations.
    pause
    goto menu
)

echo.
echo ============================================================
echo Setup Complete!
echo ============================================================
echo.
echo Next steps:
echo 1. Edit .env file with your API credentials
echo 2. Run: node dist\examples\example.js
echo.
echo For documentation, see:
echo - README.md (API documentation)
echo - INSTALLATION_GUIDE.md (detailed setup)
echo - PROJECT_SUMMARY.md (architecture overview)
echo.
pause
goto end

:instructions
echo.
echo ============================================================
echo Setup Instructions
echo ============================================================
echo.
echo Manual Setup Steps:
echo.
echo 1. Create directories:
echo    node setup.js
echo.
echo 2. Copy source code:
echo    - Open SOURCE_CODE.md
echo    - Copy each section to its file
echo    - Open SOURCE_CODE_PART2.md
echo    - Copy remaining sections
echo.
echo 3. Install and build:
echo    npm install
echo    npm run build
echo.
echo 4. Configure:
echo    Edit .env with your credentials
echo.
echo 5. Run:
echo    node dist\examples\example.js
echo.
echo See SETUP_COMPLETE.md for detailed instructions
echo.
pause
goto menu

:end
echo.
echo Thank you for using ecom-connector!
echo.
