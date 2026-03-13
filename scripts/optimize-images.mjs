/**
 * Generate responsive image variants for the landing page.
 *
 * Run: npx tsx scripts/optimize-images.mjs
 *   or: node scripts/optimize-images.mjs  (requires sharp installed)
 *
 * Requires: npm install --save-dev sharp
 */

import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

async function generateVariants(inputName, sizes, quality = 75) {
  const input = join(publicDir, inputName);
  const baseName = inputName.replace('.webp', '');

  for (const width of sizes) {
    const outputName = `${baseName}-${width}w.webp`;
    const output = join(publicDir, outputName);
    await sharp(input)
      .resize(width, null, { withoutEnlargement: true })
      .webp({ quality })
      .toFile(output);
    const { size } = await sharp(output).metadata().then(() =>
      import('fs/promises').then((fs) => fs.stat(output))
    );
    console.log(`  ${outputName} → ${(size / 1024).toFixed(1)} KiB`);
  }
}

async function main() {
  console.log('Generating responsive image variants...\n');

  console.log('hero.webp (LCP image):');
  await generateVariants('hero.webp', [480, 768, 1024, 1920], 72);

  console.log('\nspot-it.webp:');
  await generateVariants('spot-it.webp', [332, 400], 70);

  console.log('\njoin-up.webp:');
  await generateVariants('join-up.webp', [332, 400], 70);

  console.log('\nclear-it.webp:');
  await generateVariants('clear-it.webp', [332, 400], 70);

  console.log('\nDone! Update srcset attributes in src/app/page.tsx to use the new variants.');
}

main().catch(console.error);
