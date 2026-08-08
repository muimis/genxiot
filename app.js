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
  "BAPS Shastriji Maharaj Hospital, Baroda",
  "Nirmala Medical Centre",
  "Fatima Mission Hospital, Wayand",
  "Mahavir Hospital, Surat",
  "Nanavati Max - Mumbai",
  "Lilavati Hospital - Mumbai",
  "Fortis Mulund Mumbai",
  "Tata Memorial Hospital, Mumbai",
  "Aseezia Medical College, Kollam",
  "Almas Hospital, Kottakkal",
  "Kerala Medical College, Palakkad",
  "Kokilaben Hospital",
  "Amala, Trissur, Kerala",
  "Travancore Medicity, Kollam",
  "Cosmo Hospital Trivandrum",
  "Muthoot Hospital",
  "Medical Trust, Cochin",
  "Bewell Hospital, Chennai /Pondy",
  "Kauvery Hospital, Chennai",
  "INHS Sanjeevani Kochi",
  "Global Hospitals, Mumbai",
  "BCMCH, Thiruvalla",
  "BMH Kozhikode & Kannur",
  "Majestic Hospital, Hyderabad",
  "Babasaheb Gawde Charitable hospital",
  "Shanthi Memorial Hospital",
  "Thrikkakara Municipal Co-operative Hospital",
  "Urja Maternity Hospital",
  "Ashiti Clinic",
  "Aditya Medical Center, Thanjavur",
  "Anupama Hospital, Hyderabad",
  "Anil neerukonda Hospital",
  "Sudheendra Medical Missiom",
  "Nattathi Nadar Hospital, Theni",
  "Paduva Hospital",
  "Providence Hospital, Alappuzha",
  "CGH Earth Ayurveda",
  "Sree Mahalakshmi Diatone Institute",
  "Platinum Hospital, Nashik",
  "Aurindam Hospital, Mumbai",
  "Motiben Dalvi Hospital, Mumbai",
  "Indo Us Hospital, Hyderabad",
  "Narayana Hrudayalaya Kolkata",
  "KR Hospital Coimbatore",
  "HCG Eko Cancer Center Kolkata",
  "Aurum Living, Gurgoan",
  "Femicity Hospital, Hyderabad"
];



// ─── MASTER ITEM CATALOGUE ───────────────────────────────────────
// Rates verified against latest pricing structure (Annexure A).
// Now using MRP as the base selling price with Landing Price as the minimum bound.
const CATALOGUE = [
  // ── BED-DRIVEN ─────────────────────────────────
  {
    code:  'ALAMO-CP-R',
    name:  'Call Point Service and Nurse Call',
    desc:  'Call Point with Lora Transmitter for each bedside or washroom. Included one function for call Nurse, Housepeeking, Presence and Cancel Calls. Wall Mountable with two 1/2 inch screws',
    group: 'Bed Components',
    mrp:   2400,
    landingPrice: 1600,
    rate:  2400,
    img:   '',
    driverKey: 'beds'
  },
  {
    code:  'ALAMO-PD-S',
    name:  'Pendant Single Switch (Accessory)',
    desc:  'Single Switch Pendant Button',
    group: 'Bed Components',
    mrp:   600,
    landingPrice: 400,
    rate:  600,
    img:   '',
    driverKey: 'pendants_single'
  },
  {
    code:  'ALAMO-PD-D',
    name:  'Alamo Double Button Pendant (HSN: 85311090)',
    desc:  'Patient side double-switch call accessories that can be connected to the main call point.',
    group: 'Bed Components',
    mrp:   950,
    landingPrice: 650, // estimated based on single pendant
    rate:  950,
    img:   '',
    driverKey: 'pendants_double'
  },
  {
    code:  'ALAMO-CB-ACC',
    name:  'Code Blue Accessory (HSN: 85311090)',
    desc:  'Accessory for generating Code Blue calls',
    group: 'Bed Components',
    mrp:   900,
    landingPrice: 600,
    rate:  900,
    img:   '',
    driverKey: 'fixed' // Can be added manually
  },
  // ── ROOM-DRIVEN ────────────────────────────────
  {
    code:  'ALAMO-DL',
    name:  'Alamo Call light V2 (Door Indicator) (HSN: 85311090)',
    desc:  'Door Indicator. Does not include Legrand back box. Requires Legrand two-module box and 220V supply',
    group: 'Room Components',
    mrp:   2600,
    landingPrice: 2200,
    rate:  2600,
    img:   '',
    driverKey: 'rooms'
  },
  {
    code:  'ALAMO-M2-TX',
    name:  'Alamo M2 Transmitter Module (HSN: 85311090)',
    desc:  'Base transmitter module for bathroom or room modules. Requires mounting in Legrand back box (two-module box not included)',
    group: 'Room Components',
    mrp:   3200,
    landingPrice: 2200,
    rate:  3200,
    img:   '',
    driverKey: 'fixed'
  },
  {
    code:  'ALAMO-M2-BTN',
    name:  'Alamo M2 Button Module (HSN: 85311090)',
    desc:  'Two-button or single-button module for call system. Can be paired with transmitter module. Multiple buttons can be loop connected to one transmitter',
    group: 'Room Components',
    mrp:   1200,
    landingPrice: 800,
    rate:  1200,
    img:   '',
    driverKey: 'fixed'
  },
  // ── BATHROOM-DRIVEN ───────────────────────
  {
    code:  'ALAMO-CP-B',
    name:  'Alamo Washroom Call Point (HSN: 85311090)',
    desc:  'Dedicated washroom call point. Independent LoRa unit.',
    group: 'Washroom Components',
    mrp:   2400,
    landingPrice: 1600,
    rate:  2400,
    img:   '',
    driverKey: 'bathrooms'
  },
  {
    code:  'ALAMO-PL',
    name:  'Alamo Pullcord (HSN: 85311090)',
    desc:  'Pull Cord accessory for connecting to call point in washroom',
    group: 'Washroom Components',
    mrp:   600,
    landingPrice: 400,
    rate:  600,
    img:   '',
    driverKey: 'bathrooms'
  },
  // ── WARD-DRIVEN ────────────────────────────────
  {
    code:  'ALAMO-NS-BASIC',
    name:  'Pixel Matrix Display (HSN: 85311090)',
    desc:  'Pixel Matrix Display for Nursing Station Alerts. Works with Android app for adding call buttons. Can work without gateway.',
    group: 'Nursing Station',
    mrp:   12000,
    landingPrice: 10000,
    rate:  12000,
    img:   '',
    driverKey: 'ns_basic'
  },
  {
    code:  'ALAMO-NS-TV',
    name:  '32 inch bluetooth smart TV',
    desc:  'Pre-configured 32" Android display running the Alamo Monitor software. Real-time live view of all call points in the ward. Audio-visual alerts.',
    group: 'Nursing Station',
    mrp:   12000,
    landingPrice: 12000, // Kept same as rate for legacy items
    rate:  12000,
    img:   '',
    driverKey: 'ns_tv'
  },
  {
    code:  'ALAMO-GW',
    name:  'Gateway (Network Device)',
    desc:  'Includes B type charger,product stand and screws for assembly',
    group: 'Infrastructure & Network',
    mrp:   12000,
    landingPrice: 8000,
    rate:  12000,
    img:   '',
    driverKey: 'gateways'
  },
  {
    code:  'ALAMO-RPT',
    name:  'Repeater ( Networking Device )',
    desc:  'Includes B type charger, product stand and screws for assembly. Installed in between main receiver/ display rooms. Need 220V supply Plug Point',
    group: 'Infrastructure & Network',
    mrp:   4000,
    landingPrice: 2500,
    rate:  4000,
    img:   '',
    driverKey: 'repeaters'
  },
  // ── SOFTWARE / FIXED ─────────────────────────────────────
  {
    code:  'ALAMO-CLOUD-SW',
    name:  'Cloud Software (SAC: 9983)',
    desc:  'Cloud software for Escalation, Reporting and Code Blue Alerts (₹15000 per nursing station for 3 years)',
    group: 'Software & Services',
    mrp:   15000,
    landingPrice: 9000,
    rate:  15000,
    img:   '',
    driverKey: 'datalog' // Tied to datalog checkbox
  }
];

// ─── STATE ───────────────────────────────────────────────────────
let bom = CATALOGUE.map((item, i) => ({ ...item, qty: 0, baseRate: item.mrp || item.rate, rate: item.mrp || item.rate }));

// ─── INIT ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderBOM();
    renderFloors();
  calcEstimator();
  recalc();
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
        <input type="number" value="${item.rate}" min="${item.landingPrice || 0}" max="${item.mrp || 999999}"
          data-idx="${idx}" onchange="updateRate(${idx}, this.value)">
        ${(item.landingPrice && item.rate) ? `
        <div style="font-size: 0.65rem; color: ${item.rate > item.landingPrice ? 'var(--brand-indigo)' : 'var(--brand-red)'}; margin-top: 4px;">
          Margin: ₹${fmt(Math.max(0, item.rate - item.landingPrice))} (${Math.round((Math.max(0, item.rate - item.landingPrice) / item.rate) * 100) || 0}%)
        </div>` : ''}
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
  let newVal = Math.max(0, parseFloat(val) || 0);
  const item = bom[idx];
  
  if (item.landingPrice && newVal < item.landingPrice) {
    newVal = item.landingPrice;
  }
  if (item.mrp && newVal > item.mrp) {
    newVal = item.mrp;
  }
  
  item.rate = newVal;
  item.baseRate = newVal;
  
  renderBOM();
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
    code: 'CUSTOM', name:  'Custom Item (HSN: 85311090)', desc: 'Edit description',
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

  // Set up floors dynamically
    floors = [];
    const numFloors = p.floors || 1;
    const bedsPerFloor = Math.floor(p.beds / numFloors);
    const roomsPerFloor = Math.floor(p.rooms / numFloors);
    const bathsPerFloor = Math.floor(p.bathrooms / numFloors);
    
    const nsTot = (p.nsBasic || 0) + (p.nsTv || 0);
    const nsPerFloor = Math.floor(nsTot / numFloors);
    for (let i = 0; i < numFloors; i++) {
        floors.push({
            name:  `Floor ${i + 1}`,
            beds:  bedsPerFloor  + (i === 0 ? p.beds      % numFloors : 0),
            rooms: roomsPerFloor + (i === 0 ? p.rooms     % numFloors : 0),
            baths: bathsPerFloor + (i === 0 ? p.bathrooms % numFloors : 0),
            ns:    nsPerFloor    + (i === 0 ? nsTot       % numFloors : 0)
        });
    }
    renderFloors();
  document.getElementById('clientName').value    = p.client;
  document.getElementById('clientLocation').value = p.loc;
  calcEstimator();
    if(document.getElementById('chkSinglePendant')) document.getElementById('chkSinglePendant').checked = (p.pendant !== 'double');
  if(document.getElementById('chkDoublePendant')) document.getElementById('chkDoublePendant').checked = (p.pendant === 'double');
  if(document.getElementById('chkNsBasic')) document.getElementById('chkNsBasic').checked = (p.nsBasic > 0);
  if(document.getElementById('chkNsTv')) document.getElementById('chkNsTv').checked = (p.nsTv > 0);
  if(document.getElementById('chkDataLog')) document.getElementById('chkDataLog').checked = p.dataLog || false;
  calcEstimator();
}

// ─── INIT API ───────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const d = new Date();
  document.getElementById('quoteDate').valueAsDate = d;
  // Generate a local QTN ID immediately — no server call needed on load
  generateLocalQtn(d);
});

function generateLocalQtn(dateObj) {
  const d = dateObj || new Date();
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  const rand = Math.floor(Math.random() * 9000 + 1000); // 4-digit random
  document.getElementById('quoteRef').value = `GEN-ALA-${yyyy}${mm}${dd}-${rand}`;
}

// ─── SAVE / LOAD QUOTES ──────────────────────────────────────────
const API_URL = "https://script.google.com/macros/s/AKfycbydh0kfLEiWIYXpdd-jVmyVcDQ-edFZR1x111UF24ogYCi9j2Wsn8rPBNBWCAL4XO-guw/exec";

function saveQuote() {
  const qtn   = document.getElementById('quoteRef').value;
  const cName = document.getElementById('clientName').value;
  if (!cName.trim()) { alert('Please enter a Hospital Name before saving.'); return; }

  const btn = document.querySelector('button[onclick="saveQuote()"]');
  const orig = btn.innerHTML;
  btn.innerHTML = '<i data-lucide="loader" size="14"></i> <span>Saving…</span>';
  btn.disabled  = true;
  if (window.lucide) lucide.createIcons({ root: btn });

  // ── Collect all settings from the DOM ──────────────────────────────
  const settings = {
    discType:          document.getElementById('discType')?.value          || 'none',
    discVal:           document.getElementById('discVal')?.value           || '0',
    shipping:          document.getElementById('shipping')?.value          || '3500',
    advPct:            document.getElementById('advPct')?.value            || '50',
    delivery:          document.getElementById('delivery')?.value          || '',
    warranty:          document.getElementById('warranty')?.value          || '',
    scopeNotes:        document.getElementById('scopeNotes')?.value        || '',
    additionalDetails: document.getElementById('additionalDetails')?.value || '',
    poRef:             document.getElementById('poRef')?.value             || '',
    clientDistrict:    document.getElementById('clientDistrict')?.value    || '',
    clientState:       document.getElementById('clientState')?.value       || '',
    chkSinglePendant:  document.getElementById('chkSinglePendant')?.checked  || false,
    chkDoublePendant:  document.getElementById('chkDoublePendant')?.checked  || false,
    chkDoorLight:      document.getElementById('chkDoorLight')?.checked      || false,
    chkWashroom:       document.getElementById('chkWashroom')?.checked        || false,
    chkPullCord:       document.getElementById('chkPullCord')?.checked        || false,
    chkNsBasic:        document.getElementById('chkNsBasic')?.checked         || false,
    chkNsTv:           document.getElementById('chkNsTv')?.checked            || false,
    chkGateway:        document.getElementById('chkGateway')?.checked         || false,
    chkRepeater:       document.getElementById('chkRepeater')?.checked        || false,
    chkDataLog:        document.getElementById('chkDataLog')?.checked         || false,
    bankName:          document.getElementById('bankName')?.value            || '',
    bankAcc:           document.getElementById('bankAcc')?.value             || '',
    bankIfsc:          document.getElementById('bankIfsc')?.value            || '',
    clientGst:         document.getElementById('clientGst')?.value           || '',
    piRef:             document.getElementById('piRef')?.value               || ''
  };

  // ── Embed settings as first BOM entry (__SETTINGS__ meta item) ──────
  // This guarantees settings survive even if the GAS only stores bomData.
  const settingsMeta = {
    code: '__SETTINGS__', name:  'Document Settings (HSN: 85311090)', desc: JSON.stringify(settings),
    group: '__META__', qty: 0, rate: 0, _isSettings: true
  };
  const bomWithMeta = [settingsMeta, ...bom.filter(b => b.code !== '__SETTINGS__')];

  // ── Grand total as a clean number (no ₹ / commas) for dashboard ─────
  const gtText = document.getElementById('calcGT')?.textContent || '0';
  const gtNum  = parseFloat(gtText.replace(/[^0-9.]/g, '')) || 0;

  const dealData = {
    action: 'saveQuote',
    quoteRef:     qtn,
    clientName:   cName,
    location:     document.getElementById('clientLocation')?.value || '',
    totalAmount:  gtNum,            // plain number — parseable by dashboard
    contactPerson: document.getElementById('contactPerson')?.value || '',
    totalBeds:    floors.reduce((a, f) => a + (f.beds || 0), 0),
    floors:       floors,
    // Spread top-level copies for GAS columns (best effort)
    ...settings,
    bankDetails: { name: settings.bankName, acc: settings.bankAcc, ifsc: settings.bankIfsc },
    bomData:     bomWithMeta   // settings also embedded here as fallback
  };

  fetch(API_URL, { method: 'POST', body: JSON.stringify(dealData) })
    .then(r => r.json())
    .then(() => {
      btn.innerHTML = '<i data-lucide="check" size="14"></i> <span>Saved!</span>';
      if (window.lucide) lucide.createIcons({ root: btn });
      setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; if (window.lucide) lucide.createIcons({ root: btn }); }, 2500);
    })
    .catch(err => {
      console.error(err);
      btn.innerHTML = orig;
      btn.disabled  = false;
      if (window.lucide) lucide.createIcons({ root: btn });
      alert('Error saving to Google Sheet. Check your internet connection.');
    });
}

function deleteQuote() {
  const qtn = document.getElementById('quoteRef').value;
  if (!qtn || !qtn.trim()) { alert('No quote loaded to delete.'); return; }
  
  if (!confirm('Are you sure you want to permanently delete Quote "' + qtn + '"?')) return;

  const btn = document.querySelector('button[onclick="deleteQuote()"]');
  const orig = btn.innerHTML;
  btn.innerHTML = '<i data-lucide="loader" size="14"></i> <span>Deleting...</span>';
  btn.disabled = true;
  if (window.lucide) lucide.createIcons({ root: btn });

  fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: 'deleteQuote', quoteRef: qtn }) })
    .then(r => r.json())
    .then(data => {
      btn.innerHTML = orig;
      btn.disabled = false;
      if (window.lucide) lucide.createIcons({ root: btn });
      
      if (data.status === 'success') {
        alert('Quote deleted successfully.');
        document.getElementById('dashBtn').click(); // Go back to dashboard
      } else {
        alert(data.message || 'Error deleting quote.');
      }
    })
    .catch(err => {
      console.error(err);
      btn.innerHTML = orig;
      btn.disabled = false;
      if (window.lucide) lucide.createIcons({ root: btn });
      alert('Error deleting quote. Check your internet connection.');
    });
}

function loadQuotesModal() {
  const query = prompt('Enter Client Name or Quote Number to recall:');
  if (!query || !query.trim()) return;

  const btn  = document.querySelector('button[onclick="loadQuotesModal()"]');
  const orig = btn.innerHTML;
  btn.innerHTML = '<i data-lucide="loader" size="14"></i> Searching…';
  btn.disabled  = true;
  if (window.lucide) lucide.createIcons({ root: btn });

  fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: 'searchQuote', query: query.trim() }) })
    .then(r => r.json())
    .then(data => {
      btn.innerHTML = orig;
      btn.disabled  = false;
      if (window.lucide) lucide.createIcons({ root: btn });
      if (data.status === 'success' && data.data) {
        restoreQuote(data.data);
        alert('Quote "' + (data.data.quoteRef || query) + '" restored successfully!');
        showCalculator();
      } else {
        alert(data.message || 'Quote not found. Try a different name or QTN number.');
      }
    })
    .catch(err => {
      console.error(err);
      btn.innerHTML = orig;
      btn.disabled  = false;
      if (window.lucide) lucide.createIcons({ root: btn });
      alert('Error searching. Check your internet connection.');
    });
}

function restoreQuote(data) {
  // Use String() so zero-values ('0', 'none') are preserved, unlike v||''
  const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = (v !== undefined && v !== null) ? String(v) : ''; };
  const setChk = (id, v) => { const el = document.getElementById(id); if (el) el.checked = !!v; };

  // ── Extract embedded __SETTINGS__ from bomData (primary source) ────
  // This is the most reliable channel since bomData is always stored/retrieved.
  let embeddedSettings = null;
  if (data.bomData && Array.isArray(data.bomData) && data.bomData[0]?.code === '__SETTINGS__') {
    try { embeddedSettings = JSON.parse(data.bomData[0].desc || '{}'); } catch(e) {}
    data = { ...data, ...(embeddedSettings || {}), bomData: data.bomData.slice(1) };
  }

  // ── Client / Deal Info ─────────────────────────────────────────
  setVal('quoteRef',       data.quoteRef);
  setVal('quoteDate',      data.date ? data.date.split('T')[0] : '');
  setVal('clientName',     data.clientName);
  setVal('clientLocation', data.location);
  setVal('clientDistrict', data.clientDistrict);
  setVal('clientState',    data.clientState);
  setVal('contactPerson',  data.contactPerson);
  setVal('poRef',          data.poRef);
  setVal('clientGst',      data.clientGst || '');
  setVal('piRef',          data.piRef || '');

  // ── Checkboxes ─────────────────────────────────────────────────
  setChk('chkSinglePendant', data.chkSinglePendant !== undefined ? data.chkSinglePendant : true);
  setChk('chkDoublePendant', data.chkDoublePendant || false);
  setChk('chkDoorLight',     data.chkDoorLight     !== undefined ? data.chkDoorLight     : true);
  setChk('chkWashroom',      data.chkWashroom      !== undefined ? data.chkWashroom      : true);
  setChk('chkPullCord',      data.chkPullCord      !== undefined ? data.chkPullCord      : true);
  setChk('chkNsBasic',       data.chkNsBasic       !== undefined ? data.chkNsBasic       : true);
  setChk('chkNsTv',          data.chkNsTv          || false);
  setChk('chkGateway',       data.chkGateway       !== undefined ? data.chkGateway       : true);
  setChk('chkRepeater',      data.chkRepeater      !== undefined ? data.chkRepeater      : true);
  setChk('chkDataLog',       data.chkDataLog       || false);

  // ── Financial fields ───────────────────────────────────────────
  setVal('discType', data.discType || 'none');
  setVal('discVal',  data.discVal  !== undefined ? data.discVal  : '0');
  setVal('shipping', data.shipping !== undefined ? data.shipping : '3500');
  setVal('advPct',   data.advPct   !== undefined ? data.advPct   : '50');

  // ── Terms & Notes ──────────────────────────────────────────────
  if (data.delivery)          setVal('delivery',          data.delivery);
  if (data.warranty)          setVal('warranty',          data.warranty);
  if (data.scopeNotes)        setVal('scopeNotes',        data.scopeNotes);
  if (data.additionalDetails) setVal('additionalDetails', data.additionalDetails);

  // ── Bank details ───────────────────────────────────────────────
  const bd = data.bankDetails || {};
  if (bd.name || data.bankName)  setVal('bankName',  bd.name  || data.bankName);
  if (bd.acc  || data.bankAcc)   setVal('bankAcc',   bd.acc   || data.bankAcc);
  if (bd.ifsc || data.bankIfsc)  setVal('bankIfsc',  bd.ifsc  || data.bankIfsc);
  if (typeof updateBankDetails === 'function') updateBankDetails();

  // ── Floors & BOM ───────────────────────────────────────────────
  floors = (data.floors && Array.isArray(data.floors) && data.floors.length > 0)
    ? data.floors
    : [{ name:  'Floor 1', beds: 0, rooms: 0, baths: 0, ns: 0 }];
  renderFloors();

  // Restore BOM (already stripped of __SETTINGS__ entry above)
  if (data.bomData && Array.isArray(data.bomData) && data.bomData.length > 0) {
    bom = data.bomData.filter(b => b.code !== '__SETTINGS__').map(b => {
      const catItem = CATALOGUE.find(c => c.code === b.code);
      if (catItem) {
        b.name = catItem.name;
        b.desc = catItem.desc;
      }
      return b;
    });
    renderBOM();
  } else {
    calcEstimator();
  }

  recalc(); // Recompute totals with all restored financial fields
}

// ─── ESTIMATOR ───────────────────────────────────────────────────

let floors = [{name:  'Floor 1', beds: 0, rooms: 0, baths: 0, ns: 0}];

function renderFloors() {
  const container = document.getElementById('floorsContainer');
  if (!container) return;
  container.innerHTML = floors.map((f, i) => `
    <div style="border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; border-radius: 4px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <input type="text" value="${f.name}" oninput="updateFloor(${i}, 'name', this.value)" style="flex: 1; margin-right: 10px; font-weight: bold;">
        ${floors.length > 1 ? `<button onclick="removeFloor(${i})" style="background: #ff4d4d; color: white; border: none; border-radius: 4px; cursor: pointer; padding: 4px 8px;">X</button>` : ''}
      </div>
      <div class="row2">
        <div><label>Beds</label><input type="number" value="${f.beds}" min="0" oninput="updateFloor(${i}, 'beds', this.value)"></div>
        <div><label>Rooms</label><input type="number" value="${f.rooms}" min="0" oninput="updateFloor(${i}, 'rooms', this.value)"></div>
      </div>
      <div class="row2">
        <div><label>Washrooms</label><input type="number" value="${f.baths}" min="0" oninput="updateFloor(${i}, 'baths', this.value)"></div>
        <div><label>Nurse Stns</label><input type="number" value="${f.ns || 0}" min="0" oninput="updateFloor(${i}, 'ns', this.value)"></div>
      </div>
    </div>
  `).join('');
  calcEstimator();
}

function updateFloor(index, field, value) {
  if (field === 'name') floors[index][field] = value;
  else floors[index][field] = parseInt(value) || 0;
  calcEstimator();
}

function addFloor() {
  floors.push({name: `Floor ${floors.length + 1}`, beds: 0, rooms: 0, baths: 0, ns: 0});
  renderFloors();
}

function removeFloor(index) {
  floors.splice(index, 1);
  renderFloors();
}


function calcEstimator() {
  let beds = 0, rooms = 0, bathrooms = 0, nsTotal = 0;
  floors.forEach(f => {
    beds += f.beds || 0;
    rooms += f.rooms || 0;
    bathrooms += f.baths || 0;
    nsTotal += f.ns || 0;
  });

  const isChecked = (id) => document.getElementById(id)?.checked;
  
  let repeaters = 0;
  floors.forEach(f => {
    if (f.rooms > 0) repeaters += Math.ceil(f.rooms / 10) + 1;
  });
  
  bom.forEach((item, index) => {
    if (item.isLocked) return; // SKIP manually overridden items!
    
    if (item.driverKey === 'beds') item.qty = beds;
    else if (item.driverKey === 'rooms') item.qty = isChecked('chkDoorLight') ? rooms : 0;
    else if (item.driverKey === 'bathrooms') {
      if (item.code === 'ALAMO-PL') item.qty = isChecked('chkPullCord') ? bathrooms : 0;
      else item.qty = isChecked('chkWashroom') ? bathrooms : 0;
    }
    else if (item.driverKey === 'pendants_single') item.qty = isChecked('chkSinglePendant') ? beds : 0;
    else if (item.driverKey === 'pendants_double') item.qty = isChecked('chkDoublePendant') ? beds : 0;
    else if (item.driverKey === 'ns_basic') item.qty = isChecked('chkNsBasic') ? nsTotal : 0;
    else if (item.driverKey === 'ns_tv') item.qty = isChecked('chkNsTv') ? nsTotal : 0;
    else if (item.driverKey === 'gateways') {
      let gw = isChecked('chkGateway') ? (nsTotal > 0 ? nsTotal : 1) : 0;
      if (isChecked('chkDataLog')) gw += 1;
      item.qty = gw;
    }
    else if (item.driverKey === 'repeaters') item.qty = isChecked('chkRepeater') ? repeaters : 0;
    else if (item.driverKey === 'datalog') item.qty = isChecked('chkDataLog') ? 1 : 0;
  });
  
  renderBOM();
}

function updateQtyAndLock(index, newQty) {
  bom[index].qty = parseInt(newQty) || 0;
  bom[index].isLocked = true;
  renderBOM();
}

function unlockQty(index) {
  bom[index].isLocked = false;
  calcEstimator(); // Recalculate to restore auto value
}
function applyMargin() {
  const discountPct = parseFloat(document.getElementById('marginPct').value) || 0;
  bom.forEach(item => {
    if (item.code === 'CUSTOM') return;
    const mrp = item.mrp || item.rate;
    const lp = item.landingPrice || 0;
    
    let discountedRate = Math.round(mrp * (1 - discountPct / 100));
    
    if (discountedRate < lp) {
      discountedRate = lp;
    }
    if (discountedRate > mrp) {
      discountedRate = mrp;
    }
    item.rate = discountedRate;
    item.baseRate = discountedRate;
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
  if (postPct) postPct.value = Math.round(100 - advPct - 30) + '%';

  syncDoc(subtotal, discount, afterDiscount, taxableValue, cgst, sgst, grandTotal, advPct, shipping);
}




// ─── SYNC PROPOSAL DOCUMENT ──────────────────────────────────────
function syncDoc(subtotal, discount, afterDiscount, taxable, cgst, sgst, grand, advPct, shipping) {
  const clientName    = (document.getElementById('clientName')?.value)    || '';
  const clientLoc     = (document.getElementById('clientLocation')?.value) || '';
  const clientDist    = (document.getElementById('clientDistrict')?.value) || '';
  const clientState   = (document.getElementById('clientState')?.value) || '';
  const contactPerson = (document.getElementById('contactPerson')?.value)  || '';
  const quoteRef      = (document.getElementById('quoteRef')?.value)      || '';
  const bdmName       = (document.getElementById('qBdmName')?.innerText)       || 'Genxiot Sales Team';
  const beds          = floors.reduce((acc, f) => acc + parseInt(f.beds || 0), 0);
  const rooms         = floors.reduce((acc, f) => acc + parseInt(f.rooms || 0), 0);
  const washrooms     = floors.reduce((acc, f) => acc + parseInt(f.baths || 0), 0);
  const wards         = floors.reduce((acc, f) => acc + parseInt(f.ns || 0), 0) || (parseInt(document.getElementById('sysNsBasic')?.value) || 0) + (parseInt(document.getElementById('sysNsTv')?.value) || 0);

  const delivery      = (document.getElementById('delivery')?.value)      || '';
  const warranty      = (document.getElementById('warranty')?.value)      || '';
  const scopeNotes    = (document.getElementById('scopeNotes')?.value)    || '';
  const additionalDetails = (document.getElementById('additionalDetails')?.value) || '';
  const poRef         = (document.getElementById('poRef')?.value)         || '';
  const clientGst     = (document.getElementById('clientGst')?.value)     || '';

  // Cover page
  // Quotation page header
  const quoteDate = document.getElementById('quoteDate')?.value;
  setText('qDocRef',        quoteRef);
  setText('qDocRef2',       quoteRef);
  setText('qDocDate',       formatDate(quoteDate));
  setText('qDocValid',      getValidDate());
  setText('qClientName',    clientName);
  setText('qClientLoc',     clientLoc);
  setText('qClientDistrict',clientDist);
  setText('qClientState',   clientState);
  setText('qContactPerson', contactPerson);
  setText('qBdmName',       bdmName);
  
  const facilityParts = [];
  if (beds > 0) facilityParts.push(`${beds} Beds`);
  if (rooms > 0) facilityParts.push(`${rooms} Rooms`);
  if (washrooms > 0) facilityParts.push(`${washrooms} Washrooms`);
  if (wards > 0) facilityParts.push(`${wards} Nursing Stations`);
  setText('qFacility', facilityParts.join(' · '));

  // PO Reference row
  if (poRef.trim()) {
    setText('qPORef', poRef.trim());
    if (document.getElementById('qPORow')) document.getElementById('qPORow').style.display = '';
  } else {
    if (document.getElementById('qPORow')) document.getElementById('qPORow').style.display = 'none';
  }

  // Client GST row (only shown if GST is entered)
  const qClientGstRow = document.getElementById('qClientGstRow');
  if (qClientGstRow) {
    if (clientGst.trim()) {
      setText('qClientGst', clientGst.trim().toUpperCase());
      qClientGstRow.style.display = '';
    } else {
      qClientGstRow.style.display = 'none';
    }
  }

  let floorBreakupHtml = '';
  if (floors && floors.length > 0) {
    floors.forEach((f, i) => {
      let flName = f.name && f.name.trim() !== '' ? f.name : `Floor ${i+1}`;
      let parts = [];
      if ((f.beds || 0) > 0) parts.push(`${f.beds} Beds`);
      if ((f.rooms || 0) > 0) parts.push(`${f.rooms} Rooms`);
      if ((f.baths || 0) > 0) parts.push(`${f.baths} Washrooms`);
      if ((f.ns || 0) > 0) parts.push(`${f.ns} Nursing Stations`);
      
      if (parts.length > 0) {
        floorBreakupHtml += `<strong>${flName}:</strong> ${parts.join(', ')}<br>`;
      }
    });
  }
  const qFloorBreakup = document.getElementById('qFloorBreakup');
  if (qFloorBreakup) qFloorBreakup.innerHTML = floorBreakupHtml;

  const optionalCats = ['Bed Components', 'Room Components', 'Washroom Components'];
  const bomCodes = bom.filter(b => b.qty > 0).map(b => b.code);
  let optionalItems = CATALOGUE.filter(c => optionalCats.includes(c.group) && !bomCodes.includes(c.code));
  
  if (bomCodes.includes('ALAMO-NS-BASIC') && !bomCodes.includes('ALAMO-NS-TV')) {
    let tvItem = CATALOGUE.find(c => c.code === 'ALAMO-NS-TV');
    if (tvItem) {
      tvItem = { ...tvItem, desc: tvItem.desc + ' (Requires Evegate Lora Gateway @ ₹10,000/pc)' };
      optionalItems.push(tvItem);
    }
  }

  if (!bomCodes.includes('ALAMO-DATALOG')) {
    let dataLogItem = CATALOGUE.find(c => c.code === 'ALAMO-DATALOG');
    if (dataLogItem) {
      dataLogItem = { ...dataLogItem, desc: dataLogItem.desc + ' (Requires Evegate Lora Gateway @ ₹10,000/pc)' };
      optionalItems.push(dataLogItem);
    }
  }
  
  const qOptionalNote = document.getElementById('qOptionalNote');
  if (qOptionalNote) {
    if (optionalItems.length > 0) {
        let optHtml = `
          <div style="margin-top: 10px; padding: 10px; border: 1px dashed #aaa; border-radius: 6px; background: #fafafa; ">
            <h4 style="margin: 0 0 4px 0; font-size: 0.85rem; color: #444;">AVAILABLE OPTIONAL UPGRADES</h4>
            <p style="margin: 0 0 6px 0; font-size: 0.75rem; color: #666;">The following components are not included in the main Bill of Quantities above but can be added to your configuration or upgraded at anytime at the per-piece rates listed below:</p>
            <table style="width: 100%; border-collapse: collapse; font-size: 0.75rem; color: #555;">
        `;
        optionalItems.forEach(item => {
          const itemName = item.name.split(' (HSN:')[0];
          optHtml += `
            <tr>
              <td style="padding: 5px 8px 5px 0; border-bottom: 1px solid #eaeaea; font-weight: 600; vertical-align: top; width: 25%;">${itemName}</td>
              <td style="padding: 5px 8px; border-bottom: 1px solid #eaeaea; vertical-align: top;">${item.desc}</td>
              <td style="padding: 5px 0; border-bottom: 1px solid #eaeaea; font-weight: 600; vertical-align: top; text-align: right; color: var(--brand-navy); white-space: nowrap;">₹${fmt(item.rate)} / pc</td>
            </tr>
          `;
        });
        optHtml += `</table></div>`;
      qOptionalNote.innerHTML = optHtml;
    } else {
      qOptionalNote.innerHTML = '';
    }
  }
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
        <td style="text-align:center;color:#999;white-space:nowrap">${sr++}</td>
        <td style="white-space:nowrap;font-family:Consolas, 'Courier New', monospace;font-weight:400;font-size:.68rem;color:var(--brand-indigo);letter-spacing:0.02em">${item.code}</td>
        <td>
          <strong style="font-size:.78rem">${item.name}</strong>
          <div style="font-size:.68rem;color:#888;margin-top:2px">${item.desc}</div>
        </td>
        <td style="text-align:center;font-weight:600;white-space:nowrap">${item.qty}</td>
        <td style="text-align:right;white-space:nowrap">${fmt(item.rate)}</td>
        <td style="text-align:right;font-weight:600;white-space:nowrap">${fmt(amt)}</td>
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
  const advPctVal = parseFloat(advPct) || 50;
  const delPctVal = 30;
  const postPctVal = 100 - advPctVal - delPctVal;

  const advAmt  = grand * advPctVal / 100;
  const delAmt  = grand * delPctVal / 100;
  const postAmt = grand - advAmt - delAmt;

  setText('qAdvPct',  advPctVal + '%');
  setText('qDelPct',  delPctVal + '%');
  setText('qPostPct', postPctVal + '%');
  setText('qAdvAmt',  '₹' + fmt(advAmt));
  setText('qDelAmt',  '₹' + fmt(delAmt));
  setText('qPostAmt', '₹' + fmt(postAmt));

  // T&C Updates
  setText('qDelivery', delivery);
  setText('qWarranty', warranty);
  setText('qScope',    scopeNotes);

  // Additional Details
  const qAdditional    = document.getElementById('qAdditionalDetails');
  const qAdditionalTxt = document.getElementById('qAdditionalDetailsText');
  if (qAdditional && qAdditionalTxt) {
    if (additionalDetails.trim()) {
      qAdditionalTxt.textContent = additionalDetails;
      qAdditional.style.display = '';
    } else {
      qAdditional.style.display = 'none';
    }
  }

  // PO Ref (shown in proforma mode; stored for use)
  setText('qPORef',  poRef || '–');
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
function formatDate(dateStr) {
  if (!dateStr) return todayStr();
  const d = new Date(dateStr);
  if (isNaN(d)) return todayStr();
  return d.toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'});
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
function resetQuote(force = false) {
  if (!force && !confirm('Reset will clear all current data. Continue?')) return;

  bom = CATALOGUE.map(item => ({ ...item, qty: 0, baseRate: item.rate, isLocked: false }));

  const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
  const setChk = (id, v) => { const el = document.getElementById(id); if (el) el.checked = v; };

  // Client / deal info
  setVal('clientName',     '');
  setVal('clientLocation', '');
  setVal('clientDistrict', '');
  setVal('clientState',    '');
  setVal('contactPerson',  '');
  setVal('poRef',          '');
  setVal('clientGst',      '');
  setVal('piRef',          '');
  // Financial
  setVal('discType',  'none');
  setVal('discVal',   '0');
  setVal('shipping',  '3500');
  setVal('advPct',    '50');
  // Terms
  setVal('delivery',  '25 days from order confirmation & advance receipt');
  setVal('warranty',  '12 months comprehensive from installation date');
  setVal('scopeNotes','Wallmounting & electrical work by hospital. Configuration, calibration & go-live training by Genxiot.');
  setVal('additionalDetails', '');
  // Checkboxes
  setChk('chkSinglePendant', true);
  setChk('chkDoublePendant', false);
  setChk('chkDoorLight',  true);
  setChk('chkWashroom',   true);
  setChk('chkPullCord',   true);
  setChk('chkNsBasic',    true);
  setChk('chkNsTv',       false);
  setChk('chkGateway',    true);
  setChk('chkRepeater',   true);
  setChk('chkDataLog',    false);
  // Bank
  setVal('bankName',  'Genxiot LLP');
  setVal('bankAcc',   '0624073000000447');
  setVal('bankIfsc',  'SIBL0000624');
  updateBankDetails();

  floors = [{ name:  'Floor 1 (HSN: 85311090)', beds: 0, rooms: 0, baths: 0, ns: 0 }];
  renderFloors();
  generateLocalQtn();
  recalc();
}

// ─── EVENT LISTENERS ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Close modal on backdrop click
  document.getElementById('modalBg').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
  });
  // Preset dropdown toggle — guard: element may not exist on all pages
  const presetBtn = document.getElementById('presetBtn');
  if (presetBtn) {
    presetBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      document.getElementById('presetDrop').classList.toggle('open');
    });
  }
  document.addEventListener('click', () => {
    const drop = document.getElementById('presetDrop');
    if (drop) drop.classList.remove('open');
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
  link.setAttribute('download', `Genxiot_BOQ_${clientName.replace(/\s+/g, '_')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


// Bank Details Sync
function updateBankDetails() {
  const bName   = document.getElementById('bankName')?.value   || 'Genxiot LLP';
  const bAcc    = document.getElementById('bankAcc')?.value    || '0624073000000447';
  const bIfsc   = document.getElementById('bankIfsc')?.value   || 'SIBL0000624';
  
  if(document.getElementById('docBankName'))   document.getElementById('docBankName').textContent   = bName;
  if(document.getElementById('docBankAcc'))    document.getElementById('docBankAcc').textContent    = bAcc;
  if(document.getElementById('docBankIfsc'))   document.getElementById('docBankIfsc').textContent   = bIfsc;
}

// ==========================================================================
// MOBILE PWA TAB LOGIC
// ==========================================================================
function switchMobileTab(tab) {
  const setupPanel   = document.querySelector('.sidebar');
  const previewPanel = document.querySelector('.main-panel');
  const btns = document.querySelectorAll('.mobile-nav-btn');
  btns.forEach(b => b.classList.remove('active'));
  if (tab === 'setup') {
    if (setupPanel)   setupPanel.style.display   = '';
    if (previewPanel) previewPanel.style.display = 'none';
    if (btns[0]) btns[0].classList.add('active');
  } else {
    if (setupPanel)   setupPanel.style.display   = 'none';
    if (previewPanel) previewPanel.style.display = '';
    if (btns[1]) btns[1].classList.add('active');
  }
}


// On load, if mobile, ensure correct initial state
window.addEventListener('resize', () => {
  const sp = document.querySelector('.sidebar');
  const mp = document.querySelector('.main-panel');
  if (window.innerWidth > 900) {
    if (sp) sp.style.display = '';
    if (mp) mp.style.display = '';
  } else {
    const ab = document.querySelector('.mobile-nav-btn.active');
    switchMobileTab((ab && ab.textContent.includes('Preview')) ? 'preview' : 'setup');
  }
});

// ==========================================================================
// NATIVE PDF GENERATION (html2pdf)
// ==========================================================================
function downloadPDF() {
  const element = document.querySelector('.print-doc');
  const quoteRef = document.getElementById('quoteRef').value || 'Draft';
  const clientName = document.getElementById('clientName').value || 'Client';
  
  // Format filename cleanly
  const filename = `Genxiot_Quote_${clientName.replace(/\s+/g, '_')}_${quoteRef}.pdf`;

  // Provide user feedback
  const originalBtns = document.querySelectorAll('button[onclick="downloadPDF()"]');
  originalBtns.forEach(btn => {
    btn.innerHTML = `<i data-lucide="loader" size="18" class="spin"></i> Generating...`;
    btn.disabled = true;
  });

  const opt = {
    margin:       0.2, // Small margin
    filename:     filename,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true, logging: false },
    jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' },
    pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
  };

  html2pdf().set(opt).from(element).save().then(() => {
    // Reset buttons
    originalBtns.forEach(btn => {
      // Rebuild the appropriate button content based on desktop vs fab
      if (btn.classList.contains('fab')) {
        btn.innerHTML = `<i data-lucide="download" size="24"></i>`;
      } else {
        btn.innerHTML = `<i data-lucide="download" size="18"></i> Download PDF`;
      }
      btn.disabled = false;
    });
    // Re-initialize lucide icons for the dynamically injected HTML
    lucide.createIcons();
  });
}

// ==========================================================================
// DASHBOARD LOGIC (SPA)
// ==========================================================================
let pipelineChartInstance = null;

function showDashboard() {
  closeModal();
  document.getElementById('dashboardView').style.display = 'block';
  document.getElementById('calculatorView').style.display = 'none';
  document.body.classList.add('view-dashboard');
  fetchDashboardData();
}

function showCalculator() {
  closeModal();
  document.getElementById('dashboardView').style.display = 'none';
  document.getElementById('calculatorView').style.display = 'block';
  document.body.classList.remove('view-dashboard');
  
  const setupPanel   = document.querySelector('.sidebar');
  const previewPanel = document.querySelector('.main-panel');

  if (window.innerWidth > 900) {
    if (setupPanel)   setupPanel.style.display   = 'flex';
    if (previewPanel) previewPanel.style.display = 'flex';
  } else {
    switchMobileTab('setup');
  }
}

function createNewQuote() {
  closeModal();
  resetQuote(true);
  showCalculator();
}

function fetchDashboardData() {
  const webhookUrl = "https://script.google.com/macros/s/AKfycbydh0kfLEiWIYXpdd-jVmyVcDQ-edFZR1x111UF24ogYCi9j2Wsn8rPBNBWCAL4XO-guw/exec";
  
  fetch(webhookUrl, {
    method: 'POST',
    body: JSON.stringify({ action: 'getAllQuotes' })
  })
  .then(res => { return res.json(); })
  .then(data => {
    if(data.status === 'success') {
      renderDashboard(data.data);
    }
  })
  .catch(err => console.error("Error fetching dashboard data:", err));
}

function renderDashboard(quotes) {
  let totalVal = 0;
  let totalBeds = 0;
  
  const tbody = document.getElementById('dashTableBody');
  tbody.innerHTML = '';
  
  const clientValues = {};
  
  // Filter out blank rows and sort quotes by date descending
  const validQuotes = quotes.filter(q => q.quoteRef && q.quoteRef.trim() !== '');
  validQuotes.sort((a, b) => {
    const dA = a.date ? new Date(a.date).getTime() : 0;
    const dB = b.date ? new Date(b.date).getTime() : 0;
    return (dB || 0) - (dA || 0);
  });

  validQuotes.forEach((q, idx) => {
    const val = parseFloat(q.totalAmount) || 0;
    totalVal += val;
    totalBeds += parseInt(q.totalBeds) || 0;
    
    // Aggregating for chart
    if(!clientValues[q.clientName]) clientValues[q.clientName] = 0;
    clientValues[q.clientName] += val;
    
    // Table (show only top 10 recent)
    if (idx < 10) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${q.date ? q.date.split('T')[0] : ''}</td>
        <td>${q.quoteRef}</td>
        <td>${q.clientName}</td>
        <td>₹ ${val.toLocaleString('en-IN')}</td>
      `;
      tbody.appendChild(tr);
    }
  });
  
  // Update Cards
  document.getElementById('dashTotalValue').innerText = `₹ ${totalVal.toLocaleString('en-IN')}`;
  document.getElementById('dashTotalQuotes').innerText = quotes.length;
  document.getElementById('dashTotalBeds').innerText = totalBeds;
  
  // Draw Chart
  const ctx = document.getElementById('pipelineChart');
  if(!ctx) return;
  
  if (pipelineChartInstance) {
    pipelineChartInstance.destroy();
  }
  
  pipelineChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(clientValues),
      datasets: [{
        label: 'Deal Value (INR)',
        data: Object.values(clientValues),
        backgroundColor: '#00d084',
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

// On App Load, show dashboard by default
window.addEventListener('DOMContentLoaded', () => {
  // If the dashboard view exists, show it. Otherwise calc init will run.
  if (document.getElementById('dashboardView')) {
    showDashboard();
  }
});

// ─── PROFORMA INVOICE ────────────────────────────────────────────

/**
 * Generate a Proforma Invoice number in the format GEN-PI-YYYYMMDD-XXXX
 */
function generatePIRef(dateObj) {
  const d = dateObj || new Date();
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `GEN-PI-${yyyy}${mm}${dd}-${rand}`;
}

/**
 * Calculate due date: today + 7 days for proforma payment
 */
function getProformaDueDate() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Enter or exit proforma invoice mode on the printable document.
 * @param {boolean} on     - true = proforma mode, false = restore quotation mode
 * @param {string}  piRef  - Proforma Invoice number (only needed when on=true)
 * @param {string}  poRef  - PO Reference value (only needed when on=true)
 * @param {string}  dueDate - Payment due date string (only needed when on=true)
 */
function _applyProformaMode(on, piRef, poRef, dueDate) {
  const el = (id) => document.getElementById(id);

  if (on) {
    // ── Proforma Mode ON ──────────────────────────────────
    if (el('qDocTypeLabel')) el('qDocTypeLabel').textContent = 'PROFORMA INVOICE';
    if (el('qDocRef'))       el('qDocRef').textContent       = piRef || '';
    if (el('qValidRow'))     el('qValidRow').style.display   = 'none';
    if (el('qPORow'))        el('qPORow').style.display      = '';
    if (el('qDueDateRow'))   el('qDueDateRow').style.display = '';
    if (el('qProformaNote')) el('qProformaNote').style.display = '';
    if (el('qOptionalNote')) el('qOptionalNote').style.display = 'none';  // hide on PI
    if (el('qPORef'))        el('qPORef').textContent        = poRef  || '—';
    if (el('qDueDate'))      el('qDueDate').textContent      = dueDate || '';
    if (el('modalTitle'))    el('modalTitle').textContent    = 'Genxiot · Proforma Invoice Preview';
  } else {
    // ── Restore Quotation Mode ────────────────────────────
    if (el('qDocTypeLabel')) el('qDocTypeLabel').textContent = 'QUOTATION REF';
    if (el('qDocRef'))       el('qDocRef').textContent       = (el('quoteRef')?.value) || '';
    if (el('qValidRow'))     el('qValidRow').style.display   = '';
    if (el('qPORow'))        el('qPORow').style.display      = (document.getElementById('poRef')?.value || '').trim() ? '' : 'none';
    if (el('qDueDateRow'))   el('qDueDateRow').style.display = 'none';
    if (el('qProformaNote')) el('qProformaNote').style.display = 'none';
    if (el('qOptionalNote')) el('qOptionalNote').style.display = '';      // restore on exit
    if (el('modalTitle'))    el('modalTitle').textContent    = 'Genxiot · Executive Techno-Commercial Proposal Preview';
  }
}

/**
 * Print a Proforma Invoice.
 * Flow: sync UI → open modal → apply proforma fields → print → restore quotation mode
 */
function printProforma() {
  // Step 1: sync all fields into the document (quotation mode)
  recalc();

  let piRef = document.getElementById('piRef')?.value;
  if (!piRef) {
    piRef = generatePIRef();
    if (document.getElementById('piRef')) document.getElementById('piRef').value = piRef;
  }
  
  const poRef   = (document.getElementById('poRef')?.value || '').trim() || '—';
  const dueDate = getProformaDueDate();

  // Step 2: open the modal (same as Preview)
  const mb = document.getElementById('modalBg');
  if (mb) {
    mb.classList.add('open');
    mb.scrollTop = 0;
  }

  // Step 3: AFTER the modal renders, switch to proforma mode then print.
  //         We do this in a short timeout so the browser has rendered the modal
  //         and recalc's syncDoc has already finished its own synchronous work.
  setTimeout(() => {
    _applyProformaMode(true, piRef, poRef, dueDate);

    setTimeout(() => {
      window.print();

      // Step 4: After the print dialog is dismissed, restore quotation mode.
      setTimeout(() => {
        _applyProformaMode(false);
      }, 800);
    }, 400);
  }, 200);
}

