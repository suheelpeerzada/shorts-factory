@echo off
cd /d "%~dp0"
echo.
echo === Kiruna church short: full video, 1080x1920 ===
echo First run downloads packages and a browser. This can take a few minutes.
echo.
call npm install
if errorlevel 1 goto fail
if not exist out mkdir out
echo.
echo Rendering 1521 frames with your graphics card...
call npx remotion render src/index.jsx Full out\full_silent.mp4 --gl=angle --concurrency=4 --image-format=jpeg --jpeg-quality=92 --crf=17
if errorlevel 1 goto fail
echo.
echo Adding the voice-over...
call npx remotion ffmpeg -y -i out\full_silent.mp4 -i public\voiceover.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest final.mp4
if errorlevel 1 goto fail
if exist "..\..\output" copy /y final.mp4 "..\..\output\kiruna_church_final.mp4" >nul
echo.
echo Done. The video is final.mp4 (a copy is in the output folder).
pause
exit /b 0
:fail
echo.
echo Something went wrong. Scroll up to see the error, or send me a screenshot.
pause
exit /b 1
