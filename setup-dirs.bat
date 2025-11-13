@echo off
echo Creating directory structure for ecom-connector...

mkdir src 2>nul
mkdir src\platforms 2>nul
mkdir src\platforms\zalooa 2>nul
mkdir src\platforms\tiktokshop 2>nul
mkdir src\platforms\shopee 2>nul
mkdir src\platforms\lazada 2>nul
mkdir examples 2>nul
mkdir dist 2>nul

echo.
echo Directory structure created successfully!
echo.
echo Next steps:
echo 1. Run: npm install
echo 2. Run: npm run build
echo.
pause
