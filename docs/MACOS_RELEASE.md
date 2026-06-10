# macOS Signed Release

This project ships macOS releases as a signed, notarized, and stapled
`DevToolbox-macos.dmg` from `.github/workflows/release.yml`.

## Required GitHub Secrets

Configure these repository secrets before running a release:

- `MACOS_CERTIFICATE`: base64 encoded Developer ID Application `.p12`
- `MACOS_CERTIFICATE_PASSWORD`: password for the `.p12`
- `MACOS_SIGN_IDENTITY`: full Developer ID Application identity name
- `APPLE_ID`: Apple ID used for notarization
- `APPLE_APP_SPECIFIC_PASSWORD`: app-specific password for the Apple ID
- `APPLE_TEAM_ID`: Apple Developer Team ID

The release workflow fails early on the macOS job if any of these secrets are
missing. Unsigned macOS release artifacts are not uploaded by the release job.

## What the Workflow Does

On macOS runners, the release job:

1. Builds a universal `DevToolbox.app`.
2. Imports the Developer ID Application certificate into a temporary keychain.
3. Signs the app with hardened runtime and timestamping.
4. Verifies the signature with `codesign --verify`.
5. Submits the app to Apple notarization and waits for completion.
6. Staples and validates the notarization ticket.
7. Runs `spctl --assess --type execute`.
8. Packages the stapled app into `DevToolbox-macos.dmg`.
9. Verifies the DMG with `hdiutil verify`.

Mini owns certificate setup, notarization credentials, and final local Gatekeeper
verification for the released artifact.

## Local macOS Verification

After downloading the release DMG on macOS:

```bash
hdiutil verify DevToolbox-macos.dmg
hdiutil attach DevToolbox-macos.dmg
spctl --assess --type execute --verbose=4 /Volumes/DevToolbox/DevToolbox.app
codesign --verify --deep --strict --verbose=2 /Volumes/DevToolbox/DevToolbox.app
open /Volumes/DevToolbox/DevToolbox.app
```
