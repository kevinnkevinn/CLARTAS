# CLARTAS — Full Automation Test Results

**Report date:** June 30, 2026  
**Project:** CLARTAS (AI-powered e-commerce content platform)  
**Overall result:** **PASSED** — 54 of 54 tests passed (100%)

---

## Where to View Complete Test Results

Use the location that best fits what you need:

| What you want | File or folder | How to open it |
|---------------|----------------|----------------|
| **This document** (simple English, all tests listed) | `docs/qa/FULL-TEST-RESULTS.md` | Open in Cursor, VS Code, or any text editor |
| **Interactive browser report** (click through each test, see screenshots) | `playwright-report/index.html` | Run: `npx playwright show-report` |
| **E2E raw data** (for tools or CI) | `test-results/playwright-results.json` | After `npm run test:e2e` |
| **Unit test raw data** | `test-results/vitest-results.json` | After `npm run test:unit` |
| **HTML summary report** | `docs/qa/reports/laporan-qa-YYYY-MM-DD.html` | After `npm run test:report` |
| **JSON summary report** | `docs/qa/reports/laporan-qa-YYYY-MM-DD.json` | After `npm run test:report` |
| **Failed test artifacts** (screenshots, videos) | `test-results/` folder | Only created when a test fails |
| **Manual + automation handbook** (PDF, 137 cases) | `docs/qa/CLARTAS-Technical-Testing-Guideline.pdf` | Single QA guide for all features |
| **How to run tests** | `docs/qa/AUTOMATION.md` and `docs/qa/TEST-PLAN.md` | Setup and suite descriptions |
| **CI results** (after push to GitHub) | GitHub → Actions → QA workflow → Artifacts | Download `qa-reports` zip |

### Refresh all results

```bash
npm run test:plan
```

This runs unit tests, E2E tests, and generates the HTML/JSON summary report.

### Run one suite only

```bash
npm run test:smoke       # Quick health check (~2 min)
npm run test:sanity      # Core modules
npm run test:regression  # All main app pages
npm run test:e2e:suite   # Multi-step user flows
npm run test:uat         # User acceptance checks
npm run test:unit        # Code logic only (no browser)
```

---

## Executive Summary

| Category | Tool | Tests | Passed | Failed | Pass rate |
|----------|------|-------|--------|--------|-----------|
| Unit & Integration | Vitest | 18 | 18 | 0 | 100% |
| End-to-end (browser) | Playwright | 36 | 36 | 0 | 100% |
| **Total** | — | **54** | **54** | **0** | **100%** |

**Environment:** Demo mode on (`NEXT_PUBLIC_DEMO_MODE=true`), Chromium browser, desktop 1280×720.

**Recommendation:** All automated tests passed. Continue with manual cases from the Excel file for areas not yet covered (login, payments, file uploads, etc.).

---

## Part 1 — Unit & Integration Tests (Vitest)

These tests check code logic without opening a browser. They are fast and run in under one second.

### `src/lib/__tests__/credits.test.ts`

| # | Test | Result |
|---|------|--------|
| 1 | Every AI action has a positive credit cost | PASSED |
| 2 | Credit costs match the product specification | PASSED |
| 3 | Higher plans include more credits (free < premium < enterprise) | PASSED |

### `src/lib/__tests__/upload-validation.test.ts`

| # | Test | Result |
|---|------|--------|
| 4 | A valid PNG image is accepted | PASSED |
| 5 | An image larger than 10 MB is rejected | PASSED |
| 6 | A valid MP4 video is accepted | PASSED |
| 7 | A video larger than 100 MB is rejected | PASSED |
| 8 | A PDF file is rejected (wrong type) | PASSED |
| 9 | Image MIME types are detected correctly | PASSED |

### `src/lib/__tests__/paddle-verify.test.ts`

| # | Test | Result |
|---|------|--------|
| 10 | A valid Paddle payment webhook signature is accepted | PASSED |
| 11 | A changed webhook body is rejected | PASSED |
| 12 | A wrong webhook secret is rejected | PASSED |
| 13 | A missing signature header is rejected | PASSED |

### `tests/integration/ai-and-rate-limit.test.ts`

| # | Test | Linked manual case | Result |
|---|------|-------------------|--------|
| 14 | API allows 30 requests per minute; blocks request 31 | TC-AI-007 | PASSED |
| 15 | Product studio rejects a prompt shorter than 3 characters | TC-AI-004 | PASSED |
| 16 | Product studio accepts a valid prompt | TC-AI-004 | PASSED |
| 17 | Generate copy rejects an empty product name | TC-EDT-030 | PASSED |
| 18 | Remove background accepts a valid image URL | TC-AI-001 | PASSED |

---

## Part 2 — End-to-End Tests (Playwright)

These tests open a real browser and verify pages load and basic user flows work.

### Smoke suite — quick health check

| # | Test | Linked manual case | Result |
|---|------|-------------------|--------|
| 19 | Dashboard loads with the app shell | TC-PLAT-007 | PASSED |
| 20 | Sidebar navigation to Editor and Assets works | TC-PLAT-005 | PASSED |
| 21 | Demo mode: dashboard opens without sign-in | TC-AUTH-013 | PASSED |

### Sanity suite — core modules

| # | Test | Linked manual case | Result |
|---|------|-------------------|--------|
| 22 | Editor studio page loads | TC-EDT-004 | PASSED |
| 23 | Asset library page loads | TC-AST-001 | PASSED |
| 24 | Billing page loads | TC-BILL-010 | PASSED |
| 25 | Content and Design pages are accessible | — | PASSED |

### Regression suite — all main routes

| # | Test | Result |
|---|------|--------|
| 26 | /dashboard loads without error | PASSED |
| 27 | /editor loads without error | PASSED |
| 28 | /video-editor loads without error | PASSED |
| 29 | /content loads without error | PASSED |
| 30 | /design loads without error | PASSED |
| 31 | /photography loads without error | PASSED |
| 32 | /video-ad loads without error | PASSED |
| 33 | /ecommerce loads without error | PASSED |
| 34 | /assets loads without error | PASSED |
| 35 | /ai-tools loads without error | PASSED |
| 36 | /brand-kit loads without error | PASSED |
| 37 | /analytics loads without error | PASSED |
| 38 | /approvals loads without error | PASSED |
| 39 | /intelligence loads without error | PASSED |
| 40 | /agents loads without error | PASSED |
| 41 | /automation loads without error | PASSED |
| 42 | /workspace loads without error | PASSED |
| 43 | /billing loads without error | PASSED |
| 44 | /settings loads without error | PASSED |
| 45 | Public pricing page loads | TC-MKT-001 — PASSED |
| 46 | Theme button is visible in the top bar | TC-PLAT-004 — PASSED |

### E2E suite — multi-step flows

| # | Test | Linked manual case | Result |
|---|------|-------------------|--------|
| 47 | Deep link opens editor with remove-background tool | TC-EDT-031 | PASSED |
| 48 | User flow: Dashboard → Editor → Assets → Billing | TC-DMO-001 | PASSED |
| 49 | Intelligence sub-pages (research, assistant) load | — | PASSED |
| 50 | AI Tools and Brand Kit pages load | — | PASSED |

### UAT suite — acceptance criteria

| # | Test | Linked manual case | Result |
|---|------|-------------------|--------|
| 51 | Demo user sees unlimited credits (999,999) | TC-BILL-001 | PASSED |
| 52 | Content generator is available to users | TC-CNT-001 | PASSED |
| 53 | Workspace and Approvals pages work for demo admin | TC-DMO-002 | PASSED |
| 54 | Video and e-commerce modules are ready to use | — | PASSED |

---

## Part 3 — Not Yet Automated

The PDF handbook `docs/qa/CLARTAS-Technical-Testing-Guideline.pdf` lists **137 test cases**. Automation currently covers **54** tests. Examples still needing manual testing or future automation:

- Real email/password login and Google sign-in  
- Paddle payment checkout in sandbox  
- File upload at exact size limits (10 MB / 100 MB)  
- All 33 editor AI tools with real image processing  
- Database security (RLS) with two separate user accounts  
- Mobile app (Capacitor) on iOS and Android  

---

## Glossary

| Term | Simple meaning |
|------|----------------|
| **Smoke test** | Fast check that the app starts and critical pages work |
| **Sanity test** | Checks core features after a new build |
| **Regression test** | Ensures old features still work after changes |
| **E2E test** | Simulates a real user clicking through the app in a browser |
| **UAT** | Confirms the product meets business requirements |
| **Vitest** | Runs fast code-level tests (no browser) |
| **Playwright** | Controls a browser to run automated UI tests |

---

*Generated by the CLARTAS QA automation framework. Run `npm run test:plan` to refresh this report.*
