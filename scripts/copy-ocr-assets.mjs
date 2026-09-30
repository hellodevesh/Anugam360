// Copies the OCR engine + English language data from node_modules into public/lib so the site works offline (no CDN).
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const nm = p => path.join(root, 'node_modules', p), out = p => path.join(root, 'public', 'lib', p);
const jobs = [
  [nm('tesseract.js/dist/tesseract.min.js'), out('tesseract.min.js')],
  [nm('tesseract.js/dist/worker.min.js'), out('worker.min.js')],
  [nm('tesseract.js-core/tesseract-core-lstm.wasm.js'), out('core/tesseract-core-lstm.wasm.js')],
  [nm('tesseract.js-core/tesseract-core-simd-lstm.wasm.js'), out('core/tesseract-core-simd-lstm.wasm.js')],
  [nm('@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz'), out('lang/eng.traineddata.gz')]
];
for (const [src, dst] of jobs) {
  if (!fs.existsSync(src)) { console.warn('skip (not installed, using committed copy):', path.relative(root, dst)); continue }
  fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.copyFileSync(src, dst);
}
console.log('OCR assets ready in public/lib');
