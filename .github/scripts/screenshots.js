#!/usr/bin/env node
// Robi screeny wszystkich podstron projektu (mobile + desktop)
// i wywołuje recordVersion na Cloud Function

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ID  = '25lat';
const BASE_URL    = 'https://storage.googleapis.com/douglas-25lat-prod/';
const GCS_BUCKET  = 'gs://douglas-review-tool';
const RECORD_CF   = 'https://us-central1-review-tool-57cfe.cloudfunctions.net/recordVersion';
const OUT_DIR     = '/tmp/screenshots';

const PAGES = [
  { name: 'Strona główna',        path: 'index.html' },
  { name: 'Nasza historia',       path: 'nasza-historia.html' },
  { name: 'Eventy',               path: 'eventy.html' },
  { name: 'Beauty',               path: 'beauty.html' },
  { name: 'Galeria',              path: 'galeria.html' },
  { name: 'Konkurs',              path: 'konkurs.html' },
  { name: 'Wyniki',               path: 'wyniki.html' },
  { name: 'Koncert finalowy',     path: 'koncert-finalowy.html' },
  { name: 'FAQ',                  path: 'faq.html' },
  { name: 'Regulamin',            path: 'regulamin.html' },
  { name: 'Polityka prywatności', path: 'polityka-prywatnosci.html' },
];

const VIEWPORTS = [
  { name: 'mobile',   width: 390,  height: 844 },
  { name: 'desktop',  width: 1440, height: 900 },
];

const timestamp = process.env.TIMESTAMP || new Date().toISOString().replace(/[:.]/g, '-');

async function run() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const screenshots = [];

  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });
    const page = await ctx.newPage();

    for (const pg of PAGES) {
      const url  = BASE_URL + pg.path;
      const slug = pg.path.replace('.html', '').replace(/[^a-z0-9]/gi, '-');
      const file = `${slug}-${vp.name}.jpg`;
      const dest = path.join(OUT_DIR, file);

      console.log(`  📸 ${vp.name} ${pg.name}`);
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(1000);
      await page.screenshot({ path: dest, fullPage: true, type: 'jpeg', quality: 80 });

      const gcsPath = `history/${PROJECT_ID}/${timestamp}/${file}`;
      const publicUrl = `https://storage.googleapis.com/douglas-review-tool/${gcsPath}`;
      screenshots.push({ page: pg.name, path: pg.path, device: vp.name, url: publicUrl, gcsPath });
    }
    await ctx.close();
  }

  await browser.close();

  // Upload do GCS
  console.log('\n→ Upload do GCS...');
  execSync(`gcloud storage cp "${OUT_DIR}/*.jpg" "${GCS_BUCKET}/history/${PROJECT_ID}/${timestamp}/" --quiet`);

  // Ustaw public access
  execSync(`gcloud storage objects update "${GCS_BUCKET}/history/${PROJECT_ID}/${timestamp}/**" --add-acl-grant=entity=allUsers,role=READER 2>/dev/null || true`);

  // Wywołaj Cloud Function
  console.log('→ Zapisuję wersję w Firestore...');
  const payload = JSON.stringify({ projectId: PROJECT_ID, timestamp, screenshots });
  execSync(`curl -s -X POST "${RECORD_CF}" -H "Content-Type: application/json" -d '${payload}'`);

  console.log(`\n✓ Wersja ${timestamp} zapisana — ${screenshots.length} screenów`);
}

run().catch(err => { console.error(err); process.exit(1); });
