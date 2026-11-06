@echo off
setlocal
cd /d "%~dp0"
title Render: lighthouse full video
set ROOT=%~dp0..\..\
set ENGINE=%ROOT%build\engine
echo.
echo === Test render: full lighthouse video in the new style ===
echo.
if not exist "%ENGINE%\node_modules" (
  echo First run: setting up the renderer. This takes a few minutes, once.
  if not exist "%ENGINE%" mkdir "%ENGINE%"
  copy /y "%ROOT%build\kiruna\package.json" "%ENGINE%\" >nul
  copy /y "%ROOT%build\kiruna\package-lock.json" "%ENGINE%\" >nul
  pushd "%ENGINE%"
  call npm install
  if errorlevel 1 ( popd & goto fail )
  popd
)
robocopy "%~dp0src" "%ENGINE%\src" /MIR /NFL /NDL /NJH /NJS /NP >nul
robocopy "%~dp0public" "%ENGINE%\public" /MIR /NFL /NDL /NJH /NJS /NP >nul
if not exist "%ROOT%output\tests" mkdir "%ROOT%output\tests"
pushd "%ENGINE%"
if not exist out mkdir out
call npx remotion render src/index.jsx Full out\silent.mp4 --gl=angle --concurrency=4 --image-format=jpeg --jpeg-quality=92 --crf=17
if errorlevel 1 ( popd & goto fail )
call npx remotion ffmpeg -y -i out\silent.mp4 -i public\voiceover.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest "%ROOT%output\tests\lighthouse_full.mp4"
if errorlevel 1 ( popd & goto fail )
popd
echo.
echo Done: output\tests\lighthouse_full.mp4
start "" "%ROOT%output\tests\lighthouse_full.mp4"
pause
exit /b 0
:fail
echo.
echo Something went wrong. Scroll up to see the error, or send Claude a screenshot.
pause
exit /b 1
