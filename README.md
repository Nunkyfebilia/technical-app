# TechnicalApp

A React Native shopping app with authentication and product browsing.

Users can:
- Login with email/password (via backend API)
- Login with Google Sign-In
- Browse products in a 2-column catalog
- Search, sort, and filter by category
- Open product details and simulate checkout
- Switch between light and dark theme

## Built With

- React Native `0.84` (CLI project, not Expo managed)
- React `19`
- React Navigation (`@react-navigation/native`, native stack)
- Google Sign-In (`@react-native-google-signin/google-signin`)
- Async Storage (`@react-native-async-storage/async-storage`)
- Axios for API requests
- React Native Vector Icons and Linear Gradient
- Node.js env sync script (`scripts/sync-env.js`)

## Project Notes

- Auth API base URL is read from `.env` and synced into `src/config/runtimeEnv.generated.js`.
- Product listing and details currently use `https://dummyjson.com` for demo data.
- App entry point is `App.js`.

## Environment Variables

Create `.env` in the project root:

```env
EXPO_PUBLIC_API_BASE=https://your-backend-url
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
# Optional:
# EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID=your-expo-client-id.apps.googleusercontent.com
```

## Requirements

- Node.js `>= 22.11.0`
- Android Studio + SDK (for Android)
- Xcode + CocoaPods (for iOS on macOS)

Reference: https://reactnative.dev/docs/set-up-your-environment

## Getting Started

Install dependencies:

```sh
npm install
```

Start Metro:

```sh
npm start
```

Run Android:

```sh
npm run android
```

Run iOS (macOS only):

```sh
bundle install
bundle exec pod install --project-directory=ios
npm run ios
```

## Available Scripts

- `npm run env:sync` - Sync `.env` values into runtime config
- `npm start` - Sync env + start Metro bundler
- `npm run android` - Sync env + build/run Android
- `npm run ios` - Sync env + build/run iOS
- `npm test` - Sync env + run tests
- `npm run lint` - Run ESLint
