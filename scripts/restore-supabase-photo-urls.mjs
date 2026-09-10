import { readFile, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { createClient } from "@supabase/supabase-js";
import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());
const exec = promisify(execFile);
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required. Set it to the Supabase Postgres connection string.");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const args = new Set(process.argv.slice(2));
const APPLY_CONFIRMATION = "RESTORE-SUPABASE-URLS";
const dryRun = !args.has("--apply");
const confirmed = process.argv.includes(`--confirm=${APPLY_CONFIRMATION}`);
const reportPath = process.argv.find((value) => value.startsWith("--report="))?.slice(9) ?? "data/photo-url-restoration-report.json";
const jsonPath = process.argv.find((value) => value.startsWith("--json="))?.slice(7) ?? "data/photos.json";
const csvPath = process.argv.find((value) => value.startsWith("--csv="))?.slice(6) ?? "data/photos_rows.csv";
const manualPath = process.argv.find((value) => value.startsWith("--manual="))?.slice(9) ?? "data/manual-supabase-photo-url-mappings.json";

function parseCsv(text) {
  const rows = [], lines = text.replace(/^\uFEFF/, "").split(/\r?\n/);
  for (const line of lines) {
    if (!line) continue;
    const values = [], state = { value: "", quoted: false };
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' && line[i + 1] === '"') { state.value += '"'; i++; }
      else if (char === '"') state.quoted = !state.quoted;
      else if (char === "," && !state.quoted) { values.push(state.value); state.value = ""; }
      else state.value += char;
    }
    values.push(state.value); rows.push(values);
  }
  const headers = rows.shift() ?? [];
  return rows.map((values) => Object.fromEntries(headers.map((header, i) => [header, values[i] ?? ""])));
}
function isSupabaseUrl(value) { return /^https?:\/\/[^/]+\.supabase\.co\/storage\/v1\/object\/public\//.test(value ?? ""); }
function isBlobUrl(value) { return /\.blob\.vercel-storage\.com\//.test(value ?? ""); }
function pathFromUrl(value) { try { return decodeURIComponent(new URL(value).pathname.split("/object/public/photos/")[1] ?? ""); } catch { return ""; } }
async function historicalRows() {
  const { stdout } = await exec("git", ["log", "--all", "--format=%H", "--", jsonPath]);
  const rows = [];
  for (const commit of stdout.trim().split(/\r?\n/).filter(Boolean)) {
    try { rows.push(...JSON.parse((await exec("git", ["show", `${commit}:${jsonPath}`])).stdout)); } catch { /* file may not exist in an older commit */ }
  }
  return rows;
}

async function storagePaths() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY are required to list Supabase Storage.");
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const paths = [];
  async function visit(prefix = "") {
    const { data, error } = await client.storage.from("photos").list(prefix, { limit: 1000 });
    if (error) throw error;
    for (const item of data ?? []) {
      const path = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id) paths.push(path); else await visit(path);
    }
  }
  await visit();
  return paths;
}

const [dbRows, sourceJson, sourceCsv, historical] = await Promise.all([
  prisma.photo.findMany({ orderBy: { id: "asc" } }),
  readFile(jsonPath, "utf8").then(JSON.parse),
  readFile(csvPath, "utf8").then(parseCsv),
  historicalRows(),
]);
const supabasePaths = await storagePaths();
const manual = await readFile(manualPath, "utf8").then(JSON.parse).catch(() => []);
const jsonById = new Map(sourceJson.map((row) => [row.id, row]));
const manualById = new Map(manual.map((row) => [row.id, row]));
for (const row of historical) if (!jsonById.has(row.id)) jsonById.set(row.id, row);
const csvById = new Map(sourceCsv.map((row) => [row.id, row]));
const available = new Set(supabasePaths.map((path) => path.toLowerCase()));
const report = { mode: dryRun ? "dry-run" : "apply", matched: [], restored: [], skipped: [], ambiguous: [] };
const updates = [];

for (const row of dbRows) {
  const json = jsonById.get(row.id), csv = csvById.get(row.id);
  const manualMapping = manualById.get(row.id);
  const imageCandidates = [manualMapping?.imageUrl, json?.imageUrl].filter(isSupabaseUrl).filter((url) => available.has(pathFromUrl(url).toLowerCase()));
  const slideshowCandidates = [manualMapping?.slideshowImageUrl, json?.slideshowImageUrl].filter(isSupabaseUrl).filter((url) => available.has(pathFromUrl(url).toLowerCase()));
  const uniqueImages = [...new Set(imageCandidates)], uniqueSlideshows = [...new Set(slideshowCandidates)];
  const blobImage = isBlobUrl(row.imageUrl) ? row.imageUrl : (isBlobUrl(csv?.image_url) ? csv.image_url : null);
  const blobSlideshow = isBlobUrl(row.slideshowImageUrl) ? row.slideshowImageUrl : (isBlobUrl(csv?.slideshow_image_url) ? csv.slideshow_image_url : null);
  if (!uniqueImages.length) { report.skipped.push({ id: row.id, reason: "no verified Supabase image URL", blobImage, blobSlideshow }); continue; }
  if (uniqueImages.length > 1 || uniqueSlideshows.length > 1) { report.ambiguous.push({ id: row.id, imageCandidates: uniqueImages, slideshowCandidates: uniqueSlideshows }); continue; }
  const imageUrl = uniqueImages[0];
  const slideshowUrl = uniqueSlideshows[0] ?? imageUrl;
  const mapping = { id: row.id, imageUrl, slideshowUrl, blobImage, blobSlideshow, source: manualMapping ? "manual mapping + Supabase Storage listing" : "photos.json + Supabase Storage listing" };
  report.matched.push(mapping); updates.push({ row, mapping });
}

console.log(JSON.stringify(report, null, 2));
await writeFile(reportPath, JSON.stringify(report, null, 2) + "\n");
if (dryRun) { console.log(`Dry run only. Proposed mappings written to ${reportPath}. Re-run with --apply --confirm=${APPLY_CONFIRMATION} after review.`); await prisma.$disconnect(); process.exit(0); }
if (!confirmed) throw new Error(`Refusing database writes. Supply --confirm=${APPLY_CONFIRMATION}.`);
for (const { row, mapping } of updates) {
  await prisma.photo.update({ where: { id: row.id }, data: {
    blobImageUrl: row.blobImageUrl ?? mapping.blobImage,
    blobSlideshowImageUrl: row.blobSlideshowImageUrl ?? mapping.blobSlideshow,
    imageUrl: mapping.imageUrl,
    slideshowImageUrl: mapping.slideshowUrl,
  } });
  report.restored.push(mapping);
}
await writeFile(reportPath, JSON.stringify(report, null, 2) + "\n");
console.log(`Restored ${report.restored.length} rows. No files were deleted.`);
await prisma.$disconnect();
