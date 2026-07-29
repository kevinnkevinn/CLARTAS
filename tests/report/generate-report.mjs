import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "..");
const reportDir = path.join(root, "docs", "qa", "reports");

function readJsonSafe(filePath) {
  try {
    if (fs.existsSync(filePath)) return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    /* ignore */
  }
  return null;
}

function summarizePlaywright(data) {
  if (!data?.suites) return { total: 0, passed: 0, failed: 0, skipped: 0, tests: [] };
  const tests = [];
  function walk(suite) {
    for (const spec of suite.specs ?? []) {
      for (const t of spec.tests ?? []) {
        const status = t.results?.[0]?.status ?? "unknown";
        tests.push({ title: spec.title, file: spec.file, status, suite: suite.title });
      }
    }
    for (const child of suite.suites ?? []) walk(child);
  }
  for (const s of data.suites) walk(s);
  const passed = tests.filter((t) => t.status === "passed").length;
  const failed = tests.filter((t) => t.status === "failed").length;
  const skipped = tests.filter((t) => t.status === "skipped").length;
  return { total: tests.length, passed, failed, skipped, tests };
}

function summarizeVitest(data) {
  if (!data) return { total: 0, passed: 0, failed: 0, skipped: 0 };
  return {
    total: data.numTotalTests ?? 0,
    passed: data.numPassedTests ?? 0,
    failed: data.numFailedTests ?? 0,
    skipped: data.numPendingTests ?? 0,
  };
}

const timestamp = new Date().toISOString();
const pw = summarizePlaywright(readJsonSafe(path.join(root, "test-results", "playwright-results.json")));
const vitest = summarizeVitest(readJsonSafe(path.join(root, "test-results", "vitest-results.json")));

const total = pw.total + vitest.total;
const passed = pw.passed + vitest.passed;
const failed = pw.failed + vitest.failed;
const passRate = total ? ((passed / total) * 100).toFixed(1) : "0.0";

const analysis = {
  timestamp,
  ringkasan: { total, passed, failed, skipped: pw.skipped + vitest.skipped, passRate: `${passRate}%` },
  unitIntegration: vitest,
  e2e: pw,
  rekomendasi:
    failed > 0
      ? "Terdapat kegagalan — tinjau playwright-report/ dan perbaiki sebelum rilis."
      : "Semua test lulus — lanjutkan regression penuh atau UAT manual untuk kasus non-otomasi.",
  suite: {
    smoke: "tests/e2e/smoke — verifikasi app hidup (< 2 menit)",
    sanity: "tests/e2e/sanity — modul inti setelah deploy",
    regression: "tests/e2e/regression — semua rute + tema",
    e2e: "tests/e2e/flows — alur multi-langkah",
    uat: "tests/e2e/uat — kriteria penerimaan",
    unit: "src/lib/__tests__ + tests/integration — logika bisnis",
  },
};

fs.mkdirSync(reportDir, { recursive: true });

const jsonOut = path.join(reportDir, `laporan-qa-${timestamp.slice(0, 10)}.json`);
fs.writeFileSync(jsonOut, JSON.stringify(analysis, null, 2));

const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8"/>
  <title>Laporan QA CLARTAS</title>
  <style>
    body{font-family:system-ui,sans-serif;max-width:960px;margin:2rem auto;padding:0 1rem;color:#111}
    h1{color:#6366f1} .ok{color:#16a34a}.fail{color:#dc2626}
    table{border-collapse:collapse;width:100%;margin:1rem 0}
    th,td{border:1px solid #ddd;padding:8px;text-align:left}
    th{background:#f4f4f5}
    .card{background:#f8fafc;border-radius:8px;padding:1rem;margin:1rem 0}
  </style>
</head>
<body>
  <h1>Laporan Analisis QA — CLARTAS</h1>
  <p>Generated: ${timestamp}</p>
  <div class="card">
    <h2>Ringkasan Eksekusi</h2>
    <p>Total: <strong>${total}</strong> | Lulus: <span class="ok"><strong>${passed}</strong></span> | Gagal: <span class="fail"><strong>${failed}</strong></span> | Pass rate: <strong>${passRate}%</strong></p>
  </div>
  <div class="card">
    <h2>Unit & Integration (Vitest)</h2>
    <p>Total ${vitest.total} — Lulus ${vitest.passed}, Gagal ${vitest.failed}</p>
  </div>
  <div class="card">
    <h2>E2E (Playwright)</h2>
    <p>Total ${pw.total} — Lulus ${pw.passed}, Gagal ${pw.failed}, Skip ${pw.skipped}</p>
  </div>
  <div class="card">
    <h2>Suite Pengujian</h2>
    <ul>
      <li><strong>Smoke</strong> — ${analysis.suite.smoke}</li>
      <li><strong>Sanity</strong> — ${analysis.suite.sanity}</li>
      <li><strong>Regression</strong> — ${analysis.suite.regression}</li>
      <li><strong>E2E</strong> — ${analysis.suite.e2e}</li>
      <li><strong>UAT</strong> — ${analysis.suite.uat}</li>
      <li><strong>Unit</strong> — ${analysis.suite.unit}</li>
    </ul>
  </div>
  <div class="card">
    <h2>Analisis & Rekomendasi</h2>
    <p>${analysis.rekomendasi}</p>
    <p>Detail E2E interaktif: buka <code>playwright-report/index.html</code></p>
    <p>Traceability kasus manual: <code>docs/qa/CLARTAS-Technical-Testing-Guideline.pdf</code></p>
  </div>
  ${
    pw.tests.length
      ? `<h2>Detail E2E</h2><table><tr><th>Test</th><th>Status</th></tr>${pw.tests
          .map(
            (t) =>
              `<tr><td>${t.title}</td><td class="${t.status === "passed" ? "ok" : "fail"}">${t.status}</td></tr>`,
          )
          .join("")}</table>`
      : ""
  }
</body>
</html>`;

const htmlOut = path.join(reportDir, `laporan-qa-${timestamp.slice(0, 10)}.html`);
fs.writeFileSync(htmlOut, html);

console.log(`Laporan JSON: ${jsonOut}`);
console.log(`Laporan HTML: ${htmlOut}`);
console.log(`Pass rate: ${passRate}% (${passed}/${total})`);
