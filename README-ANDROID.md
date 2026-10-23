# Авторитет 2.0 — Android / RuStore

This branch keeps the existing HTML/CSS/JavaScript game as the source of truth and uses Capacitor to package it as an Android application.

## Requirements

- Node.js 22 or newer
- Android Studio with an Android SDK installed
- A supported JDK installed/configured by Android Studio

## Create the Android project locally

From the repository root, on branch `rustore`:

```sh
npm install
npm run android:add
```

The `android:add` command stages the web game into `www/` and creates the native Android project. The generated `android/` directory is intentionally not committed by the initial scaffold; after generation, review it and commit the native project files to the `rustore` branch, excluding local build output and signing keys.

## Sync game changes

After changing the HTML/CSS/JS source files:

```sh
npm run android:sync
```

To build a local debug APK from a macOS/Linux shell after installing the requirements, run:

```sh
bash scripts/build-debug-apk.sh
```

The script checks Node.js and Android SDK availability, installs npm dependencies, creates the Android project, and runs Gradle to build a debug APK. It has not yet been run against this repository in a real Android build environment.

Then open the project in Android Studio:

```sh
npm run android:open
```

## Important current status

- The game source remains in the repository root; `scripts/prepare-web.mjs` stages its files into `www/`.
- The intended app orientation is portrait. Set `android:screenOrientation="portrait"` on the generated main activity in `android/app/src/main/AndroidManifest.xml` before device testing.
- The existing `js/platform-bridge.js` is only an adapter contract. It does not itself implement a native ad SDK. Real Yandex Mobile Ads integration still needs a native Capacitor plugin/bridge and ad unit IDs from the advertising dashboard.
- No APK/AAB is produced by these repository changes. Build and test locally in Android Studio before publishing.
- Never commit advertising secrets, signing keys, or private keystores.
