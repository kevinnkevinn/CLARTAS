# Kerangka Otomasi QA CLARTAS

## Struktur Direktori

```
tests/
  e2e/
    smoke/          @smoke   — verifikasi cepat
    sanity/         @sanity  — modul inti
    regression/     @regression — rute lengkap
    flows/          @e2e     — alur pengguna
    uat/            @uat     — acceptance
  integration/      Vitest — API schema, rate limit
  helpers/          fixtures, traceability
  report/           generator laporan HTML/JSON
src/lib/__tests__/  Vitest — credits, upload, paddle
docs/qa/
  CLARTAS-Technical-Testing-Guideline.pdf  — handbook QA (manual + otomatis)
  TEST-PLAN.md
  reports/          output laporan (generated)
scripts/
  qa-test-data.mjs                         — katalog 137 kasus uji
  generate-qa-testing-guideline-pdf.mjs    — regenerasi PDF
playwright.config.ts
```

## Menjalankan Test

```bash
npm run test:unit          # Vitest unit + integration
npm run test:smoke         # Smoke only
npm run test:sanity        # Sanity only
npm run test:regression    # Regression only
npm run test:e2e:suite     # E2E flows only
npm run test:uat           # UAT only
npm run test:e2e           # Semua Playwright
npm run test:plan          # Unit + E2E + laporan QA
```

## Prasyarat

1. Node.js 22+
2. Browser Chromium Playwright — terpasang otomatis via `postinstall`, atau manual: `npm run test:browsers`
3. Mode demo aktif untuk E2E lokal (default)

## Regenerasi PDF Guideline QA

```bash
node scripts/generate-qa-testing-guideline-pdf.mjs
```
