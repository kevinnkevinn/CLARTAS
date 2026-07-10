# Panduan Deploy Produksi — CLARTAS (Web + App)

## Web (Vercel)

1. Import repo GitHub ke Vercel.
2. Set environment variables (lihat `.env.example`):
   - `NEXT_PUBLIC_DEMO_MODE=false`
   - Supabase URL + anon + service role
   - `FAL_KEY`, `REPLICATE_API_TOKEN`
   - Paddle keys + price IDs
   - `NEXT_PUBLIC_APP_URL=https://<domain-produksi>`
3. Deploy production branch (`main`).
4. Verifikasi: `https://<domain>/api/health` → `status: "ok"`, `demoMode: false`, `aiMock: false`.

## Mobile (Capacitor)

1. Deploy web terlebih dahulu.
2. Set `CAP_SERVER_URL=https://<domain-produksi>`.
3. `npm run sync:mobile` lalu buka Android Studio / Xcode.
4. Ikuti `docs/mobile/PLAY-STORE-CHECKLIST.md` dan `docs/mobile/APP-STORE-CHECKLIST.md`.

## PWA

- Manifest: `/manifest.webmanifest`
- Installable dari Chrome/Safari setelah HTTPS aktif.

## Checklist go-live

- [ ] Demo mode OFF
- [ ] AI keys aktif (bukan mock)
- [ ] Auth Google/email berfungsi
- [ ] Upload & AI job berhasil
- [ ] Paddle sandbox/production webhook
- [ ] Privacy & Terms terpublikasi (`/privacy`, `/terms`)
- [ ] Health check hijau
