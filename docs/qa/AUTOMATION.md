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
  CLARTAS-Kasus-Uji.xlsx
  TEST-PLAN.md
  reports/          output laporan (generated)
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
2. `npx playwright install chromium` (sekali)
3. Mode demo aktif untuk E2E lokal (default)

## Regenerasi Excel Kasus Uji

```bash
node scripts/generate-clartas-qa-excel.mjs
```
