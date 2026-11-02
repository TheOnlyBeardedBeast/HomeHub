#!/bin/sh
# Downloads the latest GitHub release and swaps it in next to this script.
# Stop HomeHub first, then run: ./update.sh
set -eu

repo='TheOnlyBeardedBeast/HomeHub'
bin='HomeHub.Hub'

cd "$(dirname "$0")"
dir=$(pwd)

case "$(uname -s):$(uname -m)" in
  Linux:x86_64) rid='linux-x64' ;;
  Linux:aarch64 | Linux:arm64) rid='linux-arm64' ;;
  Darwin:arm64) rid='osx-arm64' ;;
  *)
    echo "Unsupported platform: $(uname -s) $(uname -m)." >&2
    echo "Available release builds: linux-x64, linux-arm64, osx-arm64, win-x64." >&2
    exit 1
    ;;
esac

if command -v pgrep >/dev/null 2>&1 && pgrep -x "$bin" >/dev/null 2>&1; then
  echo "HomeHub is running. Stop it first, then run this script again." >&2
  exit 1
fi

if ! command -v curl >/dev/null 2>&1; then
  echo "curl is required (Termux: pkg install curl; Debian: apt install curl)." >&2
  exit 1
fi

asset="$bin-$rid"
base="https://github.com/$repo/releases/latest/download"
sums=$(mktemp)
checksums=$(mktemp)

cleanup() {
  rm -f "$asset" "$sums" "$checksums"
}
trap cleanup EXIT

echo "Downloading the latest $rid release..."
curl -fL --retry 3 --progress-bar -o "$asset" "$base/$asset"
curl -fsSL --retry 3 -o "$sums" "$base/SHA256SUMS"

if ! grep "  $asset\$" "$sums" > "$checksums"; then
  echo "No checksum for $asset in SHA256SUMS." >&2
  exit 1
fi

if command -v sha256sum >/dev/null 2>&1; then
  sha256sum -c "$checksums"
else
  shasum -a 256 -c "$checksums"
fi

chmod +x "$asset"
if [ -f "$bin" ]; then
  mv -f "$bin" "$bin.prev"
fi
mv -f "$asset" "$bin"

echo "Updated $bin from the latest release."
echo "Start it again with: $dir/$bin"
