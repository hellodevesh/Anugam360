// OCR + extraction regression test. Run: npm test
import { createWorker } from 'tesseract.js'; import path from 'path'; import os from 'os'; import { fileURLToPath } from 'url';
await import('../public/extract.js'); const parseOcr = globalThis.parseOcr;
const dir = path.dirname(fileURLToPath(import.meta.url));
const EXPECT = {
  'table.png': { type: 'ST Certificate', Name: 'Ravi Kumar Singh', DOB: '12/03/1998', 'Cert. no.': 'ST/MP/2019/44821', 'Issue date': '15-03-2019', 'Issued by': /Tehsildar/i },
  'nextline.png': { type: 'Income Certificate', Name: 'Meena Uikey', DOB: /05.?July.?2001/i, Income: /4,50,000/ },
  'sentence.png': { type: 'ST Certificate', Name: 'Ravi Kumar Singh', 'Cert. no.': 'ST/MP/2019/44821', 'Issue date': '15/03/2019', 'Issued by': /Tehsildar/i },
  'income.png': { type: 'Income Certificate', Name: 'Asha Maravi', Income: /3,20,000/, 'Cert. no.': 'INC/2026/00871', issue: /expired/i },
  'marksheet.png': { type: 'Marksheet', Name: /dev sarathe/i, Course: /Biotechnology/i, Marks: /76/, Institution: /University of Delhi/i },
  'bank.png': { type: 'Bank Document', Name: 'Lata Baiga', 'Account no.': '123456789012', IFSC: 'SBIN0001234' }
};
const w = await createWorker('eng', 1, { langPath: path.join(dir, '../public/lib/lang'), gzip: true, cachePath: path.join(os.tmpdir(), 'tess-cache') });
let fail = 0;
for (const [file, exp] of Object.entries(EXPECT)) {
  let best = null;
  for (const m of ['3', '6']) { await w.setParameters({ tessedit_pageseg_mode: m }); const { data } = await w.recognize(path.join(dir, 'fixtures', file)); const r = parseOcr(data); if (!best || r.fields.length > best.fields.length) best = r; if (best.fields.length >= 3) break }
  const val = k => (best.fields.find(f => f.k === k) || {}).v || '';
  const bad = [];
  for (const [k, e] of Object.entries(exp)) {
    const got = k === 'type' ? best.type : k === 'issue' ? best.issues.join('; ') : val(k);
    if (!(e instanceof RegExp ? e.test(got) : got === e)) bad.push(`${k}: expected ${e}, got "${got}"`);
  }
  console.log((bad.length ? 'FAIL ' : 'ok   ') + file + ' ' + JSON.stringify(best.fields.map(f => f.k + '=' + f.v)));
  bad.forEach(b => console.log('     ' + b)); if (bad.length) fail++;
}
await w.terminate(); process.exit(fail ? 1 : 0);
