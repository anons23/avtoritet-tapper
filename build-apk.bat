@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
echo ==============================================
echo   Avtoritet 2.0 - sborka APK dlya RuStore
echo ==============================================
echo.

where node >nul 2>nul || goto no_node

if not defined JAVA_HOME if exist "%ProgramFiles%\Android\Android Studio\jbr\bin\java.exe" set "JAVA_HOME=%ProgramFiles%\Android\Android Studio\jbr"
if not defined JAVA_HOME goto no_java

if not defined ANDROID_HOME if exist "%LOCALAPPDATA%\Android\Sdk" set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
if not defined ANDROID_HOME goto no_sdk

if not exist "keystore.properties" goto no_key

echo [1/3] Ustanovka zavisimostey (npm install)...
call npm install --no-audit --no-fund || goto fail
if not exist "node_modules\typescript\" call npm install -D typescript@5 --no-audit --no-fund || goto fail
if not exist "node_modules\typescript\" goto fail

if exist "android\" goto have_android
echo [2/3] Sozdanie Android-proekta...
call npm run android:add || goto fail
:have_android

echo [3/3] Sborka podpisannogo APK...
call npm run android:release || goto fail

echo.
echo ==============================================
echo   GOTOVO! Fayl app-release.apk otkroetsya v papke.
echo ==============================================
explorer "android\app\build\outputs\apk\release"
pause
exit /b 0

:no_node
echo OSHIBKA: ne nayden Node.js. Ustanovi Node.js 22 LTS s https://nodejs.org i zapusti snova.
goto end
:no_java
echo OSHIBKA: ne naydena Java. Ustanovi Android Studio (v nee vstroena Java) i zapusti snova.
goto end
:no_sdk
echo OSHIBKA: ne nayden Android SDK. Otkroy Android Studio odin raz i proydi master ustanovki do kontsa.
goto end
:no_key
echo OSHIBKA: net fayla keystore.properties ryadom s etim faylom. Smotri RELEASE-RUSTORE.md, shag 2.
goto end
:fail
echo.
echo OSHIBKA SBORKI. Sdelay snimok ekrana ili skopiruy tekst vyshe i prishli Claude.
:end
pause
exit /b 1
