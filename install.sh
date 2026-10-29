#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
#  INSTALLER — VIU TOOLS
#  Credits : @inireii3  |  Channel : @garapinajaaaa
#  Jalankan sekali: bash install.sh
# ─────────────────────────────────────────────────────────────
set -u
cd "$(dirname "$0")"

ok()  { printf '\033[32m✓\033[0m %s\n' "$1"; }
bad() { printf '\033[31m✗\033[0m %s\n' "$1"; }
hd()  { printf '\n\033[36m── %s ──\033[0m\n' "$1"; }

hd "1/5 CEK NODE"
if command -v node >/dev/null 2>&1; then
  NODE_MAJOR=$(node -p 'process.versions.node.split(".")[0]')
  if [ "$NODE_MAJOR" -lt 18 ]; then
    bad "Node $(node -v) terlalu tua — butuh 18+"; exit 1
  fi
  ok "Node $(node -v)"
else
  bad "Node belum ada. Install: curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt install -y nodejs"
  exit 1
fi

hd "2/5 CEK LIB CHROMIUM"
if ! ldconfig -p 2>/dev/null | grep -q libnss3; then
  bad "Library Chromium belum lengkap — jalankan dulu:"
  echo "  apt update && apt install -y libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libxkbcommon0 libxcomposite1 libxdamage1 libxrandr2 libgbm1 libpango-1.0-0 libcairo2 libasound2t64 libxfixes3 libxcursor1 libxinerama1 libxi6 libxtst6 libxss1 libdrm2 libxext6 libglib2.0-0"
  echo "  (lalu ulangi install.sh)"
  exit 1
fi
ok "libnss3 terpasang"

hd "3/5 INSTALL XVFB"
if command -v xvfb-run >/dev/null 2>&1; then ok "xvfb-run ada"
else
  apt-get install -y -qq xvfb >/dev/null 2>&1 && ok "xvfb-run terpasang" || { bad "gagal install xvfb"; exit 1; }
fi

hd "4/5 INSTALL DEPENDENSI NODE"
npm install --no-audit --no-fund >/dev/null 2>&1 && ok "playwright-core terpasang" || { bad "npm install gagal"; exit 1; }

hd "5/5 DOWNLOAD CHROMIUM"
if npx playwright-core install chromium >/dev/null 2>&1; then ok "Chromium siap"; else bad "download chromium gagal (cek koneksi)"; exit 1; fi

hd "KONFIG"
if [ -f .env ]; then ok ".env sudah ada (tidak ditimpa)"
else cp .env.example .env && ok ".env dibuat dari template"; fi

printf '\n\033[32m\033[1mSEMUA SIAP.\033[0m Jalankan: \033[36mnpm start\033[0m\n'
printf '\033[2mCredits : @inireii3  |  Channel : @garapinajaaaa\033[0m\n\n'
