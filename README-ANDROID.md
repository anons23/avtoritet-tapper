# Авторитет 2.0 — Android / RuStore

This branch keeps the existing HTML/CSS/JavaScript game as the source of truth and uses Capacitor to package it as an Android application.

## Requirements

- Node.js 22 or newer
- Android Studio with an Android SDK installed
- JDK 21 (recommended for the current Gradle wrapper) or a JDK supported by the installed Android Gradle Plugin
- Internet access on the first Android build so Gradle can download Yandex Mobile Ads SDK

## Create the Android project locally

From the repository root, on branch `rustore`:

```sh
npm install
npm run android:add
```

The command stages the web game into `www/`, creates the native Android project, sets portrait orientation, registers the bundled Yandex Ads Capacitor plugin, and adds Yandex Mobile Ads SDK 8.6.0 to the Android app. The generated `android/` directory is intentionally not committed; the setup script recreates the native ad integration after Android project generation.

## Sync game changes

After changing the HTML/CSS/JS source files, run:

```sh
npm run android:sync
```

This copies the latest game files and reapplies the native ads setup. The setup is safe to run more than once and does not add duplicate plugin registrations or SDK dependencies.

## Build the APK

1. Open Android Studio.
2. Choose **Open** and select the project's `android` folder.
3. Wait for Gradle sync to finish. On the first run it downloads Yandex Mobile Ads SDK.
4. Connect an Android phone with USB debugging enabled, or select an emulator.
5. In Android Studio choose **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
6. When the build finishes, click **locate** in the notification to find the APK.

Alternatively, run `gradlew.bat assembleDebug` from the `android` folder in Windows PowerShell.

## Advertising configuration

The current advertising IDs are stored in `js/ads-config.js`:

- Yandex app ID: `20297973`
- Android package: `ru.avtoritet.game`
- Rewarded block: `R-M-20297973-1`
- Interstitial block: `R-M-20297973-2`

The native plugin passes these block IDs to Yandex Mobile Ads SDK. The IDs must exist in the same Yandex Advertising Network app and their formats must match (rewarded and interstitial). The repository cannot verify the status or moderation state of blocks in the user's Yandex account.

The browser preview intentionally keeps a small mock rewarded-ad callback for testing game flows. It is explicitly disabled in native Android: if the native plugin or a real ad is unavailable, no reward is granted.

## How to verify real ad integration

After building and installing the APK:

1. Open the game and trigger an action that asks to watch an ad (for example, the ×2 tap booster).
2. Confirm that an actual Yandex test/advertisement is shown. If no ad appears, do not assume the reward was granted.
3. In Android Studio open **View → Tool Windows → Logcat** and search for `Yandex Ads` or `YandexAds`.
4. Check the SDK integration messages. Yandex's integration guide documents the expected success messages and troubleshooting output.

For the first test, Yandex recommends using its demo ad unit IDs. Before release, switch back to the real block IDs from the advertising dashboard and verify that the app and blocks are active and approved.

## Important notes

- The Yandex Mobile Ads SDK is integrated using the official Android SDK dependency `com.yandex.android:mobileads:8.6.0`.
- Rewarded rewards are granted only after the SDK fires its `onRewarded` callback; closing or failing to load an ad does not grant a reward.
- Interstitial ads are shown only when the game explicitly requests them.
- The native Android source is generated locally by Capacitor and patched by `scripts/configure-android-ads.mjs`. Do not delete the `android-ads/` template or the setup script.
- No APK/AAB is produced by GitHub commits. Build and test locally in Android Studio before publishing.
- Never commit advertising secrets, signing keys, or private keystores.

## Official Yandex documentation

- [Android SDK quick start](https://yandex.com/support2/mobile-ads/support2/mobile-ads/ru/dev/android/quick-start)
- [Rewarded ads](https://yandex.com/support2/mobile-ads/support2/mobile-ads/ru/dev/android/rewarded)
- [Interstitial ads](https://ads.yandex.com/helpcenter/en/dev/android/interstitial)
