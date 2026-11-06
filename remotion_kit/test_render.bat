@echo off
cd /d "%~dp0"
echo.
echo === 30-frame test render (1 second) ===
call npm install
if errorlevel 1 goto fail
if not exist out mkdir out
call npx remotion render src/index.jsx Full out\test.mp4 --frames=0-29 --gl=angle --concurrency=4 --image-format=jpeg --jpeg-quality=92 --crf=17
if errorlevel 1 goto fail
echo.
echo Test done: out\test.mp4. If it looks right, run render.bat.
pause
exit /b 0
:fail
echo.
echo Something went wrong. Scroll up to see the error.
pause
exit /b 1
