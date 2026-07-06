/**
 * Fail CI if any single JS chunk exceeds budget (post-build gate).
 * Run after: NEXT_PUBLIC_DEMO_MODE=true npm run build
 */
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const CHUNK_DIR = ".next/static/chunks";
const MAX_CHUNK_KB = 800;

function walk(dir) {
  const entries = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) entries.push(...walk(full));
    else if (name.endsWith(".js")) entries.push(full);
  }
  return entries;
}

let maxKb = 0;
let maxFile = "";

for (const file of walk(CHUNK_DIR)) {
  const kb = statSync(file).size / 1024;
  if (kb > maxKb) {
    maxKb = kb;
    maxFile = file;
  }
}

console.log(`Largest chunk: ${maxFile} (${maxKb.toFixed(1)} KB)`);

if (maxKb > MAX_CHUNK_KB) {
  console.error(`Bundle budget exceeded: ${maxKb.toFixed(1)} KB > ${MAX_CHUNK_KB} KB`);
  process.exit(1);
}

console.log(`Bundle budget OK (max ${MAX_CHUNK_KB} KB)`);
