/* ═══════════════════════════════════════════════════════════════
   GENXIOT ALAMO PROPOSAL – app.js  v3.0
   
   ╔══════════════════════════════════════════════════════════════╗
   ║              QUOTATION LOGIC – COMPLETE EXPLANATION         ║
   ╠══════════════════════════════════════════════════════════════╣
   ║                                                              ║
   ║  BEDS (patient beds)                                         ║
   ║    → Each BED = 1 Call Point (room type) + 1 Pendant         ║
   ║    → A room may have 1, 2, 4, 6… beds                        ║
   ║                                                              ║
   ║  ROOMS (physical patient rooms)                              ║
   ║    → Each ROOM = 1 Door Light (outside room door)            ║
   ║    → Rooms < Beds when multi-bed rooms exist                 ║
   ║                                                              ║
   ║  BATHROOMS (independent washroom units)                      ║
   ║    → Each BATHROOM = 1 Call Point (bathroom type)            ║
   ║                     + 1 Pull Cord (connected to it via RJ11)  ║
   ║    → Bathroom call point is a SEPARATE independent LoRa unit  ║
   ║    → NOT shared with the room's call point                   ║
   ║                                                              ║
   ║  WARDS / NURSING STATIONS                                    ║
   ║    → Each WARD = 1 LoRa Gateway + 1 NS Display               ║
   ║                                                              ║
   ║  SAMPLE: SAL-QTN-2024-00478 (Nims Hospital, Trivandrum)     ║
   ║    Beds: 134  → 134 CP (room) + 134 Pendants                 ║
   ║    Rooms: 39  → 39 Door Lights                               ║
   ║    Bathrooms: 99  → 99 CP (bathroom) + 99 Pull Cords         ║
   ║    Wards: 8   → 8 Gateways + 8 NS Displays                  ║
   ╚══════════════════════════════════════════════════════════════╝ */

// ─── MASTER ITEM CATALOGUE ───────────────────────────────────────
// Rates verified directly against SAL-QTN-2024-00478 (the real Evelabs quote
// in this repo — see qtn_extracted.txt) and cross-checked against both
// Genxiot_Alamo_Quote_Calculator.xlsx and Genxiot_Alamo_Quote_Calculator_2026.xlsx.
// These are EVELABS BASE COST (ex-factory), not a confirmed Genxiot resale price.
// Use "Apply Margin %" in the Financial Summary card to move from cost to a
// customer-facing sell price — do not silently hardcode a markup here.
const CATALOGUE = [
  // ── BED-DRIVEN (1 per BED) ─────────────────────────────────
  {
    code:  'ALAMO-CP-R',
    name:  'Alamo Call Point – Patient Room',
    desc:  'A1 Call Point: Call, Cancel, Acknowledge & Housekeeping. 2× RJ11 accessory ports. LoRa wireless, AA battery operated. 1 unit per patient bed.',
    group: 'Bed Components (1 per Bed)',
    rate:  2000,
    img:   'qtn_embed_p5_img0.jpeg',
    driverKey: 'beds'
  },
  {
    code:  'ALAMO-CP-PM3',
    name:  'Call Point Panel Mount 3 module',
    desc:  'Fully Assembled Panel Mount Call Point (Alternative to standard bedside point).',
    group: 'Bed Components (1 per Bed)',
    rate:  2400,
    img:   'qtn_embed_p5_img0.jpeg',
    driverKey: 'beds'
  },
  {
    code:  'ALAMO-PD',
    name:  'Pendant Button M1 / Single Switch Pendant',
    desc:  'Patient-side coil-cord call switch. Connects via RJ11 to the room call point. Placed within patient reach at the bed. 1 unit per bed.',
    group: 'Bed Components (1 per Bed)',
    rate:  450,
    img:   'qtn_embed_p5_img0.jpeg',
    driverKey: 'beds'
  },
  {
    code:  'ALAMO-PS',
    name:  'Pendant Stand',
    desc:  'Wall/bedside mounting stand for the Pendant Button. Includes screws and fisher plug for assembly. 1 unit per bed.',
    group: 'Bed Components (1 per Bed)',
    rate:  100,
    img:   'qtn_embed_p5_img0.jpeg',
    driverKey: 'beds'
  },

  // ── ROOM-DRIVEN (1 per ROOM) ────────────────────────────────
  {
    code:  'ALAMO-DL',
    name:  'Room Light (Call Light V2 / Door Indicator)',
    desc:  'LED corridor indicator light. Placed outside room door. Wirelessly paired with room call points – illuminates on any call from that room. 1 unit per room.',
    group: 'Room Components (1 per Room)',
    rate:  2300,
    img:   'qtn_embed_p5_img0.jpeg',
    driverKey: 'rooms'
  },

  // ── BATHROOM-DRIVEN (1 per BATHROOM) ───────────────────────
  {
    code:  'ALAMO-CP-B',
    name:  'Alamo Call Point – Bathroom/Washroom',
    desc:  'Dedicated bathroom call point (same base unit as the room call point). Independent LoRa unit – separate from room call points. AA battery operated. 1 unit per bathroom.',
    group: 'Bathroom Components (1 per Bathroom)',
    rate:  2000,
    img:   'qtn_embed_p5_img0.jpeg',
    driverKey: 'bathrooms'
  },
  {
    code:  'ALAMO-PL',
    name:  'Pull Cord Accessory',
    desc:  'Washroom pull cord connected to the bathroom call point via RJ11. Allows patient to call from floor level or any position – critical for fall emergencies. 1 per bathroom.',
    group: 'Bathroom Components (1 per Bathroom)',
    rate:  400,
    img:   'qtn_embed_p5_img0.jpeg',
    driverKey: 'bathrooms'
  },

  // ── WARD-DRIVEN (1 per WARD/NURSING STATION) ────────────────
  {
    code:  'ALAMO-GW',
    name:  'LoRa Gateway / Central Receiver',
    desc:  'Receives all LoRa RF transmissions from call points within its zone. Forwards data to NS display, mobile apps, and cloud. Typically 1 per ward/floor nursing station.',
    group: 'Infrastructure & Network',
    rate:  8500,
    img:   'qtn_embed_p6_img0.jpeg',
    driverKey: 'wards'
  },
  {
    code:  'ALAMO-NS',
    name:  'Nursing Station Display (32" Android panel)',
    desc:  'Pre-configured Android display running the Alamo Monitor software. Real-time live view of all call points in the ward. Audio-visual alerts. 1 unit per nursing station.',
    group: 'Infrastructure & Network',
    rate:  12500,
    img:   'qtn_embed_p6_img0.jpeg',
    driverKey: 'wards'
  },
  {
    code:  'ALAMO-MINI-NS',
    name:  'Alamo Mini Station Tetris V2',
    desc:  'Mini Station V2 with Announcement, 6 call Display. Wall Mountable.',
    group: 'Infrastructure & Network',
    rate:  12000,
    img:   'qtn_embed_p6_img0.jpeg',
    driverKey: 'wards'
  },
  {
    code:  'ALAMO-RPT',
    name:  'Repeater V2 (Signal Range Extender)',
    desc:  'Extends LoRa range for large or multi-block facilities. Qty auto-estimated at ~1.5× ward count.',
    group: 'Infrastructure & Network',
    rate:  2500,
    img:   'qtn_embed_p6_img0.jpeg',
    driverKey: 'repeaters'
  },

  // ── FIXED (per hospital) ─────────────────────────────────────
  {
    code:  'ALAMO-VISION',
    name:  'Alamo Vision – Annual App License',
    desc:  'Cloud analytics: escalation alerts, peak-time reports, nursing manager dashboard.',
    group: 'Software & Services',
    rate:  0,
    img:   'qtn_embed_p6_img0.jpeg',
    driverKey: 'fixed'
  },
  {
    code:  'ALAMO-MANAGER',
    name:  'Alamo Manager Software',
    desc:  'Call Points administration software to install, manage and reconfigure call points and lights.',
    group: 'Software & Services',
    rate:  0,
    img:   'qtn_embed_p6_img0.jpeg',
    driverKey: 'fixed'
  },
  {
    code:  'ALAMO-TRAIN',
    name:  'Installation, Configuration & Training',
    desc:  'On-site installation, LoRa network calibration, staff training, go-live support.',
    group: 'Software & Services',
    rate:  0,
    img:   'qtn_embed_p6_img0.jpeg',
    driverKey: 'fixed'
  },
  {
    code:  'RCEL-250M',
    name:  'RCEL 250 M',
    desc:  'RCEL 250 M component as specified in the proposal.',
    group: 'Fixed Components',
    rate:  2900,
    img:   'qtn_embed_p6_img0.jpeg',
    driverKey: 'fixed'
  },
  {
    code:  'DRIPO-MONITOR',
    name:  'Dripo Infusion Monitor',
    desc:  'Fully Packed Dripo Infusion Monitor.',
    group: 'Fixed Components',
    rate:  4000,
    img:   'qtn_embed_p6_img0.jpeg',
    driverKey: 'fixed'
  }
];

// Default quantities matching SAL-QTN-2024-00478 (Nims Hospital) — 15 items now,
// 134 CP-R, 0 CP-PM3, 134 PD, 134 PS, 39 DL, 99 CP-B, 99 PL, 8 GW, 8 NS, 0 NS-MINI, 12 RPT, 0 VISION, 0 MANAGER, 0 TRAIN, 0 RCEL, 0 DRIPO.
const NIMS_QTY = [134, 0, 134, 134, 39, 99, 99, 8, 8, 0, 12, 0, 0, 0, 0, 0];

// ─── STATE ───────────────────────────────────────────────────────
let bom = CATALOGUE.map((item, i) => ({ ...item, qty: NIMS_QTY[i], baseRate: item.rate }));

// ─── INIT ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderBOM();
  recalc();
  calcEstimator();
  fillDocDates();
});

// ─── RENDER BOM TABLE (web calculator) ──────────────────────────
function renderBOM() {
  const tbody = document.getElementById('bomBody');
  tbody.innerHTML = '';
  let lastGroup = null;

  bom.forEach((item, idx) => {
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
        ${item.code === 'CUSTOM' ? `
          <input type="text" value="${item.name}" oninput="updateName(${idx}, this.value)" placeholder="Item Name" style="width:100%; font-weight:600; font-size:.82rem; margin-bottom:2px; border:1px solid #ccc; padding:2px 4px; border-radius:3px;">
          <input type="text" value="${item.desc}" oninput="updateDesc(${idx}, this.value)" placeholder="Description" style="width:100%; font-size:.7rem; color:var(--muted); border:1px solid #ccc; padding:2px 4px; border-radius:3px;">
        ` : `
          <div class="prod-name">${item.name}</div>
          <div class="prod-sub">${item.code} &nbsp;·&nbsp; ${item.desc}</div>
        `}
      </td>
      <td>
        <input type="number" value="${item.qty}" min="0"
          data-idx="${idx}" oninput="updateQty(${idx}, this.value)">
      </td>
      <td>
        <input type="number" value="${item.rate}" min="0"
          data-idx="${idx}" oninput="updateRate(${idx}, this.value)">
      </td>
      <td class="amount-cell" id="amt-${idx}">₹${fmt(amount)}</td>
      <td>
        <button class="del-btn" onclick="removeItem(${idx})" title="Remove item">
          <i data-lucide="trash-2" size="14"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  if (window.lucide) lucide.createIcons();
  recalc();
}

function updateQty(idx, val) {
  bom[idx].qty = Math.max(0, parseInt(val) || 0);
  const el = document.getElementById('amt-' + idx);
  if (el) el.textContent = '₹' + fmt(bom[idx].qty * bom[idx].rate);
  recalc();
}
function updateRate(idx, val) {
  const newVal = Math.max(0, parseFloat(val) || 0);
  bom[idx].rate = newVal;
  bom[idx].baseRate = newVal;
  const el = document.getElementById('amt-' + idx);
  if (el) el.textContent = '₹' + fmt(bom[idx].qty * bom[idx].rate);
  recalc();
}
function updateName(idx, val) {
  bom[idx].name = val;
  recalc();
}
function updateDesc(idx, val) {
  bom[idx].desc = val;
  recalc();
}
function removeItem(idx) {
  bom.splice(idx, 1);
  renderBOM();
}
function addCustomItem() {
  bom.push({
    code: 'CUSTOM', name: 'Custom Item', desc: 'Edit description',
    group: 'Custom', rate: 0, baseRate: 0, qty: 1, img: '', driverKey: 'fixed'
  });
  renderBOM();
}

// ─── PRESETS ─────────────────────────────────────────────────────
function loadPreset(preset) {
  document.getElementById('presetDrop').classList.remove('open');

  const presets = {
    small: {
      beds:30, rooms:15, bathrooms:18, wards:2,
      client:'Small Clinic / Nursing Home', loc:'Kerala'
    },
    medium: {
      beds:134, rooms:39, bathrooms:99, wards:8,
      client:'Nims hospital tvm', loc:'Trivandrum, Kerala'
    },
    large: {
      beds:250, rooms:80, bathrooms:180, wards:15,
      client:'Super-Specialty Hospital', loc:'PAN India'
    }
  };

  const p = presets[preset];
  if (!p) return;

  document.getElementById('bedCount').value      = p.beds;
  document.getElementById('roomCount').value     = p.rooms;
  document.getElementById('bathroomCount').value = p.bathrooms;
  document.getElementById('wardCount').value     = p.wards;
  document.getElementById('clientName').value    = p.client;
  document.getElementById('clientLocation').value = p.loc;

  applyFacility(p.beds, p.rooms, p.bathrooms, p.wards);
  // Presets represent a typical NEW deal (unlike Reset, which is an exact
  // replica of the historical Nims quote) — include software licence & install/training.
  bom.forEach(item => {
    if (item.code === 'ALAMO-VISION' || item.code === 'ALAMO-TRAIN') item.qty = 1;
  });
  renderBOM();
  calcEstimator();
}

// ─── ESTIMATOR ───────────────────────────────────────────────────
function calcEstimator() {
  const beds      = parseInt(document.getElementById('bedCount').value)      || 0;
  const rooms     = parseInt(document.getElementById('roomCount').value)     || 0;
  const bathrooms = parseInt(document.getElementById('bathroomCount').value) || 0;
  const wards     = parseInt(document.getElementById('wardCount').value)     || 0;
  const repeaters = Math.ceil(wards * 1.5);

  // Display calculated quantities
  setText('estBeds',        beds);
  setText('estPendants',    beds);
  setText('estPendantStand',beds);
  setText('estRooms',       rooms);
  setText('estBathCPs',     bathrooms);
  setText('estPullCords',   bathrooms);
  setText('estGateways',    wards);
  setText('estNS',          wards);
  setText('estRepeaters',   repeaters);

  // Summary totals
  setText('estTotalCPs',    beds + bathrooms);
  setText('estTotalUnits',  beds + bathrooms + rooms + (wards * 2) + repeaters);
}

function applyEstimator() {
  const beds      = parseInt(document.getElementById('bedCount').value)      || 0;
  const rooms     = parseInt(document.getElementById('roomCount').value)     || 0;
  const bathrooms = parseInt(document.getElementById('bathroomCount').value) || 0;
  const wards     = parseInt(document.getElementById('wardCount').value)     || 0;
  applyFacility(beds, rooms, bathrooms, wards);
}

function applyFacility(beds, rooms, bathrooms, wards) {
  bom.forEach(item => {
    if (item.driverKey === 'beds')      item.qty = beds;
    if (item.driverKey === 'rooms')     item.qty = rooms;
    if (item.driverKey === 'bathrooms') item.qty = bathrooms;
    if (item.driverKey === 'wards')     item.qty = wards;
    if (item.driverKey === 'repeaters') item.qty = Math.ceil(wards * 1.5);
    // 'fixed' items keep their qty unchanged
  });
  renderBOM();
}

// ─── MARGIN TOOL ─────────────────────────────────────────────────
// Catalogue rates are Evelabs BASE COST. This multiplies every current
// rate by (1 + pct/100) in one shot so the BOM shows a real sell price
// instead of silently-hardcoded numbers. Re-apply with pct=0 effect by
// using Reset (which restores verified base cost) if you need to start over.
function applyMargin() {
  const pct = parseFloat(document.getElementById('marginPct').value) || 0;
  bom.forEach(item => {
    item.rate = Math.round(item.baseRate * (1 + pct / 100));
  });
  renderBOM();
}

// ─── FINANCIAL CALCULATION ───────────────────────────────────────
// CORRECT GST LOGIC:
//   1. Calculate subtotal (sum of all line items, ex-GST)
//   2. Apply discount on subtotal
//   3. Add shipping
//   4. Taxable value = (subtotal - discount) + shipping
//   5. CGST = taxable × 9%
//   6. SGST = taxable × 9%
//   7. Grand Total = taxable + CGST + SGST

function recalc() {
  const subtotal = bom.reduce((sum, item) => sum + (item.qty * item.rate), 0);

  const discType = document.getElementById('discType').value;
  const discVal  = parseFloat(document.getElementById('discVal').value) || 0;
  const shipping = parseFloat(document.getElementById('shipping').value) || 0;
  const advPct   = parseFloat(document.getElementById('advPct').value)   || 50;

  let discount = 0;
  if (discType === 'pct')  discount = subtotal * (discVal / 100);
  if (discType === 'flat') discount = Math.min(discVal, subtotal); // can't exceed subtotal

  const afterDiscount = subtotal - discount;
  const taxableValue  = afterDiscount + shipping;
  const cgst          = taxableValue * 0.09;
  const sgst          = taxableValue * 0.09;
  const grandTotal    = taxableValue + cgst + sgst;

  // Update web UI
  setText('calcSub',    '₹' + fmt(subtotal));
  setText('calcTax',    '₹' + fmt(taxableValue));
  setText('calcCGST',   '₹' + fmt(cgst));
  setText('calcSGST',   '₹' + fmt(sgst));
  setText('calcGT',     '₹' + fmt(grandTotal));
  setText('stickyTotal','₹' + fmt(grandTotal));

  const discRow = document.getElementById('discRow');
  if (discRow) {
    if (discount > 0) {
      discRow.style.display = 'flex';
      setText('calcDisc', '−₹' + fmt(discount));
    } else {
      discRow.style.display = 'none';
    }
  }

  const postPct = document.getElementById('postPct');
  if (postPct) postPct.value = Math.round(100 - advPct) + '%';

  syncDoc(subtotal, discount, afterDiscount, taxableValue, cgst, sgst, grandTotal, advPct, shipping);
}

// ─── SYNC PROPOSAL DOCUMENT ──────────────────────────────────────
function syncDoc(subtotal, discount, afterDiscount, taxable, cgst, sgst, grand, advPct, shipping) {
  const clientName    = (document.getElementById('clientName')?.value)    || '';
  const clientLoc     = (document.getElementById('clientLocation')?.value) || '';
  const contactPerson = (document.getElementById('contactPerson')?.value)  || '';
  const quoteRef      = (document.getElementById('quoteRef')?.value)      || '';
  const bdmName       = (document.getElementById('bdmName')?.value)       || '';
  const beds          = (document.getElementById('bedCount')?.value)      || 0;
  const rooms         = (document.getElementById('roomCount')?.value)     || 0;
  const bathrooms     = (document.getElementById('bathroomCount')?.value) || 0;
  const wards         = (document.getElementById('wardCount')?.value)     || 0;

  const delivery      = (document.getElementById('delivery')?.value)      || '';
  const warranty      = (document.getElementById('warranty')?.value)      || '';
  const scopeNotes    = (document.getElementById('scopeNotes')?.value)    || '';

  // Cover page
  setText('cvrClient', clientName);
  setText('cvrRef',    quoteRef);
  setText('cvrValid',  getValidDate());

  // Quotation page header
  setText('qDocRef',        quoteRef);
  setText('qDocRef2',       quoteRef);
  setText('qDocDate',       todayStr());
  setText('qDocValid',      getValidDate());
  setText('qClientName',    clientName);
  setText('qClientLoc',     clientLoc);
  setText('qContactPerson', contactPerson);
  setText('qBdmName',       bdmName);
  setText('qFacility',
    `${beds} Beds · ${rooms} Rooms · ${bathrooms} Bathrooms · ${wards} Wards/Stations`);
  setText('qSigClient', clientName);

  // BOQ rows in proposal document
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
      const tr  = document.createElement('tr');
      tr.innerHTML = `
        <td style="text-align:center;color:#999">${sr++}</td>
        <td style="font-size:.7rem;color:var(--brand-indigo)">${item.code}</td>
        <td>
          <strong style="font-size:.78rem">${item.name}</strong>
          <div style="font-size:.68rem;color:#888;margin-top:2px">${item.desc}</div>
        </td>
        <td style="text-align:center;font-weight:600">${item.qty}</td>
        <td style="text-align:right">${fmt(item.rate)}</td>
        <td style="text-align:right;font-weight:600">${fmt(amt)}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Totals in proposal
  setText('qSub',      '₹' + fmt(subtotal));
  setText('qShipping', '₹' + fmt(shipping));
  setText('qCGST',     '₹' + fmt(cgst));
  setText('qSGST',     '₹' + fmt(sgst));
  setText('qGT',       '₹' + fmt(grand));

  const qDiscRow = document.getElementById('qDiscRow');
  if (qDiscRow) {
    qDiscRow.style.display = discount > 0 ? '' : 'none';
    setText('qDisc', '−₹' + fmt(discount));
  }

  // Payment milestones
  const advAmt  = grand * advPct / 100;
  const postAmt = grand - advAmt;
  setText('qAdvPct',  advPct + '%');
  setText('qPostPct', Math.round(100 - advPct) + '%');
  setText('qAdvAmt',  '₹' + fmt(advAmt));
  setText('qPostAmt', '₹' + fmt(postAmt));

  // T&C Updates
  setText('qDelivery', delivery);
  setText('qWarranty', warranty);
  setText('qScope',    scopeNotes);
}

// ─── HELPERS ─────────────────────────────────────────────────────
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}
function fmt(n) {
  return Number(n).toLocaleString('en-IN', {
    minimumFractionDigits:  2,
    maximumFractionDigits:  2
  });
}
function todayStr() {
  return new Date().toLocaleDateString('en-IN', {
    day:'2-digit', month:'short', year:'numeric'
  });
}
function getValidDate() {
  const days = parseInt(document.getElementById('validityDays')?.value) || 30;
  const d    = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'});
}
function fillDocDates() {
  setText('qDocDate',  todayStr());
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
  document.getElementById('modalBg').classList.add('open');
  setTimeout(() => window.print(), 600);
}

// ─── RESET ───────────────────────────────────────────────────────
function resetQuote() {
  bom = CATALOGUE.map((item, i) => ({ ...item, qty: NIMS_QTY[i], baseRate: item.rate }));
  document.getElementById('clientName').value      = 'Nims hospital tvm';
  document.getElementById('clientLocation').value  = 'Trivandrum, Kerala';
  document.getElementById('contactPerson').value   = 'Medical Director / BioMed Team';
  document.getElementById('quoteRef').value        = 'SAL-QTN-2024-00478';
  document.getElementById('bdmName').value         = 'Genxiot Sales Team';
  document.getElementById('discType').value        = 'none';
  document.getElementById('discVal').value         = '0';
  document.getElementById('shipping').value        = '3500';
  document.getElementById('advPct').value          = '50';
  document.getElementById('bedCount').value        = '134';
  document.getElementById('roomCount').value       = '39';
  document.getElementById('bathroomCount').value   = '99';
  document.getElementById('wardCount').value       = '8';
  const marginEl = document.getElementById('marginPct');
  if (marginEl) marginEl.value = '0';
  renderBOM();
  calcEstimator();
}

// ─── EVENT LISTENERS ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Close modal on backdrop click
  document.getElementById('modalBg').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
  });
  // Preset dropdown toggle
  document.getElementById('presetBtn').addEventListener('click', function(e) {
    e.stopPropagation();
    document.getElementById('presetDrop').classList.toggle('open');
  });
  document.addEventListener('click', () => {
    document.getElementById('presetDrop').classList.remove('open');
  });
});
