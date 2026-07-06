import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import XLSX from "xlsx";
import { requirements, scenarios, testCases, traceability } from "./qa-test-data.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "docs", "qa");
const outFile = path.join(outDir, "CLARTAS-Kasus-Uji.xlsx");

function autoWidth(rows) {
  if (!rows.length) return [];
  const keys = Object.keys(rows[0]);
  return keys.map((key) => {
    const maxLen = Math.max(key.length, ...rows.map((r) => String(r[key] ?? "").length));
    return { wch: Math.min(maxLen + 2, 60) };
  });
}

function sheetFromRows(rows) {
  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = autoWidth(rows);
  return ws;
}

const wb = XLSX.utils.book_new();

XLSX.utils.book_append_sheet(
  wb,
  sheetFromRows([
    { Field: "Produk", Nilai: "CLARTAS - AI E-commerce Content Factory" },
    { Field: "Versi Aplikasi", Nilai: "0.1.0" },
    { Field: "Versi Dokumen", Nilai: "1.0" },
    { Field: "Bahasa", Nilai: "Bahasa Indonesia" },
    { Field: "Tanggal", Nilai: new Date().toISOString().slice(0, 10) },
    { Field: "Total Fitur (Requirement)", Nilai: String(requirements.length) },
    { Field: "Total Skenario Uji", Nilai: String(scenarios.length) },
    { Field: "Total Kasus Uji", Nilai: String(testCases.length) },
    {
      Field: "Petunjuk",
      Nilai: "Sheet Kasus Uji: isi kolom Status (Belum/Jalankan/Lulus/Gagal/Blokir) saat eksekusi",
    },
  ]),
  "Info Dokumen",
);

XLSX.utils.book_append_sheet(
  wb,
  sheetFromRows(
    requirements.map((r) => ({
      "ID Fitur": r.id,
      "Nama Fitur": r.name,
      Modul: r.module,
      "Referensi Kode": r.ref,
    })),
  ),
  "Daftar Fitur",
);

XLSX.utils.book_append_sheet(
  wb,
  sheetFromRows(
    scenarios.map((s) => ({
      "ID Skenario": s.id,
      Modul: s.module,
      "Deskripsi Skenario": s.description,
      "ID Fitur": s.reqId,
      Prioritas: s.priority,
    })),
  ),
  "Skenario Uji",
);

XLSX.utils.book_append_sheet(
  wb,
  sheetFromRows(
    testCases.map((tc) => ({
      "ID Kasus Uji": tc.id,
      "ID Skenario": tc.scenarioId,
      "ID Fitur": tc.reqId,
      Modul: tc.module,
      Prioritas: tc.priority,
      "Tipe Uji": tc.type,
      "Judul Kasus Uji": tc.title,
      Prasyarat: tc.prerequisites,
      "Data Input": tc.input,
      "Langkah Uji": tc.steps,
      "Hasil Diharapkan": tc.expected,
      "Kondisi Pasca-Uji": tc.postConditions,
      Status: "Belum",
      "Catatan Tester": "",
    })),
  ),
  "Kasus Uji",
);

XLSX.utils.book_append_sheet(
  wb,
  sheetFromRows(
    traceability.map((t) => ({
      "ID Fitur": t.reqId,
      "Nama Fitur": t.reqName,
      "ID Skenario": t.scenarioId,
      "ID Kasus Uji": t.testCaseId,
      Prioritas: t.priority,
    })),
  ),
  "Traceability Matrix",
);

fs.mkdirSync(outDir, { recursive: true });
XLSX.writeFile(wb, outFile);
console.log(`Berhasil: ${outFile}`);
console.log(`Fitur: ${requirements.length} | Skenario: ${scenarios.length} | Kasus Uji: ${testCases.length}`);
