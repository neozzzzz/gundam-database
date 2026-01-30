@echo off
chcp 65001 > nul
echo ========================================
echo   Git 업로드
echo ========================================
echo.

set /p msg="업데이트 내용: "

if "%msg%"=="" (
    echo 업데이트 내용을 입력해주세요.
    pause
    exit /b 1
)

echo.
echo [1/3] git add .
git add .

echo.
echo [2/3] git commit -m "%msg%"
git commit -m "%msg%"

echo.
echo [3/3] git push -u origin main
git push -u origin main

echo.
echo ========================================
echo   완료!
echo ========================================
pause
