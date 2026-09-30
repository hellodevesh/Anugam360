/* Layout-tolerant field extraction from OCR output.
   Strategies, in order: (1) fuzzy "label: value" on one line, (2) label on one line and value on the next,
   (3) table-style "Label   value" without a colon, (4) sentence patterns ("This is to certify that Shri ..."),
   (5) global patterns (IFSC, passport, account numbers). Output is a review signal, never a decision. */
(function (root) {
  const norm = s => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
  function lev(a, b) { const m = a.length, n = b.length; if (!m) return n; if (!n) return m; let p = Array.from({ length: n + 1 }, (_, j) => j); for (let i = 1; i <= m; i++) { const c = [i]; for (let j = 1; j <= n; j++) c[j] = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); p = c } return p[n] }
  const sim = (a, b) => { const x = norm(a), y = norm(b); return x && y ? 1 - lev(x, y) / Math.max(x.length, y.length) : 0 };
  const MON = 'january|february|march|april|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sept|sep|oct|nov|dec';
  const DATE_SRC = '(\\d{1,2}\\s*[\\/\\-.]\\s*\\d{1,2}\\s*[\\/\\-.]\\s*\\d{2,4}|\\d{1,2}(?:st|nd|rd|th)?[\\s\\-]+(?:' + MON + ')\\.?,?[\\s\\-]+\\d{2,4}|(?:' + MON + ')\\.?\\s+\\d{1,2}(?:st|nd|rd|th)?,?\\s+\\d{4})';
  const DATE = new RegExp('\\b' + DATE_SRC + '\\b', 'i');
  const HON = /^(?:shri|shree|sri|smt|shrimati|kumari|km|kum|mr|mrs|ms|miss|dr|sh|late)\.?\s+/i;
  const CUT = /\s*(?:,|\bs\/o\b|\bd\/o\b|\bw\/o\b|\bc\/o\b|\bson of\b|\bdaughter of\b|\bwife of\b|\bfather\b|\bresident\b|\bof village\b|\bbelongs\b|\bwho\b|\bhas\b|\bis\b).*$/i;

  const pName = v => { v = v.replace(/^[\s:.\-_|]+/, '').replace(HON, '').replace(CUT, '').replace(/[^A-Za-z.\s'\-]/g, '').replace(/\s+/g, ' ').trim(); return /^[A-Za-z][A-Za-z.\s'\-]{2,}$/.test(v) && v.split(' ').length <= 6 ? v : null };
  const pDate = v => { const m = v.match(DATE); return m ? (/^\d+\s*[\/\-.]/.test(m[1]) ? m[1].replace(/\s+/g, '') : m[1]) : null };
  const pId = v => { const t = v.split(/\s+/).map(x => x.replace(/^[:#.\-]+|[,;.]+$/g, '')).find(x => /\d/.test(x) && x.length >= 5); return t || null };
  const pAmt = v => { const m = v.match(/(?:rs\.?|₹|inr|rupees)?\s*(\d{1,3}(?:,\d{2,3})+(?:\.\d+)?|\d{4,9}(?:\.\d+)?)\s*(?:\/-)?/i); return m ? m[0].trim() : null };
  const pText = v => { v = v.replace(/^[\s:.\-_|]+|[\s|_]+$/g, ''); return v.length >= 3 && /[A-Za-z]/.test(v) ? v : null };
  const pMarks = v => { const m = v.match(/(\d{1,3}(?:\.\d+)?\s*(?:%|\/\s*\d{2,4}))/) || v.match(/\b(\d{1,3}(?:\.\d{1,2})?)\b/) || v.match(/\b([A-F][+]?)\b/); return m ? m[1].trim() : null };
  const pAcct = v => { const m = v.replace(/(\d)\s+(?=\d)/g, '$1').match(/\b\d{9,18}\b/); return m ? m[0] : null };
  const pIfsc = v => { const m = v.toUpperCase().match(/[A-Z]{4}0[A-Z0-9]{6}/); return m ? m[0] : null };
  const pPp = v => { const m = v.toUpperCase().match(/\b[A-Z]\d{7}\b/); return m ? m[0] : null };
  const POST = { name: pName, date: pDate, id: pId, amt: pAmt, text: pText, marks: pMarks, acct: pAcct, ifsc: pIfsc, pp: pPp };

  const F = [
    { k: 'Name', t: 'name', L: ['name', 'name of candidate', 'name of the candidate', 'candidate name', 'name of applicant', 'applicant name', 'name of student', 'student name', 'name of holder', 'holder name', 'full name', 'name of account holder', 'account holder name', 'beneficiary name'] },
    { k: 'DOB', t: 'date', L: ['date of birth', 'dob', 'd.o.b', 'birth date', 'born on'] },
    { k: 'Cert. no.', t: 'id', L: ['certificate no', 'certificate number', 'cert no', 'ref no', 'reference no', 'reference number', 'serial no', 'sl no', 'registration no', 'roll no', 'enrolment no'] },
    { k: 'Income', t: 'amt', L: ['annual income', 'annual family income', 'family income', 'total income', 'income', 'gross annual income', 'yearly income'] },
    { k: 'Issued by', t: 'text', L: ['issued by', 'issuing authority', 'authority', 'issued from', 'competent authority'] },
    { k: 'Issue date', t: 'date', L: ['date of issue', 'issue date', 'issued on', 'dated', 'date', 'date of issuance'] },
    { k: 'Institution', t: 'text', L: ['institution', 'institute', 'name of institution', 'name of institute', 'university', 'name of university', 'college', 'name of college', 'board'] },
    { k: 'Course', t: 'text', L: ['course', 'programme', 'program', 'name of course', 'course name', 'degree', 'branch', 'discipline', 'stream'] },
    { k: 'Marks', t: 'marks', L: ['marks obtained', 'total marks', 'percentage', 'cgpa', 'sgpa', 'grade', 'aggregate'] },
    { k: 'Account no.', t: 'acct', L: ['account no', 'account number', 'a/c no', 'ac no', 'savings account no'] },
    { k: 'IFSC', t: 'ifsc', L: ['ifsc', 'ifsc code'] },
    { k: 'Passport no.', t: 'pp', L: ['passport no', 'passport number'] }
  ];
  const TY = [
    ['ST Certificate', /scheduled tribes?|st certificate|tribe certificate|caste certificate|community certificate/gi],
    ['Income Certificate', /income certificate|annual income|family income|income of/gi],
    ['Marksheet', /mark ?sheet|statement of marks|grade card|marks obtained|cgpa|sgpa|semester|percentage/gi],
    ['Research Admission Letter', /admission|ph\.?d|research scholar|offer letter|enrol+ment/gi],
    ['Bank Document', /ifsc|account no|passbook|a\/c no|bank of/gi],
    ['Passport', /passport|republic of india|nationality/gi],
    ['Degree Certificate', /degree of|convocation|conferred/gi]
  ];
  const EXPECT = { 'ST Certificate': ['Name', 'Cert. no.', 'Issued by'], 'Income Certificate': ['Name', 'Income', 'Issue date'], 'Marksheet': ['Name', 'Marks'], 'Bank Document': ['Name', 'Account no.'], 'Research Admission Letter': ['Name', 'Institution'] };

  function matchLabel(left, exact) {
    if (!left || left.length > 45 || left.split(' ').length > 6) return null;
    const a = norm(left); if (!a) return null; let best = null;
    F.forEach(f => f.L.forEach(l => { const b = norm(l); const s = a === b ? 1 : (!exact && a.length > 4 && b.length > 4 ? sim(a, b) : 0); if (s >= 0.82 && (!best || s > best.s)) best = { f, s } }));
    return best && best.f;
  }
  function parseDate(str) {
    let m = str.match(/(\d{1,2})\s*[\/\-.]\s*(\d{1,2})\s*[\/\-.]\s*(\d{2,4})/);
    if (m) { let y = +m[3]; if (y < 100) y += 2000; return new Date(y, +m[2] - 1, +m[1]) }
    m = str.match(new RegExp('(\\d{1,2})(?:st|nd|rd|th)?[\\s\\-]+(' + MON + ')\\.?,?[\\s\\-]+(\\d{2,4})', 'i'));
    if (m) { let y = +m[3]; if (y < 100) y += 2000; return new Date(y, new Date(m[2].slice(0, 3) + ' 1 2000').getMonth(), +m[1]) }
    return null;
  }
  function lineList(d) {
    const out = []; const push = (t, c) => { t = String(t || '').replace(/[\u2018\u2019]/g, "'").replace(/\s+/g, ' ').trim(); if (t) out.push({ t, c: Math.round(c || 0) }) };
    (d.lines || []).forEach(l => push(l.text, l.confidence));
    if (!out.length && d.text) d.text.split(/\n+/).forEach(t => push(t, d.confidence));
    return out;
  }

  function parseOcr(d) {
    const lines = lineList(d), full = lines.map(l => l.t).join(' '), overall = Math.round(d.confidence || 0), got = {};
    let type = 'Other', top = 0;
    TY.forEach(([n, re]) => { const c = (full.match(re) || []).length; if (c > top) { top = c; type = n } });

    lines.forEach((ln, i) => {
      const t = ln.t.replace(/^\s*(?:\(?(?:\d{1,2}|[a-z])[\).]|[-•*>|]+)\s+/i, '');
      let f = null, val = '';
      const m = t.match(/^(.{1,45}?)\s*[:=]\s*(.*)$/) || t.match(/^(.{1,45}?)\s+[-–—]\s+(.*)$/);
      if (m) { f = matchLabel(m[1]); val = m[2] }
      if (!f) { const c0 = matchLabel(t, true); if (c0) { f = c0; val = '' } }
      if (!f) { const w = t.split(' '); for (let k = Math.min(5, w.length - 1); k >= 2 && !f; k--) { const c = matchLabel(w.slice(0, k).join(' '), true); if (c) { f = c; val = w.slice(k).join(' ') } } }
      if (!f || got[f.k]) return;
      let v = val ? POST[f.t](val) : null, c = ln.c;
      if (v == null && i + 1 < lines.length) { v = POST[f.t](lines[i + 1].t); c = Math.min(c, lines[i + 1].c) }
      if (v != null) got[f.k] = { k: f.k, v, c };
    });

    const fb = (k, v, pen) => { if (v && !got[k]) got[k] = { k, v, c: Math.max(0, overall - (pen || 15)) } };
    let m;
    if ((m = full.match(/(?:certify that|certified that|awarded to|conferred (?:on|upon)|admitted)\s+(?:(?:Shri|SHRI|Sri|Smt|Kumari|Km|Mr|Mrs|Ms|Miss|Dr|Sh)\.?\s+)?([A-Z][A-Za-z.'\-]+(?:\s+[A-Z][A-Za-z.'\-]+){0,4})/))) fb('Name', pName(m[1]));
    if ((m = full.match(new RegExp('(?:born on|date of birth|d\\.?o\\.?b\\.?)\\W{0,12}' + DATE_SRC, 'i')))) fb('DOB', pDate(m[1]));
    if ((m = full.match(new RegExp('(?:dated|issued on|date of issue|date)\\W{0,6}' + DATE_SRC, 'i')))) fb('Issue date', pDate(m[1]));
    if ((m = full.match(/income[^\d₹]{0,80}?((?:rs\.?|₹|inr)\s*\d[\d,]{3,}(?:\.\d+)?)/i))) fb('Income', m[1]);
    if ((m = full.match(/(?:certificate|cert\.?|ref\.?|serial)\s*(?:no|number|#)\.?\s*[:\-]?\s*([A-Z0-9][A-Z0-9\/\-.]{4,})/i)) && /\d/.test(m[1])) fb('Cert. no.', m[1].replace(/[.,]+$/, ''));
    if (!got['Issued by']) { const l = lines.find(x => /tehsildar|sub[- ]?divisional magistrate|\bsdm\b|district magistrate|collector|revenue officer|executive magistrate|patwari|registrar/i.test(x.t) && x.t.length < 90); if (l) fb('Issued by', pText(l.t.replace(/^(?:signature of|signed by|sd\/-)\s*/i, '')), 10) }
    if (!got['Institution']) { const l = lines.find(x => /\b(university|institute|college|vidyalaya|vishwavidyalaya)\b/i.test(x.t) && x.t.length < 90); if (l) fb('Institution', pText(l.t), 10) }
    fb('IFSC', pIfsc(full), 5);
    if (/passport/i.test(full)) fb('Passport no.', pPp(full), 10);
    if (type === 'Bank Document') fb('Account no.', pAcct((full.match(/(?:a\/c|account)[^0-9]{0,20}([\d\s]{9,24})/i) || [])[1] || ''), 10);

    const fields = F.map(f => got[f.k]).filter(Boolean);
    const issues = [];
    if (overall < 70) issues.push('Low OCR confidence (' + overall + '%): scan may be unclear');
    fields.filter(f => f.c < 60).forEach(f => issues.push(f.k + ' read with low confidence'));
    (EXPECT[type] || []).filter(k => !got[k]).forEach(k => issues.push('Expected field not found: ' + k));
    if (!fields.length) issues.push('No labelled fields could be read');
    const vm = full.match(new RegExp('valid(?:ity)?\\s*(?:up\\s*to|upto|till|until|for)?\\W{0,6}' + DATE_SRC, 'i'));
    if (vm) { const dt = parseDate(vm[1]); if (dt && dt < new Date()) issues.push('Document appears expired (valid until ' + vm[1] + ')') }
    return { type, tc: overall, fields, issues };
  }
  root.parseOcr = parseOcr; root.parseDate = parseDate;
  if (typeof module !== 'undefined' && module.exports) module.exports = { parseOcr, parseDate };
})(typeof window !== 'undefined' ? window : globalThis);
