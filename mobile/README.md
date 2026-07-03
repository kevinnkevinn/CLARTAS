# CLARTAS Mobile — Android, iOS & Chrome (PWA)

Aplikasi mobile resmi CLARTAS dengan **fungsi, alur UX, dan UI yang identik** dengan platform web SaaS. Android dan iOS memakai shell native Capacitor yang memuat aplikasi web ter-deploy, sehingga seluruh 22+ modul (Editor Studio, Assets, Billing, Workspace, dll.) tersedia tanpa duplikasi kode.

Versi **Chrome** diimplementasikan sebagai **Progressive Web App (PWA)** di folder utama proyek (`public/manifest.webmanifest`, `public/sw.js`).

## Arsitektur

| Platform | Teknologi | UI |
|----------|-----------|-----|
| Android | Capacitor 6 + WebView | Identik dengan web (responsive) |
| iOS | Capacitor 6 + WKWebView | Identik dengan Android & web |
| Chrome | PWA (installable) | Identik dengan web |

Login tersedia via **email/password**, **Google**, dan **Apple ID** (wajib di iOS jika ada login sosial lain — sesuai pedoman App Store).

## Prasyarat

- Node.js 20+
- Backend CLARTAS ter-deploy (Vercel/dll.) — **bukan mode demo**
- Akun [Supabase](https://supabase.com) dengan provider Google & Apple diaktifkan
- Android Studio (Android) / Xcode 15+ (iOS, hanya macOS)

## Konfigurasi

1. Salin `mobile/.env.example` → `mobile/.env` dan isi:

```env
CAP_SERVER_URL=https://app.clartas.com
GOOGLE_WEB_CLIENT_ID=<Web Client ID dari Google Cloud>
```

2. Di **Supabase Dashboard → Authentication → URL Configuration**, tambahkan:
   - `https://app.clartas.com/auth/callback`
   - `com.clartas.app://auth/callback`

3. Di **Google Cloud Console**, buat OAuth Client:
   - Web client → `NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID`
   - Android client → package `com.clartas.app` + SHA-1 release

4. Di **Apple Developer**, aktifkan Sign in with Apple untuk App ID `com.clartas.app` dan konfigurasi di Supabase.

5. Di root proyek, set `.env.local` produksi (`NEXT_PUBLIC_DEMO_MODE=false`).

## Build & Sync

```bash
# Generate ikon aplikasi
node mobile/scripts/generate-icons.mjs

# Install dependensi mobile
cd mobile && npm install

# Sync native projects (set CAP_SERVER_URL dulu)
set CAP_SERVER_URL=https://app.clartas.com   # Windows
npx cap sync

# Buka di IDE native
npx cap open android
npx cap open ios
```

## Rilis ke Store

### Google Play Store

- Target SDK 34+ (dikonfigurasi di `android/variables.gradle`)
- Kebijakan privasi: tautkan URL publik di Play Console
- Data safety: deklarasikan auth, upload media, pembayaran (Paddle)
- Signed AAB: `cd android && ./gradlew bundleRelease`
- Lihat `docs/mobile/PLAY-STORE-CHECKLIST.md`

### Apple App Store

- Sign in with Apple wajib (sudah diimplementasikan)
- Privacy Nutrition Labels di App Store Connect
- `NSPhotoLibraryUsageDescription`, `NSCameraUsageDescription` di Info.plist
- Archive via Xcode → Distribute App
- Lihat `docs/mobile/APP-STORE-CHECKLIST.md`

### Chrome (PWA)

- Deploy web app dengan HTTPS
- Pengguna dapat “Install app” dari Chrome (menu ⋮ → Install CLARTAS)
- Service worker: `public/sw.js`

## Struktur Folder

```
mobile/
├── android/          # Proyek Android Studio
├── ios/              # Proyek Xcode
├── www/              # Shell offline + redirect
├── resources/        # Ikon & splash (1024px)
├── capacitor.config.ts
├── package.json
└── scripts/
```

## Login Native

| Provider | Web / PWA | Android | iOS |
|----------|-----------|---------|-----|
| Google | OAuth redirect | Native Google Auth + Supabase ID token | OAuth / native |
| Apple | OAuth redirect | OAuth redirect | Native Apple Sign In |

Kode auth: `src/lib/mobile/native-auth.ts`, `src/features/auth/social-sign-in-buttons.tsx`

## Troubleshooting

- **Layar offline**: `CAP_SERVER_URL` belum diset saat `cap sync`
- **OAuth gagal**: periksa redirect URL di Supabase
- **Google Android**: pastikan SHA-1 fingerprint di Google Console
- **Apple iOS**: capability “Sign in with Apple” di Xcode

---

© CLARTAS — AI E-Commerce Content Factory
