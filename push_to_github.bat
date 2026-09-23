@echo off
cd /d "%~dp0"
echo =========================================================================
echo   Pushing Smart Dam Alert System (SDAS) to GitHub
echo   Repository: https://github.com/blacksnake200212-del/FYP_SDAS.git
echo   Branch: main
echo =========================================================================
echo.
git push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Successfully pushed all SDAS files to GitHub!
) else (
    echo [ERROR] Git push encountered an issue. Please verify GitHub authentication.
)
echo.
pause
