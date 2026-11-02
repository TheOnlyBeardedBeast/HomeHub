# Running HomeHub on Android with Termux

The hub is an ASP.NET Core app. Termux runs on Android's bionic libc, and the
official .NET SDK has no ASP.NET Core runtime packs for `linux-bionic-arm64`
(`NETSDK1082`), so a self-contained build cannot run natively on bionic.

The working route is **glibc-runner** (`grun`), a Termux package that runs
glibc-linked binaries without proot. The build is one self-contained ARM64 file;
only the small glibc runtime is installed from Termux.

## 1. Build the ARM64 binary

On your computer:

```bash
task publish:termux
```

This writes `artifacts/linux-arm64/HomeHub.Hub` (about 53 MB, compressed single
file). It uses .NET invariant globalization, so ICU is not required.

## 2. Get it onto the phone

With `adb`:

```bash
adb push artifacts/linux-arm64/HomeHub.Hub /sdcard/Download/
```

Then in Termux — **copy it out of shared storage**. `/sdcard` is mounted
`noexec`, so running a binary directly from `~/storage/downloads` fails with
`Permission denied`:

```bash
cp ~/storage/downloads/HomeHub.Hub ~/
chmod +x ~/HomeHub.Hub
```

## 3. Install glibc-runner

```bash
pkg update
pkg install glibc-repo -y
pkg update
pkg install glibc-runner openssl-glibc zlib-glibc -y
```

If you use a build with globalization enabled, also install
`libicu-glibc`, or start it with `DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=1`.
`openssl-glibc` pulls in `ca-certificates-glibc`; the cert exports in the run step
below are still needed so .NET finds a bundle.

## 4. Run it

Outbound HTTPS (weather, quotes) needs a CA bundle. Termux ships one at
`$PREFIX/etc/tls/cert.pem`; point OpenSSL/.NET at it (`pkg install ca-certificates`
if the file is missing):

```bash
export SSL_CERT_FILE="$PREFIX/etc/tls/cert.pem"
export SSL_CERT_DIR="$PREFIX/etc/tls/certs"
export Authentication__AdminApiKey='choose-a-key'
export Weather__ApiKey='your-weather-key'          # optional
export Weather__Location='Lučenec, Slovakia'       # optional
export Tls__Enabled=true                           # optional HTTPS
export Tls__HostNames='your-device.netbird.cloud'  # optional custom URL/hostname
grun ~/HomeHub.Hub
```

Kestrel binds all interfaces (`0.0.0.0` / `[::]`) on ports **5000** (SPA,
gRPC-Web, ICS), **5001** (gRPC) and, with TLS enabled, **5443** (HTTPS with
HTTP/2 via ALPN). From any device on the same Wi-Fi:

```
http://<phone-lan-ip>:5000
https://<phone-lan-ip>:5443
```

With TLS enabled, the self-signed certificate and its PEM export are written to
`~/.local/share/HomeHub/tls/` (`homehub.pfx`, `homehub.crt`). Install
`homehub.crt` as a trusted CA on the devices that use the hub (Android:
Settings → Security → Encryption & credentials → Install a certificate → CA
certificate), or accept the browser warning. Delete `homehub.pfx` and restart to
regenerate the certificate after the phone's IP changes. To use your own
certificate, set `Tls__CertificatePath` and `Tls__CertificatePassword` instead.

Find the phone's address with `ip addr` (usually `wlan0`, e.g. `192.168.1.42`).
Android does not need root for ports above 1024. If another device cannot
connect, check that the network does not isolate clients (guest Wi-Fi often
does).

If you prefer a patched binary, `grun --configure ~/HomeHub.Hub` rewrites the
interpreter/RPATH once and lets you start it with `./HomeHub.Hub`.

## Keeping it running

- Run `termux-wake-lock` so Android does not suspend the session.
- Disable battery optimization for Termux in Android settings.
- The process stops when the Termux session ends; use `tmux` inside Termux for a
  detached session, or Termux:Boot to start it at boot.

## Data

The SQLite database lives in the Termux home at
`~/.local/share/HomeHub/homehub.db` and survives restarts. Override it with:

```bash
ConnectionStrings__DefaultConnection="Data Source=$HOME/homehub-data/homehub.db" grun ~/HomeHub.Hub
```

## Fallback: proot-distro Debian

If glibc-runner cannot satisfy the libraries on your device, a Debian userland
inside Termux also works:

```bash
pkg install proot-distro
proot-distro install debian
proot-distro login debian --bind "$HOME:/termux"
# inside Debian:
apt update && apt install -y libssl3 zlib1g libstdc++6 ca-certificates
update-ca-certificates
mkdir -p /opt/homehub && cp /termux/HomeHub.Hub /opt/homehub/
chmod +x /opt/homehub/HomeHub.Hub
Authentication__AdminApiKey='choose-a-key' /opt/homehub/HomeHub.Hub
```

## Notes

- First start extracts the compressed bundle (a few seconds) and creates the schema.
- The binary is self-contained; the Termux packages only provide the system C
  library and OpenSSL.
