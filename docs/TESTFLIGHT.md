# TestFlight Setup

This app ships to TestFlight through EAS Build, mirroring the `FlowState-BCI/mobile`
setup (a `testflight` build profile + submit by App Store Connect app id), with one
change: signing uses an **App Store Connect API key** so the build + submit run
non-interactively (no Apple 2FA prompts).

## One-time account setup

1. Be enrolled in the Apple Developer Program that will own the build.
2. Register the App ID at developer.apple.com → Certificates, Identifiers & Profiles →
   Identifiers: Explicit, bundle id `com.flowstatebci.testing`.
3. In App Store Connect, create the app record:
   - Name: `FlowState Testing`
   - Bundle ID: `com.flowstatebci.testing`
   - SKU: `flowstate-testing`
4. Create an App Store Connect API key (Users and Access → Integrations → App Store
   Connect API), role **Admin**. Download the `.p8` (once only) and note the Key ID +
   Issuer ID.
5. Expo: this repo is already linked to the EAS project `@devanvelji/flowstate-testing`.

## Build and submit

Provide the API key via environment variables, then run the build (which auto-submits):

```bash
export EXPO_ASC_API_KEY_PATH=/absolute/path/to/AuthKey_XXXX.p8
export EXPO_ASC_KEY_ID=XXXXXXXXXX
export EXPO_ASC_ISSUER_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

npm run build:ios:testflight
```

That builds an iOS App Store archive with the `testflight` profile (EAS generates the
distribution certificate + provisioning profile from the API key) and submits the
finished build to TestFlight.

Submit-only (if a build already exists):

```bash
npm run submit:ios:testflight
```

Submit a specific build id:

```bash
npx eas submit --platform ios --profile testflight --id <build-id>
```

> The `.p8` key is a secret — keep it out of git (store it outside the repo). Do not pass
> `--what-to-test` unless the EAS plan supports changelog submission.

## Inviting testers

Internal testers must be App Store Connect users on the Apple account. Friends not on the
account are added as external testers in a TestFlight group; the first external build
needs Apple Beta App Review before they can install.
