@echo off
cd /d "%~dp0\mobile_apps\public_app"
echo =========================================================================
echo   Building SDAS Public Community Mobile App (APK) with Expo EAS
echo   Project: fypsdas | Account: vibecodes-team (blacksnake200212@gmail.com)
echo =========================================================================
echo.
echo Checking EAS login...
call npx eas-cli whoami
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Please log in with your Expo account: blacksnake200212@gmail.com
    call npx eas-cli login
)
echo.
echo Starting EAS Cloud Build for Android (APK)...
call npx eas-cli build --platform android --profile preview
echo.
pause
