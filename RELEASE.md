1. Comment `server` property in `capacitor.config.ts`.
2. Change version number in `.env.production` file.
3. Change `versionCode` and `versionName` in `android/app/build.gradle` file.
4. Run the following commands to build the application:

```shell
npm run build
npm run sync
```

5. Open the project in Android Studio:

```shell
npm run open:android
```

6. Build the application in Android Studio: `Build` -> `Generate Signed Bundle / APK...` -> `APK` -> `Next` -> `Create new...` -> `Next` -> `Finish`.
