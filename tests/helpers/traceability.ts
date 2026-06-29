/** Pemetaan kasus uji manual (Excel) ke test otomasi — untuk laporan traceability. */

export type TestSuite = "smoke" | "sanity" | "regression" | "e2e" | "uat" | "unit" | "integration";

export interface TraceEntry {
  testCaseId: string;
  scenarioId: string;
  reqId: string;
  suite: TestSuite;
  title: string;
}

export const TRACEABILITY: TraceEntry[] = [
  { testCaseId: "TC-PLAT-007", scenarioId: "TS-PLAT-06", reqId: "REQ-F05", suite: "smoke", title: "Dashboard dimuat" },
  { testCaseId: "TC-AUTH-013", scenarioId: "TS-AUTH-08", reqId: "REQ-F01", suite: "smoke", title: "Akses app terproteksi (demo)" },
  { testCaseId: "TC-PLAT-005", scenarioId: "TS-PLAT-04", reqId: "REQ-F04", suite: "smoke", title: "Navigasi sidebar" },
  { testCaseId: "TC-EDT-004", scenarioId: "TS-EDT-AI", reqId: "REQ-F06", suite: "sanity", title: "Halaman editor" },
  { testCaseId: "TC-AST-001", scenarioId: "TS-AST-01", reqId: "REQ-F09", suite: "sanity", title: "Halaman aset" },
  { testCaseId: "TC-BILL-010", scenarioId: "TS-BILL-08", reqId: "REQ-F12", suite: "sanity", title: "Halaman billing" },
  { testCaseId: "TC-PLAT-004", scenarioId: "TS-PLAT-03", reqId: "REQ-F03", suite: "regression", title: "Toggle tema" },
  { testCaseId: "TC-PLAT-001", scenarioId: "TS-PLAT-01", reqId: "REQ-F02", suite: "regression", title: "Language switcher" },
  { testCaseId: "TC-MKT-001", scenarioId: "TS-MKT-01", reqId: "REQ-F26", suite: "regression", title: "Halaman pricing" },
  { testCaseId: "TC-EDT-031", scenarioId: "TS-EDT-DL", reqId: "REQ-F06", suite: "e2e", title: "Deep link editor" },
  { testCaseId: "TC-DMO-001", scenarioId: "TS-DMO-01", reqId: "REQ-F27", suite: "e2e", title: "Alur demo dashboard-editor-aset" },
  { testCaseId: "TC-CNT-001", scenarioId: "TS-CNT-01", reqId: "REQ-F15", suite: "uat", title: "Generator konten" },
  { testCaseId: "TC-BILL-001", scenarioId: "TS-BILL-01", reqId: "REQ-F11", suite: "uat", title: "Saldo kredit demo" },
];

export const APP_ROUTES = {
  public: ["/pricing"],
  app: [
    "/dashboard",
    "/editor",
    "/video-editor",
    "/content",
    "/design",
    "/photography",
    "/video-ad",
    "/ecommerce",
    "/assets",
    "/ai-tools",
    "/brand-kit",
    "/analytics",
    "/approvals",
    "/intelligence",
    "/agents",
    "/automation",
    "/workspace",
    "/billing",
    "/settings",
  ],
} as const;
