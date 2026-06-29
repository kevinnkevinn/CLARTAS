import { tc } from "./qa-test-data-helpers.mjs";

export const testCasesPart2 = [
  // === PLATFORM ===
  tc("TC-PLAT-001", "TS-PLAT-01", "REQ-F02", "Platform", "P1", "Positif", "Ganti locale en ke id", "User login", "Locale: id", "1. Klik language switcher 2. Pilih Indonesia", "URL menjadi /id/dashboard; teks UI Bahasa Indonesia", ""),
  tc("TC-PLAT-002", "TS-PLAT-02", "REQ-F02", "Platform", "P1", "Positif", "Routing locale prefix benar", "User login", "Locale en dan zh", "Akses /dashboard dan /zh/dashboard", "en tanpa prefix; zh dengan prefix /zh/", ""),
  tc("TC-PLAT-003", "TS-PLAT-01", "REQ-F02", "Platform", "P2", "Edge", "Locale tidak valid", "—", "Locale invalid", "Akses URL locale tidak ada", "Fallback ke locale default en", ""),
  tc("TC-PLAT-004", "TS-PLAT-03", "REQ-F03", "Platform", "P2", "Positif", "Toggle tema dark ke light", "Di app shell", "—", "1. Klik theme toggle 2. Reload halaman", "Class html berubah; preferensi tersimpan di localStorage", ""),
  tc("TC-PLAT-005", "TS-PLAT-04", "REQ-F04", "Platform", "P1", "Positif", "Navigasi sidebar ke semua modul", "User login desktop", "—", "Klik setiap item nav-config", "Setiap halaman modul dimuat tanpa error", ""),
  tc("TC-PLAT-006", "TS-PLAT-05", "REQ-F04", "Platform", "P2", "Positif", "Mobile nav drawer", "Viewport 375px", "—", "1. Buka mobile nav 2. Pilih modul", "Drawer buka/tutup; navigasi berhasil", ""),
  tc("TC-PLAT-007", "TS-PLAT-06", "REQ-F05", "Dashboard", "P1", "Positif", "Dashboard tampilkan ringkasan", "User login dengan data", "—", "Buka /dashboard", "Saldo kredit, aset terbaru, quick actions tampil", ""),

  // === ASET ===
  tc("TC-AST-001", "TS-AST-01", "REQ-F08", "Aset", "P0", "Positif", "Upload JPEG 5MB", "User login", "File JPEG 5MB", "1. Buka assets 2. Upload file", "Upload sukses; aset muncul di library", ""),
  tc("TC-AST-002", "TS-AST-01", "REQ-F08", "Aset", "P0", "Boundary", "Upload JPEG tepat 10MB", "User login", "File 10485760 byte", "Upload file", "Upload sukses", ""),
  tc("TC-AST-003", "TS-AST-04", "REQ-F08", "Aset", "P0", "Boundary", "Upload JPEG 10MB+1 byte", "User login", "File 10485761 byte", "Upload file", "Error size; file ditolak", ""),
  tc("TC-AST-004", "TS-AST-03", "REQ-F08", "Aset", "P0", "Negatif", "Upload PDF ditolak", "User login", "File application/pdf", "Upload file", "Error type; file ditolak", ""),
  tc("TC-AST-005", "TS-AST-03", "REQ-F08", "Aset", "P1", "Edge", "MIME spoofed ditolak", "User login", "Ekstensi .jpg MIME pdf", "Upload file", "Error type", ""),
  tc("TC-AST-006", "TS-AST-02", "REQ-F08", "Aset", "P1", "Positif", "Upload MP4 50MB", "User login", "Video MP4 50MB", "Upload file", "Upload sukses", ""),
  tc("TC-AST-007", "TS-AST-04", "REQ-F08", "Aset", "P1", "Boundary", "Upload MP4 100MB+1 byte", "User login", "File 104857601 byte", "Upload file", "Error size", ""),
  tc("TC-AST-008", "TS-AST-05", "REQ-F09", "Aset", "P1", "Positif", "Rename aset", "Aset ada", "Nama baru: Produk-A", "Rename via UI", "Nama terupdate di DB", ""),
  tc("TC-AST-009", "TS-AST-05", "REQ-F09", "Aset", "P1", "Negatif", "Rename dengan nama kosong", "Aset ada", "Nama kosong", "Submit rename", "Validasi menolak", ""),
  tc("TC-AST-010", "TS-AST-05", "REQ-F09", "Aset", "P1", "Positif", "Tambah tag aset", "Aset ada", "Tag: promo,2026", "Tambah tag", "Tag persisten", ""),
  tc("TC-AST-011", "TS-AST-05", "REQ-F09", "Aset", "P1", "Positif", "Hapus aset", "Aset ada", "—", "Klik hapus → konfirmasi", "Aset hilang dari DB dan storage", ""),
  tc("TC-AST-012", "TS-AST-06", "REQ-F29", "Aset", "P0", "Negatif", "User A tidak hapus aset User B", "Dua user berbeda", "Asset ID milik User B", "User A coba hapus", "Ditolak RLS", ""),
  tc("TC-AST-013", "TS-AST-07", "REQ-F09", "Aset", "P2", "Positif", "Halaman detail aset", "Aset ada", "Asset ID valid", "Buka /assets/[id]", "Preview dan metadata benar", ""),
  tc("TC-AST-014", "TS-AST-01", "REQ-F08", "Aset", "P1", "Positif", "Format PNG WebP GIF didukung", "User login", "PNG, WebP, GIF", "Upload masing-masing", "Semua format diterima", ""),

  // === BILLING ===
  tc("TC-BILL-001", "TS-BILL-01", "REQ-F11", "Billing", "P0", "Positif", "Saldo kredit awal 20", "User baru signup", "—", "Periksa saldo setelah signup", "Saldo = 20 kredit", ""),
  tc("TC-BILL-002", "TS-BILL-02", "REQ-F11", "Billing", "P0", "Positif", "Pengurangan kredit remove-background", "Saldo >= 1", "Aksi remove-background", "Jalankan aksi AI", "Saldo -= 1; transaksi tercatat", ""),
  tc("TC-BILL-003", "TS-BILL-02", "REQ-F11", "Billing", "P0", "Boundary", "Saldo tepat 1 kredit", "Saldo = 1", "Aksi 1 kredit", "Jalankan aksi", "Sukses; saldo = 0", ""),
  tc("TC-BILL-004", "TS-BILL-03", "REQ-F11", "Billing", "P0", "Negatif", "Aksi AI saldo 0", "Saldo = 0", "Aksi AI", "Jalankan aksi", "HTTP 402 insufficient_credits", ""),
  tc("TC-BILL-005", "TS-BILL-04", "REQ-F11", "Billing", "P0", "Positif", "Refund kredit saat AI gagal", "Saldo cukup", "Simulasi AI gagal", "Jalankan aksi yang gagal", "Kredit dikembalikan", ""),
  tc("TC-BILL-006", "TS-BILL-05", "REQ-F12", "Billing", "P1", "Positif", "Checkout Premium sandbox", "Paddle sandbox", "Plan Premium", "Klik upgrade → checkout", "Redirect sukses Paddle", ""),
  tc("TC-BILL-007", "TS-BILL-06", "REQ-F12", "Billing", "P0", "Positif", "Webhook subscription.created", "Webhook secret valid", "Payload subscription.created", "POST webhook", "Plan premium; +500 kredit", ""),
  tc("TC-BILL-008", "TS-BILL-07", "REQ-F12", "Billing", "P0", "Negatif", "Webhook signature invalid", "—", "Payload tanpa signature valid", "POST webhook", "401; DB tidak berubah", ""),
  tc("TC-BILL-009", "TS-BILL-06", "REQ-F12", "Billing", "P1", "Edge", "Webhook duplikat idempotent", "Webhook sudah diproses", "Payload sama 2x", "POST webhook 2x", "Tidak double-grant kredit", ""),
  tc("TC-BILL-010", "TS-BILL-08", "REQ-F12", "Billing", "P2", "Positif", "Riwayat transaksi di billing", "User punya transaksi", "—", "Buka /billing", "Riwayat kredit dan transaksi tampil", ""),

  // === API AI ===
  tc("TC-AI-001", "TS-AI-01", "REQ-F07", "API AI", "P0", "Positif", "POST remove-background sukses", "Login; saldo >= 1; gambar valid", "imageUrl atau assetId", "POST /api/ai/remove-background", "200; URL hasil; job tercatat; saldo -1", "Aset processed tersimpan"),
  tc("TC-AI-002", "TS-AI-01", "REQ-F07", "API AI", "P0", "Negatif", "API tanpa sesi", "Tidak login", "Body valid", "POST tanpa cookie", "401 Unauthorized", ""),
  tc("TC-AI-003", "TS-AI-09", "REQ-F07", "API AI", "P1", "Negatif", "Body JSON invalid", "Login", "Body bukan JSON", "POST request", "400 Invalid JSON body", ""),
  tc("TC-AI-004", "TS-AI-02", "REQ-F07", "API AI", "P1", "Negatif", "Product studio prompt terlalu pendek", "Login", "prompt: ab", "POST product-studio", "400 Validation failed", ""),
  tc("TC-AI-005", "TS-AI-02", "REQ-F07", "API AI", "P1", "Boundary", "Product studio prompt 1000 char", "Login", "prompt 1000 char", "POST product-studio", "Sukses validasi", ""),
  tc("TC-AI-006", "TS-AI-02", "REQ-F07", "API AI", "P1", "Boundary", "Product studio prompt 1001 char", "Login", "prompt 1001 char", "POST product-studio", "400 Validation failed", ""),
  tc("TC-AI-007", "TS-AI-08", "REQ-F07", "API AI", "P0", "Boundary", "Rate limit 30 req/menit", "Login", "31 request dalam 60 detik", "POST berulang", "Request ke-31 → 429", ""),
  tc("TC-AI-008", "TS-AI-08", "REQ-F07", "API AI", "P1", "Edge", "Rate limit per aksi terpisah", "Login", "30 req remove-bg + 30 enhance", "POST 2 aksi berbeda", "Masing-masing limit independen", ""),
  tc("TC-AI-009", "TS-AI-10", "REQ-F10", "API AI", "P1", "Positif", "Brand voice diinjeksi ke generate-copy", "Brand kit ada", "generate-copy request", "POST generate-copy", "tone/voice brand digunakan", ""),
  tc("TC-AI-010", "TS-AI-04", "REQ-F07", "API AI", "P1", "Boundary", "Enhance image scale 2-4", "Login", "scale: 2, 4, 5", "POST enhance-image", "scale 2-4 OK; 5 gagal", ""),
  tc("TC-AI-011", "TS-AI-06", "REQ-F07", "API AI", "P1", "Positif", "Video slideshow 1-20 gambar", "Login", "1 dan 20 imageUrls", "POST video-slideshow", "Sukses; 0 atau 21 gagal", ""),
  tc("TC-AI-012", "TS-AI-07", "REQ-F07", "API AI", "P1", "Positif", "TTS text 1-5000 char", "Login", "text valid dan 5001 char", "POST text-to-speech", "1-5000 OK; 5001 gagal", ""),
  tc("TC-AI-013", "TS-AI-11", "REQ-F27", "API AI", "P2", "Positif", "Mock mode tanpa API key", "FAL_KEY kosong", "Request AI valid", "POST AI route", "Mock response; tidak panggil eksternal", ""),
  tc("TC-AI-014", "TS-AI-03", "REQ-F07", "API AI", "P1", "Positif", "Object cleanup sukses", "Login; saldo >= 4", "imageUrl + prompt", "POST object-cleanup", "200; 4 kredit terpotong", ""),
  tc("TC-AI-015", "TS-AI-05", "REQ-F07", "API AI", "P1", "Positif", "Generate copy sukses", "Login; saldo >= 1", "productName valid", "POST generate-copy", "200; copy text dikembalikan", ""),
];
