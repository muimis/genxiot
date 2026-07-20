/* ═══════════════════════════════════════════════════════════════
   GENXIOT ALAMO PROPOSAL – app.js  v2.0
   
   QUOTATION LOGIC EXPLAINED
   ─────────────────────────────────────────────────────────────
   A hospital facility is configured by:
     • Rooms       – each room gets 1 Call Point + 1 Pendant Button
     •               + optional Room Light (door indicator) per room
     • Bathrooms   – each bathroom is an INDEPENDENT unit:
     •               1 Call Point (dedicated bathroom unit) + 1 Pull Cord
     • Wards       – each ward/nursing station gets 1 Gateway + 1 NS Display
     • Licenses    – Alamo Vision (per hospital) + training (once)

   Sample quote SAL-QTN-2024-00478 (Nims Hospital):
     134 Rooms → 134 Call Points + 134 Pendants + 39 Room Lights
      99 Bathrooms → 99 Call Points (bathroom) + 99 Pull Cords
       8 Wards → 8 Gateways + 8 NS Displays
   ═══════════════════════════════════════════════════════════════ */

// ─── MASTER ITEM CATALOGUE ───────────────────────────────────────
// img paths: use qtn_embed_p* (full embedded page jpegs) for thumbnails
// For PDF print, images are served as relative paths from the HTML file
const CATALOGUE = [
  // ROOM COMPONENTS
  {
    code: 'ALAMO-CP-R',
    name: 'Call Point – Patient Room Unit',
    desc: 'Alamo A1 Call Point with Call, Cancel, Acknowledge & Housekeeping buttons. 2× RJ11 ports for accessories. Battery operated (AA) – no wiring needed.',
    group: 'Room Components',
    rate: 4500,
    img:  'qtn_embed_p5_img0.jpeg'
  },
  {
    code: 'ALAMO-PD',
    name: 'Pendant Button M1',
    desc: 'Patient-side coil cord call switch. Connects via RJ11 to the room call point. Placed near the patient bed for easy reach.',
    group: 'Room Components',
    rate: 1000,
    img:  'qtn_embed_p5_img0.jpeg'
  },
  {
    code: 'ALAMO-DL',
    name: 'Room Light (Door Indicator)',
    desc: 'LED corridor light placed outside room door. Paired wirelessly with room call point – lights up when patient calls.',
    group: 'Room Components',
    rate: 2500,
    img:  'qtn_embed_p5_img0.jpeg'
  },

  // BATHROOM COMPONENTS (independent unit)
  {
    code: 'ALAMO-CP-B',
    name: 'Call Point – Bathroom Unit',
    desc: 'Dedicated bathroom/washroom call point. Fully independent LoRa unit. Waterproof placement, battery operated. Call, Cancel, and Emergency buttons.',
    group: 'Bathroom Components',
    rate: 4500,
    img:  'qtn_embed_p5_img0.jpeg'
  },
  {
    code: 'ALAMO-PL',
    name: 'Pull Cord Accessory',
    desc: 'Washroom pull cord connected to the bathroom call point via RJ11. Allows patient to call from any position – ideal for fall emergencies.',
    group: 'Bathroom Components',
    rate: 500,
    img:  'qtn_embed_p5_img0.jpeg'
  },

  // INFRASTRUCTURE
  {
    code: 'ALAMO-GW',
    name: 'LoRa Gateway / Central Receiver',
    desc: 'Receives LoRa RF transmissions from all call points within its coverage zone (1 per ward/nursing station). Forwards data to displays, mobile apps, and cloud.',
    group: 'Infrastructure',
    rate: 12000,
    img:  'qtn_embed_p6_img0.jpeg'
  },
  {
    code: 'ALAMO-NS',
    name: 'Nursing Station Display (Android TV)',
    desc: 'Android Smart TV pre-loaded with Alamo Monitor Software. Shows live real-time call status for all beds in the ward. 1 per nursing station.',
    group: 'Infrastructure',
    rate: 20000,
    img:  'qtn_embed_p6_img0.jpeg'
  },

  // SOFTWARE & SERVICES
  {
    code: 'ALAMO-VISION',
    name: 'Alamo Vision – Annual App License',
    desc: 'Cloud analytics platform: peak-time reports, missed-call escalation alerts, nursing manager dashboard, station-wise performance data.',
    group: 'Software & Services',
    rate: 30000,
    img:  'qtn_embed_p6_img0.jpeg'
  },
  {
    code: 'ALAMO-TRAIN',
    name: 'Installation, Configuration & Training',
    desc: 'On-site installation & LoRa network calibration. Staff training, go-live support, and Installation Protocol signoff.',
    group: 'Software & Services',
    rate: 15000,
    img:  'qtn_embed_p5_img0.jpeg'
  }
];

// Default sample qty (SAL-QTN-2024-00478 – Nims Hospital 134 beds, 99 bathrooms, 8 wards)
const DEFAULT_QTY = [134, 134, 39, 99, 99, 8, 8, 1, 1];

// ─── STATE ───────────────────────────────────────────────────────
let bom = CATALOGUE.map((item, i) => ({ ...item, qty: DEFAULT_QTY[i] }));

// ─── INIT ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderBOM();
  recalc();
  calcEstimator();
  fillDocDates();
});

// ─── RENDER BOM (Web calculator table) ──────────────────────────
function renderBOM() {
  const tbody = document.getElementById('bomBody');
  tbody.innerHTML = '';

  let lastGroup = null;

  bom.forEach((item, idx) => {
    // Group header row
    if (item.group !== lastGroup) {
      lastGroup = item.group;
      const gtr = document.createElement('tr');
      gtr.className = 'grp-hdr';
      gtr.innerHTML = `<td colspan="6">${item.group}</td>`;
      tbody.appendChild(gtr);
    }

    const amount = item.qty * item.rate;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <img src="${item.img}" class="prod-thumb" alt="${item.name}"
          onerror="this.style.display='none'">
      </td>
      <td>
        <div class="prod-name">${item.name}</div>
        <div class="prod-sub">${item.code} &nbsp;·&nbsp; ${item.desc}</div>
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
        <button class="del-btn" onclick="removeItem(${idx})" title="Remove">
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
  // Recalculate that row's amount cell
  const rows = document.querySelectorAll('#bomBody tr:not(.grp-hdr)');
  // Map to find correct row
  let rowCount = 0;
  const allRows = document.querySelectorAll('#bomBody tr');
  for (let r of allRows) {
    if (r.classList.contains('grp-hdr')) continue;
    if (rowCount === idx) {
      const ac = r.querySelector('.amount-cell');
      if (ac) ac.textContent = '₹' + fmt(bom[idx].qty * bom[idx].rate);
      break;
    }
    rowCount++;
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
    desc: 'Click to edit description',
    group: 'Custom',
    qty: 1, rate: 0, img: ''
  });
  renderBOM();
  recalc();
}

// ─── PRESETS ─────────────────────────────────────────────────────
function loadPreset(preset) {
  document.getElementById('presetDrop').classList.remove('open');
  const presets = {
    small: {
      rooms:25, bathrooms:18, wards:2, roomLights:0,
      client:'Small Clinic / Nursing Home', loc:'Kerala'
    },
    medium: {
      rooms:134, bathrooms:99, wards:8, roomLights:39,
      client:'Nims hospital tvm', loc:'Trivandrum, Kerala'
    },
    large: {
      rooms:250, bathrooms:180, wards:15, roomLights:80,
      client:'Super-Specialty Hospital', loc:'PAN India'
    }
  };
  const p = presets[preset];
  if (!p) return;
  document.getElementById('roomCount').value     = p.rooms;
  document.getElementById('bathroomCount').value = p.bathrooms;
  document.getElementById('wardCount').value     = p.wards;
  document.getElementById('clientName').value    = p.client;
  document.getElementById('clientLocation').value = p.loc;

  // Apply to BOM using logic
  applyFacility(p.rooms, p.bathrooms, p.wards, p.roomLights);
  calcEstimator();
}

// ─── ESTIMATOR ───────────────────────────────────────────────────
function calcEstimator() {
  const rooms     = parseInt(document.getElementById('roomCount').value)     || 0;
  const bathrooms = parseInt(document.getElementById('bathroomCount').value) || 0;
  const wards     = parseInt(document.getElementById('wardCount').value)     || 1;
  const dlOpt     = document.getElementById('doorLightOpt').value;

  let roomLights = 0;
  if (dlOpt === 'all')  roomLights = rooms;
  if (dlOpt === 'half') roomLights = Math.ceil(rooms / 2);
  if (dlOpt === 'none') roomLights = 0;
  if (dlOpt === 'custom') {
    roomLights = parseInt(document.getElementById('dlCustom').value) || 0;
  }

  // Totals
  const totalCP = rooms + bathrooms;   // all call points
  const totalPD = rooms;               // pendants (room only)
  const totalPL = bathrooms;           // pull cords (bathroom only)
  const totalDL = roomLights;
  const totalGW = wards;
  const totalDS = wards;

  document.getElementById('estRoomCP').textContent    = rooms;
  document.getElementById('estPendant').textContent   = rooms;
  document.getElementById('estRoomLight').textContent = roomLights;
  document.getElementById('estBathCP').textContent    = bathrooms;
  document.getElementById('estPullCord').textContent  = bathrooms;
  document.getElementById('estGW').textContent        = wards;
  document.getElementById('estDS').textContent        = wards;
  document.getElementById('estTotalCP').textContent   = totalCP;
}

function applyEstimator() {
  const rooms     = parseInt(document.getElementById('roomCount').value)     || 0;
  const bathrooms = parseInt(document.getElementById('bathroomCount').value) || 0;
  const wards     = parseInt(document.getElementById('wardCount').value)     || 1;
  const dlOpt     = document.getElementById('doorLightOpt').value;

  let roomLights = 0;
  if (dlOpt === 'all')    roomLights = rooms;
  if (dlOpt === 'half')   roomLights = Math.ceil(rooms / 2);
  if (dlOpt === 'none')   roomLights = 0;
  if (dlOpt === 'custom') roomLights = parseInt(document.getElementById('dlCustom').value) || 0;

  applyFacility(rooms, bathrooms, wards, roomLights);
}

function applyFacility(rooms, bathrooms, wards, roomLights) {
  // Map catalogue indices to quantities
  // [CP-R, PD, DL, CP-B, PL, GW, NS, VISION, TRAIN]
  const qtys = [rooms, rooms, roomLights, bathrooms, bathrooms, wards, wards,
                bom[7] ? bom[7].qty : 1,   // keep existing Vision qty
                bom[8] ? bom[8].qty : 1];  // keep existing Training qty

  qtys.forEach((q, i) => { if (bom[i]) bom[i].qty = q; });
  renderBOM();
  recalc();
}

// Show/hide custom DL input
document.addEventListener('DOMContentLoaded', () => {
  const dlSel = document.getElementById('doorLightOpt');
  if (dlSel) {
    dlSel.addEventListener('change', function() {
      const wrap = document.getElementById('dlCustomWrap');
      if (wrap) wrap.style.display = this.value === 'custom' ? 'block' : 'none';
      calcEstimator();
    });
  }
});

// ─── RECALC ──────────────────────────────────────────────────────
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

  setText('calcSub',  '₹' + fmt(subtotal));
  setText('calcTax',  '₹' + fmt(taxable));
  setText('calcCGST', '₹' + fmt(cgst));
  setText('calcSGST', '₹' + fmt(sgst));
  setText('calcGT',   '₹' + fmt(grand));
  setText('stickyTotal', '₹' + fmt(grand));

  const discRow = document.getElementById('discRow');
  if (discRow) {
    discRow.style.display = discount > 0 ? 'flex' : 'none';
    setText('calcDisc', '-₹' + fmt(discount));
  }
  const postPct = document.getElementById('postPct');
  if (postPct) postPct.value = (100 - advPct) + '%';

  syncDoc(subtotal, discount, taxable, cgst, sgst, grand, advPct, shipping);
}

// ─── SYNC PROPOSAL DOCUMENT ──────────────────────────────────────
function syncDoc(subtotal, discount, taxable, cgst, sgst, grand, advPct, shipping) {
  const clientName    = document.getElementById('clientName').value;
  const clientLoc     = document.getElementById('clientLocation').value;
  const contactPerson = document.getElementById('contactPerson').value;
  const quoteRef      = document.getElementById('quoteRef').value;
  const bdmName       = document.getElementById('bdmName').value;
  const rooms         = document.getElementById('roomCount').value;
  const bathrooms     = document.getElementById('bathroomCount').value;
  const wards         = document.getElementById('wardCount').value;

  // Cover
  setText('cvrClient', clientName);
  setText('cvrRef',    quoteRef);
  setText('cvrValid',  getValidDate());

  // Quotation page
  setText('qDocRef',       quoteRef);
  setText('qDocRef2',      quoteRef);
  setText('qDocDate',      new Date().toLocaleDateString('en-IN', {day:'2-digit',month:'short',year:'numeric'}));
  setText('qDocValid',     getValidDate());
  setText('qClientName',   clientName);
  setText('qClientLoc',    clientLoc);
  setText('qContactPerson',contactPerson);
  setText('qBdmName',      bdmName);
  setText('qFacility',     `${rooms} Rooms · ${bathrooms} Bathrooms · ${wards} Wards/Stations`);
  setText('qSigClient',    clientName);

  // Build BOQ rows in document
  const tbody = document.getElementById('qBomBody');
  if (tbody) {
    tbody.innerHTML = '';
    let sr = 1;
    let lastGroup = null;
    bom.forEach(item => {
      if (item.qty === 0) return;
      if (item.group !== lastGroup) {
        lastGroup = item.group;
        const gtr = document.createElement('tr');
        gtr.className = 'grp-row';
        gtr.innerHTML = `<td colspan="6">${item.group}</td>`;
        tbody.appendChild(gtr);
      }
      const amt = item.qty * item.rate;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="text-align:center">${sr++}</td>
        <td>${item.code}</td>
        <td><strong>${item.name}</strong><br><small>${item.desc}</small></td>
        <td style="text-align:center">${item.qty}</td>
        <td style="text-align:right">${fmt(item.rate)}</td>
        <td style="text-align:right">${fmt(amt)}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Totals
  setText('qSub',      '₹' + fmt(subtotal));
  setText('qShipping', '₹' + fmt(shipping));
  setText('qCGST',     '₹' + fmt(cgst));
  setText('qSGST',     '₹' + fmt(sgst));
  setText('qGT',       '₹' + fmt(grand));

  const qDiscRow = document.getElementById('qDiscRow');
  if (qDiscRow) {
    qDiscRow.style.display = discount > 0 ? '' : 'none';
    setText('qDisc', '-₹' + fmt(discount));
  }

  // Payment milestones
  const advAmt  = grand * advPct / 100;
  const postAmt = grand - advAmt;
  setText('qAdvPct',  advPct + '%');
  setText('qPostPct', (100 - advPct) + '%');
  setText('qAdvAmt',  '₹' + fmt(advAmt));
  setText('qPostAmt', '₹' + fmt(postAmt));
}

// ─── HELPERS ─────────────────────────────────────────────────────
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}
function fmt(n) {
  return Number(n).toLocaleString('en-IN', {minimumFractionDigits:2, maximumFractionDigits:2});
}
function getValidDate() {
  const days = parseInt(document.getElementById('validityDays').value) || 30;
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'});
}
function fillDocDates() {
  const today = new Date().toLocaleDateString('en-IN', {day:'2-digit',month:'short',year:'numeric'});
  setText('qDocDate',  today);
  setText('qDocValid', getValidDate());
}

// ─── MODAL & PRINT ───────────────────────────────────────────────
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
  // Open modal first so the document is visible in DOM
  const mb = document.getElementById('modalBg');
  mb.classList.add('open');
  mb.scrollTop = 0;
  setTimeout(() => window.print(), 600);
}

// ─── RESET ───────────────────────────────────────────────────────
function resetQuote() {
  bom = CATALOGUE.map((item, i) => ({ ...item, qty: DEFAULT_QTY[i] }));
  document.getElementById('clientName').value      = 'Nims hospital tvm';
  document.getElementById('clientLocation').value  = 'Trivandrum, Kerala';
  document.getElementById('contactPerson').value   = 'Medical Director / BioMed Team';
  document.getElementById('quoteRef').value        = 'SAL-QTN-2024-00478';
  document.getElementById('bdmName').value         = 'Genxiot Sales Team';
  document.getElementById('discType').value        = 'none';
  document.getElementById('discVal').value         = '0';
  document.getElementById('shipping').value        = '3500';
  document.getElementById('advPct').value          = '50';
  document.getElementById('roomCount').value       = '134';
  document.getElementById('bathroomCount').value   = '99';
  document.getElementById('wardCount').value       = '8';
  renderBOM();
  recalc();
  calcEstimator();
}

// ─── INIT EVENTS ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Close modal when clicking backdrop
  document.getElementById('modalBg').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
  });
  // Preset dropdown
  document.getElementById('presetBtn').addEventListener('click', function(e) {
    e.stopPropagation();
    document.getElementById('presetDrop').classList.toggle('open');
  });
  document.addEventListener('click', function() {
    document.getElementById('presetDrop').classList.remove('open');
  });
});
