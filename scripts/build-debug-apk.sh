#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required. Install Node.js 22 or newer, then rerun this script." >&2
  exit 1
fi

NODE_MAJOR="$(node -p 'Number(process.versions.node.split(".")[0])')"
if [ "$NODE_MAJOR" -lt 22 ]; then
  echo "Node.js 22 or newer is required (found $(node --version))." >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required but was not found." >&2
  exit 1
fi

if [ ! -d "$ANDROID_HOME" ] && [ ! -d "${ANDROID_SDK_ROOT:-}" ]; then
  echo "Android SDK not found. Install Android Studio and configure ANDROID_HOME or ANDROID_SDK_ROOT." >&2
  exit 1
fi

npm install --no-audit --no-fund
npm run android:add

cd "$ROOT_DIR/android"
if [ ! -x "./gradlew" ]; then
  echo "Gradle wrapper was not generated. Check the Capacitor Android setup." >&2
  exit 1
fi

./gradlew assembleDebug

APK="$ROOT_DIR/android/app/build/outputs/apk/debug/app-debug.apk"
if [ ! -f "$APK" ]; then
  echo "Build completed without the expected APK at: $APK" >&2
  exit 1
fi

echo
echo "Debug APK created successfully:"
echo "$APK"
