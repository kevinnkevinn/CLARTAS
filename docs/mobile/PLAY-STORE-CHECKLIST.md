# Checklist Google Play Store — CLARTAS

Gunakan sebelum mengirim rilis produksi.

## Identitas Aplikasi

- [ ] Package name: `com.clartas.app`
- [ ] Nama tampilan: **CLARTAS**
- [ ] Ikon 512×512 PNG (dari `public/icons/icon-512.png`)
- [ ] Feature graphic 1024×500
- [ ] Screenshot phone & tablet (min. 2)

## Kebijakan & Kepatuhan

- [ ] URL kebijakan privasi (wajib)
- [ ] URL ketentuan layanan
- [ ] Form Data safety: akun, foto/video upload, info pembayaran
- [ ] Target audience & rating konten (IARC)
- [ ] Deklarasi izin: INTERNET, CAMERA (opsional), READ_MEDIA_IMAGES

## Teknis

- [ ] `targetSdkVersion` ≥ 34
- [ ] App Bundle (AAB) ditandatangani release keystore
- [ ] `android:exported` hanya untuk activity yang perlu deep link
- [ ] ProGuard/R8 enabled untuk release
- [ ] Tidak ada `usesCleartextTraffic` di produksi

## Autentikasi

- [ ] Google Sign-In: SHA-1 release + debug terdaftar di Google Cloud
- [ ] OAuth redirect `com.clartas.app` di Supabase

## Pembayaran

- [ ] Paddle checkout via WebView — deklarasikan “in-app purchases” jika applicable
- [ ] Tidak memakai billing Google Play untuk langganan web (digital goods policy)

## Pra-rilis

- [ ] Internal testing track → closed testing → production
- [ ] Uji login Google, upload asset, editor, billing di perangkat fisik
