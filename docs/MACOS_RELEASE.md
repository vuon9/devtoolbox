# macOS Signed Release

This project ships macOS releases as a signed, notarized, and stapled
`DevToolbox-macos-universal.dmg` from `.github/workflows/release.yml`.

The first signed release is intentionally macOS-only. Linux and Windows release
artifacts are skipped until a later release pass.

Release tags use normal project SemVer. Stable releases use tags such as
`v0.10.0`; prereleases use tags such as `v0.10.0-rc.1`. The packaging script
embeds the stable base version into the macOS app bundle as
`CFBundleShortVersionString` and `CFBundleVersion`, so a prerelease tag like
`v0.10.0-rc.1` embeds `0.10.0` in the app bundle and marks the GitHub Release
as a prerelease.

## Required GitHub Secrets

Configure these repository secrets before running a release:

- `APPLE_DEVELOPER_ID_APPLICATION_CERTIFICATE_P12_BASE64`: base64 encoded Developer ID Application `.p12`
- `APPLE_DEVELOPER_ID_APPLICATION_CERTIFICATE_PASSWORD`: password for the `.p12`
- `APP_STORE_CONNECT_API_KEY_P8`: App Store Connect API private key content
- `APP_STORE_CONNECT_API_KEY_ID`: App Store Connect API key ID
- `APP_STORE_CONNECT_API_ISSUER_ID`: App Store Connect issuer ID

Optional:

- `MACOS_CODESIGN_IDENTITY`: full `Developer ID Application: ... (TEAMID)` identity name. If omitted, the reusable workflow finds the imported Developer ID Application identity for team `256XRVYZ9V`.

The release workflow fails early if required signing or notarization secrets are
missing. Unsigned macOS release artifacts are not uploaded by the release job.

## What the Workflow Does

On macOS runners, the release job:

1. Builds a universal `DevToolbox.app`.
2. Embeds the SemVer tag into the app bundle version fields.
3. Imports the Developer ID Application certificate into a temporary keychain.
4. Signs the app with hardened runtime and timestamping.
5. Verifies the signature with `codesign --verify`.
6. Submits the app to Apple notarization through App Store Connect API keys.
7. Staples and validates the app notarization ticket.
8. Runs `spctl --assess --type execute`.
9. Packages the stapled app into `DevToolbox-macos-universal.dmg`.
10. Signs, notarizes, staples, and verifies the DMG.

Mini owns Apple Developer certificate export, repository secret setup, and final
local Gatekeeper verification for the released artifact.

## Local macOS Verification

After downloading the release DMG on macOS:

```bash
hdiutil verify DevToolbox-macos-universal.dmg
hdiutil attach DevToolbox-macos-universal.dmg
spctl --assess --type execute --verbose=4 /Volumes/DevToolbox/DevToolbox.app
codesign --verify --deep --strict --verbose=2 /Volumes/DevToolbox/DevToolbox.app
open /Volumes/DevToolbox/DevToolbox.app
```
