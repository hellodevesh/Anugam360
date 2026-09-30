/* Stage 9A: ANUGAM 360 public landing page.
   The landing page replaces the old intro flashcards and the "What would you like to do?" screen.
   Built as a scrollable page: navbar, hero, a "start here" band, then anchored sections.
   Stage 9B added the core sections; Stage 9C added the FAQ, final CTA and footer (bottom of this file).
   Depends on helpers from app.js (pubShell, ico, P, INT, intent, DEMO, showExplore, showAuth). */
const BRAND={name:'ANUGAM 360',tag:'Accompanying Every Scholar Through the Complete Journey'};
const LNAV=[['Explore Scholarships','explore'],['How It Works','how'],['FAQ','faq']];
const LSTEPS=[['search','Discover scholarships.'],['files','Check what you need.'],['send','Apply with confidence.'],['clock','Track what happens next.']];
const lLink=x=>x[1]=='explore'
  ?`<button class="lk" onclick="lClose();showExplore()">${x[0]}</button>`
  :`<a class="lk" href="#${x[1]}" onclick="lScroll('${x[1]}',event)">${x[0]}</a>`;
const lTile=x=>`<button class="itile" onclick="intent('${x[0]}')"><i>${ico(P[x[3]])}</i><b>${x[1]}</b><small>${x[2]}</small></button>`;
const lBars='<path class="h" d="M4 7h16M4 12h16M4 17h16"/><path class="x" d="M6 6l12 12M18 6 6 18"/>';

/* Stage 9B: core sections. The scholarship preview reads catalog() and reuses dCards()/showScheme() from app.js. */
const LHOW=[['Discover','Find scholarships and fellowships relevant to your education and goals.'],['Check','Identify possible missing information, readability issues and inconsistencies before applying.'],['Apply','Understand requirements and prepare applications with scheme-specific guidance.'],['Track','Follow application progress, deficiencies, decisions and available scholarship benefits.']];
const LAI=[['files','Document understanding'],['search','OCR and field extraction'],['check','Consistency checks'],['alert','Deficiency assistance'],['user','Optional scholarship guidance']];
const lHow=()=>`<div class="lband"><section class="lsec" id="how" tabindex="-1" aria-labelledby="lhow"><h2 id="lhow">How ANUGAM 360 Works</h2><p class="lsub">From discovering an opportunity to following it through.</p><ol class="ljr">${LHOW.map((x,i)=>`<li><span class="ln0">0${i+1}</span><h3>${x[0]}</h3><p>${x[1]}</p></li>`).join('')}</ol></section></div>`;
const lAI=()=>`<section class="lsec" id="assistance" tabindex="-1" aria-labelledby="lah"><div class="lai"><div><h2 id="lah">Smart Assistance. Human Decisions.</h2><p class="lsub">AI helps you prepare and helps officials review. It never decides.</p><p class="lhum"><i>${ico(P.user)}</i><span>AI assists; authorised officials retain final decision authority.</span></p></div><ul class="lail">${LAI.map(x=>`<li><i>${ico(P[x[0]])}</i>${x[1]}</li>`).join('')}</ul></div></section>`;
const lPrev=()=>`<section class="lsec" id="schemes" tabindex="-1" aria-labelledby="lph2"><div class="lpvh"><div><h2 id="lph2">Supported scholarships</h2><p class="lsub">Five Ministry of Tribal Affairs schemes for ST students. Rules and dates are demo values; check the official portal.</p></div><button class="s" onclick="showExplore()">Explore All Scholarships</button></div><div class="lpv">${dCards(catalog())}</div></section>`;
function lClose(){const n=document.querySelector('.ln');if(!n)return;n.classList.remove('open');const b=document.getElementById('lmb');b&&b.setAttribute('aria-expanded','false')}
function lMenu(){const n=document.querySelector('.ln');if(!n)return;const o=n.classList.toggle('open');document.getElementById('lmb').setAttribute('aria-expanded',o?'true':'false')}
function lScroll(id,e){
  if(e)e.preventDefault();lClose();
  const rm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches,b=rm?'auto':'smooth';
  if(id=='top'){window.scrollTo({top:0,behavior:b});return}
  const el=document.getElementById(id);if(!el)return;
  el.scrollIntoView({behavior:b,block:'start'});try{el.focus({preventScroll:true})}catch(x){}
}
document.addEventListener('keydown',e=>{if(e.key=='Escape')lClose()});

/* Stage 9C: FAQ (native details accordion), final CTA and footer. Facts below mirror what the prototype does. */
const LFQ=[
['What is ANUGAM 360 and how does it help students?','ANUGAM 360 is a prototype for Scheduled Tribe students following five Ministry of Tribal Affairs schemes. It puts scholarship discovery, document checks, application preparation and progress tracking in one place. Its guidance is rule-based and AI-assisted; authorised officials make the decisions.'],
['Can I explore scholarships without creating an account?','Yes. You can browse the five schemes, get matches with Find Scholarships For Me and check your documents without an account. You need to log in to submit an application and to track it.'],
['Can ANUGAM 360 check my documents before I apply?','Yes. Upload a clear image (PNG, JPG or WebP) of a document and it is read in your browser. It points out possible issues such as missing details, hard-to-read text, expiry, or a name, date of birth or income that differs from what you entered. These are potential issues to review, not a verdict. PDFs and Hindi text are not supported yet.'],
['How can I track my application and scholarship payments?','After you submit, My Applications shows your current stage, the next stage, any action needed and a progress timeline. Once a sanction is recorded, Scholarship Benefits lists the amount sanctioned, received and remaining, with instalments. In this prototype the updates are simulated, the amounts are demo values and the data stays in your browser.'],
['Does ANUGAM 360 replace the official scholarship portal?','No. It helps you prepare, but it is not connected to the official portals and does not submit anything on your behalf. Scheme rules and dates shown here are demo values, so always confirm them and complete your official application on the government scholarship portal.']];
const lFaq=()=>`<section class="lsec" id="faq" tabindex="-1" aria-labelledby="lfaq"><h2 id="lfaq">Frequently asked questions</h2><p class="lsub">Short answers about how ANUGAM 360 works.</p><div class="lfq">${LFQ.map(x=>`<details name="lfaq"><summary>${x[0]}</summary><p>${x[1]}</p></details>`).join('')}</div></section>`;
const lCta=()=>`<section class="lsec lcs" aria-labelledby="lcth"><div class="lcx"><h2 id="lcth">Ready to move forward?</h2><p>Discover opportunities, prepare with confidence, and follow your journey with ANUGAM 360.</p><div class="lb2"><button class="lp1" onclick="showExplore()">Explore Scholarships</button><button class="lp2" onclick="showAuth('up')">Get Started</button></div></div></section>`;
const LFC=[['Platform',[['Explore Scholarships','showExplore()'],['How It Works',"lScroll('how')"],['Check Documents',"intent('docs')"],['Track Application',"intent('track')"]]],['Support',[['FAQ',"lScroll('faq')"],['Help / Guidance',"lScroll('start')"]]],['Trust',[['Privacy',"lNote('priv')"],['Data &amp; Security',"lNote('sec')"],['Official Sources',"lNote('src')"]]]];
const LFN={priv:'Documents you check are read in your browser and are not uploaded by this prototype. Accounts, drafts and applications are stored only in this browser. Use dummy documents for demos.',sec:'This is a client-side prototype: data stays in this browser and role checks are not real security. Server-side security belongs to the backend phase.',src:'Scholarship rules, dates and amounts here are demo values. Check <a href="https://scholarships.gov.in" target="_blank" rel="noopener">scholarships.gov.in</a> and <a href="https://tribal.nic.in" target="_blank" rel="noopener">tribal.nic.in</a> for official information.'};
let lNk=null;
function lNote(k){const n=document.getElementById('lfn');if(!n)return;lNk=lNk==k?null:k;n.hidden=!lNk;if(lNk)n.innerHTML=LFN[lNk];document.querySelectorAll('.lft [data-n]').forEach(b=>b.setAttribute('aria-expanded',b.dataset.n==lNk?'true':'false'))}
const lFoot=()=>`<footer class="lft"><div class="lfi"><div class="lfg"><div class="lfa"><div class="lfb"><img src="/brand/anugam360-logo-192.png" width="40" height="40" alt=""><span>ANUGAM <span>360</span></span></div><p class="lfd">A prototype that helps Scheduled Tribe students discover Ministry of Tribal Affairs scholarships, check documents, prepare applications and follow their progress.</p></div>${LFC.map(c=>`<div class="lfc" role="group" aria-label="${c[0]}"><h3>${c[0]}</h3><ul>${c[1].map(l=>`<li><button type="button" onclick="${l[1]}"${l[1].startsWith('lNote')?` data-n="${l[1].slice(7,-2)}" aria-expanded="false" aria-controls="lfn"`:''}>${l[0]}</button></li>`).join('')}</ul></div>`).join('')}</div><div class="lfn" id="lfn" role="status" hidden></div><p class="lfs">Prototype with demo data. Scholarship rules, limits and dates are not official; check the official portal before applying. Authorised officials make all decisions.</p></div></footer>`;

/* Hero product preview: laptop dashboard with floating cards (replaces the hero logo; the logo stays in navbar and footer). Real product concepts and catalog data only. */
const lViz=()=>{const St=[['Discover','Find scholarships that match.','lvdn'],['Check','Review your documents.','lvdn'],['Apply','Prepare and submit.','lvcu'],['Track','Follow status and benefits.','']],n=catalog().length,
sc=catalog().slice(0,3).map(s=>{const t=sstat(s).t;return`<li><i>${ico(P.files)}</i><div><b>${s.name.replace(/ (Scheme )?for ST Students/,'')}</b><small>${s.level}</small></div><span class="lvg ${t=='Open'?'o':t=='Closed'?'x':'w'}">${t}</span></li>`}).join(''),
K=(c,ic,a,b)=>`<div class="lvk ${c}"><i>${ico(P[ic])}</i><div><b>${a}</b><small>${b}</small></div><u>&rsaquo;</u></div>`;
return`<div class="lv" role="img" aria-label="Preview of the ANUGAM 360 Scholarship Journey: Discover, Check, Apply, Track"><div class="lvs" aria-hidden="true"><div class="lvo"></div><div class="lvp">${ico(P.send)}</div><div class="lvcap"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"/></svg></div><div class="lvsc"><b>Your Scholarship Journey</b><small>From discovery to benefits, all in one place.</small><ol>${St.map(x=>`<li class="${x[2]}"><span></span><div><b>${x[0]}</b><small>${x[1]}</small></div></li>`).join('')}</ol></div><div class="lvbase"></div><div class="lvrc"><h4><b>Scholarships</b><span>View all</span></h4><ul>${sc}</ul></div>${K('k1','search',n+' schemes available','Ministry of Tribal Affairs')}${K('k2','files','Document Check','Find missing or unclear documents')}${K('k3','clock','Track Your Application','Stage, status and next steps')}</div></div>`};

function showLanding(){
  pubShell(`<div class="lp" id="top">
<div class="ln" role="banner"><div class="lni">
<a class="lb" href="#top" onclick="lScroll('top',event)" aria-label="${BRAND.name}, back to top">${LOGO}<span class="wm">ANUGAM <span>360</span></span></a>
<div class="ll" id="ll" role="navigation" aria-label="Main">${LNAV.map(lLink).join('')}<button class="lgs m" onclick="showAuth('up')">Get Started</button></div>
<div class="lr"><button class="lsi" onclick="showAuth('in')">Sign In</button><button class="lgs" onclick="showAuth('up')">Get Started</button><button class="lmb" id="lmb" aria-label="Menu" aria-expanded="false" aria-controls="ll" onclick="lMenu()">${ico(lBars)}</button></div>
</div></div>
<section class="lh" aria-labelledby="lh1"><div class="lhi">
<div class="lht">
<span class="lchip"><i></i>Scholarships for ST students</span>
<h1 id="lh1">ANUGAM <span>360</span></h1>
<p class="ltag">${BRAND.tag}</p>
<ul class="lsteps">${LSTEPS.map(x=>`<li><i>${ico(P[x[0]])}</i>${x[1]}</li>`).join('')}</ul>
<div class="lcta"><button class="lp1" onclick="showExplore()">Explore Scholarships</button><button class="lp2" onclick="showAuth('in')">Sign In</button></div>
<p class="lnew">New here? <button class="lnk" onclick="showAuth('up')">Get started with a free account</button></p>
</div>
<div class="lhv">${lViz()}</div>
</div></section>
<section class="lst" id="start" tabindex="-1" aria-labelledby="lsh"><div class="lstc">
<h2 id="lsh">Where would you like to start?</h2>
<p class="lsp">You can explore, get matches and check documents without an account.</p>
<div class="lt">${INT.map(lTile).join('')}</div>
</div></section>
${lHow()}${lAI()}${lPrev()}
${lFaq()}${lCta()}${lFoot()}
</div>`);
  window.scrollTo(0,0);
}
