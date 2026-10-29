<div align="center">

# 🎬 VIU Auto Create

**Automated account registration & JWT token extractor for Viu — built for headless VPS automation.**

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Playwright](https://img.shields.io/badge/Playwright-1.56-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)](https://playwright.dev)
[![Platform](https://img.shields.io/badge/Platform-Linux-E95420?style=for-the-badge&logo=ubuntu&logoColor=white)](#-persyaratan-sistem)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](#-lisensi)

<br />

Mendukung reCAPTCHA v2 otomatis, proxy residential, retry berlapis, dan pencatatan hasil terstruktur (JSONL).

<br />

**Credits : [@inireii3](https://t.me/inireii3) · Channel : [@garapinajaaaa](https://t.me/garapinajaaaa)**

</div>

---

## 📑 Daftar Isi

- [Fitur](#-fitur)
- [Cara Kerja](#️-cara-kerja)
- [Persyaratan Sistem](#️-persyaratan-sistem)
- [Instalasi](#-instalasi)
- [Konfigurasi](#-konfigurasi)
- [Penggunaan](#-penggunaan)
- [Format Output](#-format-output)
- [Struktur Proyek](#️-struktur-proyek)
- [Penanganan Error](#-penanganan-error)
- [FAQ](#-faq)
- [Lisensi](#-lisensi)

---

## ✨ Fitur

| Fitur | Keterangan |
|---|---|
| 🔁 **Registrasi Otomatis** | Alur register end-to-end tanpa intervensi manual |
| 🧩 **Bypass reCAPTCHA v2** | Integrasi Capsolver (invisible reCAPTCHA) untuk tahap register & login |
| 🔑 **Ekstraksi JWT** | Mengambil `accessToken` valid hasil login |
| 🛡️ **Retry Berlapis** | 4x percobaan ulang dengan backoff eksponensial pada kegagalan jaringan |
| ♻️ **Auto-Recovery** | Restart browser context otomatis saat proxy/socket putus |
| 🌐 **Dukungan Proxy** | Proxy residential dengan autentikasi user:pass |
| 📊 **Output JSONL** | Hasil terstruktur, siap dikonsumsi skrip lain |
| 🎨 **CLI Profesional** | Progress berwarna, indikator status, ringkasan eksekusi |
| 🔒 **Konfigurasi Terisolasi** | Seluruh kredensial disimpan di `.env` |

---

## ⚙️ Cara Kerja

```
┌──────────────────────────────────────────────────────────────┐
│  1. Solve reCAPTCHA (register)      →  Capsolver API         │
│  2. Ambil client_credentials token  →  /auth/token           │
│  3. POST register                   →  /auth/register        │
│  4. Solve reCAPTCHA (login)         →  Capsolver API         │
│  5. POST login                      →  /auth/login           │
│  6. Ambil accessToken (JWT)         →  response body         │
│  7. Verifikasi tier akun            →  /subscription/status  │
└──────────────────────────────────────────────────────────────┘
```

Setiap tahap memiliki retry independen. Kegagalan jaringan pada satu akun tidak menghentikan keseluruhan batch.

---

## 🖥️ Persyaratan Sistem

| Komponen | Versi / Keterangan |
|---|---|
| OS | Ubuntu 20.04+ / Debian 11+ |
| Node.js | 18 atau lebih baru |
| RAM | Minimum 1 GB |
| Arsitektur | x86_64 / arm64 |
| Akses | Root atau sudo |
| Eksternal | Saldo [Capsolver](https://capsolver.com), proxy residential Indonesia |

> Proyek ini membutuhkan Chromium headless. Pada VPS tanpa display, eksekusi dibungkus `xvfb-run` (sudah otomatis melalui `npm start`).

---

## 🚀 Instalasi

### 1. Clone repositori

```bash
git clone https://github.com/Cylne/Auto_Create-Viu.git
cd viu-auto-create
```

### 2. Pasang dependensi sistem

```bash
sudo apt update
sudo apt install -y libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 \
  libcups2 libxkbcommon0 libxcomposite1 libxdamage1 libxrandr2 \
  libgbm1 libpango-1.0-0 libcairo2 libasound2t64 libxfixes3 \
  libxcursor1 libxinerama1 libxi6 libxtst6 libxss1 libdrm2 \
  libxext6 libglib2.0-0 xvfb
```

### 3. Jalankan installer

```bash
bash install.sh
```

Installer akan memverifikasi Node.js, kelengkapan library Chromium, memasang dependensi npm, mengunduh Chromium, dan membuat berkas `.env` dari template.

### 4. Sesuaikan konfigurasi

```bash
nano .env
```

---

## 🔧 Konfigurasi

Seluruh kredensial dibaca dari `.env`. Salin template terlebih dahulu:

```bash
cp .env.example .env
```

| Variabel | Wajib | Deskripsi |
|---|:---:|---|
| `PROXY` | ✅ | Endpoint proxy — format `http://host:port` |
| `PUSER` | ✅ | Username proxy (umumnya memuat kode negara & session) |
| `PPASS` | ✅ | Password proxy |
| `CAPSOLVER_KEY` | ✅ | API key Capsolver, diawali `CAP-` |
| `PASSWORD` | ➖ | Password akun yang dibuat (default `Test1234`) |
| `COUNT` | ➖ | Jumlah akun default bila argumen tidak diberikan |
| `OUT` | ➖ | Nama berkas output (default `results.jsonl`) |
| `SITE` | ➖ | URL target |
| `SITEKEY_REG` / `SITEKEY_LOGIN` | ➖ | Sitekey reCAPTCHA per tahap |

> `.env` sudah tercantum di `.gitignore` — kredensial tidak akan ikut ter-commit.

---

## 📦 Penggunaan

```bash
npm start           # jumlah akun mengikuti COUNT
npm start -- 10     # buat 10 akun
OUT=batch1.jsonl npm start -- 5
```

### Contoh Keluaran

```text
┌──────────────────────────────────────────────────────────────────┐
│  🎬  V I U   A U T O   C R E A T E   —   P R O   E D I T I O N  │
└──────────────────────────────────────────────────────────────────┘
   Credits : @inireii3   |   Channel : @garapinajaaaa

┌─ KONFIGURASI ──────────────────────────────────────────────────────
│ 🌐 Proxy      : http://residential-budget.novaproxy.io:6969
│ 👤 Target     : 2 akun
│ 🧩 Captcha    : Capsolver v2 (invisible)
│ 🔵 Output     : results.jsonl
└────────────────────────────────────────────────────────────────────

👤 [1/2] u17932162251011@gmail.com
   01. Solve reCAPTCHA register ✓
   02. Register (HTTP 200) ✓
   03. Solve reCAPTCHA login ✓
   04. Login (HTTP 200) ✓
   05. Cek tier (HTTP 200) ✓
   🔑 Token : eyJhbG...bmMi...
   🔵 Tier  : Dasar (Basic_ID)
```

### Ringkasan Akhir

```text
┌─ RINGKASAN ────────────────────────────────────────────────────────
│ 🟢 Sukses : 2
│ 🔴 Gagal  : 0
│ ⏱  Waktu  : 173.1s
│ 💾 File   : results.jsonl
└────────────────────────────────────────────────────────────────────
```

---

## 📄 Format Output

Satu objek JSON per baris (JSONL) pada berkas `OUT`:

```json
{
  "email": "u17932162251011@gmail.com",
  "password": "Test1234",
  "ok": true,
  "identity": "1fc4e98526618c04cab55a9f6c9c1e7830062bd1",
  "userId": "1fc4e98526618c04cab55a9f6c9c1e7830062bd1",
  "accessToken": "eyJhbG...",
  "plan": "Basic_ID",
  "planName": "Dasar"
}
```

Mengekstrak seluruh token:

```bash
jq -r 'select(.ok) | .accessToken' results.jsonl
```

### Menggunakan Token

```bash
curl -H "Authorization: Bearer <accessToken>" \
  https://api-gateway-global.viu.com/api/subscription/status
```

---

## 🗂️ Struktur Proyek

```
viu-auto-create/
├── viu-tool.cjs        # Entry point — alur registrasi & ekstraksi token
├── install.sh          # Installer dependensi otomatis
├── verify-token.cjs    # Utilitas verifikasi token
├── .env.example        # Template konfigurasi
├── .gitignore
├── package.json
└── README.md
```

---

## 🩺 Penanganan Error

| Gejala | Penyebab | Solusi |
|---|---|---|
| `libnss3.so: cannot open shared object` | Library Chromium belum terpasang | Jalankan langkah instalasi dependensi |
| `Missing X server or $DISPLAY` | Chromium butuh display | Gunakan `npm start`, bukan `node` langsung |
| `Client network socket disconnected` | Proxy memutus TLS handshake | Otomatis di-retry; ganti session proxy bila berulang |
| `captcha timeout` | Saldo Capsolver habis / key salah | Periksa saldo & validitas API key |
| `register 403` | Proxy region salah / mati | Gunakan proxy dengan `country-ID` |
| `login 200` tanpa token | Akun tertahan review | Naikkan jeda antar akun, ganti proxy |

Kode keluar `0` menandakan minimal satu akun berhasil; `1` bila seluruh batch gagal.

---

## ❓ FAQ

<details>
<summary><b>Apakah akun otomatis menjadi premium?</b></summary>

Tidak. Akun yang dibuat berada pada tier **Basic_ID (gratis)**. Langganan premium Viu sepenuhnya berbayar dan tidak dapat diaktifkan melalui endpoint publik.

</details>

<details>
<summary><b>Berapa lama satu akun diproses?</b></summary>

Rata-rata 45–90 detik karena dua penyelesaian captcha. Hindari eksekusi paralel berlebihan agar tidak memicu `503`.

</details>

<details>
<summary><b>Bisakah dijalankan di Windows?</b></summary>

Bisa, dengan menyesuaikan langkah dependensi sistem dan menjalankan `node viu-tool.cjs` langsung (tanpa `xvfb-run`) pada lingkungan berdisplay.

</details>

<details>
<summary><b>Apakah aman menyimpan kredensial di `.env`?</b></summary>

Aman selama berkas tidak di-commit. `.env` sudah dikecualikan melalui `.gitignore`; hanya `.env.example` yang disertakan.

</details>

---

## 🤝 Kontribusi

Pull request terbuka untuk perbaikan alur, penambahan penyedia captcha, maupun peningkatan stabilitas jaringan.

1. Fork repositori
2. Buat branch fitur (`git checkout -b feat/nama-fitur`)
3. Commit perubahan (`git commit -m 'feat: deskripsi'`)
4. Push dan buka Pull Request

---

## 📜 Lisensi

Dirilis di bawah [MIT License](LICENSE).

---

<div align="center">

**Dibuat oleh [@inireii3](https://t.me/inireii3)** · **Channel : [@garapinajaaaa](https://t.me/garapinajaaaa)**

⭐ Beri bintang bila proyek ini bermanfaat

</div>
