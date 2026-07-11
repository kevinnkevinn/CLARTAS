/**
 * Generates docs/qa/CLARTAS-Technical-Testing-Guideline.pdf
 * Source: FULL-TEST-RESULTS.md + TEST-PLAN.md + CLARTAS-Kasus-Uji data
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { chromium } from "playwright";
import { requirements, scenarios, testCases } from "./qa-test-data.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "docs", "qa");
const outPdf = path.join(outDir, "CLARTAS-Technical-Testing-Guideline.pdf");
const docDate = new Date().toISOString().slice(0, 10);

const byModule = new Map();
for (const r of requirements) {
  if (!byModule.has(r.module)) byModule.set(r.module, { reqs: [], scenarios: [], cases: [] });
  byModule.get(r.module).reqs.push(r);
}
for (const s of scenarios) {
  if (!byModule.has(s.module)) byModule.set(s.module, { reqs: [], scenarios: [], cases: [] });
  byModule.get(s.module).scenarios.push(s);
}
for (const tc of testCases) {
  if (!byModule.has(tc.module)) byModule.set(tc.module, { reqs: [], scenarios: [], cases: [] });
  byModule.get(tc.module).cases.push(tc);
}

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function prioClass(p) {
  if (p === "P0") return "p0";
  if (p === "P1") return "p1";
  if (p === "P2") return "p2";
  return "p3";
}

const moduleSections = [...byModule.entries()]
  .map(([module, data]) => {
    const reqRows = data.reqs
      .map(
        (r) =>
          `<tr><td>${esc(r.id)}</td><td>${esc(r.name)}</td><td><code>${esc(r.ref)}</code></td></tr>`,
      )
      .join("");
    const caseRows = data.cases
      .map(
        (tc) => `<tr>
        <td>${esc(tc.id)}</td>
        <td><span class="badge ${prioClass(tc.priority)}">${esc(tc.priority)}</span></td>
        <td>${esc(tc.type)}</td>
        <td>${esc(tc.title)}</td>
        <td>${esc(tc.prerequisites)}</td>
        <td>${esc(tc.steps)}</td>
        <td>${esc(tc.expected)}</td>
      </tr>`,
      )
      .join("");
    return `
    <section class="module">
      <h2>${esc(module)}</h2>
      <p class="meta">${data.reqs.length} requirement(s) · ${data.scenarios.length} scenario(s) · ${data.cases.length} test case(s)</p>
      ${
        data.reqs.length
          ? `<h3>Requirements</h3>
      <table>
        <thead><tr><th>ID</th><th>Feature</th><th>Code reference</th></tr></thead>
        <tbody>${reqRows}</tbody>
      </table>`
          : ""
      }
      ${
        data.cases.length
          ? `<h3>Test cases — execution guide</h3>
      <table class="cases">
        <thead>
          <tr>
            <th>Case ID</th><th>Priority</th><th>Type</th><th>Title</th>
            <th>Prerequisites</th><th>Steps</th><th>Expected result</th>
          </tr>
        </thead>
        <tbody>${caseRows}</tbody>
      </table>`
          : `<p class="note">No dedicated cases in Excel for this module yet — cover via related scenarios / security checklist.</p>`
      }
    </section>`;
  })
  .join("\n");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>CLARTAS Technical Testing Guideline</title>
<style>
  @page { size: A4; margin: 16mm 14mm; }
  * { box-sizing: border-box; }
  body {
    font-family: "Segoe UI", system-ui, sans-serif;
    font-size: 9.5pt;
    line-height: 1.45;
    color: #111;
  }
  h1 { font-size: 20pt; margin: 0 0 6px; letter-spacing: -0.02em; }
  h2 {
    font-size: 13pt;
    margin: 22px 0 8px;
    padding-bottom: 4px;
    border-bottom: 2px solid #ff7a50;
    page-break-after: avoid;
  }
  h3 { font-size: 10.5pt; margin: 14px 0 6px; page-break-after: avoid; }
  .cover {
    border: 1px solid #ddd;
    border-radius: 12px;
    padding: 28px 24px;
    margin-bottom: 20px;
    background: linear-gradient(135deg, #fff8f3, #fff);
  }
  .cover .subtitle { color: #555; font-size: 11pt; margin: 0 0 16px; }
  .meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px 18px;
    font-size: 9pt;
  }
  .meta-grid strong { color: #333; }
  .toc { margin: 12px 0 20px; }
  .toc li { margin: 3px 0; }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 6px 0 12px;
    font-size: 8pt;
  }
  th, td {
    border: 1px solid #ddd;
    padding: 4px 6px;
    vertical-align: top;
    text-align: left;
  }
  th { background: #f5f5f5; font-weight: 600; }
  code { font-size: 7.5pt; background: #f3f3f3; padding: 1px 3px; border-radius: 3px; }
  .badge {
    display: inline-block;
    padding: 1px 6px;
    border-radius: 999px;
    font-weight: 700;
    font-size: 7.5pt;
  }
  .p0 { background: #ffe0e0; color: #a10; }
  .p1 { background: #fff0d6; color: #8a5a00; }
  .p2 { background: #e8f0ff; color: #1a4a9c; }
  .p3 { background: #eee; color: #555; }
  .module { page-break-inside: avoid; }
  .module + .module { page-break-before: auto; }
  .cases td:nth-child(6), .cases td:nth-child(7) { min-width: 90px; }
  .note { color: #666; font-style: italic; }
  .meta { color: #666; font-size: 8.5pt; margin-top: -4px; }
  ul.compact li { margin: 2px 0; }
  .footer-note {
    margin-top: 24px;
    padding-top: 10px;
    border-top: 1px solid #ddd;
    font-size: 8pt;
    color: #666;
  }
  .callout {
    background: #fff7f2;
    border-left: 4px solid #ff7a50;
    padding: 8px 12px;
    margin: 10px 0;
    border-radius: 0 8px 8px 0;
  }
</style>
</head>
<body>
  <div class="cover">
    <h1>CLARTAS — Technical Testing Guideline</h1>
    <p class="subtitle">Complete QA handbook for testing all website features (manual + automation)</p>
    <div class="meta-grid">
      <div><strong>Product:</strong> CLARTAS Commerce Content OS</div>
      <div><strong>Document version:</strong> 1.0</div>
      <div><strong>Date:</strong> ${esc(docDate)}</div>
      <div><strong>App version:</strong> 0.1.0</div>
      <div><strong>Requirements:</strong> ${requirements.length}</div>
      <div><strong>Scenarios:</strong> ${scenarios.length}</div>
      <div><strong>Test cases:</strong> ${testCases.length}</div>
      <div><strong>Automation baseline:</strong> 54/54 passed (FULL-TEST-RESULTS.md)</div>
    </div>
  </div>

  <h2>1. Purpose &amp; scope</h2>
  <p>
    This guideline defines how to test every CLARTAS feature end-to-end: public marketing pages,
    authentication, app modules, AI APIs, billing, security, and mobile packaging.
    It consolidates <code>docs/qa/FULL-TEST-RESULTS.md</code>, <code>TEST-PLAN.md</code>,
    <code>AUTOMATION.md</code>, and the Excel catalog <code>CLARTAS-Kasus-Uji.xlsx</code>.
  </p>
  <div class="callout">
    <strong>Pass criteria for release:</strong> Smoke + Sanity 100% · Regression ≥ 95% ·
    Unit/Integration 100% · Zero open P0 defects from the Excel manual set.
  </div>

  <h2>2. Test environments</h2>
  <table>
    <thead><tr><th>Environment</th><th>Setup</th><th>Use for</th></tr></thead>
    <tbody>
      <tr>
        <td>Local demo</td>
        <td><code>NEXT_PUBLIC_DEMO_MODE=true</code>, <code>npm run dev</code>, http://localhost:3000</td>
        <td>Smoke, Sanity, Regression, E2E, UAT without login</td>
      </tr>
      <tr>
        <td>Local auth</td>
        <td>Demo off + configured Supabase Auth</td>
        <td>Real sign-up / sign-in / OAuth / password reset</td>
      </tr>
      <tr>
        <td>CI (GitHub Actions)</td>
        <td>Workflow QA · Playwright Chromium</td>
        <td>Automated gate on push/PR</td>
      </tr>
      <tr>
        <td>Paddle sandbox</td>
        <td>Sandbox keys + webhook secret</td>
        <td>Checkout &amp; webhook signature tests</td>
      </tr>
    </tbody>
  </table>

  <h2>3. Automation suites (how to run)</h2>
  <table>
    <thead><tr><th>Suite</th><th>Command</th><th>Goal</th><th>Est. duration</th></tr></thead>
    <tbody>
      <tr><td>Smoke</td><td><code>npm run test:smoke</code></td><td>App boots, dashboard, core nav</td><td>1–2 min</td></tr>
      <tr><td>Sanity</td><td><code>npm run test:sanity</code></td><td>Core modules after deploy</td><td>2–3 min</td></tr>
      <tr><td>Regression</td><td><code>npm run test:regression</code></td><td>All main routes + theme</td><td>5–8 min</td></tr>
      <tr><td>E2E flows</td><td><code>npm run test:e2e:suite</code></td><td>Multi-step journeys</td><td>3–5 min</td></tr>
      <tr><td>UAT</td><td><code>npm run test:uat</code></td><td>Acceptance criteria</td><td>3–5 min</td></tr>
      <tr><td>Unit</td><td><code>npm run test:unit</code></td><td>Credits, upload, Paddle, rate limit</td><td>~10 s</td></tr>
      <tr><td>Full plan</td><td><code>npm run test:plan</code></td><td>Unit + E2E + HTML/JSON report</td><td>10–15 min</td></tr>
    </tbody>
  </table>
  <p><strong>Prerequisites:</strong> Node.js 22+, <code>npx playwright install chromium</code> (once), demo mode for local E2E.</p>
  <p><strong>Reports:</strong> <code>playwright-report/index.html</code> · <code>docs/qa/reports/laporan-qa-YYYY-MM-DD.html</code> · refresh narrative via <code>docs/qa/FULL-TEST-RESULTS.md</code>.</p>

  <h2>4. Defect severity &amp; status</h2>
  <table>
    <thead><tr><th>Priority</th><th>Meaning</th><th>Action</th></tr></thead>
    <tbody>
      <tr><td><span class="badge p0">P0</span></td><td>Blocker — auth, payment, data loss, security</td><td>Stop release until fixed</td></tr>
      <tr><td><span class="badge p1">P1</span></td><td>Major — core workflow broken with workaround</td><td>Fix before production</td></tr>
      <tr><td><span class="badge p2">P2</span></td><td>Minor — secondary module / UX</td><td>Schedule in next sprint</td></tr>
      <tr><td><span class="badge p3">P3</span></td><td>Cosmetic / nice-to-have</td><td>Backlog</td></tr>
    </tbody>
  </table>
  <p>Excel status values: <strong>Belum</strong> / <strong>Jalankan</strong> / <strong>Lulus</strong> / <strong>Gagal</strong> / <strong>Blokir</strong>.</p>

  <h2>5. Recommended execution order</h2>
  <ol class="compact">
    <li>Clear stale cache if needed (<code>.next</code>), start <code>npm run dev</code>, confirm http://localhost:3000 returns 200.</li>
    <li>Run <code>npm run test:smoke</code> then <code>test:sanity</code>.</li>
    <li>Run <code>npm run test:unit</code> and <code>test:regression</code>.</li>
    <li>Run <code>test:e2e:suite</code> and <code>test:uat</code>.</li>
    <li>Execute remaining Excel P0/P1 cases manually (auth, Paddle, uploads, RLS, real AI).</li>
    <li>Record results in Excel + attach Playwright/Vitest artifacts for failures.</li>
  </ol>

  <h2>6. Automation coverage snapshot (from FULL-TEST-RESULTS.md)</h2>
  <table>
    <thead><tr><th>Layer</th><th>Tool</th><th>Count</th><th>Result</th></tr></thead>
    <tbody>
      <tr><td>Unit &amp; integration</td><td>Vitest</td><td>18</td><td>100% passed</td></tr>
      <tr><td>Browser E2E</td><td>Playwright</td><td>36</td><td>100% passed</td></tr>
      <tr><td><strong>Total automated</strong></td><td>—</td><td><strong>54</strong></td><td><strong>100%</strong></td></tr>
      <tr><td>Manual catalog</td><td>Excel</td><td>137</td><td>Execute gaps below</td></tr>
    </tbody>
  </table>
  <p class="note">Still primarily manual: real login/OAuth, Paddle sandbox checkout, exact upload boundaries, all 33 editor tools with live AI, RLS with two users, Capacitor mobile builds.</p>

  <h2>7. Feature modules — full test catalog</h2>
  <p>Use each table as the technical checklist for that module. Steps and expected results come from the official Excel case set.</p>
  ${moduleSections}

  <h2>8. Cross-cutting checks</h2>
  <ul class="compact">
    <li><strong>Responsive:</strong> phone / tablet / laptop / desktop for marketing + app shell.</li>
    <li><strong>i18n:</strong> switch en ↔ id ↔ zh ↔ es; verify URL prefix and UI strings.</li>
    <li><strong>Theme:</strong> light mode readable; dark mode pure black background (#000).</li>
    <li><strong>Security:</strong> unauthenticated API calls rejected; webhook signatures verified; RLS isolation.</li>
    <li><strong>Performance smoke:</strong> dashboard and editor interactive within acceptable local latency.</li>
  </ul>

  <h2>9. Traceability &amp; artifacts</h2>
  <ul class="compact">
    <li>Manual cases: <code>docs/qa/CLARTAS-Kasus-Uji.xlsx</code></li>
    <li>Automation map: <code>tests/helpers/traceability.ts</code></li>
    <li>Regenerate Excel: <code>node scripts/generate-clartas-qa-excel.mjs</code></li>
    <li>Failed runs: screenshots/videos under <code>test-results/</code></li>
  </ul>

  <div class="footer-note">
    Generated for CLARTAS QA from FULL-TEST-RESULTS.md and the 137-case technical catalog.
    Document ID: CLARTAS-QA-TTG-1.0 · ${esc(docDate)}
  </div>
</body>
</html>`;

fs.mkdirSync(outDir, { recursive: true });
const tmpHtml = path.join(outDir, "_guideline-tmp.html");
fs.writeFileSync(tmpHtml, html, "utf8");

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto(`file://${tmpHtml.replace(/\\/g, "/")}`, { waitUntil: "load" });
await page.pdf({
  path: outPdf,
  format: "A4",
  printBackground: true,
  margin: { top: "14mm", right: "12mm", bottom: "14mm", left: "12mm" },
});
await browser.close();
fs.unlinkSync(tmpHtml);

const sizeKb = Math.round(fs.statSync(outPdf).size / 1024);
console.log(`Wrote ${outPdf} (${sizeKb} KB)`);
console.log(`Modules: ${byModule.size} | Cases: ${testCases.length}`);
