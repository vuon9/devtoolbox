#!/usr/bin/env bash
set -euo pipefail

app_name="${APP_NAME:-DevToolbox}"
bin_dir="${BIN_DIR:-bin}"

export GOOS=darwin
export CGO_ENABLED=1
export CGO_CFLAGS="-mmacosx-version-min=10.15"
export CGO_LDFLAGS="-mmacosx-version-min=10.15"
export MACOSX_DEPLOYMENT_TARGET="10.15"

go mod download

test -f build/darwin/Info.plist
test -f build/darwin/icons.icns

(
  cd frontend
  bun install --frozen-lockfile
  PRODUCTION=true bun run build
)

mkdir -p "$bin_dir"

GOARCH=amd64 go build -tags production -trimpath -buildvcs=false -ldflags="-w -s" -o "$bin_dir/$app_name-amd64" .
GOARCH=arm64 go build -tags production -trimpath -buildvcs=false -ldflags="-w -s" -o "$bin_dir/$app_name-arm64" .

lipo -create -output "$bin_dir/$app_name" "$bin_dir/$app_name-amd64" "$bin_dir/$app_name-arm64"
rm "$bin_dir/$app_name-amd64" "$bin_dir/$app_name-arm64"

app_bundle="$bin_dir/$app_name.app"
rm -rf "$app_bundle"
mkdir -p "$app_bundle/Contents/MacOS"
mkdir -p "$app_bundle/Contents/Resources"

cp "$bin_dir/$app_name" "$app_bundle/Contents/MacOS/"
cp build/darwin/Info.plist "$app_bundle/Contents/"
cp build/darwin/icons.icns "$app_bundle/Contents/Resources/"
if [[ -f build/darwin/Assets.car ]]; then
  cp build/darwin/Assets.car "$app_bundle/Contents/Resources/"
fi

echo "Created $app_bundle"
