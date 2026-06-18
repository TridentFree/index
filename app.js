/* ============================================================
   Ecuador Strategic Partnership — Interactive Sales Tool
   Customer-facing only.
   Fixed-fee + phase-tied milestone payment structure.
   ============================================================ */

// ---------- Footer year & nav scroll state ----------
document.getElementById('yr').textContent = new Date().getFullYear();

const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 24);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// ---------- Workstream tabs ----------
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
    advisory: true,  // advisory-only workstream — execution requires future negotiation
    contracts: { 3:  175000, 6:  257000, 12:  638000 },
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
      12: [
        { name: 'M1 — Resource & Value Assessment',           trigger: 'Strategic Resource, Security, Value & Infrastructure Assessments delivered', month: 3 },
        { name: 'M2 — Mapping & Validation Outcomes',         trigger: 'Validated mapping, geological findings & Critical Minerals Strategic Recommendations delivered (advisory)', month: 6 },
        { name: 'M3 — Advisory & Strategic Recommendations',  trigger: 'Continued advisory support, stakeholder engagement & development pathway analysis delivered — advisory only; execution subject to future negotiation following Stage 2 validation', month: 12 },
      ],
    },
  },
};

// Payment structure per term:
//   fixedPct      = upfront mobilization fee (% of each workstream's contract value)
//   milestonePcts = milestone payment weights as % of contract value (must sum to 1 - fixedPct)
const PAYMENT_STRUCTURE = {
  3:  { fixedPct: 0.60, milestonePcts: [0.25, 0.15] },
  6:  { fixedPct: 0.50, milestonePcts: [0.25, 0.15, 0.10] },
  12: { fixedPct: 0.40, milestonePcts: [0.25, 0.20, 0.15] },
};

const fmt = n => '$' + Math.round(n).toLocaleString('en-US');
const ordinal = (n) => n + (['th','st','nd','rd'][((n%100-20)%10<4&&(n%100-20)%10>0)?(n%100-20)%10:(n%100<4?n%100:0)]||'th');

// ---------- State ----------
let state = {
  ws: new Set([1]),
  term: 12,
  view: 'monthly',  // 'monthly' or 'milestone'
};

function selectedWorkstreams() { return Array.from(state.ws).sort(); }

function workstreamLabel() {
  const ids = selectedWorkstreams();
  if (ids.length === 3) return 'Full Initiative';
  const roman = { 1: 'I', 2: 'II', 3: 'III' };
  return 'Workstream ' + ids.map(i => roman[i]).join(' + ');
}

function termLabel() {
  return { 3: '90-Day Introductory Assessment',
           6: '6-Month Foundation Program',
          12: '12-Month Strategic Partnership' }[state.term];
}

function compute() {
  const ids = selectedWorkstreams();
  const months = state.term;
  const struct = PAYMENT_STRUCTURE[months];

  const wsBreakdown = ids.map(id => {
    const w = WS[id];
    const value = w.contracts[months];
    const wsMilestones = w.milestones[months];
    return {
      id, name: w.name, value,
      fixed: value * struct.fixedPct,
      milestones: wsMilestones.map((m, i) => ({
        name: m.name, trigger: m.trigger, month: m.month,
        amount: value * struct.milestonePcts[i],
      })),
    };
  });

  const total = wsBreakdown.reduce((s, w) => s + w.value, 0);
  const totalFixed = wsBreakdown.reduce((s, w) => s + w.fixed, 0);
  const totalMilestone = total - totalFixed;

  return {
    rows: wsBreakdown, total, months,
    fixedPct: struct.fixedPct,
    totalFixed, totalMilestone,
    monthly: total / months,
  };
}

// ---------- Render: live summary ----------
function render() {
  const c = compute();

  document.getElementById('cs-headline').textContent =
    `${workstreamLabel()} · ${termLabel()}`;

  const rowsEl = document.getElementById('cs-rows');
  rowsEl.innerHTML = c.rows.map(r => `
    <div class="cs-row">
      <span class="label">Workstream ${ {1:'I',2:'II',3:'III'}[r.id] } &mdash; ${r.name}</span>
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
  document.getElementById('cs-fixed-monthly').textContent = fmt(c.totalFixed);
  document.getElementById('cs-milestone-total-monthly').textContent = fmt(c.totalMilestone);

  // Milestone view — fixed + per-workstream schedule
  document.getElementById('cs-fixed').textContent = fmt(c.totalFixed);
  document.getElementById('cs-fixed-pct').textContent = Math.round(c.fixedPct * 100) + '%';
  document.getElementById('cs-milestone-total').textContent = fmt(c.totalMilestone);
  document.getElementById('cs-milestone-pct').textContent = Math.round((1 - c.fixedPct) * 100) + '%';

  // Build milestone schedule table — one section per workstream
  const milestoneEl = document.getElementById('cs-milestone-schedule');
  milestoneEl.innerHTML = c.rows.map(r => {
    const wsRoman = {1:'I',2:'II',3:'III'}[r.id];
    const isAdvisory = WS[r.id].advisory === true;
    const advisoryBadge = isAdvisory
      ? '<span class="ms-advisory-badge" title="Advisory engagement — execution subject to future negotiation">Advisory</span>'
      : '';
    const advisoryNote = (isAdvisory && state.term === 12)
      ? `<p class="ms-advisory-note"><strong>Advisory Information Edition.</strong> The 12-month Workstream III engagement provides continued advisory support, assessment refinement, strategic resource validation, stakeholder engagement, and development of strategic recommendations. It does <strong>not</strong> authorize or initiate resource extraction, processing facilities, infrastructure development, or commercialization activities. Implementation of those activities is subject to future negotiation following Stage 2 validation.</p>`
      : (isAdvisory
          ? `<p class="ms-advisory-note">Workstream III is an advisory engagement. Implementation of resource extraction, processing, infrastructure development, or commercialization activities is not included and remains subject to future negotiation.</p>`
          : '');
    return `
      <div class="ms-block${isAdvisory ? ' is-advisory' : ''}">
        <p class="ms-block-title">Workstream ${wsRoman} &mdash; ${r.name}${advisoryBadge}</p>
        ${advisoryNote}
        <table class="ms-table">
          <thead>
            <tr><th>Payment</th><th>Trigger</th><th class="num">Month</th><th class="num">Amount</th></tr>
          </thead>
          <tbody>
            <tr class="ms-fixed">
              <td><strong>Mobilization Fee</strong></td>
              <td>Contract execution &amp; engagement kickoff</td>
              <td class="num">Month 0</td>
              <td class="num">${fmt(r.fixed)}</td>
            </tr>
            ${r.milestones.map((m, i) => `
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
  let baseNote;
  if (state.term === 3) {
    baseNote = 'Ninety-day introductory engagement. ' + Math.round(c.fixedPct*100) + '% mobilization fee at contract execution; remainder released against assessment and roadmap deliverables.';
  } else if (state.term === 6) {
    baseNote = 'Six-month foundation program. ' + Math.round(c.fixedPct*100) + '% mobilization fee at contract execution; remainder released against three phase-aligned milestones.';
  } else {
    baseNote = 'Twelve-month Strategic Partnership. ' + Math.round(c.fixedPct*100) + '% mobilization fee at contract execution; remainder released against three phase-aligned milestones spanning the engagement.';
  }
  if (state.ws.has(3)) {
    baseNote += ' Workstream III is structured as an advisory engagement — resource extraction, processing, infrastructure development, and commercialization activities are not included and are subject to future negotiation following Stage 2 validation.';
  }
  note.textContent = baseNote;
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

document.querySelectorAll('.seg-btn[data-term]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.seg-btn[data-term]').forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    state.term = +btn.dataset.term;
    render();
  });
});

// View tabs (Monthly / Milestone)
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
  state.term = 12;
  syncControls();
  render();
});
document.getElementById('preset-reset').addEventListener('click', () => {
  state.ws = new Set([1]);
  state.term = 6;
  syncControls();
  render();
});

function syncControls() {
  document.querySelectorAll('.toggle input[data-ws]').forEach(inp => {
    inp.checked = state.ws.has(+inp.dataset.ws);
  });
  document.querySelectorAll('.seg-btn[data-term]').forEach(b => {
    b.classList.toggle('is-active', +b.dataset.term === state.term);
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
    `   • Workstream ${ {1:'I',2:'II',3:'III'}[r.id] } — ${r.name}: ${fmt(r.value)}`
  ).join('\n');

  // Per-workstream milestone schedule
  const scheduleLines = c.rows.map(r => {
    const ws = {1:'I',2:'II',3:'III'}[r.id];
    let lines = `\n   Workstream ${ws} — ${r.name} (${fmt(r.value)} total)`;
    lines += `\n      • Mobilization Fee (Month 0):                    ${fmt(r.fixed)}`;
    r.milestones.forEach((m, i) => {
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
   Term:           ${termLabel()}
   Term Length:    ${c.months} months

   Workstreams included:
${wsLines}

   Total Contract Value:                 ${fmt(c.total)}

────────────────────────────────────────────────
PAYMENT STRUCTURE
────────────────────────────────────────────────
   Fixed Mobilization Fee  (${Math.round(c.fixedPct*100)}%):     ${fmt(c.totalFixed)}
   Milestone Payments      (${Math.round((1-c.fixedPct)*100)}%):     ${fmt(c.totalMilestone)}
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
