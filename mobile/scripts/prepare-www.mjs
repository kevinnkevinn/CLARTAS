/**
 * Injects CAP_SERVER_URL into www/index.html before cap sync.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const templatePath = join(__dirname, "..", "www", "index.template.html");
const wwwIndex = join(__dirname, "..", "www", "index.html");
const serverUrl = process.env.CAP_SERVER_URL ?? "";

let html = readFileSync(templatePath, "utf8");
html = html.replace(/%CAP_SERVER_URL%/g, serverUrl);
writeFileSync(wwwIndex, html);
console.log(
  serverUrl
    ? `www/index.html → redirect ke ${serverUrl}`
    : "www/index.html → mode offline (CAP_SERVER_URL belum diset)",
);
