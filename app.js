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

  // Set up floors dynamically
    floors = [];
    const numFloors = p.floors || 1;
    const bedsPerFloor = Math.floor(p.beds / numFloors);
    const roomsPerFloor = Math.floor(p.rooms / numFloors);
    const bathsPerFloor = Math.floor(p.bathrooms / numFloors);
    
    for (let i = 0; i < numFloors; i++) {
        floors.push({
            name: `Floor ${i + 1}`,
            beds: bedsPerFloor + (i === 0 ? p.beds % numFloors : 0),
            rooms: roomsPerFloor + (i === 0 ? p.rooms % numFloors : 0),
            baths: bathsPerFloor + (i === 0 ? p.bathrooms % numFloors : 0)
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

  const dealData = {
    action: 'saveQuote',
    quoteRef: qtn,
    clientName: cName,
    location:  document.getElementById('clientLocation').value,
    totalAmount: document.getElementById('calcGT').textContent,
    contactPerson: document.getElementById('contactPerson').value,
    totalBeds: floors.reduce((a, f) => a + (f.beds || 0), 0),
    floors: floors,
    chkSinglePendant: document.getElementById('chkSinglePendant')?.checked || false,
    chkDoublePendant: document.getElementById('chkDoublePendant')?.checked || false,
    bankDetails: {
      name:   document.getElementById('bankName')?.value   || '',
      acc:    document.getElementById('bankAcc')?.value    || '',
      ifsc:   document.getElementById('bankIfsc')?.value   || '',
      branch: document.getElementById('bankBranch')?.value || ''
    },
    bomData: bom
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
  const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v || ''; };
  const setChk = (id, v) => { const el = document.getElementById(id); if (el) el.checked = !!v; };

  setVal('quoteRef',       data.quoteRef);
  setVal('quoteDate',      data.date ? data.date.split('T')[0] : '');
  setVal('clientName',     data.clientName);
  setVal('clientLocation', data.location);
  setVal('contactPerson',  data.contactPerson);

  // Pendant checkboxes
  setChk('chkSinglePendant', data.chkSinglePendant !== undefined ? data.chkSinglePendant : true);
  setChk('chkDoublePendant', data.chkDoublePendant || false);

  // Bank details (optional fields)
  if (data.bankDetails) {
    setVal('bankName',   data.bankDetails.name);
    setVal('bankAcc',    data.bankDetails.acc);
    setVal('bankIfsc',   data.bankDetails.ifsc);
    setVal('bankBranch', data.bankDetails.branch);
    if (typeof updateBankDetails === 'function') updateBankDetails();
  }

  floors = (data.floors && Array.isArray(data.floors) && data.floors.length > 0)
    ? data.floors
    : [{ name: 'Floor 1', beds: 0, rooms: 0, baths: 0, ns: 0 }];
  renderFloors();

  // Restore BOM exactly as saved — the isLocked flags will come back too
  if (data.bomData && Array.isArray(data.bomData) && data.bomData.length > 0) {
    bom = data.bomData;
    renderBOM();
  } else {
    calcEstimator(); // fallback: recalculate from floors
  }
  recalc();
}

// ─── ESTIMATOR ───────────────────────────────────────────────────

let floors = [{name: 'Floor 1', beds: 0, rooms: 0, baths: 0, ns: 0}];

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
    else if (item.driverKey === 'gateways') item.qty = isChecked('chkGateway') ? (nsTotal > 0 ? nsTotal : 1) : 0;
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
  const bdmName       = (document.getElementById('qBdmName')?.innerText)       || 'Genxiot Sales Team';
  const beds          = floors.reduce((acc, f) => acc + parseInt(f.beds || 0), 0);
  const rooms         = floors.reduce((acc, f) => acc + parseInt(f.rooms || 0), 0);
  const bathrooms     = floors.reduce((acc, f) => acc + parseInt(f.baths || 0), 0);
  const wards         = floors.reduce((acc, f) => acc + parseInt(f.ns || 0), 0) || (parseInt(document.getElementById('sysNsBasic')?.value) || 0) + (parseInt(document.getElementById('sysNsTv')?.value) || 0);

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
  if (!confirm('Reset will clear all current data. Continue?')) return;

  bom = CATALOGUE.map(item => ({ ...item, qty: 0, baseRate: item.rate, isLocked: false }));

  const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
  const setChk = (id, v) => { const el = document.getElementById(id); if (el) el.checked = v; };

  setVal('clientName',     '');
  setVal('clientLocation', '');
  setVal('contactPerson',  '');
  setVal('discType',       'none');
  setVal('discVal',        '0');
  setVal('shipping',       '3500');
  setVal('advPct',         '50');
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

  floors = [{ name: 'Floor 1', beds: 0, rooms: 0, baths: 0, ns: 0 }];
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


// Bank Details Sync
function updateBankDetails() {
  const bName = document.getElementById('bankName').value;
  const bAcc = document.getElementById('bankAcc').value;
  const bIfsc = document.getElementById('bankIfsc').value;
  const bBranch = document.getElementById('bankBranch').value;
  
  if(document.getElementById('docBankName')) document.getElementById('docBankName').innerText = bName;
  if(document.getElementById('docBankAcc')) document.getElementById('docBankAcc').innerText = bAcc;
  if(document.getElementById('docBankIfsc')) document.getElementById('docBankIfsc').innerText = bIfsc;
  if(document.getElementById('docBankBranch')) document.getElementById('docBankBranch').innerText = bBranch;
}

// ==========================================================================
// MOBILE PWA TAB LOGIC
// ==========================================================================
function switchMobileTab(tab) {
  const setupPanel = document.getElementById('setupPanel');
  const previewPanel = document.getElementById('previewPanel');
  const btns = document.querySelectorAll('.mobile-nav-btn');
  
  btns.forEach(b => b.classList.remove('active'));

  if (tab === 'setup') {
    if(setupPanel) setupPanel.style.display = 'block';
    if(previewPanel) previewPanel.style.display = 'none';
    btns[0].classList.add('active');
  } else if (tab === 'preview') {
    if(setupPanel) setupPanel.style.display = 'none';
    if(previewPanel) previewPanel.style.display = 'block';
    btns[1].classList.add('active');
  }
}

// On load, if mobile, ensure correct initial state
window.addEventListener('resize', () => {
  if (window.innerWidth > 900) {
    // Reset to desktop layout
    const setupPanel = document.getElementById('setupPanel');
    const previewPanel = document.getElementById('previewPanel');
    if(setupPanel) setupPanel.style.display = 'block';
    if(previewPanel) previewPanel.style.display = 'block';
  } else {
    // Re-apply active tab logic if resized to mobile
    const activeTab = document.querySelector('.mobile-nav-btn.active');
    if (activeTab) {
      if (activeTab.innerText.includes('Setup')) {
        switchMobileTab('setup');
      } else {
        switchMobileTab('preview');
      }
    } else {
      switchMobileTab('setup');
    }
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
  document.getElementById('dashboardView').style.display = 'block';
  document.getElementById('calculatorView').style.display = 'none';
  document.body.classList.add('view-dashboard');
  fetchDashboardData();
}

function showCalculator() {
  document.getElementById('dashboardView').style.display = 'none';
  document.getElementById('calculatorView').style.display = 'block';
  document.body.classList.remove('view-dashboard');
  
  // Always enforce setup tab on mobile heavily
  if(window.innerWidth <= 900) {
    setTimeout(() => {
        switchMobileTab('setup');
    }, 50);
  }
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
  
  // Sort quotes by date descending
  quotes.sort((a, b) => new Date(b.date) - new Date(a.date));

  quotes.forEach((q, idx) => {
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
  resetQuote();
  if (document.getElementById('dashboardView')) {
    showDashboard();
  }
});
