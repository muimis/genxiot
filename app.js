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

// ─── CUSTOMER LIST ───────────────────────────────────────────────
const PRESTIGIOUS_CLIENTS = [
  "INHS Sanjeevani Kochi", "Baby Memorial Kozhikode & Kannur", "Nanavati Max Mumbai", 
  "Fortis Mulund Mumbai", "Majestic Hospital Hyderabad", "Babasaheb Gawde Charitable Hospital", 
  "Shanthi Memorial Hospital", "Thrikkakara Municipal Co-operative Hospital", "BAPS Shastriji Maharaj Hospital Baroda", 
  "Nirmala Medical Centre", "Fatima Mission Hospital Wayand", "Urja Maternity Hospital", 
  "Ashiti Clinic", "Aditya Medical Center Thanjavur", "Anupama Hospital Hyderabad", 
  "Anil Neerukonda Hospital", "Sudheendra Medical Mission", "Nattathi Nadar Hospital Theni", 
  "Paduva Hospital", "Providence Hospital Alappuzha", "CGH Earth Ayurveda", 
  "Sree Mahalakshmi Diatone Institute", "Platinum Hospital Nashik", "Aurindam Hospital Mumbai",
  "Motiben Dalvi Hospital Mumbai", "Indo Us Hospital Hyderabad", "Mahavir Hospital Surat", 
  "Lilavati Hospital Mumbai", "Tata Memorial Hospital Mumbai", "Aseezia Medical College Kollam", 
  "Almas Hospital Kottakkal", "Kerala Medical College Palakkad", "Kokilaben Hospital", 
  "Amala Trissur Kerala", "Travancore Medicity Kollam", "Cosmo Hospital Trivandrum", 
  "Muthoot Hospital", "Medical Trust Cochin", "Bewell Hospital Chennai / Pondy", 
  "Kauvery Hospital Chennai", "Global Hospitals Mumbai", "BCMCH Thiruvalla", 
  "Narayana Hrudayalaya Kolkata", "KR Hospital Coimbatore", "HCG Eko Cancer Center Kolkata", 
  "Aurum Living Gurgoan", "Femicity Hospital Hyderabad"
];

// ─── MASTER ITEM CATALOGUE ───────────────────────────────────────
// Rates verified directly against SAL-QTN-2024-00478 (the real Evelabs quote
// in this repo — see qtn_extracted.txt) and cross-checked against both
// Genxiot_Alamo_Quote_Calculator.xlsx and Genxiot_Alamo_Quote_Calculator_2026.xlsx.
// These are EVELABS BASE COST (ex-factory), not a confirmed Genxiot resale price.
// Use "Apply Margin %" in the Financial Summary card to move from cost to a
// customer-facing sell price — do not silently hardcode a markup here.
const CATALOGUE = [
  // ── BED-DRIVEN ─────────────────────────────────
  {
    code:  'ALAMO-CP-R',
    name:  'Alamo Call Point – Patient Room',
    desc:  'Patient call point with Call, Service, Cancel and Acknowledge buttons. This module also has 2 RJ11 ports to connect accessories and a power port to connect an adapter if needed. Include screws for assembly',
    group: 'Bed Components',
    rate:  2000,
    img:   'qtn_embed_p5_img0.jpeg',
    driverKey: 'beds'
  },
  {
    code:  'ALAMO-PD-S',
    name:  'Alamo | Pendant Button',
    desc:  'Patient side single-switch call accessories that can be connected to the main call point. Includes product stand and screws for assembly',
    group: 'Bed Components',
    rate:  600,
    img:   'qtn_embed_p5_img0.jpeg',
    driverKey: 'pendants_single'
  },
  {
    code:  'ALAMO-PD-D',
    name:  'Alamo | Double Button Pendant',
    desc:  'Patient side double-switch call accessories that can be connected to the main call point. Includes product stand and screws for assembly',
    group: 'Bed Components',
    rate:  950,
    img:   'qtn_embed_p5_img0.jpeg',
    driverKey: 'pendants_double'
  },
  // ── ROOM-DRIVEN ────────────────────────────────
  {
    code:  'ALAMO-DL',
    name:  'Alamo | Call light V2 (Door Indicator)',
    desc:  'LED corridor indicator light (Alamo Call light V2). Placed outside room door. Illuminates on any call from that room.',
    group: 'Room Components',
    rate:  2400,
    img:   'qtn_embed_p5_img0.jpeg',
    driverKey: 'rooms'
  },
  // ── BATHROOM-DRIVEN ───────────────────────
  {
    code:  'ALAMO-CP-B',
    name:  'Alamo | Bathroom Call Point',
    desc:  'Dedicated bathroom call point (Call, Cancel, Acknowledge). Independent LoRa unit.',
    group: 'Washroom Components',
    rate:  2000,
    img:   'qtn_embed_p5_img0.jpeg',
    driverKey: 'bathrooms'
  },
  {
    code:  'ALAMO-PL',
    name:  'Alamo | Pullcord',
    desc:  'Pull Cord accessory that can be connected to a call point for use in washrooms for ease of access. Include screws for assembly',
    group: 'Washroom Components',
    rate:  600,
    img:   'qtn_embed_p5_img0.jpeg',
    driverKey: 'bathrooms'
  },
  // ── WARD-DRIVEN ────────────────────────────────
  {
    code:  'ALAMO-NS-BASIC',
    name:  'Alamo Mini Station Tetris V2',
    desc:  'Mini Station V2 with Announcement, 6 call Display. Wall Mountable. Includes built-in LoRa gateway.',
    group: 'Nursing Station',
    rate:  13000,
    img:   'qtn_embed_p6_img0.jpeg',
    driverKey: 'ns_basic'
  },
  {
    code:  'ALAMO-NS-TV',
    name:  'Nursing Station Display (32" Android panel)',
    desc:  'Pre-configured 32" Android display running the Alamo Monitor software. Real-time live view of all call points in the ward. Audio-visual alerts.',
    group: 'Nursing Station',
    rate:  12000,
    img:   'qtn_embed_p6_img0.jpeg',
    driverKey: 'ns_tv'
  },
  {
    code:  'ALAMO-GW',
    name:  'Evegate Lora Gateway',
    desc:  'Gateway receives messages from the call points and shares the data to other devices. It can be a mobile phone, tablets, android tv or cloud server.',
    group: 'Infrastructure & Network',
    rate:  10000,
    img:   'qtn_embed_p6_img0.jpeg',
    driverKey: 'gateways'
  },
  {
    code:  'ALAMO-RPT',
    name:  '|REPEATER V2|',
    desc:  'Extends LoRa signal range. Includes B type charger, product stand and screws for assembly',
    group: 'Infrastructure & Network',
    rate:  2500,
    img:   'qtn_embed_p6_img0.jpeg',
    driverKey: 'repeaters'
  },
  // ── FIXED ─────────────────────────────────────
  {
    code:  'ALAMO-DATALOG',
    name:  'Alamo Additional Data Logging & Analytics',
    desc:  'Automated logging of all key data, nurse presence, response times, and emailed reports.',
    group: 'Software & Services',
    rate:  3000,
    img:   'qtn_embed_p6_img0.jpeg',
    driverKey: 'datalog'
  }
];

// Default quantities (11 items)
const NIMS_QTY = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

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
      beds:30, rooms:15, bathrooms:18, floors:1, nsBasic:1, nsTv:0, dataLog: false, pendant: 'single',
      client:'Small Clinic / Nursing Home', loc:'Kerala'
    },
    medium: {
      beds:134, rooms:39, bathrooms:99, floors:3, nsBasic:0, nsTv:8, dataLog: false, pendant: 'single',
      client:'Nims hospital tvm', loc:'Trivandrum, Kerala'
    },
    large: {
      beds:250, rooms:80, bathrooms:180, floors:6, nsBasic:5, nsTv:10, dataLog: true, pendant: 'double',
      client:'Super-Specialty Hospital', loc:'PAN India'
    },
    ref50: {
      beds:50, rooms:25, bathrooms:50, floors:1, nsBasic:0, nsTv:2, dataLog: true, pendant: 'single',
      client:'50-Bed Reference Hospital', loc:'Reference Configuration'
    }
  };

  const p = presets[preset];
  if (!p) return;

  document.getElementById('bedCount').value      = p.beds;
  document.getElementById('roomCount').value     = p.rooms;
  document.getElementById('bathroomCount').value = p.bathrooms;
  document.getElementById('floorCount').value    = p.floors || 1;
  document.getElementById('nsBasicCount').value  = p.nsBasic || 0;
  document.getElementById('nsTvCount').value     = p.nsTv || 0;
  document.getElementById('dataLogging').checked = p.dataLog || false;
  document.getElementById('pendantType').value   = p.pendant || 'single';
  document.getElementById('clientName').value    = p.client;
  document.getElementById('clientLocation').value = p.loc;
  
  const beds      = parseInt(document.getElementById('bedCount').value)      || 0;
  const rooms     = parseInt(document.getElementById('roomCount').value)     || 0;
  const bathrooms = parseInt(document.getElementById('bathroomCount').value) || 0;
  const floors    = parseInt(document.getElementById('floorCount').value)    || 1;
  const nsBasic   = parseInt(document.getElementById('nsBasicCount').value)  || 0;
  const nsTv      = parseInt(document.getElementById('nsTvCount').value)     || 0;
  const dataLog   = document.getElementById('dataLogging').checked ? 1 : 0;
  const pendantType = document.getElementById('pendantType').value || 'single';

  applyFacility(beds, rooms, bathrooms, floors, nsBasic, nsTv, dataLog, pendantType);
}

// ─── INIT API ───────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  // Set date
  document.getElementById('quoteDate').valueAsDate = new Date();
  // Fetch QTN
  fetch('/api/next-qtn')
    .then(r => r.json())
    .then(data => {
      document.getElementById('quoteRef').value = data.qtn;
      recalc();
    })
    .catch(e => console.error("Error fetching next QTN, server might not be running"));
});

// ─── SAVE / LOAD QUOTES ──────────────────────────────────────────
function saveQuote() {
  const quoteData = {
    qtn: document.getElementById('quoteRef').value,
    date: document.getElementById('quoteDate').value,
    hospital: document.getElementById('clientName').value,
    location: document.getElementById('clientLocation').value,
    contact: document.getElementById('contactPerson').value,
    validity: document.getElementById('validityDays').value,
    beds: document.getElementById('bedCount').value,
    rooms: document.getElementById('roomCount').value,
    bathrooms: document.getElementById('bathroomCount').value,
    floors: document.getElementById('floorCount').value,
    nsBasic: document.getElementById('nsBasicCount').value,
    nsTv: document.getElementById('nsTvCount').value,
    pendantType: document.getElementById('pendantType').value,
    dataLogging: document.getElementById('dataLogging').checked,
    bom: bom
  };

  fetch('/api/quotes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(quoteData)
  }).then(() => {
    alert("Quote Saved Successfully to quotes.json!");
  }).catch(e => {
    alert("Error saving quote. Is the server running?");
  });
}

function loadQuotesModal() {
  fetch('/api/quotes')
    .then(r => r.json())
    .then(data => {
      let msg = "Saved Quotes:\n\n";
      data.forEach((q, i) => {
        msg += `${i+1}. ${q.qtn} - ${q.hospital} (${q.date})\n`;
      });
      msg += "\nCheck quotes.json for full data. Loading logic via UI can be fully built out here!";
      alert(msg);
    })
    .catch(e => {
      alert("Error loading quotes. Is the server running?");
    });
}

// ─── ESTIMATOR ───────────────────────────────────────────────────
function calcEstimator() {
  const beds      = parseInt(document.getElementById('bedCount').value)      || 0;
  const rooms     = parseInt(document.getElementById('roomCount').value)     || 0;
  const bathrooms = parseInt(document.getElementById('bathroomCount').value) || 0;
  const floors    = parseInt(document.getElementById('floorCount').value)    || 1;
  const nsBasic   = parseInt(document.getElementById('nsBasicCount').value)  || 0;
  const nsTv      = parseInt(document.getElementById('nsTvCount').value)     || 0;
  const dataLog   = document.getElementById('dataLogging').checked ? 1 : 0;
  const pendantType = document.getElementById('pendantType').value || 'none';
  
  applyFacility(beds, rooms, bathrooms, floors, nsBasic, nsTv, dataLog, pendantType);
}

function applyFacility(beds, rooms, bathrooms, floors, nsBasic, nsTv, dataLog, pendantType) {
  let gateways = nsTv;
  if (dataLog > 0) gateways += 1;
  let totalWards = nsBasic + nsTv;
  // Dynamic repeater logic: average of 1.5 repeaters per (ward + floor impact)
  let repeaters = Math.ceil((totalWards * 1.5) + (floors * 0.5));

  bom.forEach(item => {
    if (item.driverKey === 'beds') item.qty = beds;
    if (item.driverKey === 'rooms') item.qty = rooms;
    if (item.driverKey === 'bathrooms') item.qty = bathrooms;
    if (item.driverKey === 'repeaters') item.qty = repeaters;
    if (item.driverKey === 'pendants_single') item.qty = (pendantType === 'single') ? beds : 0;
    if (item.driverKey === 'pendants_double') item.qty = (pendantType === 'double') ? beds : 0;
    if (item.driverKey === 'ns_basic') item.qty = nsBasic;
    if (item.driverKey === 'ns_tv') item.qty = nsTv;
    if (item.driverKey === 'gateways') item.qty = gateways;
    if (item.driverKey === 'datalog') item.qty = dataLog;
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
  const discVal  = Math.max(0, parseFloat(document.getElementById('discVal').value) || 0);
  const shipping = Math.max(0, parseFloat(document.getElementById('shipping').value) || 0);
  const advPct   = Math.max(0, Math.min(100, parseFloat(document.getElementById('advPct').value) || 50));

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

function printQuoteOnly() {
  recalc();
  document.body.classList.add('print-quote-only');
  document.getElementById('modalBg').classList.add('open');
  setTimeout(() => {
    window.print();
    setTimeout(() => {
      document.body.classList.remove('print-quote-only');
    }, 1000);
  }, 600);
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

// ─── EXPORT TO CSV (EXCEL) ───────────────────────────────────────
function exportCSV() {
  const clientName = document.getElementById('clientName')?.value || 'Client';
  let csv = 'Genxiot Quotation - Bill of Quantities\n\n';
  csv += 'Item Code,Name,Description,Quantity,Unit Rate (INR),Total Amount (INR)\n';

  let subtotal = 0;
  bom.forEach(item => {
    if (item.qty === 0) return;
    const amt = item.qty * item.rate;
    subtotal += amt;
    // Escape quotes properly for CSV
    const escName = `"${(item.name || '').replace(/"/g, '""')}"`;
    const escDesc = `"${(item.desc || '').replace(/"/g, '""')}"`;
    csv += `${item.code},${escName},${escDesc},${item.qty},${item.rate},${amt}\n`;
  });

  const discType = document.getElementById('discType').value;
  const discVal  = Math.max(0, parseFloat(document.getElementById('discVal').value) || 0);
  const shipping = Math.max(0, parseFloat(document.getElementById('shipping').value) || 0);

  let discount = 0;
  if (discType === 'pct') discount = subtotal * (discVal / 100);
  if (discType === 'flat') discount = Math.min(discVal, subtotal);

  const taxable = subtotal - discount + shipping;
  const cgst = taxable * 0.09;
  const sgst = taxable * 0.09;
  const grand = taxable + cgst + sgst;

  csv += '\n,,,,,';
  csv += `\nSubtotal,,,,,${subtotal}`;
  if (discount > 0) csv += `\nDiscount,,,,, -${discount}`;
  if (shipping > 0) csv += `\nShipping,,,,, ${shipping}`;
  csv += `\nTaxable Value,,,,,${taxable}`;
  csv += `\nCGST (9%),,,,,${cgst}`;
  csv += `\nSGST (9%),,,,,${sgst}`;
  csv += `\nGrand Total,,,,,${grand}`;

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Genxiot_BOQ_${clientName.replace(/\\s+/g, '_')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

