/* ============================================================
   Ecuador Strategic Partnership — Interactive Sales Tool
   Customer-facing only.
   Independent per-workstream durations; Workstream I governs max.
   Program Activation Fee (flat $) + phase-tied milestone payments.
   Workstream III 12-Month = informational only (no fee/schedule).
   Bilingual EN/ES via window.I18N (see i18n.js).
   ============================================================ */

// Convenience accessor — falls back to the key itself if i18n.js
// hasn't loaded yet (graceful degradation).
function t(key) {
  if (window.I18N && typeof window.I18N.t === 'function') return window.I18N.t(key);
  return key;
}

// ---------- Footer year & nav scroll state ----------
document.getElementById('yr').textContent = new Date().getFullYear();

const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 24);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// ---------- Workstream tabs (overview) ----------
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => {
      t.classList.remove('is-active');
      t.setAttribute('aria-selected', 'false');
    });
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('is-active'));
    btn.classList.add('is-active');
    btn.setAttribute('aria-selected', 'true');
    document.getElementById(btn.dataset.tab).classList.add('is-active');
  });
});

// ---------- Timeline phases ----------
document.querySelectorAll('.t-phase').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.t-phase').forEach(t => t.classList.remove('is-active'));
    document.querySelectorAll('.t-panel').forEach(p => p.classList.remove('is-active'));
    btn.classList.add('is-active');
    document.getElementById(btn.dataset.phase).classList.add('is-active');
  });
});

// ============================================================
//  CONTRACT VALUES & PAYMENT STRUCTURE
//  Milestone names & triggers are translated at render time via i18n keys.
// ============================================================

const WS = {
  1: {
    nameKey: 'js.ws1.name',
    contracts: { 3:  750000, 6: 1260000, 12: 2140000 },
    activation: { 3: 450000, 6: 600000, 12: 600000 },
    milestones: {
      3: [
        { nameKey: 'js.ws1.t3.m1.name', trigKey: 'js.ws1.t3.m1.trig', month: 2 },
        { nameKey: 'js.ws1.t3.m2.name', trigKey: 'js.ws1.t3.m2.trig', month: 3 },
      ],
      6: [
        { nameKey: 'js.ws1.t6.m1.name', trigKey: 'js.ws1.t6.m1.trig', month: 3 },
        { nameKey: 'js.ws1.t6.m2.name', trigKey: 'js.ws1.t6.m2.trig', month: 5 },
        { nameKey: 'js.ws1.t6.m3.name', trigKey: 'js.ws1.t6.m3.trig', month: 6 },
      ],
      12: [
        { nameKey: 'js.ws1.t12.m1.name', trigKey: 'js.ws1.t12.m1.trig', month: 3 },
        { nameKey: 'js.ws1.t12.m2.name', trigKey: 'js.ws1.t12.m2.trig', month: 6 },
        { nameKey: 'js.ws1.t12.m3.name', trigKey: 'js.ws1.t12.m3.trig', month: 12 },
      ],
    },
  },
  2: {
    nameKey: 'js.ws2.name',
    contracts: { 3:  500000, 6:  752000, 12: 1280000 },
    activation: { 3: 300000, 6: 300000, 12: 512000 },
    milestones: {
      3: [
        { nameKey: 'js.ws2.t3.m1.name', trigKey: 'js.ws2.t3.m1.trig', month: 2 },
        { nameKey: 'js.ws2.t3.m2.name', trigKey: 'js.ws2.t3.m2.trig', month: 3 },
      ],
      6: [
        { nameKey: 'js.ws2.t6.m1.name', trigKey: 'js.ws2.t6.m1.trig', month: 3 },
        { nameKey: 'js.ws2.t6.m2.name', trigKey: 'js.ws2.t6.m2.trig', month: 5 },
        { nameKey: 'js.ws2.t6.m3.name', trigKey: 'js.ws2.t6.m3.trig', month: 6 },
      ],
      12: [
        { nameKey: 'js.ws2.t12.m1.name', trigKey: 'js.ws2.t12.m1.trig', month: 3 },
        { nameKey: 'js.ws2.t12.m2.name', trigKey: 'js.ws2.t12.m2.trig', month: 6 },
        { nameKey: 'js.ws2.t12.m3.name', trigKey: 'js.ws2.t12.m3.trig', month: 12 },
      ],
    },
  },
  3: {
    nameKey: 'js.ws3.name',
    advisory: true,
    contracts: { 3:  175000, 6:  257000, 12:  638000 },
    activation: { 3: 120000, 6: 120000, 12: 0 },
    milestones: {
      3: [
        { nameKey: 'js.ws3.t3.m1.name', trigKey: 'js.ws3.t3.m1.trig', month: 2 },
        { nameKey: 'js.ws3.t3.m2.name', trigKey: 'js.ws3.t3.m2.trig', month: 3 },
      ],
      6: [
        { nameKey: 'js.ws3.t6.m1.name', trigKey: 'js.ws3.t6.m1.trig', month: 3 },
        { nameKey: 'js.ws3.t6.m2.name', trigKey: 'js.ws3.t6.m2.trig', month: 5 },
        { nameKey: 'js.ws3.t6.m3.name', trigKey: 'js.ws3.t6.m3.trig', month: 6 },
      ],
      12: [],
    },
  },
};

// Milestone weights — distribute the post-activation remainder.
const MILESTONE_WEIGHTS = {
  3:  [0.625, 0.375],
  6:  [0.50, 0.30, 0.20],
  12: [5/12, 4/12, 3/12],
};

const TERM_ORDER = [3, 6, 12];

function termLabel(term) { return t('js.term.' + term + '.full'); }
function termShort(term) { return t('js.term.' + term + '.short'); }

// USD amounts are kept in US format regardless of language (currency consistency).
const fmt = n => '$' + Math.round(n).toLocaleString('en-US');

// ---------- State ----------
let state = {
  ws: new Set([1]),
  wsTerms: { 1: 12, 2: 12, 3: 12 },
  view: 'monthly',
};

function selectedWorkstreams() { return Array.from(state.ws).sort(); }

function maxAllowedTerm(wsId) {
  if (wsId === 1) return 12;
  return state.wsTerms[1];
}

function effectiveTerm(wsId) {
  const cap = maxAllowedTerm(wsId);
  const sel = state.wsTerms[wsId];
  return Math.min(sel, cap);
}

function workstreamLabel() {
  const ids = selectedWorkstreams();
  if (ids.length === 3) return t('js.fullInitiative');
  const roman = { 1: 'I', 2: 'II', 3: 'III' };
  return t('js.workstream') + ' ' + ids.map(i => roman[i]).join(' + ');
}

function compute() {
  const ids = selectedWorkstreams();
  const wsBreakdown = ids.map(id => {
    const w = WS[id];
    const term = effectiveTerm(id);
    const value = w.contracts[term];
    const activation = w.activation[term] || 0;
    const wsMilestones = w.milestones[term] || [];
    const milestoneRemainder = Math.max(0, value - activation);
    const weights = MILESTONE_WEIGHTS[term] || [];
    const isInfoOnly = (w.advisory === true && term === 12);

    return {
      id, name: t(w.nameKey), value, term, activation,
      isInfoOnly,
      milestones: wsMilestones.map((m, i) => ({
        name: t(m.nameKey),
        trigger: t(m.trigKey),
        month: m.month,
        amount: milestoneRemainder * (weights[i] || 0),
      })),
      milestoneRemainder,
    };
  });

  const total = wsBreakdown.reduce((s, w) => s + w.value, 0);
  const totalActivation = wsBreakdown.reduce((s, w) => s + w.activation, 0);
  const totalMilestone = wsBreakdown.reduce((s, w) => s + w.milestoneRemainder, 0);
  const longestTerm = Math.max(...wsBreakdown.map(w => w.term));

  return {
    rows: wsBreakdown, total,
    totalActivation, totalMilestone,
    longestTerm,
    monthly: total / longestTerm,
  };
}

// ---------- Render: live summary ----------
function render() {
  syncTermAvailability();

  const c = compute();

  // Build a headline that reflects the configuration
  const ids = selectedWorkstreams();
  let headline;
  const WS_WORD = t('js.workstream');
  if (ids.length === 1) {
    headline = WS_WORD + ' I · ' + termLabel(c.rows[0].term);
  } else if (ids.length === 3 &&
             c.rows.every(r => r.term === c.rows[0].term)) {
    headline = t('js.fullInitiative') + ' · ' + termLabel(c.rows[0].term);
  } else {
    const parts = c.rows.map(r => 'WS ' + ({1:'I',2:'II',3:'III'}[r.id]) + ' (' + termShort(r.term) + ')');
    headline = parts.join(' · ');
  }
  document.getElementById('cs-headline').textContent = headline;

  const advisoryInfoTag = t('js.advisoryInfoOnly');
  const rowsEl = document.getElementById('cs-rows');
  rowsEl.innerHTML = c.rows.map(r => `
    <div class="cs-row">
      <span class="label">${WS_WORD} ${ {1:'I',2:'II',3:'III'}[r.id] } &mdash; ${r.name} <em style="font-style:normal;color:var(--muted);font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;display:block;margin-top:4px">${termShort(r.term)}${r.isInfoOnly ? ' · ' + advisoryInfoTag : ''}</em></span>
      <span class="val">${fmt(r.value)}</span>
    </div>
  `).join('');

  document.getElementById('cs-gross').textContent = fmt(c.total);

  // Update view tabs visibility
  document.getElementById('view-monthly').classList.toggle('is-active', state.view === 'monthly');
  document.getElementById('view-milestone').classList.toggle('is-active', state.view === 'milestone');
  document.getElementById('pane-monthly').classList.toggle('is-active', state.view === 'monthly');
  document.getElementById('pane-milestone').classList.toggle('is-active', state.view === 'milestone');

  // Monthly view
  document.getElementById('cs-monthly').textContent = fmt(c.monthly) + ' ' + t('js.perMo');
  document.getElementById('cs-fixed-monthly').textContent = fmt(c.totalActivation);
  document.getElementById('cs-milestone-total-monthly').textContent = fmt(c.totalMilestone);

  // Milestone view
  document.getElementById('cs-fixed').textContent = fmt(c.totalActivation);
  document.getElementById('cs-fixed-pct').textContent = c.total > 0 ? Math.round((c.totalActivation/c.total)*100) + '%' : '';
  document.getElementById('cs-milestone-total').textContent = fmt(c.totalMilestone);
  document.getElementById('cs-milestone-pct').textContent = c.total > 0 ? Math.round((c.totalMilestone/c.total)*100) + '%' : '';

  // Per-workstream milestone schedule
  const monthWord = t('js.month');
  const milestoneEl = document.getElementById('cs-milestone-schedule');
  milestoneEl.innerHTML = c.rows.map(r => {
    const wsRoman = {1:'I',2:'II',3:'III'}[r.id];
    const isAdvisory = WS[r.id].advisory === true;
    const advisoryBadge = isAdvisory
      ? `<span class="ms-advisory-badge" title="${t('js.advisoryTooltip')}">${t('js.advisoryBadge')}</span>`
      : '';

    // Workstream III 12-Month: informational only — no payment schedule
    if (r.isInfoOnly) {
      return `
        <div class="ms-block is-advisory">
          <p class="ms-block-title">${WS_WORD} ${wsRoman} &mdash; ${r.name}${advisoryBadge}</p>
          <p class="ms-advisory-note">${t('js.ws3.info.p1')}</p>
          <p class="ms-advisory-note">${t('js.ws3.info.p2')}</p>
          <p class="ms-advisory-note">${t('js.ws3.info.p3')}</p>
        </div>
      `;
    }

    const advisoryNote = isAdvisory
      ? `<p class="ms-advisory-note">${t('js.ws3.advisory.note')}</p>`
      : '';

    return `
      <div class="ms-block${isAdvisory ? ' is-advisory' : ''}">
        <p class="ms-block-title">${WS_WORD} ${wsRoman} &mdash; ${r.name} <em style="font-style:normal;color:var(--muted);font-size:11px;letter-spacing:.18em;text-transform:uppercase;margin-left:8px">${termShort(r.term)}</em>${advisoryBadge}</p>
        ${advisoryNote}
        <table class="ms-table">
          <thead>
            <tr><th>${t('js.tbl.payment')}</th><th>${t('js.tbl.trigger')}</th><th class="num">${t('js.tbl.month')}</th><th class="num">${t('js.tbl.amount')}</th></tr>
          </thead>
          <tbody>
            <tr class="ms-fixed">
              <td><strong>${t('js.activationFee')}</strong></td>
              <td>${t('js.activationTrigger')}</td>
              <td class="num">${monthWord} 0</td>
              <td class="num">${fmt(r.activation)}</td>
            </tr>
            ${r.milestones.map((m) => `
              <tr>
                <td><strong>${m.name}</strong></td>
                <td>${m.trigger}</td>
                <td class="num">${monthWord} ${m.month}</td>
                <td class="num">${fmt(m.amount)}</td>
              </tr>
            `).join('')}
            <tr class="ms-subtotal">
              <td colspan="3">${WS_WORD} ${wsRoman} ${t('js.subtotal')}</td>
              <td class="num">${fmt(r.value)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }).join('');

  // Contextual note
  const note = document.getElementById('cs-note');
  const ws1Term = state.wsTerms[1];
  let baseNote;
  if (ws1Term === 3) {
    baseNote = t('js.note.t3');
  } else if (ws1Term === 6) {
    baseNote = t('js.note.t6');
  } else {
    baseNote = t('js.note.t12');
  }
  if (state.ws.has(3) && effectiveTerm(3) === 12) {
    baseNote += ' ' + t('js.note.ws3.info');
  } else if (state.ws.has(3)) {
    baseNote += ' ' + t('js.note.ws3');
  }
  note.textContent = baseNote;
}

// Disable/enable per-workstream term buttons based on WS I's term and selection state
function syncTermAvailability() {
  const ws1Term = state.wsTerms[1];

  document.querySelectorAll('.ws-seg').forEach(seg => {
    const wsId = +seg.dataset.wsSeg;
    const selected = state.ws.has(wsId);

    seg.querySelectorAll('.seg-btn[data-term]').forEach(btn => {
      const term = +btn.dataset.term;
      let disabled = false;

      if (wsId !== 1) {
        if (term > ws1Term) disabled = true;
        if (!selected) disabled = true;
      }

      btn.classList.toggle('is-disabled', disabled);
      if (disabled) btn.setAttribute('aria-disabled', 'true');
      else btn.removeAttribute('aria-disabled');
    });

    const effective = effectiveTerm(wsId);
    seg.querySelectorAll('.seg-btn[data-term]').forEach(btn => {
      btn.classList.toggle('is-active', +btn.dataset.term === effective);
    });
  });
}

// ---------- Wire controls ----------

document.querySelectorAll('.toggle input[data-ws]').forEach(inp => {
  inp.addEventListener('change', () => {
    const id = +inp.dataset.ws;
    if (inp.checked) state.ws.add(id); else state.ws.delete(id);
    if (!state.ws.has(1)) state.ws.add(1);
    render();
  });
});

document.querySelectorAll('.ws-seg').forEach(seg => {
  const wsId = +seg.dataset.wsSeg;
  seg.querySelectorAll('.seg-btn[data-term]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('is-disabled')) return;
      const term = +btn.dataset.term;
      state.wsTerms[wsId] = term;

      if (wsId === 1) {
        if (state.wsTerms[2] > term) state.wsTerms[2] = term;
        if (state.wsTerms[3] > term) state.wsTerms[3] = term;
      }

      render();
    });
  });
});

document.getElementById('view-monthly').addEventListener('click', () => {
  state.view = 'monthly';
  render();
});
document.getElementById('view-milestone').addEventListener('click', () => {
  state.view = 'milestone';
  render();
});

document.getElementById('preset-full').addEventListener('click', () => {
  state.ws = new Set([1, 2, 3]);
  state.wsTerms = { 1: 12, 2: 12, 3: 12 };
  syncControls();
  render();
});
document.getElementById('preset-reset').addEventListener('click', () => {
  state.ws = new Set([1]);
  state.wsTerms = { 1: 6, 2: 6, 3: 6 };
  syncControls();
  render();
});

function syncControls() {
  document.querySelectorAll('.toggle input[data-ws]').forEach(inp => {
    inp.checked = state.ws.has(+inp.dataset.ws);
  });
}

syncControls();
render();

// Re-render dynamic content when language changes
document.addEventListener('langchange', () => {
  render();
});

// ============================================================
//  AUTHORIZATION FORM — Export & Copy
// ============================================================
function buildMemo() {
  const checked = Array.from(document.querySelectorAll('input[name="auth"]:checked')).map(i => i.value);
  const f = document.getElementById('auth-form');
  const fd = new FormData(f);
  const rep = {
    name:   fd.get('rep_name')   || '',
    title:  fd.get('rep_title')  || '',
    agency: fd.get('rep_agency') || '',
    date:   fd.get('rep_date')   || new Date().toISOString().slice(0, 10),
  };

  const c = compute();
  const WS_WORD = t('js.workstream');
  const monthWord = t('js.month');

  const wsLines = c.rows.map(r =>
    `   • ${WS_WORD} ${ {1:'I',2:'II',3:'III'}[r.id] } — ${r.name} (${termShort(r.term)}): ${fmt(r.value)}${r.isInfoOnly ? '  [' + t('js.memo.advisoryNote') + ']' : ''}`
  ).join('\n');

  // Per-workstream payment schedule
  const scheduleLines = c.rows.map(r => {
    const wsR = {1:'I',2:'II',3:'III'}[r.id];
    let lines = `\n   ${WS_WORD} ${wsR} — ${r.name} (${termShort(r.term)} · ${fmt(r.value)})`;
    if (r.isInfoOnly) {
      const advLines = t('js.memo.advisoryNoSchedule').split('\n');
      advLines.forEach(line => { lines += `\n      • ${line}`; });
      return lines;
    }
    lines += `\n      • ${t('js.memo.activationLine')}              ${fmt(r.activation)}`;
    r.milestones.forEach((m) => {
      const tail = ` (${monthWord} ${m.month}):`;
      lines += `\n      • ${m.name}${tail}${' '.repeat(Math.max(2, 34 - m.name.length - tail.length))}${fmt(m.amount)}`;
    });
    return lines;
  }).join('\n');

  const auths = checked.length
    ? checked.map(x => `   ☒ ${x}`).join('\n')
    : `   ${t('js.memo.noAuth')}`;

  return `${t('js.memo.title')}
${t('js.memo.subtitle')}
${t('js.memo.preparedBy')}
${t('js.memo.date')} ${rep.date}

────────────────────────────────────────────────
${t('js.memo.config')}
────────────────────────────────────────────────
   ${t('js.memo.program')}        ${workstreamLabel()}

   ${t('js.memo.wsIncluded')}
${wsLines}

   ${t('js.memo.totalLine')}                 ${fmt(c.total)}

────────────────────────────────────────────────
${t('js.memo.payment')}
────────────────────────────────────────────────
   ${t('js.memo.activationFees')}               ${fmt(c.totalActivation)}
   ${t('js.memo.milestonePmts')}                    ${fmt(c.totalMilestone)}
   ─────────────────────────────────────────
   ${t('js.memo.totalLine')}                  ${fmt(c.total)}

   ${t('js.memo.perWS')}
${scheduleLines}

────────────────────────────────────────────────
${t('js.memo.authReq')}
────────────────────────────────────────────────
${auths}

────────────────────────────────────────────────
${t('js.memo.govRep')}
────────────────────────────────────────────────
   ${t('js.memo.name')}             ${rep.name || '____________________________'}
   ${t('js.memo.title2')}            ${rep.title || '____________________________'}
   ${t('js.memo.agency')}  ${rep.agency || '____________________________'}
   ${t('js.memo.signature')}        ____________________________
   ${t('js.memo.dateField')}             ${rep.date}


────────────────────────────────────────────────
${t('js.memo.poc')}
────────────────────────────────────────────────
   Bruce Roberts     — ${t('js.memo.r.title')}
   Nicholas Fowler   — ${t('js.memo.f.title')}

   ${t('js.memo.tridentDiv')}
   ${t('js.memo.tagline')}
`;
}

function setStatus(msg) {
  const s = document.getElementById('auth-status');
  s.textContent = msg;
  clearTimeout(setStatus._t);
  setStatus._t = setTimeout(() => { s.textContent = ''; }, 4000);
}

document.getElementById('copy-btn').addEventListener('click', async () => {
  const memo = buildMemo();
  try {
    await navigator.clipboard.writeText(memo);
    setStatus(t('js.status.copied'));
  } catch {
    const ta = document.createElement('textarea');
    ta.value = memo; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); ta.remove();
    setStatus(t('js.status.copied'));
  }
});

document.getElementById('print-btn').addEventListener('click', () => {
  const memo = buildMemo();
  const w = window.open('', '_blank');
  if (!w) {
    setStatus(t('js.status.popup'));
    return;
  }
  const lang = (window.I18N && window.I18N.lang) || 'en';
  const docLang = lang === 'es' ? 'es-EC' : 'en';
  w.document.write(`<!doctype html><html lang="${docLang}"><head><meta charset="utf-8">
    <title>${t('js.memo.printTitle')}</title>
    <style>
      @page { margin: 0.75in; }
      body{ font-family: Georgia, "Times New Roman", serif; color:#111;
            max-width:7.2in; margin:0 auto; padding:0.5in 0;
            font-size:11pt; line-height:1.55; }
      h1{ font-family: "Cinzel", Georgia, serif; font-size: 18pt; letter-spacing:.1em;
          text-transform:uppercase; text-align:center; color:#7a6029; margin:0 0 4pt; }
      .sub{ text-align:center; font-size:10pt; letter-spacing:.18em;
            text-transform:uppercase; color:#666; margin-bottom:24pt }
      hr{ border:0; border-top:1px solid #b8964e; margin: 16pt 0 }
      pre{ white-space:pre-wrap; font-family: "SFMono-Regular", Consolas, monospace;
           font-size:10pt; color:#222; line-height:1.5; }
      .seal{ text-align:center; margin-bottom:8pt; color:#b8964e; font-size:28pt }
    </style>
    </head><body>
    <div class="seal">⚜</div>
    <h1>Trident Solutions</h1>
    <div class="sub">${t('js.memo.printSub')}</div>
    <hr>
    <pre>${memo.replace(/[<>&]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]))}</pre>
    </body></html>`);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 350);
});

// ---------- Smooth-scroll ----------
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    const y = el.getBoundingClientRect().top + window.scrollY - 70;
    window.scrollTo({ top: y, behavior: 'smooth' });
  });
});

// ---------- Reveal on scroll ----------
const io = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting) {
      en.target.style.opacity = '1';
      en.target.style.transform = 'translateY(0)';
      io.unobserve(en.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.card, .leader, .stat, .prog-step, .compliance, .cfg-block, .config-summary, table.dx').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(14px)';
  el.style.transition = 'opacity .6s cubic-bezier(.2,.7,.2,1), transform .6s cubic-bezier(.2,.7,.2,1)';
  io.observe(el);
});
