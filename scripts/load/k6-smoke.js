import http from "k6/http";
import { check, sleep } from "k6";

/**
 * Smoke load test for CLARTAS public routes.
 * Run: k6 run scripts/load/k6-smoke.js
 * Env: BASE_URL=https://your-app.vercel.app k6 run scripts/load/k6-smoke.js
 */
export const options = {
  vus: 10,
  duration: "30s",
  thresholds: {
    http_req_failed: ["rate<0.05"],
    http_req_duration: ["p(95)<3000"],
  },
};

const BASE = __ENV.BASE_URL || "http://localhost:3000";

export default function () {
  const locales = ["en", "id"];
  const locale = locales[Math.floor(Math.random() * locales.length)];

  const res = http.get(`${BASE}/${locale}`);
  check(res, {
    "landing ok": (r) => r.status === 200,
    "landing fast": (r) => r.timings.duration < 3000,
  });

  sleep(1);
}
