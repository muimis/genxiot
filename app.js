/* ═══════════════════════════════════════════════════════════════
   GENXIOT ALAMO PROPOSAL – app.js
   Dynamic BOM Calculator, Proposal Populator
   ═══════════════════════════════════════════════════════════════ */

// ─── BOQ DATA ───────────────────────────────────────────────────
const ITEMS = [
  {
    code: 'ALAMO-CP',
    name: 'Call Point – Alamo A1',
    desc: 'Patient Call, Cancel, Acknowledge & Housekeeping. 2× RJ11 ports, optional adapter port.',
    qty: 134,
    rate: 4500,
    img: 'qtn_embed_p5_img0.jpeg'
  },
  {
    code: 'ALAMO-PD',
    name: 'Pendant Button M1',
    desc: 'Coil cord pendant call switch. Connects to call point, placed near patient bed.',
    qty: 134,
    rate: 1000,
    img: 'qtn_embed_p5_img0.jpeg'
  },
  {
    code: 'ALAMO-PL',
    name: 'Pull Cord Accessory',
    desc: 'Washroom accessible pull cord for patient emergency call. Connects to call point via RJ11.',
    qty: 99,
    rate: 500,
    img: 'qtn_embed_p5_img0.jpeg'
  },
  {
    code: 'ALAMO-DL',
    name: 'Room Light (Door Indicator)',
    desc: 'LED indicator light paired with call point. Activates on patient call. Placed outside room.',
    qty: 39,
    rate: 2500,
    img: 'qtn_embed_p5_img0.jpeg'
  },
  {
    code: 'ALAMO-GW',
    name: 'LoRa Gateway / Central Receiver',
    desc: 'Receives LoRa RF transmissions from all call points. Forwards to nursing station and cloud.',
    qty: 8,
    rate: 12000,
    img: 'qtn_embed_p6_img0.jpeg'
  },
  {
    code: 'ALAMO-NS',
    name: 'Nursing Station Display (Android TV)',
    desc: 'Pre-configured Android Smart TV with Alamo Monitor Software showing live call status.',
    qty: 8,
    rate: 20000,
    img: 'qtn_embed_p6_img0.jpeg'
  },
  {
    code: 'ALAMO-VISION',
    name: 'Alamo Vision App License (Annual)',
    desc: 'Cloud-based nurse call analytics, escalation alerts, and performance reports.',
    qty: 1,
    rate: 30000,
    img: 'qtn_embed_p6_img0.jpeg'
  },
  {
    code: 'ALAMO-TRAIN',
    name: 'Installation, Configuration & Training',
    desc: 'On-site installation, LoRa network calibration, staff training, go-live support.',
    qty: 1,
    rate: 15000,
    img: 'qtn_embed_p5_img0.jpeg'
  }
];

// ─── STATE ───────────────────────────────────────────────────────
let bom = ITEMS.map(i => ({ ...i }));

// ─── INIT ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderBOM();
  recalc();
  setValidityDate();
  calcEstimator();
  fillDocDates();
});

// ─── RENDER BOM ──────────────────────────────────────────────────
function renderBOM() {
  const tbody = document.getElementById('bomBody');
  tbody.innerHTML = '';

  bom.forEach((item, idx) => {
    const amount = item.qty * item.rate;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <img src="${item.img}" class="prod-thumb" alt="${item.name}" onerror="this.style.display='none'">
      </td>
      <td>
        <div class="prod-name">${item.name}</div>
        <div class="prod-sub">${item.code} · ${item.desc}</div>
      </td>
      <td>
        <input type="number" value="${item.qty}" min="0"
          oninput="updateQty(${idx}, this.value)">
      </td>
      <td>
        <input type="number" value="${item.rate}" min="0"
          oninput="updateRate(${idx}, this.value)">
      </td>
      <td class="amount-cell">₹${fmt(amount)}</td>
      <td>
        <button class="del-btn" onclick="removeItem(${idx})">
          <i data-lucide="trash-2" size="14"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  if (window.lucide) lucide.createIcons();
}

function updateQty(idx, val) {
  bom[idx].qty = Math.max(0, parseInt(val) || 0);
  refreshRow(idx);
  recalc();
}

function updateRate(idx, val) {
  bom[idx].rate = Math.max(0, parseFloat(val) || 0);
  refreshRow(idx);
  recalc();
}

function refreshRow(idx) {
  const rows = document.querySelectorAll('#bomBody tr');
  if (rows[idx]) {
    rows[idx].querySelector('.amount-cell').textContent = '₹' + fmt(bom[idx].qty * bom[idx].rate);
  }
}

function removeItem(idx) {
  bom.splice(idx, 1);
  renderBOM();
  recalc();
}

function addCustomItem() {
  bom.push({
    code: 'CUSTOM',
    name: 'Custom Item',
    desc: 'Tap to edit description',
    qty: 1,
    rate: 0,
    img: ''
  });
  renderBOM();
  recalc();
}

// ─── PRESETS ────────────────────────────────────────────────────
function loadPreset(preset) {
  document.getElementById('presetDrop').classList.remove('open');
  const presets = {
    small: {
      beds: 30, washrooms: 20, wards: 2,
      qtys: [30, 30, 20, 10, 2, 2, 1, 1],
      client: 'Small Clinic / Nursing Home', loc: 'Kerala'
    },
    medium: {
      beds: 134, washrooms: 99, wards: 8,
      qtys: [134, 134, 99, 39, 8, 8, 1, 1],
      client: 'Nims hospital tvm', loc: 'Trivandrum, Kerala'
    },
    large: {
      beds: 250, washrooms: 180, wards: 15,
      qtys: [250, 250, 180, 80, 15, 15, 1, 1],
      client: 'Super-Specialty Hospital', loc: 'PAN India'
    }
  };
  const p = presets[preset];
  if (!p) return;
  document.getElementById('bedCount').value = p.beds;
  document.getElementById('washroomCount').value = p.washrooms;
  document.getElementById('wardCount').value = p.wards;
  document.getElementById('clientName').value = p.client;
  document.getElementById('clientLocation').value = p.loc;
  p.qtys.forEach((q, i) => { if (bom[i]) bom[i].qty = q; });
  renderBOM();
  recalc();
  calcEstimator();
}

// ─── ESTIMATOR ──────────────────────────────────────────────────
function calcEstimator() {
  const beds = parseInt(document.getElementById('bedCount').value) || 0;
  const wc   = parseInt(document.getElementById('washroomCount').value) || 0;
  const wards = parseInt(document.getElementById('wardCount').value) || 1;
  const dlFac = parseFloat(document.getElementById('doorLightOpt').value) || 0;

  const estCP = beds;
  const estPD = beds;
  const estPL = wc;
  const estDL = Math.round(beds * dlFac);
  const estGW = wards;
  const estDS = wards;

  document.getElementById('estCP').textContent = estCP;
  document.getElementById('estPD').textContent = estPD;
  document.getElementById('estPL').textContent = estPL;
  document.getElementById('estDL').textContent = estDL;
  document.getElementById('estGW').textContent = estGW;
  document.getElementById('estDS').textContent = estDS;
}

function applyEstimator() {
  const beds  = parseInt(document.getElementById('bedCount').value) || 0;
  const wc    = parseInt(document.getElementById('washroomCount').value) || 0;
  const wards = parseInt(document.getElementById('wardCount').value) || 1;
  const dlFac = parseFloat(document.getElementById('doorLightOpt').value) || 0;

  const qtys = [
    beds,
    beds,
    wc,
    Math.round(beds * dlFac),
    wards,
    wards,
    bom[6] ? bom[6].qty : 1,
    bom[7] ? bom[7].qty : 1
  ];
  qtys.forEach((q, i) => { if (bom[i]) bom[i].qty = q; });
  renderBOM();
  recalc();
}

// ─── RECALC ─────────────────────────────────────────────────────
function recalc() {
  const subtotal = bom.reduce((s, i) => s + i.qty * i.rate, 0);
  const discType = document.getElementById('discType').value;
  const discVal  = parseFloat(document.getElementById('discVal').value) || 0;
  const shipping = parseFloat(document.getElementById('shipping').value) || 0;
  const advPct   = parseFloat(document.getElementById('advPct').value) || 50;

  let discount = 0;
  if (discType === 'pct')  discount = subtotal * discVal / 100;
  if (discType === 'flat') discount = discVal;

  const taxable = subtotal - discount + shipping;
  const cgst    = taxable * 0.09;
  const sgst    = taxable * 0.09;
  const grand   = taxable + cgst + sgst;

  document.getElementById('calcSub').textContent  = '₹' + fmt(subtotal);
  document.getElementById('calcTax').textContent  = '₹' + fmt(taxable);
  document.getElementById('calcCGST').textContent = '₹' + fmt(cgst);
  document.getElementById('calcSGST').textContent = '₹' + fmt(sgst);
  document.getElementById('calcGT').textContent   = '₹' + fmt(grand);
  document.getElementById('stickyTotal').textContent = '₹' + fmt(grand);

  const discRow = document.getElementById('discRow');
  if (discount > 0) {
    discRow.style.display = 'flex';
    document.getElementById('calcDisc').textContent = '-₹' + fmt(discount);
  } else {
    discRow.style.display = 'none';
  }

  document.getElementById('postPct').value = (100 - advPct) + '%';

  // Update proposal doc
  syncDoc(subtotal, discount, taxable, cgst, sgst, grand, advPct);
}

// ─── SYNC DOCUMENT ──────────────────────────────────────────────
function syncDoc(subtotal, discount, taxable, cgst, sgst, grand, advPct) {
  const clientName    = document.getElementById('clientName').value;
  const clientLoc     = document.getElementById('clientLocation').value;
  const contactPerson = document.getElementById('contactPerson').value;
  const quoteRef      = document.getElementById('quoteRef').value;
  const bdmName       = document.getElementById('bdmName').value;
  const beds          = document.getElementById('bedCount').value;
  const wc            = document.getElementById('washroomCount').value;
  const wards         = document.getElementById('wardCount').value;

  // Cover page
  setTxt('cvrClient', clientName);
  setTxt('cvrRef', quoteRef);
  setTxt('cvrValid', getValidDate());

  // Quotation page
  setTxt('qDocRef', quoteRef);
  setTxt('qDocDate', new Date().toLocaleDateString('en-IN', {day:'2-digit',month:'short',year:'numeric'}));
  setTxt('qDocValid', getValidDate());
  setTxt('qClientName', clientName);
  setTxt('qClientLoc', clientLoc);
  setTxt('qContactPerson', contactPerson);
  setTxt('qBdmName', bdmName);
  setTxt('qFacility', `${beds} Beds · ${wc} Washrooms · ${wards} Wards`);
  setTxt('qSigClient', clientName);

  // BOQ in doc
  const tbody = document.getElementById('qBomBody');
  if (tbody) {
    tbody.innerHTML = '';
    bom.forEach((item, i) => {
      if (item.qty === 0) return;
      const amt = item.qty * item.rate;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="text-align:center">${i+1}</td>
        <td>${item.code}</td>
        <td>${item.name}<br><small style="color:#888">${item.desc}</small></td>
        <td style="text-align:center">${item.qty}</td>
        <td style="text-align:right">${fmt(item.rate)}</td>
        <td style="text-align:right">${fmt(amt)}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Totals in doc
  setTxt('qSub', '₹' + fmt(subtotal));
  setTxt('qCGST', '₹' + fmt(cgst));
  setTxt('qSGST', '₹' + fmt(sgst));
  setTxt('qGT', '₹' + fmt(grand));

  const qDiscRow = document.getElementById('qDiscRow');
  if (qDiscRow) {
    if (discount > 0) {
      qDiscRow.style.display = '';
      setTxt('qDisc', '-₹' + fmt(discount));
    } else {
      qDiscRow.style.display = 'none';
    }
  }

  // Payment
  const advAmt  = grand * advPct / 100;
  const postAmt = grand - advAmt;
  setTxt('qAdvPct', advPct + '%');
  setTxt('qPostPct', (100 - advPct) + '%');
  setTxt('qAdvAmt', '₹' + fmt(advAmt));
  setTxt('qPostAmt', '₹' + fmt(postAmt));
}

function setTxt(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// ─── VALIDITY DATE ───────────────────────────────────────────────
function setValidityDate() {
  document.getElementById('cvrValid').textContent = getValidDate();
}

function getValidDate() {
  const days = parseInt(document.getElementById('validityDays').value) || 30;
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function fillDocDates() {
  const today = new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
  setTxt('qDocDate', today);
  setTxt('qDocValid', getValidDate());
}

// ─── FORMAT ─────────────────────────────────────────────────────
function fmt(n) {
  return Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── MODAL ──────────────────────────────────────────────────────
function openModal() {
  recalc();
  const mb = document.getElementById('modalBg');
  mb.classList.add('open');
  mb.scrollTop = 0;
  if (window.lucide) lucide.createIcons();
}

function closeModal() {
  document.getElementById('modalBg').classList.remove('open');
}

function printDoc() {
  recalc();
  openModal();
  setTimeout(() => {
    window.print();
  }, 500);
}

// ─── RESET ──────────────────────────────────────────────────────
function resetQuote() {
  bom = ITEMS.map(i => ({ ...i }));
  document.getElementById('clientName').value   = 'Nims hospital tvm';
  document.getElementById('clientLocation').value = 'Trivandrum, Kerala';
  document.getElementById('contactPerson').value  = 'Medical Director / BioMed Team';
  document.getElementById('quoteRef').value      = 'SAL-QTN-2024-00478';
  document.getElementById('bdmName').value       = 'Genxiot Sales Team';
  document.getElementById('discType').value      = 'none';
  document.getElementById('discVal').value       = '0';
  document.getElementById('shipping').value      = '3500';
  document.getElementById('advPct').value        = '50';
  document.getElementById('bedCount').value      = '134';
  document.getElementById('washroomCount').value = '99';
  document.getElementById('wardCount').value     = '8';
  renderBOM();
  recalc();
  calcEstimator();
}

// ─── CLOSE MODAL ON BG CLICK ────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('modalBg').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
  });
});
