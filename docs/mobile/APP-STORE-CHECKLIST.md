# Checklist Apple App Store — CLARTAS

Gunakan sebelum mengirim rilis produksi.

## Identitas Aplikasi

- [ ] Bundle ID: `com.clartas.app`
- [ ] Nama: **CLARTAS**
- [ ] Ikon App Store 1024×1024 (`mobile/resources/icon.png`)
- [ ] Screenshot iPhone 6.7" & iPad (jika universal)

## Sign in with Apple

- [ ] Capability **Sign in with Apple** di Xcode
- [ ] Provider Apple di Supabase Dashboard
- [ ] Tombol “Continue with Apple” di layar sign-in (wajib jika ada Google login)

## Privasi (Info.plist)

- [ ] `NSCameraUsageDescription` — foto produk untuk editor AI
- [ ] `NSPhotoLibraryUsageDescription` — unggah aset dari galeri
- [ ] `NSPhotoLibraryAddUsageDescription` — simpan hasil edit
- [ ] `NSMicrophoneUsageDescription` — hanya jika fitur video memerlukan (opsional)

## App Privacy (App Store Connect)

- [ ] Contact Info (email akun)
- [ ] User Content (foto/video upload)
- [ ] Identifiers (User ID)
- [ ] Purchase history (Paddle)

## Pedoman Konten

- [ ] Tidak ada konten demo/mock di build produksi (`NEXT_PUBLIC_DEMO_MODE=false`)
- [ ] Tautan support & privacy policy di metadata App Store

## Teknis

- [ ] Deployment target iOS 14+
- [ ] ATS (App Transport Security) — hanya HTTPS
- [ ] Universal Links / custom URL scheme `com.clartas.app` untuk OAuth callback
- [ ] Archive Release → Validate → Distribute

## Pra-rilis

- [ ] TestFlight internal & external
- [ ] Uji Sign in with Apple, Google, upload, editor, billing
