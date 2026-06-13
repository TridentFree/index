/* ============================================================
   Ecuador Strategic Partnership — Interactive Sales Tool
   Customer-facing only.
   Independent per-workstream durations; Workstream I governs max.
   Program Activation Fee (flat $) + phase-tied milestone payments.
   Workstream III 12-Month = informational only (no fee/schedule).
   ============================================================ */

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
// ============================================================

const WS = {
  1: {
    name: 'Security Modernization & ISR Foundation',
    contracts: { 3:  750000, 6: 1260000, 12: 2140000 },
    activation: { 3: 450000, 6: 600000, 12: 600000 },
    milestones: {
      3: [
        { name: 'M1 — Security Assessment Delivered',  trigger: 'Comprehensive Security Assessment Report & Threat Analysis delivered', month: 2 },
        { name: 'M2 — Modernization Recommendations',  trigger: 'Capability gap analysis & preliminary modernization roadmap delivered',    month: 3 },
      ],
      6: [
        { name: 'M1 — Security Assessment Delivered',  trigger: 'National & ISR Security Assessment, Border/Port/Maritime review delivered', month: 3 },
        { name: 'M2 — Modernization Roadmap',          trigger: 'National Modernization Roadmap, ISR Architecture Framework & Procurement Roadmap delivered', month: 5 },
        { name: 'M3 — Implementation Readiness',       trigger: 'Strategic partner recommendations & implementation readiness review accepted', month: 6 },
      ],
      12: [
        { name: 'M1 — Security Assessment Delivered',  trigger: 'National & ISR Security Assessment, Threat & Capability Gap Analysis delivered', month: 3 },
        { name: 'M2 — Modernization Architecture',     trigger: 'National Modernization Roadmap, ISR Architecture & Procurement Roadmap delivered', month: 6 },
        { name: 'M3 — Capability Integration',         trigger: 'Procurement integration, training coordination & quarterly strategic reviews delivered', month: 12 },
      ],
    },
  },
  2: {
    name: 'Intelligence Fusion & Targeting',
    contracts: { 3:  500000, 6:  752000, 12: 1280000 },
    activation: { 3: 300000, 6: 300000, 12: 512000 },  // 12-Month unchanged (40% of $1.28M)
    milestones: {
      3: [
        { name: 'M1 — Intelligence Fusion Assessment', trigger: 'Intelligence Fusion & Targeting Assessment, Counter-Narcotics Assessment delivered', month: 2 },
        { name: 'M2 — Targeting Framework Outline',    trigger: 'Preliminary National Targeting Framework & operational integration recommendations delivered', month: 3 },
      ],
      6: [
        { name: 'M1 — Fusion & Targeting Assessment',  trigger: 'Intelligence Fusion Assessment & Operational Synchronization Assessment delivered', month: 3 },
        { name: 'M2 — Targeting Framework Delivered',  trigger: 'National Targeting Framework, Intelligence Sharing Framework & Fusion Cell Blueprint delivered', month: 5 },
        { name: 'M3 — Operational Integration Plan',   trigger: 'Operational Integration Roadmap & Procurement Roadmap accepted', month: 6 },
      ],
      12: [
        { name: 'M1 — Fusion & Targeting Assessment',  trigger: 'Intelligence Fusion, Targeting & Counter-Narcotics Assessments delivered', month: 3 },
        { name: 'M2 — Targeting Architecture',         trigger: 'National Targeting Framework, Fusion Cell Blueprint & Operational Integration Roadmap delivered', month: 6 },
        { name: 'M3 — Fusion Implementation Support',  trigger: 'Fusion implementation support, operational integration & training coordination delivered', month: 12 },
      ],
    },
  },
  3: {
    name: 'Strategic Resource Security & Critical Minerals',
    advisory: true,
    contracts: { 3:  175000, 6:  257000, 12:  638000 },
    activation: { 3: 120000, 6: 120000, 12: 0 },  // 12-Month: no activation fee, info only
    milestones: {
      3: [
        { name: 'M1 — Resource & Value Assessment',    trigger: 'Strategic Resource Assessment & Strategic Value Assessment delivered', month: 2 },
        { name: 'M2 — Security & Commercial Outline',  trigger: 'Resource Security Assessment & preliminary commercial development outline delivered', month: 3 },
      ],
      6: [
        { name: 'M1 — Resource & Value Assessment',    trigger: 'Strategic Resource Assessment, Resource Security & Infrastructure Assessment delivered', month: 3 },
        { name: 'M2 — Critical Minerals Roadmap',      trigger: 'Critical Minerals Strategic Recommendations & validation outcomes delivered', month: 5 },
        { name: 'M3 — Strategic Recommendations',      trigger: 'Strategic Recommendation Brief & Resource Security Framework accepted', month: 6 },
      ],
      // 12-Month: no milestone schedule — informational only
      12: [],
    },
  },
};

// Milestone weights — distribute the post-activation remainder.
// These must sum to 1.0 for each term length where milestones apply.
const MILESTONE_WEIGHTS = {
  3:  [0.625, 0.375],            // 2 milestones
  6:  [0.50, 0.30, 0.20],        // 3 milestones
  12: [5/12, 4/12, 3/12],        // 3 milestones (≈ 41.67% / 33.33% / 25%)
};

const TERM_ORDER = [3, 6, 12];
const TERM_LABEL = { 3: '90-Day Introductory Assessment',
                     6: '6-Month Foundation Program',
                     12: '12-Month Strategic Partnership' };
const TERM_SHORT = { 3: '90 Days', 6: '6 Months', 12: '12 Months' };

const fmt = n => '$' + Math.round(n).toLocaleString('en-US');

// ---------- State ----------
let state = {
  ws: new Set([1]),                  // selected workstreams (1 always present)
  wsTerms: { 1: 12, 2: 12, 3: 12 },  // independent per-workstream durations
  view: 'monthly',                    // 'monthly' or 'milestone'
};

function selectedWorkstreams() { return Array.from(state.ws).sort(); }

function maxAllowedTerm(wsId) {
  // Workstream I governs max length for II and III
  if (wsId === 1) return 12;
  return state.wsTerms[1];
}

function effectiveTerm(wsId) {
  // Cap each workstream's selected term at WS I's term
  const cap = maxAllowedTerm(wsId);
  const sel = state.wsTerms[wsId];
  return Math.min(sel, cap);
}

function workstreamLabel() {
  const ids = selectedWorkstreams();
  if (ids.length === 3) return 'Full Initiative';
  const roman = { 1: 'I', 2: 'II', 3: 'III' };
  return 'Workstream ' + ids.map(i => roman[i]).join(' + ');
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
      id, name: w.name, value, term, activation,
      isInfoOnly,
      milestones: wsMilestones.map((m, i) => ({
        name: m.name, trigger: m.trigger, month: m.month,
        amount: milestoneRemainder * (weights[i] || 0),
      })),
      milestoneRemainder,
    };
  });

  const total = wsBreakdown.reduce((s, w) => s + w.value, 0);
  const totalActivation = wsBreakdown.reduce((s, w) => s + w.activation, 0);
  const totalMilestone = wsBreakdown.reduce((s, w) => s + w.milestoneRemainder, 0);
  // longest term among selected workstreams drives "monthly equivalent" horizon
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
  if (ids.length === 1) {
    headline = `Workstream I · ${TERM_LABEL[c.rows[0].term]}`;
  } else if (ids.length === 3 &&
             c.rows.every(r => r.term === c.rows[0].term)) {
    headline = `Full Initiative · ${TERM_LABEL[c.rows[0].term]}`;
  } else {
    const parts = c.rows.map(r => `WS ${ {1:'I',2:'II',3:'III'}[r.id] } (${TERM_SHORT[r.term]})`);
    headline = parts.join(' · ');
  }
  document.getElementById('cs-headline').textContent = headline;

  const rowsEl = document.getElementById('cs-rows');
  rowsEl.innerHTML = c.rows.map(r => `
    <div class="cs-row">
      <span class="label">Workstream ${ {1:'I',2:'II',3:'III'}[r.id] } &mdash; ${r.name} <em style="font-style:normal;color:var(--muted);font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;display:block;margin-top:4px">${TERM_SHORT[r.term]}${r.isInfoOnly ? ' · Advisory (Info Only)' : ''}</em></span>
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
  document.getElementById('cs-monthly').textContent = fmt(c.monthly) + ' / mo';
  document.getElementById('cs-fixed-monthly').textContent = fmt(c.totalActivation);
  document.getElementById('cs-milestone-total-monthly').textContent = fmt(c.totalMilestone);

  // Milestone view
  document.getElementById('cs-fixed').textContent = fmt(c.totalActivation);
  document.getElementById('cs-fixed-pct').textContent = c.total > 0 ? Math.round((c.totalActivation/c.total)*100) + '%' : '';
  document.getElementById('cs-milestone-total').textContent = fmt(c.totalMilestone);
  document.getElementById('cs-milestone-pct').textContent = c.total > 0 ? Math.round((c.totalMilestone/c.total)*100) + '%' : '';

  // Per-workstream milestone schedule
  const milestoneEl = document.getElementById('cs-milestone-schedule');
  milestoneEl.innerHTML = c.rows.map(r => {
    const wsRoman = {1:'I',2:'II',3:'III'}[r.id];
    const isAdvisory = WS[r.id].advisory === true;
    const advisoryBadge = isAdvisory
      ? '<span class="ms-advisory-badge" title="Advisory engagement — execution subject to future negotiation">Advisory</span>'
      : '';

    // Workstream III 12-Month: informational only — no payment schedule
    if (r.isInfoOnly) {
      return `
        <div class="ms-block is-advisory">
          <p class="ms-block-title">Workstream ${wsRoman} &mdash; ${r.name}${advisoryBadge}</p>
          <p class="ms-advisory-note"><strong>Advisory Information Edition (12-Month).</strong> Selection of the 12-Month Strategic Partnership Program for Workstream III does <strong>not</strong> automatically authorize or initiate strategic resource development, mining activities, extraction projects, processing facilities, commercialization efforts, or downstream infrastructure development. Instead, the 12-Month engagement allows and is intended for future advisory support, assessment refinement, strategic resource validation, stakeholder engagement, and development of strategic recommendations.</p>
          <p class="ms-advisory-note">The implementation of a strategic roadmap with regards to commercialization, operations, stakeholder engagement, and execution activities shall be revisited and formally negotiated upon successful completion of Stage 2 (6 Months), based upon validated mapping outcomes, geological findings, infrastructure feasibility, commercial viability, and Government of Ecuador priorities.</p>
          <p class="ms-advisory-note"><strong>No activation fee. No payment schedule. No milestone schedule. Informational only.</strong></p>
        </div>
      `;
    }

    const advisoryNote = isAdvisory
      ? `<p class="ms-advisory-note">Workstream III is an advisory engagement. Implementation of resource extraction, processing, infrastructure development, or commercialization activities is not included and remains subject to future negotiation following Stage 2 validation.</p>`
      : '';

    return `
      <div class="ms-block${isAdvisory ? ' is-advisory' : ''}">
        <p class="ms-block-title">Workstream ${wsRoman} &mdash; ${r.name} <em style="font-style:normal;color:var(--muted);font-size:11px;letter-spacing:.18em;text-transform:uppercase;margin-left:8px">${TERM_SHORT[r.term]}</em>${advisoryBadge}</p>
        ${advisoryNote}
        <table class="ms-table">
          <thead>
            <tr><th>Payment</th><th>Trigger</th><th class="num">Month</th><th class="num">Amount</th></tr>
          </thead>
          <tbody>
            <tr class="ms-fixed">
              <td><strong>Program Activation Fee</strong></td>
              <td>Contract execution &amp; program activation activities</td>
              <td class="num">Month 0</td>
              <td class="num">${fmt(r.activation)}</td>
            </tr>
            ${r.milestones.map((m) => `
              <tr>
                <td><strong>${m.name}</strong></td>
                <td>${m.trigger}</td>
                <td class="num">Month ${m.month}</td>
                <td class="num">${fmt(m.amount)}</td>
              </tr>
            `).join('')}
            <tr class="ms-subtotal">
              <td colspan="3">Workstream ${wsRoman} Subtotal</td>
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
    baseNote = 'Ninety-day introductory engagement. Program Activation Fee paid at contract execution; remainder released against assessment and roadmap deliverables.';
  } else if (ws1Term === 6) {
    baseNote = 'Six-month foundation program. Program Activation Fee paid at contract execution; remainder released against three phase-aligned milestones.';
  } else {
    baseNote = 'Twelve-month Strategic Partnership. Program Activation Fee paid at contract execution; remainder released against three phase-aligned milestones spanning the engagement.';
  }
  if (state.ws.has(3) && effectiveTerm(3) === 12) {
    baseNote += ' Workstream III at 12 months is the Advisory Information Edition — no activation fee or milestone schedule; informational only. Implementation of extraction, processing, infrastructure, and commercialization activities is subject to future negotiation following Stage 2 validation.';
  } else if (state.ws.has(3)) {
    baseNote += ' Workstream III is structured as an advisory engagement — resource extraction, processing, infrastructure development, and commercialization activities are not included and are subject to future negotiation following Stage 2 validation.';
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
        // WS II / III can't exceed WS I term
        if (term > ws1Term) disabled = true;
        // If parent toggle is unchecked, gray out entire row
        if (!selected) disabled = true;
      }

      btn.classList.toggle('is-disabled', disabled);
      if (disabled) btn.setAttribute('aria-disabled', 'true');
      else btn.removeAttribute('aria-disabled');
    });

    // Reflect active state on each segment
    const effective = effectiveTerm(wsId);
    seg.querySelectorAll('.seg-btn[data-term]').forEach(btn => {
      btn.classList.toggle('is-active', +btn.dataset.term === effective);
    });
  });
}

// ---------- Wire controls ----------

// Workstream II / III toggles (Workstream I is always selected)
document.querySelectorAll('.toggle input[data-ws]').forEach(inp => {
  inp.addEventListener('change', () => {
    const id = +inp.dataset.ws;
    if (inp.checked) state.ws.add(id); else state.ws.delete(id);
    if (!state.ws.has(1)) state.ws.add(1);
    render();
  });
});

// Per-workstream term buttons
document.querySelectorAll('.ws-seg').forEach(seg => {
  const wsId = +seg.dataset.wsSeg;
  seg.querySelectorAll('.seg-btn[data-term]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('is-disabled')) return;
      const term = +btn.dataset.term;
      state.wsTerms[wsId] = term;

      // If WS I drops below WS II/III selected terms, clamp them down
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

  const wsLines = c.rows.map(r =>
    `   • Workstream ${ {1:'I',2:'II',3:'III'}[r.id] } — ${r.name} (${TERM_SHORT[r.term]}): ${fmt(r.value)}${r.isInfoOnly ? '  [Advisory · Information Only]' : ''}`
  ).join('\n');

  // Per-workstream payment schedule
  const scheduleLines = c.rows.map(r => {
    const ws = {1:'I',2:'II',3:'III'}[r.id];
    let lines = `\n   Workstream ${ws} — ${r.name} (${TERM_SHORT[r.term]} · ${fmt(r.value)} total)`;
    if (r.isInfoOnly) {
      lines += `\n      • Advisory Information Edition — no activation fee, no payment schedule, no milestones.`;
      lines += `\n      • Implementation of resource extraction, processing, infrastructure development, and`;
      lines += `\n        commercialization is subject to future negotiation following Stage 2 validation.`;
      return lines;
    }
    lines += `\n      • Program Activation Fee (Month 0):              ${fmt(r.activation)}`;
    r.milestones.forEach((m) => {
      lines += `\n      • ${m.name} (Month ${m.month}):${' '.repeat(Math.max(2, 32 - m.name.length - String(m.month).length))}${fmt(m.amount)}`;
    });
    return lines;
  }).join('\n');

  const auths = checked.length
    ? checked.map(x => `   ☒ ${x}`).join('\n')
    : '   (no authorizations selected)';

  return `MINISTERIAL DECISION MEMORANDUM
Republic of Ecuador — Strategic Partnership Initiative
Prepared by: Trident Solutions, Strategic Advisory Division
Date: ${rep.date}

────────────────────────────────────────────────
SELECTED CONFIGURATION
────────────────────────────────────────────────
   Program:        ${workstreamLabel()}

   Workstreams included:
${wsLines}

   Total Contract Value:                 ${fmt(c.total)}

────────────────────────────────────────────────
PAYMENT STRUCTURE
────────────────────────────────────────────────
   Program Activation Fees:               ${fmt(c.totalActivation)}
   Milestone Payments:                    ${fmt(c.totalMilestone)}
   ─────────────────────────────────────────
   Total Contract Value:                  ${fmt(c.total)}

   Per-Workstream Schedule:
${scheduleLines}

────────────────────────────────────────────────
AUTHORIZATIONS REQUESTED
────────────────────────────────────────────────
${auths}

────────────────────────────────────────────────
GOVERNMENT REPRESENTATIVE
────────────────────────────────────────────────
   Name:             ${rep.name || '____________________________'}
   Title:            ${rep.title || '____________________________'}
   Agency/Ministry:  ${rep.agency || '____________________________'}
   Signature:        ____________________________
   Date:             ${rep.date}

────────────────────────────────────────────────
POINTS OF CONTACT — TRIDENT SOLUTIONS
────────────────────────────────────────────────
   Bruce Roberts     — Chief Executive Officer · Founding Partner
   Nicholas Fowler   — President · Founding Partner

   Trident Solutions — Strategic Advisory Division
   National Security Modernization · Sovereign Capability Development
   Strategic Resource Security · Industrial Development
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
    setStatus('Decision memorandum copied to clipboard.');
  } catch {
    const ta = document.createElement('textarea');
    ta.value = memo; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); ta.remove();
    setStatus('Decision memorandum copied to clipboard.');
  }
});

document.getElementById('print-btn').addEventListener('click', () => {
  const memo = buildMemo();
  const w = window.open('', '_blank');
  if (!w) {
    setStatus('Pop-up blocked. Please allow pop-ups to export the memorandum.');
    return;
  }
  w.document.write(`<!doctype html><html><head><meta charset="utf-8">
    <title>Ministerial Decision Memorandum — Republic of Ecuador</title>
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
    <div class="sub">Strategic Advisory Division · Ministerial Decision Memorandum</div>
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
