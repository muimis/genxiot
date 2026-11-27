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
    name:  'Bed Call Point (HSN: 85365090)',
    desc:  'Wall-mounted bedside call unit with LoRa wireless transmitter. Buttons: Call Nurse, Housekeeping, Cancel, Acknowledge. Presence and Code Blue calls pre-configured. Accepts the patient pendant (item 2). Mounts with two ½-inch screws. Battery: 3 × AAA.',
    group: 'Bed Components',
    mrp:   2400,
    landingPrice: 1600,
    rate:  2400,
    img:   '',
    driverKey: 'beds'
  },
  {
    code:  'ALAMO-PD-S',
    name:  'Pendant Single Switch (Accessory) (HSN: 85365090)',
    desc:  'Single switch patient pendant connecting to the bed call point.',
    group: 'Bed Components',
    mrp:   600,
    landingPrice: 400,
    rate:  600,
    img:   '',
    driverKey: 'pendants_single'
  },
  {
    code:  'ALAMO-PD-D',
    name:  'Double Button Pendant (HSN: 85365090)',
    desc:  'Patient-side pendant connecting to the bed call point. Button 1: Nurse Call. Button 2: Housekeeping.',
    group: 'Bed Components',
    mrp:   950,
    landingPrice: 650, // estimated based on single pendant
    rate:  950,
    img:   '',
    driverKey: 'pendants_double'
  },
  {
    code:  'ALAMO-CB-ACC',
    name:  'Code Blue Accessory Pendant (HSN: 85365090)',
    desc:  'Patient-side accessory pendant for generating Code Blue calls. (Note: Code Blue is already pre-configured on the Bed Call Point; this pendant is an optional add-on).',
    group: 'Bed Components',
    mrp:   900,
    landingPrice: 600,
    rate:  900,
    img:   '',
    driverKey: 'fixed' // Can be added manually
  },

  // ── SMART INFUSION SYSTEM ───────────────────────
  {
    code:  'DRIPO-IM',
    name:  'Dripo – The Smart Infusion Monitor (HSN: 90189099)',
    desc:  'The smart infusion monitor lets healthcare practitioners keep an eye on critical infusion therapy from anywhere. The device counts drops in a gravity-fed IV and calculates real-time flow rate. It sends alerts to the nursing station on the occasions of blocks, rate variations and completion of drips. You can also get alerts on your personal mobile devices. The ergonomically designed, rechargeable device is handy, wireless and has a battery backup of 20 hours.',
    group: 'Smart Infusion System',
    mrp:   5000,
    landingPrice: 2800,
    rate:  4500,
    img:   'dripo.jpg',
    driverKey: 'dripo'
  },

  // ── ROOM-DRIVEN ────────────────────────────────
  {
    code:  'ALAMO-DL',
    name:  'Call Light V2 (Door Indicator) (HSN: 85318000)',
    desc:  'Room-door indicator showing active call status. Colour is preset automatically for each configured function and can be changed by the hospital. Mounts on a Legrand two-module box with 220V supply, both supplied by the hospital.',
    group: 'Room Components',
    mrp:   2600,
    landingPrice: 2200,
    rate:  2600,
    img:   '',
    driverKey: 'rooms'
  },

  // ── BATHROOM-DRIVEN ───────────────────────
  {
    code:  'ALAMO-CP-B',
    name:  'Washroom Call Point (HSN: 85365090)',
    desc:  'Dedicated washroom unit with independent LoRa transmitter. Pull cord (item 5) connects via RJ11 cord. Battery: 3 × AAA.',
    group: 'Washroom Components',
    mrp:   2400,
    landingPrice: 1600,
    rate:  2400,
    img:   '',
    driverKey: 'bathrooms'
  },
  {
    code:  'ALAMO-PL',
    name:  'Pull Cord (HSN: 85365090)',
    desc:  'Modular washroom pull cord connecting to the washroom call point. Wear part, excluded from warranty.',
    group: 'Washroom Components',
    mrp:   600,
    landingPrice: 400,
    rate:  600,
    img:   '',
    driverKey: 'bathrooms'
  },
  // ── WARD-DRIVEN ────────────────────────────────
  {
    code:  'ALAMO-MINI',
    name:  'Mini Station - Tetris (Alert System) (HSN: 85318000)',
    desc:  'Tetris style mini indicator display. Works with Android app for adding call buttons. Can work without gateway.',
    group: 'Nursing Station',
    mrp:   12000,
    landingPrice: 10000,
    rate:  12000,
    img:   '',
    driverKey: 'ns_basic'
  },
  {
    code:  'ALAMO-NS-TV',
    name:  '32" Smart Display (HSN: 85287390)',
    desc:  'Android display pre-loaded with Alamo Monitor software for live view of all call points with audio-visual alerts. Requires 220V. Mounting by hospital. Manufacturer\'s 1-year warranty.',
    group: 'Nursing Station',
    mrp:   12000,
    landingPrice: 12000, // Kept same as rate for legacy items
    rate:  12000,
    img:   '',
    driverKey: 'ns_tv'
  },
  {
    code:  'ALAMO-GW',
    name:  'Gateway (one for local, one for cloud) (HSN: 85176230)',
    desc:  'The local gateway links call points to the display. The cloud gateway links the system to the cloud software and needs internet or Wi-Fi. Local operation needs no internet. Includes B-type charger, product stand and screws for assembly.',
    group: 'Infrastructure & Network',
    mrp:   12000,
    landingPrice: 8000,
    rate:  12000,
    img:   '',
    driverKey: 'gateways'
  },
  {
    code:  'ALAMO-RPT',
    name:  'Repeater (HSN: 85176290)',
    desc:  'Extends local LoRa coverage between gateway and rooms. Includes B-type charger, stand and screws. Requires a 220V outlet. Quantity depends on the floor plan.',
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
    desc:  'Escalation, reporting, historical analytics and Code Blue alerts. Code Blue works from the pre-configured call point; the pendant accessory is an optional add-on. Per nursing station, 3 years from go-live. Renewal after 3 years: ₹3,500 per nursing station per year. Needs internet or Wi-Fi.',
    group: 'Software & Services',
    mrp:   15000,
    landingPrice: 9000,
    rate:  15000,
    img:   '',
    driverKey: 'datalog' // Tied to datalog checkbox
  }
];

// ─── DRIPO TIER PRICING & CATALOGUE ACTIONS ─────────────────────
// Dripo Pricing Slab Calculator (Excl. GST):
// 1–10 units  : ₹4,500 / unit
// 10–30 units : ₹4,000 / unit
// 30–100+ units : ₹3,500 / unit
function getDripoRate(qty) {
  const q = parseInt(qty, 10) || 0;
  if (q <= 10) return 4500;
  if (q <= 30) return 4000;
  return 3500;
}

// Check if active quote or proposal is configured for Dripo (infusion monitoring)
function isDripoQuoteActive() {
  const hasDripo = bom.some(b => b.code === 'DRIPO-IM' && b.qty > 0);
  const hasNurseCall = bom.some(b => ['ALAMO-CP-R', 'ALAMO-PD-S', 'ALAMO-PD-D', 'ALAMO-DL', 'ALAMO-CP-B', 'ALAMO-PL', 'ALAMO-CB-ACC'].includes(b.code) && b.qty > 0);
  const qRef = document.getElementById('quoteRef')?.value || '';
  return (hasDripo && !hasNurseCall) || (qRef.includes('GEN-DRP') && !hasNurseCall);
}

// ─── AMOUNT IN WORDS (INDIAN NUMBERING SYSTEM) ───────────────────
function numberToWordsIndian(num) {
  if (num === null || num === undefined || isNaN(num)) return 'Zero Rupees Only';
  if (num === 0) return 'Zero Rupees Only';
  const isNeg = num < 0;
  num = Math.abs(num);
  let whole = Math.floor(num);
  let paise = Math.round((num - whole) * 100);
  if (paise === 100) {
    whole += 1;
    paise = 0;
  }

  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n) {
    if (n === 0) return '';
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + inWords(n % 100) : '');
    return '';
  }

  function convertWhole(n) {
    if (n === 0) return 'Zero';
    let crore = Math.floor(n / 10000000);
    n %= 10000000;
    let lakh = Math.floor(n / 100000);
    n %= 100000;
    let thousand = Math.floor(n / 1000);
    n %= 1000;
    let remainder = n;

    let s = '';
    if (crore > 0) s += inWords(crore) + ' Crore ';
    if (lakh > 0) s += inWords(lakh) + ' Lakh ';
    if (thousand > 0) s += inWords(thousand) + ' Thousand ';
    if (remainder > 0) s += inWords(remainder);
    return s.trim();
  }

  let res = (isNeg ? 'Minus ' : '') + 'Rupees ' + convertWhole(whole);
  if (paise > 0) {
    res += ' and ' + inWords(paise) + ' Paise';
  }
  return res + ' Only';
}

// ─── DOCUMENT TYPE CONTROLS ─────────────────────────────────────
let currentDocType = 'commercial';

function onDocTypeChange() {
  const sel = document.getElementById('docTypeSelect');
  if (sel) currentDocType = sel.value;
  if (currentDocType === 'tax_invoice') {
    previewTaxInvoice();
  } else {
    if (typeof _applyTaxInvoiceMode === 'function') _applyTaxInvoiceMode(false);
    updateDocTypeDisplay();
    recalc();
  }
}

function updateDocTypeDisplay() {
  const label = document.getElementById('qDocTypeLabel');
  if (!label) return;
  if (currentDocType === 'budgetary') {
    label.textContent = 'BUDGETARY PROPOSAL REF';
  } else if (currentDocType === 'revised') {
    label.textContent = 'REVISED QUOTATION REF';
  } else if (currentDocType === 'tax_invoice') {
    label.textContent = 'TAX INVOICE';
  } else {
    label.textContent = 'COMMERCIAL QUOTATION REF';
  }
}

// Dynamically return product name and description based on quote context (Alamo vs Dripo)
function getItemDisplayInfo(item, isDripo) {
  let name = item.name;
  let desc = item.desc;
  
  if (isDripo) {
    if (item.code === 'ALAMO-NS-TV') {
      name = '32 inch Smart TV – Dripo Central Monitoring Station (HSN: 85287213)';
      desc = 'Pre-configured 32" Android display running the Dripo Central Monitoring Station software. Real-time central dashboard of active IV infusions, live flow rates, time remaining, and instant audio-visual alerts for blocks, rate variations, and drip completion.';
    } else if (item.code === 'ALAMO-MINI') {
      name = 'Mini Station – Dripo Infusion Alert Display (HSN: 85318000)';
      desc = 'Tetris-style compact audio-visual alert indicator configured for Dripo smart infusion monitoring. Provides immediate visual and audio alerts for IV drip completion, blockages, and rate variations.';
    } else if (item.code === 'ALAMO-GW') {
      name = 'Gateway (Network Device) (HSN: 85176230)';
      desc = 'IoT Gateway for Dripo wireless network. Securely connects and aggregates real-time data from Dripo Infusion Monitors to the central nursing station display and cloud dashboard. Includes B-type charger, product stand, and screws for assembly.';
    } else if (item.code === 'ALAMO-RPT') {
      name = 'Repeater (Networking Device) (HSN: 85176290)';
      desc = 'IoT Signal Repeater for Dripo wireless network. Extends wireless RF communication range between Dripo infusion monitors and the central gateway across hospital corridors and wards. Requires a 220V power outlet.';
    }
  } else {
    if (item.code === 'ALAMO-CP-R') {
      const model = document.getElementById('bedCallPointModel')?.value || 'wall';
      if (model === 'panel') {
        name = 'Panel-Mount Call Terminal (HSN: 85365090)';
        desc = 'Panel-mount call terminal with LoRa wireless transmitter for new construction. Buttons: Call Nurse, Presence, Close, Call Assist. (Power source & mounting plate as per site specifications).';
      } else {
        name = 'Bed Call Point (HSN: 85365090)';
        desc = 'Wall-mounted bedside call unit with LoRa wireless transmitter. Buttons: Call Nurse, Housekeeping, Cancel, Acknowledge. Presence and Code Blue calls pre-configured. Accepts the patient pendant (item 2). Mounts with two ½-inch screws. Battery: 3 × AAA.';
      }
    } else if (item.code === 'ALAMO-NS-TV') {
      name = '32" Smart Display (HSN: 85287390)';
      desc = 'Android display pre-loaded with Alamo Monitor software for live view of all call points with audio-visual alerts. Requires 220V. Mounting by hospital. Manufacturer\'s 1-year warranty.';
    } else if (item.code === 'ALAMO-MINI') {
      name = 'Mini Station - Tetris (Alert System) (HSN: 85318000)';
      desc = 'Tetris style mini indicator display. Works with Android app for adding call buttons. Can work without gateway.';
    } else if (item.code === 'ALAMO-GW') {
      name = 'Gateway (one for local, one for cloud) (HSN: 85176230)';
      desc = 'The local gateway links call points to the display. The cloud gateway links the system to the cloud software and needs internet or Wi-Fi. Local operation needs no internet. Includes B-type charger, product stand and screws for assembly.';
    } else if (item.code === 'ALAMO-RPT') {
      name = 'Repeater (HSN: 85176290)';
      desc = 'Extends local LoRa coverage between gateway and rooms. Includes B-type charger, stand and screws. Requires a 220V outlet. Quantity depends on the floor plan.';
    } else if (item.code === 'ALAMO-CLOUD-SW') {
      name = 'Cloud Software (SAC: 9983)';
      desc = 'Escalation, reporting, historical analytics and Code Blue alerts. Code Blue works from the pre-configured call point; the pendant accessory is an optional add-on. Per nursing station, 3 years from go-live. Renewal after 3 years: ₹3,500 per nursing station per year. Needs internet or Wi-Fi.';
    }
  }
  
  return { name, desc };
}

function onBedCallPointModelChange() {
  const model = document.getElementById('bedCallPointModel')?.value || 'wall';
  const cpItem = CATALOGUE.find(c => c.code === 'ALAMO-CP-R');
  if (cpItem) {
    if (model === 'panel') {
      cpItem.name = 'Panel-Mount Call Terminal (HSN: 85365090)';
      cpItem.desc = 'Panel-mount call terminal with LoRa wireless transmitter for new construction. Buttons: Call Nurse, Presence, Close, Call Assist. (Power source & mounting plate as per site specifications).';
    } else {
      cpItem.name = 'Bed Call Point (HSN: 85365090)';
      cpItem.desc = 'Wall-mounted bedside call unit with LoRa wireless transmitter. Buttons: Call Nurse, Housekeeping, Cancel, Acknowledge. Presence and Code Blue calls pre-configured. Accepts the patient pendant (item 2). Mounts with two ½-inch screws. Battery: 3 × AAA.';
    }
  }
  const badge = document.getElementById('callPointBadgeModel');
  if (badge) {
    badge.textContent = (model === 'panel') 
      ? 'Active Configuration: Model B – Panel-mount (New Construction)'
      : 'Active Configuration: Model A – Wall-mount (Battery-operated)';
  }
  const bomCp = bom.find(b => b.code === 'ALAMO-CP-R');
  if (bomCp && cpItem) {
    bomCp.name = cpItem.name;
    bomCp.desc = cpItem.desc;
  }
  renderBOM();
  recalc();
}

// Client autofill helper (e.g. PB Health)
function checkKnownClient(name) {
  if (!name) return;
  const n = name.trim().toLowerCase();
  if (n === 'pb health' || n === 'pbhealth' || n === 'pb healthcare' || n.includes('pb health')) {
    const cp = document.getElementById('contactPerson');
    if (cp && (!cp.value || cp.value === 'Medical Director / BioMed Team')) {
      cp.value = 'Chief Nursing Officer / BioMed Procurement';
    }
    const loc = document.getElementById('clientLocation');
    if (loc && (!loc.value || loc.value === 'Kerala' || loc.value === 'Trivandrum')) {
      loc.value = 'Sector-44, Gurugram';
    }
    const dist = document.getElementById('clientDistrict');
    if (dist && (!dist.value || dist.value === 'Thiruvananthapuram')) {
      dist.value = 'Gurugram';
    }
    const state = document.getElementById('clientState');
    if (state && (!state.value || state.value === 'Kerala')) {
      state.value = 'Haryana';
    }
    const po = document.getElementById('poRef');
    if (po && !po.value) {
      po.value = 'PBH-WO-2026-DRP';
    }
    recalc();
  }
}

// Quick add product from master catalogue dropdown into active BOM
function addCatalogueItem(code) {
  if (!code) return;
  const existing = bom.find(b => b.code === code);
  if (existing) {
    if (existing.qty === 0) existing.qty = 1;
    existing.isLocked = true;
    showToast(`${existing.name} is in the BOM (Quantity: ${existing.qty})`, 'info');
    renderBOM();
    return;
  }
  const cat = CATALOGUE.find(c => c.code === code);
  if (cat) {
    const rate = (code === 'DRIPO-IM') ? getDripoRate(1) : (cat.mrp || cat.rate);
    bom.push({
      ...cat,
      qty: 1,
      rate: rate,
      baseRate: rate,
      isLocked: true
    });
    renderBOM();
    showToast(`Added ${cat.name} to BOM`, 'success');
  }
}

// Sidebar & Quick Actions for Dripo
function toggleDripoSidebar(checked) {
  const dripoItem = bom.find(b => b.code === 'DRIPO-IM');
  if (dripoItem) {
    const curQty = parseInt(document.getElementById('dripoSidebarQty')?.value, 10) || 0;
    dripoItem.qty = checked ? (curQty > 0 ? curQty : 10) : 0;
    dripoItem.isLocked = true;
    if (dripoItem.qty > 0 && !dripoItem.isLockedRate) {
      const rate = getDripoRate(dripoItem.qty);
      dripoItem.rate = rate;
      dripoItem.baseRate = rate;
    }
    renderBOM();
  }
}

function onDripoSidebarQtyChange(val) {
  const qty = Math.max(0, parseInt(val, 10) || 0);
  const dripoItem = bom.find(b => b.code === 'DRIPO-IM');
  if (dripoItem) {
    dripoItem.qty = qty;
    dripoItem.isLocked = true;
    if (qty > 0 && !dripoItem.isLockedRate) {
      const rate = getDripoRate(qty);
      dripoItem.rate = rate;
      dripoItem.baseRate = rate;
    }
    const chkDripo = document.getElementById('chkDripo');
    if (chkDripo) chkDripo.checked = (qty > 0);
    renderBOM();
  }
}

function quickAddDripo() {
  const dripoItem = bom.find(b => b.code === 'DRIPO-IM');
  if (dripoItem) {
    dripoItem.qty = (dripoItem.qty > 0 ? dripoItem.qty + 10 : 10);
    dripoItem.isLocked = true;
    if (!dripoItem.isLockedRate) {
      const rate = getDripoRate(dripoItem.qty);
      dripoItem.rate = rate;
      dripoItem.baseRate = rate;
    }
    renderBOM();
    showToast(`Dripo set to ${dripoItem.qty} units (@ ₹${fmt(dripoItem.rate)}/unit)`, 'success');
    const row = document.getElementById('bomRowDripo');
    if (row) row.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function createNewDripoQuote() {
  closeModal();
  resetQuote(true);
  loadPreset('dripo');
  showCalculator();
}

// ─── STATE ───────────────────────────────────────────────────────
// Initial BOM loads all catalogue components ready for quick quantity selection
let bom = CATALOGUE.map(item => ({
  ...item,
  qty: 0,
  baseRate: (item.code === 'DRIPO-IM') ? 4500 : (item.mrp || item.rate),
  rate: (item.code === 'DRIPO-IM') ? 4500 : (item.mrp || item.rate),
  isLocked: false
}));

// ─── INIT ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const qDateEl = document.getElementById('quoteDate');
  if (qDateEl && !qDateEl.value) {
    qDateEl.value = `${yyyy}-${mm}-${dd}`;
  }
  generateLocalQtn(d);
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
    const isDripoItem = (item.code === 'DRIPO-IM');
    if (item.group !== lastGroup) {
      lastGroup = item.group;
      const gtr = document.createElement('tr');
      gtr.className = 'grp-hdr';
      if (isDripoItem) {
        gtr.style.background = 'linear-gradient(90deg, #0d9488, #0f766e)';
        gtr.style.color = '#ffffff';
      }
      gtr.innerHTML = `<td colspan="6">${isDripoItem ? '💧 ' : ''}${item.group}</td>`;
      tbody.appendChild(gtr);
    }
    const amount = item.qty * item.rate;
    const isDripoActive = isDripoQuoteActive();
    const displayInfo = getItemDisplayInfo(item, isDripoActive);
    const tr = document.createElement('tr');
    if (isDripoItem) {
      tr.style.background = 'rgba(13, 148, 136, 0.05)';
      tr.id = 'bomRowDripo';
    }
    tr.innerHTML = `
      <td>
        <img src="${item.img}" class="prod-thumb" alt="${displayInfo.name}"
          onerror="this.style.display='none'">
      </td>
      <td>
        ${item.code === 'CUSTOM' ? `
          <input type="text" value="${item.name}" oninput="updateName(${idx}, this.value)" placeholder="Item Name" style="width:100%; font-weight:600; font-size:.82rem; margin-bottom:2px; border:1px solid #ccc; padding:2px 4px; border-radius:3px;">
          <input type="text" value="${item.desc}" oninput="updateDesc(${idx}, this.value)" placeholder="Description" style="width:100%; font-size:.7rem; color:var(--muted); border:1px solid #ccc; padding:2px 4px; border-radius:3px;">
        ` : `
          <div class="prod-name" style="${isDripoItem ? 'color:#0f766e; font-weight:700;' : ''}">${isDripoItem ? '💧 ' : ''}${displayInfo.name}</div>
          <div class="prod-sub">${item.code} &nbsp;·&nbsp; ${displayInfo.desc}</div>
          ${isDripoItem ? `
            <div style="font-size:0.68rem; color:#0d9488; font-weight:600; margin-top:3px; background:rgba(13,148,136,0.08); padding:2px 6px; border-radius:4px; display:inline-block;">
              Tier Pricing: 1–10 units: ₹4,500 | 10–30 units: ₹4,000 | 30+ units: ₹3,500 (Excl. GST)
            </div>
          ` : ''}
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

  // Sync Dripo sidebar state
  const dripoItem = bom.find(b => b.code === 'DRIPO-IM');
  const dQty = dripoItem ? dripoItem.qty : 0;
  const chkDripoEl = document.getElementById('chkDripo');
  const dripoSidebarQtyEl = document.getElementById('dripoSidebarQty');
  const dripoSidebarRateEl = document.getElementById('dripoSidebarRate');
  if (chkDripoEl) chkDripoEl.checked = (dQty > 0);
  if (dripoSidebarQtyEl && parseInt(dripoSidebarQtyEl.value, 10) !== dQty) {
    dripoSidebarQtyEl.value = dQty;
  }
  if (dripoSidebarRateEl) {
    dripoSidebarRateEl.textContent = (dQty > 0) ? `₹${fmt(getDripoRate(dQty))} / unit` : '';
  }

  if (window.lucide) lucide.createIcons();
  recalc();
}

function updateQty(idx, val) {
  const newQty = Math.max(0, parseInt(val) || 0);
  bom[idx].qty = newQty;
  bom[idx].isLocked = true; // Lock so calcEstimator doesn't override manual entry

  if (bom[idx].code === 'DRIPO-IM') {
    if (!bom[idx].isLockedRate && newQty > 0) {
      const tierRate = getDripoRate(newQty);
      bom[idx].rate = tierRate;
      bom[idx].baseRate = tierRate;
      const rateInput = document.querySelector(`input[data-idx="${idx}"][onchange*="updateRate"]`);
      if (rateInput) rateInput.value = tierRate;
    }
    const chkDripoEl = document.getElementById('chkDripo');
    const dripoSidebarQtyEl = document.getElementById('dripoSidebarQty');
    const dripoSidebarRateEl = document.getElementById('dripoSidebarRate');
    if (chkDripoEl) chkDripoEl.checked = (newQty > 0);
    if (dripoSidebarQtyEl) dripoSidebarQtyEl.value = newQty;
    if (dripoSidebarRateEl) {
      dripoSidebarRateEl.textContent = (newQty > 0) ? `₹${fmt(getDripoRate(newQty))} / unit` : '';
    }
  }

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
  if (item.code === 'DRIPO-IM') {
    item.isLockedRate = true; // Lock user's manual price override
  }
  
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
  document.getElementById('presetDrop')?.classList.remove('open');

  if (preset === 'dripo' || preset === 'dripo_pb') {
    // Dripo Infusion System: 10 Dripo units + 1 Gateway + 1 Repeater + 1 32" Smart TV
    // Nurse call buttons, pendants, pullcords are NOT needed!
    floors = [{ name: 'Infusion Ward / Day Care', beds: 0, rooms: 0, baths: 0, ns: 1 }];
    renderFloors();

    bom.forEach(item => {
      item.isLocked = true;
      if (item.code === 'DRIPO-IM') {
        item.qty = 10;
        item.rate = getDripoRate(10);
        item.baseRate = item.rate;
      } else if (item.code === 'ALAMO-GW') {
        item.qty = 1;
      } else if (item.code === 'ALAMO-RPT') {
        item.qty = 1;
      } else if (item.code === 'ALAMO-NS-TV') {
        item.qty = 1;
      } else {
        item.qty = 0; // Call buttons, pendants, pullcords are 0
      }
    });

    ['DRIPO-IM', 'ALAMO-GW', 'ALAMO-RPT', 'ALAMO-NS-TV'].forEach(code => {
      let bItem = bom.find(b => b.code === code);
      if (!bItem) {
        const cat = CATALOGUE.find(c => c.code === code);
        if (cat) {
          const qty = (code === 'DRIPO-IM') ? 10 : 1;
          const rate = (code === 'DRIPO-IM') ? getDripoRate(10) : (cat.mrp || cat.rate);
          bom.push({ ...cat, qty, rate, baseRate: rate, isLocked: true });
        }
      }
    });

    const clientEl = document.getElementById('clientName');
    const locEl = document.getElementById('clientLocation');
    const distEl = document.getElementById('clientDistrict');
    const stateEl = document.getElementById('clientState');
    const cpEl = document.getElementById('contactPerson');
    const poEl = document.getElementById('poRef');

    if (preset === 'dripo_pb' || (clientEl && clientEl.value && clientEl.value.toLowerCase().includes('pb health'))) {
      if (clientEl) clientEl.value = 'PB Health';
      if (locEl) locEl.value = 'Sector-44, Gurugram';
      if (distEl) distEl.value = 'Gurugram';
      if (stateEl) stateEl.value = 'Haryana';
      if (cpEl) cpEl.value = 'Chief Nursing Officer / BioMed Procurement';
      if (poEl && !poEl.value) poEl.value = 'PBH-WO-2026-DRP';
    } else {
      if (clientEl && !clientEl.value) clientEl.value = 'General Hospital – Infusion Therapy';
      if (locEl && !locEl.value) locEl.value = 'Kerala';
      if (distEl && !distEl.value) distEl.value = 'Thiruvananthapuram';
      if (stateEl && !stateEl.value) stateEl.value = 'Kerala';
      if (cpEl && (!cpEl.value || cpEl.value === 'Medical Director / BioMed Team')) {
        cpEl.value = 'Chief Nursing Officer / Infusion Care Team';
      }
    }

    const scopeEl = document.getElementById('scopeNotes');
    if (scopeEl) {
      scopeEl.value = 'Dripo Smart Infusion Monitors, IoT Gateway & Repeater wireless network configuration, charging cradle setup, nursing station display setup, and staff clinical training by GenXIoT.';
    }
    const warrEl = document.getElementById('warranty');
    if (warrEl) {
      warrEl.value = '12 months standard warranty from date of installation and handover';
    }

    generateQuoteRef();
    renderBOM();
    showToast(preset === 'dripo_pb' ? 'Loaded Dripo Infusion preset for PB Health' : 'Loaded Dripo Infusion preset (10 Dripo + Gateway + Repeater + 32" Display)', 'success');
    return;
  }

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
    },
    dripo_pb: {
      type: 'dripo',
      client: 'PB Health',
      loc: 'Sector-44, Gurugram',
      district: 'Gurugram',
      state: 'Haryana',
      contact: 'Chief Nursing Officer / BioMed Procurement',
      poRef: 'PBH-WO-2026-DRP'
    }
  };

  const p = presets[preset];
  if (!p) return;

  // Unlock all items when loading a fresh preset
  bom.forEach(item => {
    item.isLocked = false;
    if (item.code === 'DRIPO-IM') item.qty = 0;
  });

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
  if(document.getElementById('chkSinglePendant')) document.getElementById('chkSinglePendant').checked = (p.pendant !== 'double');
  if(document.getElementById('chkDoublePendant')) document.getElementById('chkDoublePendant').checked = (p.pendant === 'double');
  if(document.getElementById('chkNsBasic')) document.getElementById('chkNsBasic').checked = (p.nsBasic > 0);
  if(document.getElementById('chkNsTv')) document.getElementById('chkNsTv').checked = (p.nsTv > 0);
  if(document.getElementById('chkDataLog')) document.getElementById('chkDataLog').checked = p.dataLog || false;
  calcEstimator();
  generateQuoteRef();
}

// ─── INIT API & QUOTE REF GENERATOR ─────────────────────────────
function getQuoteDateParts() {
  const qDateVal = document.getElementById('quoteDate')?.value;
  let d;
  if (qDateVal) {
    const parts = qDateVal.split('-');
    if (parts.length === 3) {
      d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
  }
  if (!d || isNaN(d.getTime())) d = new Date();
  
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return { yy, mm, dd, dateStr: `${yy}${mm}${dd}` };
}

// ─── TOAST NOTIFICATIONS ──────────────────────────────────────────
function showToast(msg, type = 'info', duration = 3000) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerText = msg;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s, transform 0.3s';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => toast.remove(), 350);
  }, duration);
}

// ─── LOCAL STATUS CACHE / OVERRIDES ──────────────────────────────
function getLocalStatusOverrides() {
  try {
    return JSON.parse(localStorage.getItem('genxiot_quote_statuses') || '{}');
  } catch(e) {
    return {};
  }
}

function setLocalStatusOverride(quoteRef, status) {
  if (!quoteRef) return;
  try {
    const overrides = getLocalStatusOverrides();
    overrides[quoteRef] = status;
    localStorage.setItem('genxiot_quote_statuses', JSON.stringify(overrides));
  } catch(e) {}
}

// ─── CALCULATOR DEAL STATUS & VERSIONING ──────────────────────────
// ─── CALCULATOR DEAL STATUS & VERSIONING ──────────────────────────
function onDealStatusChange() {
  const select = document.getElementById('dealStatus');
  if (!select) return;
  const val = select.value;
  select.className = 'status-select';
  if (val === 'Closed Won') select.classList.add('status-won');
  else if (val === 'Closed Lost') select.classList.add('status-lost');
  else if (val === 'Revised') select.classList.add('status-revised');
  else if (val === 'Active Option') select.classList.add('status-option');
  else select.classList.add('status-pending');
}

function updateVersionBadge(vNum, isOption) {
  const badge = document.getElementById('versionLabelBadge');
  if (!badge) return;
  const num = parseInt(vNum, 10) || 1;
  const statusVal = document.getElementById('dealStatus')?.value;
  if (isOption || statusVal === 'Active Option') {
    badge.className = 'badge-v-option';
    badge.textContent = `V${num} (Option)`;
  } else if (num > 1) {
    badge.className = 'badge-v-rev';
    badge.textContent = `V${num} (Rev)`;
  } else {
    badge.className = 'badge-v-latest';
    badge.textContent = `V${num} (Latest)`;
  }
}

function onVersionManualChange() {
  const vInput = document.getElementById('quoteVersion');
  if (!vInput) return;
  let v = parseInt(vInput.value, 10);
  if (isNaN(v) || v < 1) v = 1;
  vInput.value = v;
  updateVersionBadge(v);
  generateQuoteRef();
}

function createNewRevision() {
  const cName = document.getElementById('clientName')?.value.trim() || '';
  if (!cName) {
    showToast('Please enter a Hospital Name first.', 'error');
    return;
  }
  const modal = document.getElementById('newRevisionModal');
  if (modal) {
    selectRevisionChoice('linear');
    modal.classList.add('open');
  }
}

function selectRevisionChoice(type) {
  window.currentRevisionChoice = type;
  const cLinear = document.getElementById('choiceLinear');
  const cOption = document.getElementById('choiceOption');
  if (cLinear && cOption) {
    if (type === 'linear') {
      cLinear.classList.add('active');
      cOption.classList.remove('active');
      const r = cLinear.querySelector('input[type="radio"]');
      if (r) r.checked = true;
    } else {
      cOption.classList.add('active');
      cLinear.classList.remove('active');
      const r = cOption.querySelector('input[type="radio"]');
      if (r) r.checked = true;
    }
  }
}

function closeNewRevisionModal() {
  const modal = document.getElementById('newRevisionModal');
  if (modal) modal.classList.remove('open');
}

function confirmCreateRevision() {
  const choice = window.currentRevisionChoice || 'linear';
  closeNewRevisionModal();

  const refInput = document.getElementById('quoteRef');
  const vInput   = document.getElementById('quoteVersion');
  const statusEl = document.getElementById('dealStatus');

  const currentRef = refInput ? refInput.value : '';
  const currentVersion = parseInt(vInput?.value, 10) || 1;
  const nextVersion = currentVersion + 1;

  if (vInput) vInput.value = nextVersion;

  if (choice === 'linear') {
    // Sequential revision: will retire previous version on save
    window.selectedRevisionWithdraw = true;
    if (currentRef && !currentRef.includes('Generating')) {
      window.previousRevisionRef = currentRef;
    }

    if (refInput && currentRef) {
      if (/V\d+$/i.test(currentRef)) {
        refInput.value = currentRef.replace(/V\d+$/i, 'V' + nextVersion);
      } else {
        refInput.value = currentRef + '-V' + nextVersion;
      }
    } else {
      generateQuoteRef();
    }

    if (statusEl) {
      statusEl.value = 'Pending';
      onDealStatusChange();
    }
    updateVersionBadge(nextVersion, false);
    showToast(`Revision V${nextVersion} created (Sequential Update). Previous quote will be marked Revised upon save.`, 'info', 4500);
  } else {
    // Alternative Option / Scenario: Both stand active!
    window.selectedRevisionWithdraw = false;
    window.previousRevisionRef = null; // Do NOT retire previous version

    if (refInput && currentRef) {
      if (/V\d+$/i.test(currentRef)) {
        refInput.value = currentRef.replace(/V\d+$/i, 'V' + nextVersion);
      } else {
        refInput.value = currentRef + '-V' + nextVersion;
      }
    } else {
      generateQuoteRef();
    }

    if (statusEl) {
      statusEl.value = 'Active Option';
      onDealStatusChange();
    }
    updateVersionBadge(nextVersion, true);
    showToast(`Alternative Option V${nextVersion} created! Both proposals remain active for client selection.`, 'info', 5000);
  }

  recalc();
}

function generateQuoteRef() {
  const cName = document.getElementById('clientName')?.value.trim() || '';
  const vNum = document.getElementById('quoteVersion')?.value || '1';
  const refInput = document.getElementById('quoteRef');
  if (!refInput) return;

  const { yyyy } = getQuoteDateParts();
  let currentRef = refInput.value || '';
  
  // Safely extract existing serial / random number if already generated
  let randMatch = currentRef.match(/^GEN-(?:ALA|DRP)-(?:\d{4}|\d{6,8})-(\d{2,4})-?/i);
  let rand = randMatch ? randMatch[1] : (window.currentRandom || String(Math.floor(Math.random() * 900 + 100)).padStart(3, '0'));
  window.currentRandom = rand;

  const hasDripo = bom.some(b => b.code === 'DRIPO-IM' && b.qty > 0);
  const hasNurseCall = bom.some(b => (b.code === 'ALAMO-CP-R' || b.code === 'ALAMO-CP-B' || b.code === 'ALAMO-PD-S' || b.code === 'ALAMO-DL') && b.qty > 0);
  const prefixProd = (hasDripo && !hasNurseCall) ? 'GEN-DRP' : 'GEN-ALA';
  
  // Systematic universal standard: GEN-ALA-2026-001-V1 (with client acronym if name is present)
  let clientTag = '';
  if (cName) {
    let prefix = cName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase();
    if (prefix.length >= 2) clientTag = '-' + prefix;
  }
  
  refInput.value = `${prefixProd}-${yyyy || 2026}-${rand}${clientTag}-V${vNum}`;
  updateVersionBadge(vNum);
  recalc();
}

function generateLocalQtn(dateObj) {
  const d = dateObj || new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  
  const qDateEl = document.getElementById('quoteDate');
  if (qDateEl && !qDateEl.value) {
    qDateEl.value = `${yyyy}-${mm}-${dd}`;
  }
  window.currentRandom = Math.floor(Math.random() * 90 + 10);
  generateQuoteRef();
}

// ─── SAVE / LOAD QUOTES ──────────────────────────────────────────
const API_URL = "https://script.google.com/macros/s/AKfycbydh0kfLEiWIYXpdd-jVmyVcDQ-edFZR1x111UF24ogYCi9j2Wsn8rPBNBWCAL4XO-guw/exec";

function saveQuote() {
  const qtn   = document.getElementById('quoteRef').value;
  const cName = document.getElementById('clientName').value;
  if (!cName.trim()) { alert('Please enter a Hospital Name before saving.'); return; }

  const dealStatus = document.getElementById('dealStatus')?.value || 'Pending';
  const quoteVer   = document.getElementById('quoteVersion')?.value || '1';

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
    delivery:                  document.getElementById('delivery')?.value                  || '',
    warranty:                  document.getElementById('warranty')?.value                  || '',
    addWarrantyDuration:       document.getElementById('addWarrantyDuration')?.value       || 'none',
    addWarrantyCustomDuration: document.getElementById('addWarrantyCustomDuration')?.value || '',
    addWarrantyCost:           document.getElementById('addWarrantyCost')?.value           || '0',
    extWarrantyOpt:            document.getElementById('extWarrantyOpt')?.value            || 'none',
    extWarrantyDuration:       document.getElementById('extWarrantyDuration')?.value       || '1 Year (12 Months)',
    extWarrantyCustomDuration: document.getElementById('extWarrantyCustomDuration')?.value || '',
    extWarrantyPct:            document.getElementById('extWarrantyPct')?.value            || '10',
    extWarrantyTerms:          document.getElementById('extWarrantyTerms')?.value          || '',
    scopeNotes:                document.getElementById('scopeNotes')?.value                || '',

    additionalDetails: document.getElementById('additionalDetails')?.value || '',
    poRef:             document.getElementById('poRef')?.value             || '',
    clientDistrict:    document.getElementById('clientDistrict')?.value    || '',
    clientState:       document.getElementById('clientState')?.value       || '',
    status:            dealStatus,
    quoteVersion:      quoteVer,
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
    clientGst:         document.getElementById('clientGst')?.value           || '',
    piRef:             document.getElementById('piRef')?.value               || '',
    coverFinalAmt:     document.getElementById('coverFinalAmt')?.value       || '',
    coverAdvAmt:       document.getElementById('coverAdvAmt')?.value         || '',
    productType:       window.currentProduct || 'alamo',
    dripoQty:          parseInt(document.getElementById('dripoQty')?.value, 10) || 10,
    dripoGwQty:        parseInt(document.getElementById('dripoGwQty')?.value, 10) ?? 1,
    dripoRptQty:       parseInt(document.getElementById('dripoRptQty')?.value, 10) ?? 1,
    dripoAlloc:        document.getElementById('dripoAlloc')?.value || '',
    bedCallPointModel:   document.getElementById('bedCallPointModel')?.value   || 'wall',
    genxSignatoryName:   document.getElementById('genxSignatoryName')?.value   || 'Authorized Signatory',
    genxSignatoryDesig:  document.getElementById('genxSignatoryDesig')?.value  || 'GENXIOT LLP',
    customersPageTitle:  document.getElementById('customersPageTitleInput')?.value || 'Alamo installations across India',
    companySupportPhone: document.getElementById('companySupportPhone')?.value || '+91 9496557777',
    companyBdmPhone:     document.getElementById('companyBdmPhone')?.value     || '+91 88916 70903',
    coverageNote:        document.getElementById('coverageNoteInput')?.value   || '',
    archBasis:           document.getElementById('archBasisInput')?.value      || '',
    brochureLayoutMode:  currentBrochureLayoutMode,
    showOptionalAddons:  document.getElementById('chkShowOptionalAddons')?.checked ?? true,
    selectedAddonCodes:  Array.from(selectedAddonCodes),
    docType:             currentDocType,
    finalInvoice:        (typeof collectFinalInvoiceState === 'function') ? collectFinalInvoiceState() : null
  };

  // ── Embed settings as first BOM entry (__SETTINGS__ meta item) ──────
  // This guarantees settings survive even if the GAS only stores bomData.
  const settingsMeta = {
    code: '__SETTINGS__', name:  'Document Settings (HSN: 85311090)', desc: JSON.stringify(settings),
    group: '__META__', qty: 0, rate: 0, _isSettings: true
  };
  const isDripoActive = isDripoQuoteActive();
  const sanitizedBom = bom.filter(b => b.code !== '__SETTINGS__').map(item => {
    const info = getItemDisplayInfo(item, isDripoActive);
    return {
      ...item,
      name: info.name,
      desc: info.desc
    };
  });
  const bomWithMeta = [settingsMeta, ...sanitizedBom];

  // ── Grand total as a clean number (no ₹ / commas) for dashboard ─────
  const gtText = document.getElementById('calcGT')?.textContent || '0';
  const gtNum  = parseFloat(gtText.replace(/[^0-9.]/g, '')) || 0;

  const shouldWithdraw = window.selectedRevisionWithdraw !== false;

  const totalUnits = (window.currentProduct === 'dripo')
    ? (parseInt(document.getElementById('dripoQty')?.value, 10) || 10)
    : floors.reduce((a, f) => a + (f.beds || 0), 0);

  const dealData = {
    action: 'saveQuote',
    quoteRef:     qtn,
    clientName:   cName,
    location:     document.getElementById('clientLocation')?.value || '',
    totalAmount:  gtNum,            // plain number — parseable by dashboard
    contactPerson: document.getElementById('contactPerson')?.value || '',
    totalBeds:    totalUnits,
    quoteVersion: quoteVer,
    status:       dealStatus,
    withdrawPrevious: shouldWithdraw,
    floors:       floors,
    // Spread top-level copies for GAS columns (best effort)
    ...settings,
    bomData:     bomWithMeta   // settings also embedded here as fallback
  };

  fetch(API_URL, { method: 'POST', body: JSON.stringify(dealData) })
    .then(r => r.json())
    .then(() => {
      setLocalStatusOverride(qtn, dealStatus);
      if (shouldWithdraw && window.previousRevisionRef && window.previousRevisionRef !== qtn) {
        setLocalStatusOverride(window.previousRevisionRef, 'Revised');
        fetch(API_URL, {
          method: 'POST',
          body: JSON.stringify({ action: 'updateStatus', quoteRef: window.previousRevisionRef, status: 'Revised' })
        }).catch(e => console.warn('Retiring previous revision async:', e));
      }
      window.previousRevisionRef = null;
      window.selectedRevisionWithdraw = true;
      showToast(`Quote "${qtn}" saved (${dealStatus})`, 'success');
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
        showDashboard(); // Go back to dashboard cleanly
      } else {

        alert(data.message || 'Error deleting quote.');
      }
    })
    .catch(err => {
      console.error(err);
      btn.innerHTML = orig;
      btn.disabled  = false;
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
  setVal('quoteVersion',   data.quoteVersion || '1');
  const restoredStatus = data.status || getLocalStatusOverrides()[data.quoteRef] || 'Pending';
  setVal('dealStatus',     restoredStatus);
  onDealStatusChange();
  updateVersionBadge(data.quoteVersion || '1');
  if (data.clientName && data.clientName.toLowerCase().includes('pb health')) {
    if (!data.contactPerson) data.contactPerson = 'Chief Nursing Officer / BioMed Procurement';
    if (!data.location || data.location === 'Haryana') data.location = 'Sector-44, Gurugram';
    if (!data.clientDistrict) data.clientDistrict = 'Gurugram';
    if (!data.clientState) data.clientState = 'Haryana';
    if (!data.poRef) data.poRef = 'PBH-WO-2026-DRP';
  }

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
  setVal('coverFinalAmt', data.coverFinalAmt !== undefined ? data.coverFinalAmt : '');
  setVal('coverAdvAmt',   data.coverAdvAmt   !== undefined ? data.coverAdvAmt   : '');

  // ── Terms & Notes ──────────────────────────────────────────────
  if (data.delivery)          setVal('delivery',          data.delivery);
  if (data.warranty)          setVal('warranty',          data.warranty);
  setVal('addWarrantyDuration',       data.addWarrantyDuration       || 'none');
  setVal('addWarrantyCustomDuration', data.addWarrantyCustomDuration || '');
  setVal('addWarrantyCost',           data.addWarrantyCost !== undefined ? data.addWarrantyCost : '0');
  onAddWarrantyChange();

  setVal('extWarrantyOpt',            data.extWarrantyOpt !== undefined ? data.extWarrantyOpt : 'none');
  setVal('extWarrantyDuration',       data.extWarrantyDuration || '1 Year (12 Months)');
  setVal('extWarrantyCustomDuration', data.extWarrantyCustomDuration || '');
  setVal('extWarrantyPct',            data.extWarrantyPct !== undefined ? data.extWarrantyPct : '10');
  if (data.extWarrantyTerms) setVal('extWarrantyTerms', data.extWarrantyTerms);
  onExtWarrantyDurationChange();
  onExtWarrantyChange();
  if (data.scopeNotes)        setVal('scopeNotes',        data.scopeNotes);
  if (data.additionalDetails) setVal('additionalDetails', data.additionalDetails);
  if (data.bedCallPointModel) {
    setVal('bedCallPointModel', data.bedCallPointModel);
    onBedCallPointModelChange();
  }
  if (data.genxSignatoryName)   setVal('genxSignatoryName',   data.genxSignatoryName);
  if (data.genxSignatoryDesig)  setVal('genxSignatoryDesig',  data.genxSignatoryDesig);
  if (data.customersPageTitle)  setVal('customersPageTitleInput', data.customersPageTitle);
  if (data.companySupportPhone) setVal('companySupportPhone', data.companySupportPhone);
  if (data.companyBdmPhone)     setVal('companyBdmPhone',     data.companyBdmPhone);
  if (data.coverageNote) {
    setVal('coverageNoteInput', data.coverageNote);
    const cn = document.getElementById('coverageNoteInput');
    if (cn) cn.dataset.userEdited = 'true';
  }
  if (data.archBasis) {
    setVal('archBasisInput', data.archBasis);
    const ab = document.getElementById('archBasisInput');
    if (ab) ab.dataset.userEdited = 'true';
  }

  if (data.brochureLayoutMode) {
    currentBrochureLayoutMode = data.brochureLayoutMode;
    setVal('brochureLayoutMode', data.brochureLayoutMode);
    applyBrochureLayoutClass();
  }
  if (data.showOptionalAddons !== undefined) {
    setChk('chkShowOptionalAddons', data.showOptionalAddons);
  }
  if (data.selectedAddonCodes && Array.isArray(data.selectedAddonCodes)) {
    selectedAddonCodes = new Set(data.selectedAddonCodes);
    userCustomizedAddons = true;
  }
  renderOptionalAddonsPicker();

  if (data.finalInvoice && typeof restoreFinalInvoiceState === 'function') {
    restoreFinalInvoiceState(data.finalInvoice);
  } else if (data.quoteRef && typeof restoreFinalInvoiceState === 'function') {
    try {
      const localInv = localStorage.getItem('genxiot_final_invoice_' + data.quoteRef.trim());
      if (localInv) restoreFinalInvoiceState(JSON.parse(localInv));
    } catch (e) {}
  }

  if (data.docType) {
    currentDocType = data.docType;
    setVal('docTypeSelect', data.docType);
    updateDocTypeDisplay();
  }


  // ── Bank details ───────────────────────────────────────────────
  // Bank details are now strictly hardcoded in the HTML output and need not be loaded

  // ── Floors & BOM Restoration ──────────────────────────────────
  const bedCount = parseInt(data.totalBeds || data.beds, 10) || 0;
  if (data.floors && Array.isArray(data.floors) && data.floors.length > 0 && data.floors.some(f => (parseInt(f.beds) || 0) > 0)) {
    floors = data.floors.map(f => {
      if (f.name) f.name = f.name.replace(/\s*\(HSN:\s*85311090\)/gi, '');
      return f;
    });
  } else if (bedCount > 0) {
    floors = [{
      name:  'Floor 1',
      beds:  bedCount,
      rooms: Math.ceil(bedCount * 0.5),
      baths: Math.ceil(bedCount * 0.5),
      ns:    Math.max(1, Math.ceil(bedCount / 30))
    }];
  } else if (data.floors && Array.isArray(data.floors) && data.floors.length > 0) {
    floors = data.floors;
  } else {
    floors = [{ name:  'Floor 1', beds: 0, rooms: 0, baths: 0, ns: 0 }];
  }
  renderFloors();

  // Restore BOM (already stripped of __SETTINGS__ entry above)
  if (data.bomData && Array.isArray(data.bomData) && data.bomData.length > 0) {
    const savedMap = {};
    data.bomData
      .filter(b => b && b.code !== '__SETTINGS__')
      .forEach(b => {
        const c = b.code === 'ALAMO-NS-BASIC' ? 'ALAMO-MINI' : b.code;
        savedMap[c] = b;
      });

    const hasAnySavedQty = Object.values(savedMap).some(b => (parseInt(b.qty, 10) || 0) > 0);

    if (hasAnySavedQty) {
      bom = CATALOGUE.map(catItem => {
        const saved = savedMap[catItem.code];
        if (saved) {
          const q = parseInt(saved.qty, 10) || 0;
          return {
            ...catItem,
            qty: q,
            rate: (saved.rate !== undefined && saved.rate !== null) ? parseFloat(saved.rate) : (catItem.mrp || catItem.rate),
            baseRate: (saved.baseRate !== undefined && saved.baseRate !== null) ? parseFloat(saved.baseRate) : (catItem.mrp || catItem.rate),
            isLocked: (saved.isLocked !== undefined) ? saved.isLocked : (q > 0)
          };
        }
        return { ...catItem, qty: 0, baseRate: (catItem.code === 'DRIPO-IM') ? 4500 : (catItem.mrp || catItem.rate), rate: (catItem.code === 'DRIPO-IM') ? 4500 : (catItem.mrp || catItem.rate), isLocked: false };
      });

      // Preserve any custom line items
      data.bomData
        .filter(b => b && b.code === 'CUSTOM')
        .forEach(cust => {
          bom.push({ ...cust, isLocked: true });
        });

      renderBOM();
    } else {
      calcEstimator();
    }
  } else {
    calcEstimator();
  }

  recalc();

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
    beds += parseInt(f.beds) || 0;
    rooms += parseInt(f.rooms) || 0;
    bathrooms += parseInt(f.baths) || 0;
    nsTotal += parseInt(f.ns) || 0;
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

// ─── ADDITIONAL WARRANTY HELPERS ─────────────────────────────────
function getAddWarrantyDuration() {
  const dSelect = document.getElementById('addWarrantyDuration');
  if (!dSelect || dSelect.value === 'none') return 'none';
  if (dSelect.value === 'custom') {
    return document.getElementById('addWarrantyCustomDuration')?.value.trim() || 'none';
  }
  return dSelect.value;
}

function onAddWarrantyChange() {
  const dSelect = document.getElementById('addWarrantyDuration');
  const customInput = document.getElementById('addWarrantyCustomDuration');
  if (dSelect && customInput) {
    customInput.style.display = (dSelect.value === 'custom') ? 'block' : 'none';
  }
  recalc();
}

// ─── EXTENDED WARRANTY HELPERS ──────────────────────────────────
function getExtWarrantyDuration() {
  const dSelect = document.getElementById('extWarrantyDuration');
  if (!dSelect) return '1 Year (12 Months)';
  if (dSelect.value === 'custom') {
    return document.getElementById('extWarrantyCustomDuration')?.value.trim() || '1 Year (12 Months)';
  }
  return dSelect.value;
}

function onExtWarrantyDurationChange() {
  const dSelect = document.getElementById('extWarrantyDuration');
  const customInput = document.getElementById('extWarrantyCustomDuration');
  if (dSelect && customInput) {
    customInput.style.display = (dSelect.value === 'custom') ? 'block' : 'none';
  }
  recalc();
}

function onExtWarrantyChange() {
  const opt = document.getElementById('extWarrantyOpt')?.value || 'none';
  const fields = document.getElementById('extWarrantyFields');
  if (fields) {
    fields.style.display = (opt === 'none') ? 'none' : 'flex';
  }
  recalc();
}

// ─── FINANCIAL CALCULATION ───────────────────────────────────────
// CORRECT GST LOGIC:
//   1. Calculate subtotal (sum of all line items, ex-GST)
//   2. Apply discount on subtotal
//   3. Add shipping, additional warranty & extended warranty (if selected)
//   4. Taxable value = (subtotal - discount) + extWarrantyTaxable + addWarrantyTaxable + shipping
//   5. CGST = taxable × 9%
//   6. SGST = taxable × 9%
//   7. Grand Total = taxable + CGST + SGST

function recalc() {
  const subtotal = bom.reduce((sum, item) => sum + (item.qty * item.rate), 0);

  const discType = document.getElementById('discType')?.value || 'none';
  const discVal  = Math.max(0, parseFloat(document.getElementById('discVal')?.value) || 0);
  const shipping = Math.max(0, parseFloat(document.getElementById('shipping')?.value) || 0);
  const rawAdv   = parseFloat(document.getElementById('advPct')?.value);
  const advPct   = Math.max(0, Math.min(100, isNaN(rawAdv) ? 50 : rawAdv));

  let discount = 0;
  if (discType === 'pct')  discount = subtotal * (discVal / 100);
  if (discType === 'flat') discount = Math.min(discVal, subtotal); // can't exceed subtotal

  // Additional Warranty Calculation
  const addDur = getAddWarrantyDuration();
  const addCost = Math.max(0, parseFloat(document.getElementById('addWarrantyCost')?.value) || 0);
  const hasAddWarranty = (addDur !== 'none');
  const addBadgeEl = document.getElementById('addWarrantyBadge');
  if (addBadgeEl) {
    if (!hasAddWarranty) {
      addBadgeEl.textContent = 'None';
      addBadgeEl.className = 'badge-v-rev';
    } else if (addCost > 0) {
      addBadgeEl.textContent = `${addDur} (₹${fmt(addCost)})`;
      addBadgeEl.className = 'badge-v-latest';
    } else {
      addBadgeEl.textContent = `${addDur} (Free)`;
      addBadgeEl.className = 'badge-v-latest';
    }
  }

  // Extended Warranty Calculation
  const extOpt = document.getElementById('extWarrantyOpt')?.value || 'none';
  const extPct = Math.max(0, parseFloat(document.getElementById('extWarrantyPct')?.value) || 0);
  const extDuration = getExtWarrantyDuration();
  const extAmt = Math.round(subtotal * (extPct / 100));
  const isExtBilled = (extOpt === 'included');

  // Update badge on sidebar card
  const badgeEl = document.getElementById('extWarrantyAmountBadge');
  if (badgeEl) {
    if (!isExtBilled) {
      badgeEl.textContent = 'None';
      badgeEl.className = 'badge-v-rev';
    } else {
      badgeEl.textContent = `₹${fmt(extAmt)} (${extDuration})`;
      badgeEl.className = 'badge-v-latest';
    }
  }

  const afterDiscount = subtotal - discount;
  const extWarrantyTaxable = isExtBilled ? extAmt : 0;
  const addWarrantyTaxable = hasAddWarranty ? addCost : 0;
  const taxableValue  = afterDiscount + extWarrantyTaxable + addWarrantyTaxable + shipping;

  // Determine GST treatment: Intra-State (Kerala / State 32) vs Inter-State (Outside Kerala)
  const clientStateInput = (document.getElementById('clientState')?.value || '').trim().toLowerCase();
  const clientGstInput = (document.getElementById('clientGst')?.value || '').trim();
  const gstStateCode = clientGstInput.slice(0, 2);

  const isKerala = (clientStateInput === 'kerala' || gstStateCode === '32' || (!clientStateInput && !gstStateCode));
  const isInterState = !isKerala;

  let cgst = 0, sgst = 0, igst = 0;
  if (isInterState) {
    igst = taxableValue * 0.18;
    cgst = 0;
    sgst = 0;
  } else {
    cgst = taxableValue * 0.09;
    sgst = taxableValue * 0.09;
    igst = 0;
  }
  const exactGrandTotal = taxableValue + (isInterState ? igst : (cgst + sgst));
  const roundedGrandTotal = Math.round(exactGrandTotal);
  const roundOff = Number((roundedGrandTotal - exactGrandTotal).toFixed(2));

  // Update web UI
  setText('calcSub',    '₹' + fmt(subtotal));
  setText('calcTax',    '₹' + fmt(taxableValue));
  
  const calcCgstRow = document.getElementById('calcCgstRow');
  const calcSgstRow = document.getElementById('calcSgstRow');
  const calcIgstRow = document.getElementById('calcIgstRow');
  if (isInterState) {
    if (calcCgstRow) calcCgstRow.style.display = 'none';
    if (calcSgstRow) calcSgstRow.style.display = 'none';
    if (calcIgstRow) calcIgstRow.style.display = 'flex';
    setText('calcIGST', '₹' + fmt(igst));
  } else {
    if (calcCgstRow) calcCgstRow.style.display = 'flex';
    if (calcSgstRow) calcSgstRow.style.display = 'flex';
    if (calcIgstRow) calcIgstRow.style.display = 'none';
    setText('calcCGST', '₹' + fmt(cgst));
    setText('calcSGST', '₹' + fmt(sgst));
  }
  
  // Sidebar calcAddWarrantyRow
  const calcAddWarrantyRow = document.getElementById('calcAddWarrantyRow');
  if (calcAddWarrantyRow) {
    if (hasAddWarranty) {
      calcAddWarrantyRow.style.display = 'flex';
      setText('calcAddWarrantyLabel', addDur);
      setText('calcAddWarrantyVal', addCost > 0 ? ('₹' + fmt(addCost)) : 'Included (₹0.00)');
    } else {
      calcAddWarrantyRow.style.display = 'none';
    }
  }

  // Sidebar calcExtWarrantyRow
  const calcExtWarrantyRow = document.getElementById('calcExtWarrantyRow');
  if (calcExtWarrantyRow) {
    if (isExtBilled) {
      calcExtWarrantyRow.style.display = 'flex';
      setText('calcExtWarrantyPctLabel', `${extPct}% (${extDuration})`);
      setText('calcExtWarrantyVal', '₹' + fmt(extAmt));
    } else {
      calcExtWarrantyRow.style.display = 'none';
    }
  }

  const roundOffRow = document.getElementById('roundOffRow');
  if (roundOffRow) {
    if (Math.abs(roundOff) > 0.001) {
      roundOffRow.style.display = 'flex';
      setText('calcRoundOff', '₹' + fmt(roundOff));
    } else {
      roundOffRow.style.display = 'none';
    }
  }

  setText('calcGT',     '₹' + fmt(roundedGrandTotal));
  setText('stickyTotal','₹' + fmt(roundedGrandTotal));

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
  if (postPct) postPct.value = Math.max(0, Math.round(100 - advPct - 30)) + '%';

  const hasDripo = bom.some(b => b.code === 'DRIPO-IM' && b.qty > 0);
  const hasNurseCall = bom.some(b => (b.code === 'ALAMO-CP-R' || b.code === 'ALAMO-CP-B' || b.code === 'ALAMO-PD-S' || b.code === 'ALAMO-DL') && b.qty > 0);
  const isDripoOnly = hasDripo && !hasNurseCall;

  const refInput = document.getElementById('quoteRef');
  if (refInput && refInput.value) {
    if (isDripoOnly && refInput.value.startsWith('GEN-ALA-')) {
      refInput.value = refInput.value.replace(/^GEN-ALA-/, 'GEN-DRP-');
    } else if (!isDripoOnly && refInput.value.startsWith('GEN-DRP-')) {
      refInput.value = refInput.value.replace(/^GEN-DRP-/, 'GEN-ALA-');
    }
  }

  syncDoc(subtotal, discount, afterDiscount, taxableValue, cgst, sgst, roundedGrandTotal, advPct, shipping, roundOff, {
    extOpt, extPct, extDuration, extAmt, isExtBilled,
    hasAddWarranty, addDur, addCost
  }, igst, isInterState);
}





// Helper to compute Place of Supply with GST state code
function getPlaceOfSupply(stateName, gstNumber) {
  if (gstNumber && gstNumber.trim().length >= 2) {
    const prefix = gstNumber.trim().slice(0, 2);
    if (!isNaN(prefix)) {
      return `${stateName || 'State'} (State Code: ${prefix})`;
    }
  }
  const stateCodes = {
    'kerala': '32',
    'tamil nadu': '33',
    'tamilnadu': '33',
    'karnataka': '29',
    'andhra pradesh': '37',
    'telangana': '36',
    'maharashtra': '27',
    'haryana': '06',
    'delhi': '07',
    'gujarat': '24',
    'uttar pradesh': '09',
    'west bengal': '19',
    'rajasthan': '08',
    'madhya pradesh': '23',
    'punjab': '03',
    'bihar': '10',
    'odisha': '21',
    'assam': '18',
    'goa': '30'
  };
  const key = (stateName || '').toLowerCase().trim();
  const code = stateCodes[key] || '32';
  return `${stateName || 'Kerala'} (State Code: ${code})`;
}

// ─── SYNC PROPOSAL DOCUMENT ──────────────────────────────────────
function syncDoc(subtotal, discount, afterDiscount, taxable, cgst, sgst, grand, advPct, shipping, roundOff, extInfo, igst, isInterState) {

  const clientName    = (document.getElementById('clientName')?.value)    || '';
  const clientLoc     = (document.getElementById('clientLocation')?.value) || '';
  const clientDist    = (document.getElementById('clientDistrict')?.value) || '';
  const clientState   = (document.getElementById('clientState')?.value) || '';
  const contactPerson = (document.getElementById('contactPerson')?.value)  || '';
  const quoteRef      = (document.getElementById('quoteRef')?.value)      || '';
  const bdmName       = (document.getElementById('qBdmName')?.innerText)       || 'GenXIoT Sales Team';
  const projectName   = (document.getElementById('projectName')?.value)   || '';
  const quoteVersion  = (document.getElementById('quoteVersion')?.value)  || '1';
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
  const formattedQuoteDate = formatDate(quoteDate);
  setText('qDocRef',        quoteRef);
  setText('qDocRef2',       quoteRef);
  setText('qDocDate',       formattedQuoteDate);
  setText('qDocValid',      getValidDate());
  setText('qDocRev',        `V${quoteVersion}`);
  setText('qClientName',    clientName);
  setText('qClientLoc',     clientLoc);
  setText('qClientDistrict',clientDist);
  setText('qClientState',   clientState);
  setText('qPlaceOfSupply', getPlaceOfSupply(clientState, clientGst));
  setText('qContactPerson', contactPerson);
  setText('qBdmName',       bdmName);

  const signatoryName = document.getElementById('genxSignatoryName')?.value || 'Authorized Signatory';
  const signatoryDesig = document.getElementById('genxSignatoryDesig')?.value || 'GENXIOT LLP';
  setText('qSigGenxName', signatoryName);
  setText('qSigGenxDesig', signatoryDesig);

  const supportPhone = document.getElementById('companySupportPhone')?.value || '+91 9496557777';
  const bdmPhone = document.getElementById('companyBdmPhone')?.value || '+91 88916 70903';
  document.querySelectorAll('.dyn-support-phone').forEach(el => el.textContent = supportPhone);
  document.querySelectorAll('.dyn-bdm-phone').forEach(el => el.textContent = bdmPhone);
  setText('cpDynPhone', supportPhone);

  const custTitle = document.getElementById('customersPageTitleInput')?.value || 'Alamo installations across India';
  setText('custPageTitleOverlay', custTitle);

  const cpModel = document.getElementById('bedCallPointModel')?.value || 'wall';
  const cpBadge = document.getElementById('callPointBadgeModel');
  if (cpBadge) {
    cpBadge.textContent = (cpModel === 'panel')
      ? 'Active Configuration: Model B – Panel-mount (New Construction)'
      : 'Active Configuration: Model A – Wall-mount (Battery-operated)';
  }
  
  const qProjRow = document.getElementById('qProjectNameRow');
  if (qProjRow) {
    if (projectName.trim()) {
      qProjRow.style.display = '';
      setText('qProjectName', projectName.trim());
    } else {
      qProjRow.style.display = 'none';
    }
  }

  const qGstRow = document.getElementById('qClientGstRow');
  if (qGstRow) {
    if (clientGst.trim()) {
      qGstRow.style.display = '';
      setText('qClientGst', clientGst.trim());
    } else {
      qGstRow.style.display = 'none';
    }
  }

  setText('qSigDateGenx',      formattedQuoteDate);
  setText('qSigDateGenxTerms', formattedQuoteDate);
  setText('qSigClientInline',  clientName || 'Hospital Name');
  setText('qSigClient',        clientName || 'Hospital Name');
  
  const hasDripoInBom = bom.some(b => b.code === 'DRIPO-IM' && b.qty > 0);
  const hasNurseCallInBom = bom.some(b => (b.code === 'ALAMO-CP-R' || b.code === 'ALAMO-CP-B' || b.code === 'ALAMO-PD-S' || b.code === 'ALAMO-DL') && b.qty > 0);
  const isDripoOnlyQuote = hasDripoInBom && !hasNurseCallInBom;
  const qFloorBreakup = document.getElementById('qFloorBreakup');
  const qOptionalNote = document.getElementById('qOptionalNote');

  if (isDripoOnlyQuote) {
    const dripoItem = bom.find(b => b.code === 'DRIPO-IM');
    const gwItem = bom.find(b => b.code === 'ALAMO-GW' && b.qty > 0);
    const rptItem = bom.find(b => b.code === 'ALAMO-RPT' && b.qty > 0);
    const tvItem = bom.find(b => b.code === 'ALAMO-NS-TV' && b.qty > 0);
    const miniItem = bom.find(b => b.code === 'ALAMO-MINI' && b.qty > 0);
    const dQty = dripoItem ? dripoItem.qty : 0;

    setText('qHeaderTagline', 'Intelligent Healthcare & Smart Infusion Monitoring');
    setText('qPartnerSub', 'Authorized Dripo Partner · Smart Infusion Solutions');
    setText('qSectionTitle', 'Bill of Quantities – Dripo Smart Infusion System');
    setText('qFacLabel', 'Scope:');

    const facParts = [`${dQty} Dripo Smart Infusion Monitor${dQty > 1 ? 's' : ''}`];
    if (gwItem) facParts.push(`${gwItem.qty} Gateway${gwItem.qty > 1 ? 's' : ''}`);
    if (rptItem) facParts.push(`${rptItem.qty} Repeater${rptItem.qty > 1 ? 's' : ''}`);
    if (tvItem) facParts.push(`${tvItem.qty} 32" Central Station Display${tvItem.qty > 1 ? 's' : ''}`);
    if (miniItem) facParts.push(`${miniItem.qty} Mini Station Display${miniItem.qty > 1 ? 's' : ''}`);
    setText('qFacility', facParts.join(' · '));

    if (qFloorBreakup) {
      qFloorBreakup.innerHTML = '';
    }

    if (qOptionalNote) {
      qOptionalNote.innerHTML = '';
    }

  } else {
    // Alamo Nurse Call System (or Combined Alamo + Dripo)
    setText('qHeaderTagline', 'Intelligent Healthcare & Smart IoT Solutions');
    setText('qPartnerSub', hasDripoInBom ? 'Authorized Alamo & Dripo Integration Partner' : 'Authorized Alamo Integration Partner');
    setText('qSectionTitle', 'Bill of Quantities – Facility Specific Configuration');
    setText('qFacLabel', 'Facility:');

    const hasBilledBeds = bom.some(b => b.driverKey === 'beds' && b.qty > 0);
    const hasBilledRooms = bom.some(b => b.driverKey === 'rooms' && b.qty > 0);
    const hasBilledBaths = bom.some(b => (b.driverKey === 'bathrooms' || b.code === 'ALAMO-CP-B') && b.qty > 0);
    const hasBilledNs = bom.some(b => (b.driverKey === 'ns_basic' || b.driverKey === 'ns_tv') && b.qty > 0);

    const facilityParts = [];
    if (beds > 0 && hasBilledBeds) facilityParts.push(`${beds} Bed${beds > 1 ? 's' : ''}`);
    if (rooms > 0 && hasBilledRooms) facilityParts.push(`${rooms} Room${rooms > 1 ? 's' : ''}`);
    if (washrooms > 0 && hasBilledBaths) facilityParts.push(`${washrooms} Washroom${washrooms > 1 ? 's' : ''}`);
    if (wards > 0 && hasBilledNs) facilityParts.push(`${wards} Nursing Station${wards > 1 ? 's' : ''}`);
    setText('qFacility', facilityParts.join(' · '));

    let floorBreakupHtml = '';
    let floorsWithoutNs = [];
    let floorsWithNs = [];
    if (floors && floors.length > 0) {
      floors.forEach((f, i) => {
        let flName = f.name && f.name.trim() !== '' ? f.name : `Floor ${i+1}`;
        let parts = [];
        let b = parseInt(f.beds) || 0, r = parseInt(f.rooms) || 0, w = parseInt(f.baths) || 0, n = parseInt(f.ns) || 0;
        if (b > 0 && hasBilledBeds) parts.push(`${b} Bed${b > 1 ? 's' : ''}`);
        if (r > 0 && hasBilledRooms) parts.push(`${r} Room${r > 1 ? 's' : ''}`);
        if (w > 0 && hasBilledBaths) parts.push(`${w} Washroom${w > 1 ? 's' : ''}`);
        if (n > 0 && hasBilledNs) parts.push(`${n} Nursing Station${n > 1 ? 's' : ''}`);
        
        if (n > 0) {
          floorsWithNs.push(flName);
        } else if (b > 0 || r > 0) {
          floorsWithoutNs.push(flName);
        }

        if (parts.length > 0) {
          floorBreakupHtml += `<strong>${flName}:</strong> ${parts.join(', ')}<br>`;
        }
      });
    }

    // Flaw 6: Coverage Note (Required whenever a floor has no nursing station)
    const coverageInput = document.getElementById('coverageNoteInput');
    const targetNsFloor = floorsWithNs.length > 0 ? floorsWithNs[0] : 'Floor 1';
    let defaultCoverageDraft = (floorsWithoutNs.length > 0)
      ? `${floorsWithoutNs.join(', ')} has no nursing station. Its calls are routed to the ${targetNsFloor} display via repeaters.`
      : '';
    if (coverageInput && !coverageInput.dataset.userEdited && defaultCoverageDraft) {
      coverageInput.value = defaultCoverageDraft;
    }
    const finalCoverageNote = coverageInput?.value || defaultCoverageDraft;
    if (floorsWithoutNs.length > 0 && finalCoverageNote) {
      floorBreakupHtml += `<div style="margin-top: 4px; font-size: 0.74rem; color: #475569; font-style: italic;"><strong>Coverage Note:</strong> ${finalCoverageNote}</div>`;
    }

    // Flaw 7: Architecture Basis Line (Editable per quote, with gateway and repeater count)
    const gwItem = bom.find(b => b.code === 'ALAMO-GW' && b.qty > 0);
    const rptItem = bom.find(b => b.code === 'ALAMO-RPT' && b.qty > 0);
    const gwCount = gwItem ? gwItem.qty : 2;
    const rptCount = rptItem ? rptItem.qty : 0;
    const archInput = document.getElementById('archBasisInput');
    const defaultArchDraft = `${gwCount} gateways (one for local operation, one for cloud), ${rptCount > 0 ? `${rptCount} repeaters for local floor-to-floor LoRa coverage as per facility layout` : 'repeaters as required for local coverage'}.`;
    if (archInput && !archInput.dataset.userEdited) {
      archInput.value = defaultArchDraft;
    }
    const finalArchBasis = archInput?.value || defaultArchDraft;
    floorBreakupHtml += `<div style="margin-top: 4px; font-size: 0.74rem; color: #475569;"><strong>Architecture Basis:</strong> ${finalArchBasis}</div>`;

    if (qFloorBreakup) qFloorBreakup.innerHTML = floorBreakupHtml;

    // ── Optional Add-ons (Selectable on Quotation) ──
    const qOptionalNote = document.getElementById('qOptionalNote');
    const chkShowAddons = document.getElementById('chkShowOptionalAddons')?.checked ?? true;

    // Refresh optional add-ons UI picker
    renderOptionalAddonsPicker();

    if (qOptionalNote) {
      if (chkShowAddons && !isDripoOnlyQuote && selectedAddonCodes.size > 0) {
        const bomCodes = bom.filter(b => b.qty > 0).map(b => b.code);
        let optItemsToPrint = ADDON_CATALOGUE.filter(c => selectedAddonCodes.has(c.code) && !bomCodes.includes(c.code));

        if (optItemsToPrint.length > 0) {
          let optHtml = `
            <div style="margin-bottom: 8px; padding: 6px 10px; border: 1px dashed #cbd5e1; border-radius: 4px; background: #f8fafc; font-size: 0.68rem;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 3px;">
                <strong style="color: #1e293b; text-transform: uppercase; letter-spacing: 0.04em;">Optional Add-ons (Exclusive of GST at 18%)</strong>
                <span style="color: #64748b; font-size: 0.63rem;">Rates valid for quotation validity period</span>
              </div>
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 2px 14px; line-height: 1.35; color: #334155;">
          `;
          optItemsToPrint.forEach(item => {
            let itemName = item.name.replace(/^Alamo\s+/i, '');
            let extra = item.renewal ? ` (${item.renewal})` : (item.code === 'ALAMO-NS-TV' ? ' (Display Monitor)' : '');
            optHtml += `
              <div style="display: flex; justify-content: space-between; border-bottom: 1px dotted #e2e8f0; padding: 1px 0;">
                <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 68%;">${itemName}${extra}</span>
                <strong style="color: var(--brand-navy); white-space: nowrap;">₹${fmt(item.rate)} / ${item.unit || 'pc'}</strong>
              </div>
            `;
          });
          optHtml += `
              </div>
            </div>
          `;
          qOptionalNote.innerHTML = optHtml;
          qOptionalNote.style.display = 'block';
        } else {
          qOptionalNote.innerHTML = '';
          qOptionalNote.style.display = 'none';
        }
      } else {
        qOptionalNote.innerHTML = '';
        qOptionalNote.style.display = 'none';
      }
    }
  }
  setText('qSigClient', clientName);

  // BOQ rows in proposal document
  const tbody = document.getElementById('qBomBody');
  if (tbody) {
    tbody.innerHTML = '';
    let sr = 1;
    let lastGroup = null;
    let isFirstInGroup = false;

    bom.forEach(item => {
      if (item.qty === 0) return;

      if (item.group !== lastGroup) {
        lastGroup = item.group;
        const gtr = document.createElement('tr');
        gtr.className = 'grp-row';
        gtr.style.pageBreakAfter = 'avoid';
        gtr.style.breakAfter = 'avoid';
        gtr.innerHTML = `<td colspan="6">${item.group}</td>`;
        tbody.appendChild(gtr);
        isFirstInGroup = true;
      }

      const amt = item.qty * item.rate;
      const displayInfo = getItemDisplayInfo(item, isDripoOnlyQuote);
      const tr  = document.createElement('tr');
      if (isFirstInGroup) {
        tr.style.pageBreakBefore = 'avoid';
        tr.style.breakBefore = 'avoid';
        isFirstInGroup = false;
      }

      tr.innerHTML = `
        <td style="text-align:center;color:#999;white-space:nowrap">${sr++}</td>
        <td style="white-space:nowrap;font-family:Consolas, 'Courier New', monospace;font-weight:400;font-size:.68rem;color:var(--brand-indigo);letter-spacing:0.02em">${item.code}</td>
        <td>
          <strong style="font-size:.78rem">${displayInfo.name}</strong>
          <div style="font-size:.68rem;color:#888;margin-top:2px">${displayInfo.desc}</div>
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

  // Commercial Details: Additional Warranty row if selected
  const qAddWarrantyBillRow = document.getElementById('qAddWarrantyBillRow');
  if (qAddWarrantyBillRow) {
    if (extInfo?.hasAddWarranty) {
      qAddWarrantyBillRow.style.display = '';
      setText('qAddWarrantyBillLabel', extInfo.addDur);
      setText('qAddWarrantyBillVal', extInfo.addCost > 0 ? ('₹' + fmt(extInfo.addCost)) : 'Included (₹0.00)');
    } else {
      qAddWarrantyBillRow.style.display = 'none';
    }
  }

  // Commercial Details: Extended warranty bill row if included
  const qExtWarrantyBillRow = document.getElementById('qExtWarrantyBillRow');
  if (qExtWarrantyBillRow) {
    if (extInfo?.isExtBilled) {
      qExtWarrantyBillRow.style.display = '';
      setText('qExtWarrantyBillLabel', `${extInfo.extDuration} @ ${extInfo.extPct}%`);
      setText('qExtWarrantyBillVal', '₹' + fmt(extInfo.extAmt));
    } else {
      qExtWarrantyBillRow.style.display = 'none';
    }
  }

  // Optional Note for Extended Warranty (legacy container kept hidden)
  const qExtOptNote = document.getElementById('qExtWarrantyOptNote');
  if (qExtOptNote) {
    qExtOptNote.style.display = 'none';
    qExtOptNote.innerHTML = '';
  }

  const qCgstRow = document.getElementById('qCgstRow');
  const qSgstRow = document.getElementById('qSgstRow');
  const qIgstRow = document.getElementById('qIgstRow');

  if (isInterState) {
    if (qCgstRow) qCgstRow.style.display = 'none';
    if (qSgstRow) qSgstRow.style.display = 'none';
    if (qIgstRow) qIgstRow.style.display = '';
    setText('qIGST', '₹' + fmt(igst || 0));
    setText('qGTLabel', 'Grand Total (18% IGST)');
  } else {
    if (qCgstRow) qCgstRow.style.display = '';
    if (qSgstRow) qSgstRow.style.display = '';
    if (qIgstRow) qIgstRow.style.display = 'none';
    setText('qCGST', '₹' + fmt(cgst));
    setText('qSGST', '₹' + fmt(sgst));
    setText('qGTLabel', 'Grand Total (18% GST: CGST 9% + SGST 9%)');
  }

  setText('qTaxable',  '₹' + fmt(taxable));
  setText('qGT',       '₹' + fmt(grand));
  setText('qAmountWords', numberToWordsIndian(grand));
  updateDocTypeDisplay();
  
  const qRoundOffRow = document.getElementById('qRoundOffRow');
  if (qRoundOffRow) {
    if (roundOff !== undefined && Math.abs(roundOff) > 0.001) {
      qRoundOffRow.style.display = '';
      setText('qRoundOff', '₹' + fmt(roundOff));
    } else {
      qRoundOffRow.style.display = 'none';
    }
  }

  const qDiscRow = document.getElementById('qDiscRow');
  const qDiscLabel = document.getElementById('qDiscLabel');
  if (qDiscRow) {
    if (discount > 0) {
      qDiscRow.style.display = '';
      if (qDiscLabel) {
        const discType = document.getElementById('discType')?.value || 'none';
        const discVal = document.getElementById('discVal')?.value || '0';
        qDiscLabel.textContent = discType === 'pct' ? `${discVal}%` : 'Special Commercial Discount';
      }
      setText('qDisc', '−₹' + fmt(discount));
    } else {
      qDiscRow.style.display = 'none';
    }
  }

  // Payment milestones
  const advPctVal = parseFloat(advPct) || 50;
  const delPctVal = 30;
  const postPctVal = 100 - advPctVal - delPctVal;

  const advAmt  = Math.round(grand * advPctVal / 100);
  const delAmt  = Math.round(grand * delPctVal / 100);
  const postAmt = grand - advAmt - delAmt;

  setText('qAdvPct',  advPctVal + '%');
  setText('qDelPct',  delPctVal + '%');
  setText('qPostPct', postPctVal + '%');
  setText('qAdvAmt',  '₹' + fmt(advAmt));
  setText('qDelAmt',  '₹' + fmt(delAmt));
  setText('qPostAmt', '₹' + fmt(postAmt));

  // T&C Updates
  setText('qDelivery', delivery);

  // Standard Warranty (+ Additional Warranty if selected)
  let warrantyText = warranty.trim();
  if (extInfo?.hasAddWarranty) {
    const durStr = extInfo.addDur.replace(/^\+\s*/, '');
    warrantyText += ` + ${durStr} additional warranty (special concession)`;
  }
  setText('qWarranty', warrantyText);
  setText('qScope',    scopeNotes);

  // Extended Warranty Clause in Terms & Conditions
  const extTermsText = (document.getElementById('extWarrantyTerms')?.value) || 'Comprehensive replacement or repair of defective units or parts for the specified duration (consumables/wear parts like pull cords and batteries excluded).';
  const qExtInline = document.getElementById('qExtWarrantyInline');
  if (qExtInline) {
    if (extInfo?.isExtBilled) {
      qExtInline.innerHTML = ` <strong>Extended Warranty:</strong> Provided for <strong>${extInfo.extDuration}</strong> on additional payment of <strong>${extInfo.extPct}% of component cost</strong> (₹${fmt(extInfo.extAmt)} + applicable GST). Covers ${extTermsText} Following standard warranty completion.`;
    } else {
      qExtInline.innerHTML = '';
    }
  }


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
  setText('qSigClientInline', clientName || 'Client / Hospital');
  
  // Sync Proposal Brochure cover badge and layout
  if (typeof updateProposalBrochure === 'function') {
    updateProposalBrochure();
  }
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
  const parts = dateStr.split('-');
  let d;
  if (parts.length === 3) {
    d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  } else {
    d = new Date(dateStr);
  }
  if (!d || isNaN(d.getTime())) return todayStr();
  return d.toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'});
}
function getValidDate() {
  const days = parseInt(document.getElementById('validityDays')?.value) || 30;
  const qDateStr = document.getElementById('quoteDate')?.value;
  let d;
  if (qDateStr) {
    const parts = qDateStr.split('-');
    if (parts.length === 3) {
      d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
  }
  if (!d || isNaN(d.getTime())) d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'});
}
function fillDocDates() {
  const qDateVal = document.getElementById('quoteDate')?.value;
  setText('qDocDate',  formatDate(qDateVal));
  setText('qDocValid', getValidDate());
}

// ─── BROCHURE LAYOUT MODE (Spread vs Portrait vs Single) ─────────
let currentBrochureLayoutMode = '2up-spread';

function onBrochureLayoutModeChange() {
  const sel = document.getElementById('brochureLayoutMode');
  if (sel) currentBrochureLayoutMode = sel.value;
  applyBrochureLayoutClass();
}

function applyBrochureLayoutClass() {
  document.body.classList.remove('brochure-2up-spread', 'brochure-2up-portrait', 'brochure-single');
  document.body.classList.add('brochure-' + currentBrochureLayoutMode);
  const sel = document.getElementById('brochureLayoutMode');
  if (sel && sel.value !== currentBrochureLayoutMode) sel.value = currentBrochureLayoutMode;
}

// ─── OPTIONAL ADD-ONS CATALOGUE & SELECTABLE PICKER ──────────────
const ADDON_CATALOGUE = [
  { code: 'ALAMO-PD-D', name: 'Double Button Pendant', rate: 950, unit: 'pc', group: 'Bed' },
  { code: 'ALAMO-PD-S', name: 'Single Button Pendant', rate: 600, unit: 'pc', group: 'Bed' },
  { code: 'ALAMO-CB-ACC', name: 'Code Blue Pendant Accessory', rate: 900, unit: 'pc', group: 'Safety' },
  { code: 'ALAMO-DL', name: 'Call Light V2 (Door Indicator)', rate: 2600, unit: 'pc', group: 'Room' },
  { code: 'ALAMO-CP-B', name: 'Washroom Call Point', rate: 2400, unit: 'pc', group: 'Washroom' },
  { code: 'ALAMO-PL', name: 'Pull Cord for Washroom', rate: 600, unit: 'pc', group: 'Washroom' },
  { code: 'ALAMO-NS-TV', name: '32" Smart Display', rate: 12000, unit: 'pc', group: 'Display' },
  { code: 'ALAMO-RPT', name: 'LoRa Range Repeater', rate: 3500, unit: 'pc', group: 'Network' },
  { code: 'ALAMO-GW', name: 'Central Gateway (Cloud / Local)', rate: 12000, unit: 'pc', group: 'Server' },
  { code: 'ALAMO-CLOUD-SW', name: 'Cloud Software & Analytics (3 Yrs)', rate: 10500, unit: 'stn', renewal: '₹3,500/yr renewal', group: 'Software' },
  { code: 'DRIPO-IM', name: 'Dripo Smart Infusion Monitor', rate: 4500, unit: 'unit', group: 'Infusion' }
];

let selectedAddonCodes = new Set();
let userCustomizedAddons = false;

function renderOptionalAddonsPicker() {
  const container = document.getElementById('optionalAddonsList');
  if (!container) return;

  const bomCodes = bom.filter(b => b.qty > 0).map(b => b.code);
  const hasDoublePendant = bomCodes.includes('ALAMO-PD-D') || document.getElementById('chkDoublePendant')?.checked;

  if (!userCustomizedAddons) {
    selectedAddonCodes.clear();
    ADDON_CATALOGUE.forEach(item => {
      // 1. Exclude items already in BoQ
      if (bomCodes.includes(item.code)) return;

      // 2. If Double Pendant is chosen, Single Pendant is a DOWNGRADE - do NOT select by default!
      if (item.code === 'ALAMO-PD-S' && hasDoublePendant) return;

      // 3. Smart TV if Mini Station is chosen
      if (item.code === 'ALAMO-NS-TV' && bomCodes.includes('ALAMO-MINI')) {
        selectedAddonCodes.add(item.code);
        return;
      }

      // 4. Cloud Software if not in BOM
      if (item.code === 'ALAMO-CLOUD-SW' && !bomCodes.includes('ALAMO-CLOUD-SW')) {
        selectedAddonCodes.add(item.code);
        return;
      }

      // 5. Code Blue Accessory Pendant
      if (item.code === 'ALAMO-CB-ACC' && !bomCodes.includes('ALAMO-CB-ACC')) {
        selectedAddonCodes.add(item.code);
        return;
      }

      // 6. Double Button Pendant if single button is in BOM
      if (item.code === 'ALAMO-PD-D' && !hasDoublePendant && bomCodes.includes('ALAMO-PD-S')) {
        selectedAddonCodes.add(item.code);
        return;
      }
    });
  }

  container.innerHTML = '';
  ADDON_CATALOGUE.forEach(item => {
    const inBom = bomCodes.includes(item.code);
    const isChecked = selectedAddonCodes.has(item.code);
    const label = document.createElement('label');
    label.style.cssText = `display:flex; align-items:center; gap:5px; font-size:0.72rem; margin:0; cursor:${inBom ? 'not-allowed' : 'pointer'}; ${inBom ? 'opacity:0.45;' : ''} white-space:nowrap; overflow:hidden; text-overflow:ellipsis;`;
    label.title = `${item.name} - ₹${fmt(item.rate)}/${item.unit || 'pc'}${inBom ? ' (Already in BoQ)' : ''}`;

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.value = item.code;
    input.checked = isChecked && !inBom;
    input.disabled = inBom;
    input.onchange = (e) => onAddonCheckboxChange(item.code, e.target.checked);

    const span = document.createElement('span');
    span.textContent = item.name.replace(/^Alamo\s+/i, '') + (inBom ? ' (In BoQ)' : '');

    label.appendChild(input);
    label.appendChild(span);
    container.appendChild(label);
  });
}

function onAddonCheckboxChange(code, checked) {
  userCustomizedAddons = true;
  if (checked) {
    selectedAddonCodes.add(code);
  } else {
    selectedAddonCodes.delete(code);
  }
  recalc();
}

function toggleOptionalAddons(show) {
  const container = document.getElementById('optionalAddonsList');
  if (container) container.style.display = show ? 'grid' : 'none';
  recalc();
}

// ─── PROPOSAL BROCHURE & PRINT MODAL ────────────────────────────
let activeDocMode = 'proposal';

function updateProposalBrochure() {
  const el = id => document.getElementById(id);

  // Sync Cover Badge
  const cName = (el('clientName')?.value || 'Hospital Name').trim();
  const cLoc = (el('clientLocation')?.value || '').trim();
  const cDist = (el('clientDistrict')?.value || '').trim();
  const cState = (el('clientState')?.value || '').trim();
  const fullLoc = [cLoc, cDist, cState].filter(Boolean).join(', ') || 'Kerala, India';
  
  if (el('bcbClientName')) el('bcbClientName').textContent = cName || 'Hospital Name';
  if (el('bcbClientLocation')) el('bcbClientLocation').textContent = fullLoc;
  if (el('bcbQuoteRef')) el('bcbQuoteRef').textContent = el('quoteRef')?.value || el('qDocRef')?.textContent || '–';
  if (el('bcbQuoteDate')) el('bcbQuoteDate').textContent = el('quoteDate')?.value ? formatDate(el('quoteDate').value) : (el('qDocDate')?.textContent || '–');
  if (el('bcbRepName')) el('bcbRepName').textContent = el('qBdmName')?.innerText || el('bdmName')?.value || 'GenXIoT Sales Team';

  // Badge visibility
  const showBadge = el('chkBadge') ? el('chkBadge').checked : true;
  if (el('brochureCoverBadge')) {
    el('brochureCoverBadge').style.display = showBadge ? 'block' : 'none';
  }

  // Terms & Conditions visibility (Page 2 of quotation)
  const showTerms = el('chkTerms') ? el('chkTerms').checked : true;
  if (activeDocMode === 'tax_invoice' || activeDocMode === 'cover') {
    if (el('pageTerms')) el('pageTerms').style.display = 'none';
  } else {
    if (el('pageTerms')) el('pageTerms').style.display = showTerms ? 'block' : 'none';
  }
  document.body.classList.toggle('show-terms', showTerms);

  // Sync client name to compact signature on 1-page quotation
  if (el('qSigClientInline')) {
    el('qSigClientInline').textContent = cName || 'Client / Hospital';
  }

  // Active mode check
  if (activeDocMode !== 'proposal') {
    if (el('proposalFrontPages')) el('proposalFrontPages').style.display = 'none';
    if (el('proposalBackPages')) el('proposalBackPages').style.display = 'none';
    document.body.classList.remove('has-back-brochure');
    document.body.classList.add('no-back-brochure');
    return;
  }

  // In Proposal mode:
  if (el('proposalFrontPages')) el('proposalFrontPages').style.display = 'block';
  if (el('proposalBackPages')) el('proposalBackPages').style.display = 'block';

  const chkCover = el('chkCover') ? el('chkCover').checked : true;
  const chkAlamo = el('chkAlamo') ? el('chkAlamo').checked : true;
  const chkDripo = el('chkDripoBrochure') ? el('chkDripoBrochure').checked : false;
  const chkClients = el('chkClients') ? el('chkClients').checked : true;
  const chkContact = el('chkContact') ? el('chkContact').checked : true;

  const hasBedCallPoint = bom.some(b => (b.code === 'ALAMO-CP-R' || b.code === 'ALAMO-CP-B') && b.qty > 0);
  const hasAccessories = bom.some(b => (b.code === 'ALAMO-PD-S' || b.code === 'ALAMO-PD-D' || b.code === 'ALAMO-CP-B' || b.code === 'ALAMO-PL' || b.code === 'ALAMO-CB-ACC') && b.qty > 0);
  const hasDisplaysOrIndicators = bom.some(b => (b.code === 'ALAMO-DL' || b.code === 'ALAMO-MINI' || b.code === 'ALAMO-NS-TV') && b.qty > 0);
  const hasCloudSoftware = bom.some(b => b.code === 'ALAMO-CLOUD-SW' && b.qty > 0);
  const hasDripoUnits = bom.some(b => b.code === 'DRIPO-IM' && b.qty > 0);

  const showCover = chkCover;
  const showP2 = chkAlamo && hasBedCallPoint;
  const showP3 = chkAlamo && hasAccessories;
  const showP4 = chkAlamo && hasDisplaysOrIndicators;
  const showP5 = chkAlamo && hasCloudSoftware;
  const showP6 = chkDripo && hasDripoUnits;
  const showP7 = chkClients;
  const showP8 = chkContact;

  if (el('brochurePage1')) el('brochurePage1').style.display = showCover ? 'block' : 'none';
  if (el('brochurePage2')) el('brochurePage2').style.display = showP2 ? 'block' : 'none';
  if (el('brochurePage3')) el('brochurePage3').style.display = showP3 ? 'block' : 'none';
  if (el('spreadFront1')) el('spreadFront1').style.display = (showP2 || showP3) ? '' : 'none';

  if (el('brochurePage4')) el('brochurePage4').style.display = showP4 ? 'block' : 'none';
  if (el('brochurePage5')) el('brochurePage5').style.display = showP5 ? 'block' : 'none';
  if (el('spreadFront2')) el('spreadFront2').style.display = (showP4 || showP5) ? '' : 'none';

  if (el('brochurePage6')) el('brochurePage6').style.display = showP6 ? 'block' : 'none';

  if (el('brochurePage7')) el('brochurePage7').style.display = showP7 ? 'block' : 'none';
  if (el('brochurePage8')) el('brochurePage8').style.display = showP8 ? 'block' : 'none';
  if (el('spreadBack')) el('spreadBack').style.display = (showP7 || showP8) ? '' : 'none';

  const hasBack = showP7 || showP8;
  document.body.classList.toggle('has-back-brochure', hasBack);
  document.body.classList.toggle('no-back-brochure', !hasBack);
  applyBrochureLayoutClass();
}

function setBrochurePreset(preset) {
  const el = id => document.getElementById(id);
  if (preset === 'all') {
    if (el('chkCover')) el('chkCover').checked = true;
    if (el('chkAlamo')) el('chkAlamo').checked = true;
    if (el('chkDripoBrochure')) el('chkDripoBrochure').checked = true;
    if (el('chkClients')) el('chkClients').checked = true;
    if (el('chkContact')) el('chkContact').checked = true;
    if (el('chkTerms')) el('chkTerms').checked = true;
    previewProposal();
  } else if (preset === 'alamo') {
    if (el('chkCover')) el('chkCover').checked = true;
    if (el('chkAlamo')) el('chkAlamo').checked = true;
    if (el('chkDripoBrochure')) el('chkDripoBrochure').checked = false;
    if (el('chkClients')) el('chkClients').checked = true;
    if (el('chkContact')) el('chkContact').checked = true;
    if (el('chkTerms')) el('chkTerms').checked = true;
    previewProposal();
  } else if (preset === 'dripo') {
    if (el('chkCover')) el('chkCover').checked = true;
    if (el('chkAlamo')) el('chkAlamo').checked = false;
    if (el('chkDripoBrochure')) el('chkDripoBrochure').checked = true;
    if (el('chkClients')) el('chkClients').checked = true;
    if (el('chkContact')) el('chkContact').checked = true;
    if (el('chkTerms')) el('chkTerms').checked = true;
    previewProposal();
  } else if (preset === 'none') {
    if (el('chkCover')) el('chkCover').checked = false;
    if (el('chkAlamo')) el('chkAlamo').checked = false;
    if (el('chkDripoBrochure')) el('chkDripoBrochure').checked = false;
    if (el('chkClients')) el('chkClients').checked = false;
    if (el('chkContact')) el('chkContact').checked = false;
    if (el('chkTerms')) el('chkTerms').checked = false;
    openModal(); // Quick BOQ mode (1 single page)
  }
  if (el('chkDripoBrochure')) el('chkDripoBrochure').dataset.userModified = 'true';
  updateProposalBrochure();
}

function previewProposal() {
  activeDocMode = 'proposal';
  recalc();
  const mb = document.getElementById('modalBg');
  if (mb) {
    mb.classList.add('open');
    mb.scrollTop = 0;
  }
  if (typeof _applyCoverPageMode === 'function') _applyCoverPageMode(false);
  if (typeof _applyProformaMode === 'function') _applyProformaMode(false);
  if (typeof _applyTaxInvoiceMode === 'function') _applyTaxInvoiceMode(false);

  // Auto-detect Dripo quote to enable Dripo page by default if quote has Dripo
  const isDripo = (typeof isDripoQuoteActive === 'function') && isDripoQuoteActive();
  const chkDripoBrochure = document.getElementById('chkDripoBrochure');
  if (chkDripoBrochure && isDripo && !chkDripoBrochure.dataset.userModified) {
    chkDripoBrochure.checked = true;
  }

  const el = id => document.getElementById(id);
  if (el('modalTitle')) el('modalTitle').textContent = 'GenXIoT · Executive Techno-Commercial Proposal Preview';
  if (el('proposalSettings')) el('proposalSettings').style.display = 'flex';
  if (el('coverPageSettings')) el('coverPageSettings').style.display = 'none';
  if (el('invoiceSettings')) el('invoiceSettings').style.display = 'none';

  updateProposalBrochure();
  if (window.lucide) lucide.createIcons();
}

function openModal() {
  activeDocMode = 'quote';
  recalc();
  const mb = document.getElementById('modalBg');
  mb.classList.add('open');
  mb.scrollTop = 0;

  if (typeof _applyCoverPageMode === 'function') _applyCoverPageMode(false);
  if (typeof _applyProformaMode === 'function') _applyProformaMode(false);
  if (typeof _applyTaxInvoiceMode === 'function') _applyTaxInvoiceMode(false);

  const el = id => document.getElementById(id);
  if (el('modalTitle')) el('modalTitle').textContent = 'GenXIoT · Quick Quotation / BOQ Preview';
  if (el('proposalSettings')) el('proposalSettings').style.display = 'flex';
  if (el('coverPageSettings')) el('coverPageSettings').style.display = 'none';
  if (el('invoiceSettings')) el('invoiceSettings').style.display = 'none';

  updateProposalBrochure();
  if (window.lucide) lucide.createIcons();
}

function closeModal() {
  document.getElementById('modalBg').classList.remove('open');
  if (typeof _applyCoverPageMode === 'function') _applyCoverPageMode(false);
  if (typeof _applyProformaMode === 'function') _applyProformaMode(false);
  if (typeof _applyTaxInvoiceMode === 'function') _applyTaxInvoiceMode(false);
  updateProposalBrochure();
}

function printDoc() {
  recalc();
  updateProposalBrochure();
  if (activeDocMode === 'tax_invoice' && typeof updateTaxInvoiceView === 'function') {
    updateTaxInvoiceView();
  }
  const ctrls = document.querySelectorAll('.modal-ctrl');
  ctrls.forEach(c => c.style.display = 'none');
  document.getElementById('modalBg').classList.add('open');
  setTimeout(() => {
    window.print();
    ctrls.forEach(c => {
      if (c.id === 'coverPageSettings') {
        c.style.display = (activeDocMode === 'cover') ? 'flex' : 'none';
      } else if (c.id === 'invoiceSettings') {
        c.style.display = (activeDocMode === 'tax_invoice') ? 'flex' : 'none';
      } else if (c.id === 'proposalSettings') {
        c.style.display = (activeDocMode === 'cover' || activeDocMode === 'proforma' || activeDocMode === 'tax_invoice') ? 'none' : 'flex';
      } else {
        c.style.display = 'flex';
      }
    });
  }, 100);
}


function resetQuote(force = false) {
  if (!force && !confirm('Reset will clear all current data. Continue?')) return;

  const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
  const setChk = (id, v) => { const el = document.getElementById(id); if (el) el.checked = v; };

  bom = CATALOGUE.map(item => ({
    ...item,
    qty: 0,
    baseRate: (item.code === 'DRIPO-IM') ? 4500 : (item.mrp || item.rate),
    rate: (item.code === 'DRIPO-IM') ? 4500 : (item.mrp || item.rate),
    isLocked: false
  }));

  // Client / deal info
  setVal('clientName',     '');
  setVal('quoteVersion',   '1');
  setVal('dealStatus',     'Pending');
  onDealStatusChange();
  updateVersionBadge('1');
  window.previousRevisionRef = null;
  setVal('clientLocation', '');
  setVal('clientDistrict', '');
  setVal('clientState',    '');
  setVal('contactPerson',  '');
  setVal('poRef',          '');
  setVal('clientGst',      '');
  setVal('piRef',          '');
  setVal('coverFinalAmt',  '');
  setVal('coverAdvAmt',    '');
  // Financial
  setVal('discType',  'none');
  setVal('discVal',   '0');
  setVal('shipping',  '3500');
  setVal('advPct',    '50');
  // Terms
  setVal('delivery',  '25 days from order confirmation and receipt of advance payment');
  setVal('warranty',  '12 months standard warranty from date of installation and handover');
  setVal('addWarrantyDuration',       'none');
  setVal('addWarrantyCustomDuration', '');
  setVal('addWarrantyCost',           '0');
  onAddWarrantyChange();

  setVal('extWarrantyOpt',            'none');
  setVal('extWarrantyDuration',       '1 Year (12 Months)');
  setVal('extWarrantyCustomDuration', '');
  setVal('extWarrantyPct',            '10');
  setVal('extWarrantyTerms',          'Comprehensive replacement or repair of defective units or parts for the specified duration (consumables/wear parts like pull cords and batteries excluded).');
  onExtWarrantyDurationChange();
  onExtWarrantyChange();
  setVal('scopeNotes','Wall mounting and electrical work by the hospital. Configuration, calibration & go-live training by GenXIoT.');

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


  floors = [{ name:  'Floor 1', beds: 0, rooms: 0, baths: 0, ns: 0 }];
  renderFloors();
  generateLocalQtn();
  recalc();
}

// ─── EVENT LISTENERS ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  applyBrochureLayoutClass();
  renderOptionalAddonsPicker();

  // Close modal on backdrop click
  document.getElementById('modalBg').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
  });
  // Preset dropdown toggle — guard: element may not exist on all pages
  const presetBtn = document.getElementById('presetBtn');
  if (presetBtn) {
    presetBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      document.getElementById('presetDrop')?.classList.toggle('open');
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
  let csv = 'GenXIoT Quotation - Bill of Quantities\n\n';
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

  const discType = document.getElementById('discType')?.value || 'none';
  const discVal  = Math.max(0, parseFloat(document.getElementById('discVal')?.value) || 0);
  const shipping = Math.max(0, parseFloat(document.getElementById('shipping')?.value) || 0);

  let discount = 0;
  if (discType === 'pct') discount = subtotal * (discVal / 100);
  if (discType === 'flat') discount = Math.min(discVal, subtotal);

  const addDur = getAddWarrantyDuration();
  const addCost = Math.max(0, parseFloat(document.getElementById('addWarrantyCost')?.value) || 0);
  const hasAddWarranty = (addDur !== 'none');

  const extOpt = document.getElementById('extWarrantyOpt')?.value || 'none';
  const extPct = Math.max(0, parseFloat(document.getElementById('extWarrantyPct')?.value) || 0);
  const extDuration = getExtWarrantyDuration();
  const extAmt = Math.round(subtotal * (extPct / 100));
  const isExtBilled = (extOpt === 'included');

  const extTaxable = isExtBilled ? extAmt : 0;
  const addTaxable = hasAddWarranty ? addCost : 0;
  const taxable = subtotal - discount + extTaxable + addTaxable + shipping;
  const cgst = taxable * 0.09;
  const sgst = taxable * 0.09;
  const exactGrand = taxable + cgst + sgst;
  const grand = Math.round(exactGrand);
  const roundOff = Number((grand - exactGrand).toFixed(2));

  csv += '\n,,,,,';
  csv += `\nSubtotal (Components),,,,,${subtotal}`;
  if (discount > 0) csv += `\nDiscount,,,,, -${discount}`;
  if (hasAddWarranty) csv += `\nAdditional Warranty (${addDur}),,,,, ${addCost > 0 ? addCost : 'Included (0.00)'}`;
  if (isExtBilled && extAmt > 0) csv += `\nExtended Warranty (${extDuration} @ ${extPct}%),,,,, ${extAmt}`;
  if (shipping > 0) csv += `\nShipping,,,,, ${shipping}`;
  csv += `\nTaxable Value,,,,,${taxable}`;
  csv += `\nCGST (9%),,,,,${cgst}`;
  csv += `\nSGST (9%),,,,,${sgst}`;
  if (Math.abs(roundOff) > 0.001) csv += `\nRound Off,,,,,${roundOff}`;
  csv += `\nGrand Total,,,,,${grand}`;


  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `GenXIoT_BOQ_${clientName.replace(/\s+/g, '_')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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
  const filename = `GenXIoT_Quote_${clientName.replace(/\s+/g, '_')}_${quoteRef}.pdf`;

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
  fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'getAllQuotes' })
  })
  .then(res => res.json())
  .then(data => {
    if(data.status === 'success') {
      renderDashboard(data.data);
    }
  })
  .catch(err => console.error("Error fetching dashboard data:", err));
}

window.allDashboardQuotes = [];
window.enrichedDashboardQuotes = [];
window.currentDashboardTab = 'active';
window.currentChartMode = 'active';

function enrichQuotesWithVersionAndStatus(rawQuotes) {
  const localOverrides = getLocalStatusOverrides();

  // First pass: extract version and group key
  const parsed = rawQuotes.map(q => {
    const ref = (q.quoteRef || '').trim();
    let version = parseInt(q.quoteVersion, 10);
    const vMatch = ref.match(/V(\d+)$/i);
    if (vMatch) {
      version = parseInt(vMatch[1], 10);
    } else if (!version || isNaN(version)) {
      version = 1;
    }

    // Group key: client name normalized (e.g. "jeevamedicarehospital")
    const clientKey = (q.clientName || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const rootMatch = ref.match(/^(GEN-(?:ALA|DRP)-\d{6,8}-\d{2,4}-[A-Z0-9]{3})/i);
    const rootRef = rootMatch ? rootMatch[1].toUpperCase() : '';
    const groupKey = clientKey || rootRef || ref;

    return {
      ...q,
      version: version,
      groupKey: groupKey,
      rootRef: rootRef
    };
  });

  // Group quotes by deal key
  const groupMap = {};
  parsed.forEach(q => {
    if (!groupMap[q.groupKey]) groupMap[q.groupKey] = [];
    groupMap[q.groupKey].push(q);
  });

  // Within each group, sort by version descending, then date descending
  const enriched = [];
  Object.keys(groupMap).forEach(key => {
    const group = groupMap[key];
    group.sort((a, b) => {
      if (b.version !== a.version) return b.version - a.version;
      const tA = a.date ? new Date(a.date).getTime() : 0;
      const tB = b.date ? new Date(b.date).getTime() : 0;
      return tB - tA;
    });

    const totalRevisions = group.length;

    group.forEach((q, idx) => {
      const isLatest = (idx === 0);

      // Determine effective status:
      // 1. Explicit local override
      // 2. Remote status from Google Sheet
      // 3. Intelligent default: older revision -> Revised; latest -> Pending
      let st = localOverrides[q.quoteRef] || q.status;
      if (!st || st.trim() === '') {
        if (!isLatest && totalRevisions > 1) {
          st = 'Revised';
        } else {
          st = 'Pending';
        }
      }

      enriched.push({
        ...q,
        isLatest: isLatest,
        totalRevisions: totalRevisions,
        groupKey: key,
        groupQuotes: group,
        status: st
      });
    });
  });

  // Sort overall by date descending
  enriched.sort((a, b) => {
    const tA = a.date ? new Date(a.date).getTime() : 0;
    const tB = b.date ? new Date(b.date).getTime() : 0;
    return tB - tA;
  });

  return enriched;
}

function renderDashboard(quotes) {
  if (!Array.isArray(quotes)) return;

  const validQuotes = quotes.filter(q => q.quoteRef && q.quoteRef.trim() !== '');
  window.allDashboardQuotes = validQuotes;
  window.enrichedDashboardQuotes = enrichQuotesWithVersionAndStatus(validQuotes);

  // Compute metrics:
  let activePipelineValue = 0;
  let wonRevenue = 0;
  let activeDealsCount = 0;
  let activeBeds = 0;

  let countActive = 0;
  let countAll = window.enrichedDashboardQuotes.length;
  let countPending = 0;
  let countWon = 0;
  let countLost = 0;
  let countRevised = 0;
  let optionScenariosCount = 0;

  // Active prospective deals grouped by client to avoid double counting alternate options
  const activeDealsByGroup = {};

  window.enrichedDashboardQuotes.forEach(q => {
    const val = parseFloat(q.totalAmount) || 0;
    const beds = parseInt(q.totalBeds, 10) || 0;
    const st = q.status;

    if (st === 'Closed Won') {
      wonRevenue += val;
      countWon++;
    } else if (st === 'Closed Lost') {
      countLost++;
    } else if (st === 'Revised') {
      countRevised++;
    } else {
      // Pending or Active Option
      countPending++;
      if (st === 'Active Option') optionScenariosCount++;
    }

    // Is this an active standing proposal?
    const isActiveProposal = (st === 'Active Option') || (q.isLatest && (st === 'Pending' || !st));
    if (isActiveProposal) {
      countActive++;
      if (!activeDealsByGroup[q.groupKey]) {
        activeDealsByGroup[q.groupKey] = {
          quotes: [],
          maxVal: val,
          beds: beds
        };
      }
      activeDealsByGroup[q.groupKey].quotes.push(q);
      if (val > activeDealsByGroup[q.groupKey].maxVal) {
        activeDealsByGroup[q.groupKey].maxVal = val;
        activeDealsByGroup[q.groupKey].beds = beds;
      }
    }
  });

  // Calculate clean non-duplicated active pipeline
  Object.keys(activeDealsByGroup).forEach(k => {
    activeDealsCount++;
    activePipelineValue += activeDealsByGroup[k].maxVal;
    activeBeds += activeDealsByGroup[k].beds;
  });

  // Update Metric Cards
  const valEl = document.getElementById('dashTotalValue');
  if (valEl) valEl.innerText = `₹ ${Math.round(activePipelineValue).toLocaleString('en-IN')}`;

  const activeSubEl = document.getElementById('dashActiveDealsSub');
  if (activeSubEl) {
    activeSubEl.innerText = optionScenariosCount > 0
      ? `${activeDealsCount} live deals (${optionScenariosCount} option scenarios)`
      : `${activeDealsCount} live deals in active pipeline`;
  }

  const wonEl = document.getElementById('dashWonValue');
  if (wonEl) wonEl.innerText = `₹ ${Math.round(wonRevenue).toLocaleString('en-IN')}`;

  const wonSubEl = document.getElementById('dashWonDealsSub');
  if (wonSubEl) wonSubEl.innerText = `${countWon} closed won orders`;

  const activeDealsEl = document.getElementById('dashActiveDealsCount');
  if (activeDealsEl) activeDealsEl.innerText = activeDealsCount;

  const bedsSubEl = document.getElementById('dashBedsSub');
  if (bedsSubEl) bedsSubEl.innerText = `${activeBeds} beds in active pipeline`;

  const totalQuotesEl = document.getElementById('dashTotalQuotes');
  if (totalQuotesEl) totalQuotesEl.innerText = countAll;

  const revSubEl = document.getElementById('dashRevisionsSub');
  if (revSubEl) revSubEl.innerText = `${countRevised} revisions · ${countLost} lost`;

  // Update tab counts
  setTabCount('countTabActive', countActive);
  setTabCount('countTabAll', countAll);
  setTabCount('countTabPending', countPending);
  setTabCount('countTabWon', countWon);
  setTabCount('countTabLost', countLost);
  setTabCount('countTabRevised', countRevised);

  // Render Table & Chart
  filterDashboardQuotes();
  renderPipelineChart();
}

function setTabCount(id, count) {
  const el = document.getElementById(id);
  if (el) el.innerText = count;
}

function renderPipelineChart() {
  const ctx = document.getElementById('pipelineChart');
  if (!ctx) return;

  const clientValues = {};
  const mode = window.currentChartMode || 'active';

  (window.enrichedDashboardQuotes || []).forEach(q => {
    const val = parseFloat(q.totalAmount) || 0;
    const st = q.status;
    const cName = q.clientName || 'Unknown';

    if (mode === 'active') {
      const isActiveProposal = (st === 'Active Option') || (q.isLatest && (st === 'Pending' || !st));
      if (isActiveProposal) {
        clientValues[cName] = Math.max(clientValues[cName] || 0, val);
      }
    } else if (mode === 'won') {
      if (st === 'Closed Won') {
        clientValues[cName] = (clientValues[cName] || 0) + val;
      }
    } else {
      if (q.isLatest || st === 'Active Option') {
        clientValues[cName] = Math.max(clientValues[cName] || 0, val);
      }
    }
  });

  const chartSub = document.getElementById('chartFilterSub');
  if (chartSub) {
    if (mode === 'active') chartSub.innerText = 'Active pipeline deals (latest versions only)';
    else if (mode === 'won') chartSub.innerText = 'Confirmed Closed Won deals';
    else chartSub.innerText = 'All clients (latest quote version per client)';
  }

  if (pipelineChartInstance) {
    pipelineChartInstance.destroy();
  }

  const bgColors = mode === 'won' ? '#10b981' : (mode === 'active' ? '#00d4ff' : '#3b3fa8');

  pipelineChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(clientValues),
      datasets: [{
        label: 'Deal Value (INR)',
        data: Object.values(clientValues),
        backgroundColor: bgColors,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(c) {
              return '₹ ' + Math.round(c.raw).toLocaleString('en-IN');
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(v) { return '₹' + (v >= 100000 ? (v / 100000).toFixed(1) + 'L' : v.toLocaleString('en-IN')); }
          }
        }
      }
    }
  });
}

function setChartMode(mode) {
  window.currentChartMode = mode;
  ['btnChartActive', 'btnChartWon', 'btnChartAll'].forEach(id => {
    const b = document.getElementById(id);
    if (b) b.classList.remove('active');
  });
  const activeBtn = document.getElementById(`btnChart${mode.charAt(0).toUpperCase() + mode.slice(1)}`);
  if (activeBtn) activeBtn.classList.add('active');
  renderPipelineChart();
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
 * Preview a Proforma Invoice.
 * Flow: sync UI → open modal → apply proforma fields (no auto print)
 */
function previewProforma() {
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

  // Reset Cover Page Mode just in case
  if (typeof _applyCoverPageMode === 'function') _applyCoverPageMode(false);
  if (typeof _applyTaxInvoiceMode === 'function') _applyTaxInvoiceMode(false);

  // Step 3: Switch to proforma mode
  _applyProformaMode(true, piRef, poRef, dueDate);
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
    activeDocMode = 'proforma';
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
    if (el('modalTitle'))    el('modalTitle').textContent    = 'GenXIoT · Proforma Invoice Preview';
    if (el('proposalSettings')) el('proposalSettings').style.display = 'none';
    if (el('proposalFrontPages')) el('proposalFrontPages').style.display = 'none';
    if (el('proposalBackPages')) el('proposalBackPages').style.display = 'none';
  } else {
    // ── Restore Quotation Mode ────────────────────────────
    if (el('qDocTypeLabel')) el('qDocTypeLabel').textContent = 'QUOTATION REF';
    if (el('qDocRef'))       el('qDocRef').textContent       = (el('quoteRef')?.value) || '';
    if (el('qValidRow'))     el('qValidRow').style.display   = '';
    if (el('qPORow'))        el('qPORow').style.display      = (document.getElementById('poRef')?.value || '').trim() ? '' : 'none';
    if (el('qDueDateRow'))   el('qDueDateRow').style.display = 'none';
    if (el('qProformaNote')) el('qProformaNote').style.display = 'none';
    if (el('qOptionalNote')) el('qOptionalNote').style.display = '';      // restore on exit
    if (el('modalTitle'))    el('modalTitle').textContent    = (activeDocMode === 'proposal') ? 'GenXIoT · Executive Techno-Commercial Proposal Preview' : 'GenXIoT · Quick Quotation / BOQ Preview';
    if (el('proposalSettings')) el('proposalSettings').style.display = 'flex';
  }
  updateProposalBrochure();
}

/**
 * Enter or exit Cover Page mode on the printable document.
 */
function _applyCoverPageMode(on) {
  const el = (id) => document.getElementById(id);
  if (on) {
    activeDocMode = 'cover';
    if (el('qDocTypeLabel')) el('qDocTypeLabel').textContent = 'FINAL SUMMARY';
    if (el('qDocRef'))       el('qDocRef').textContent       = (el('poRef')?.value || '').trim() || '—';
    if (el('quoteTable'))    el('quoteTable').style.display  = 'none';
    if (el('pageQuote'))     el('pageQuote').style.display   = 'none';
    if (el('pageTerms'))     el('pageTerms').style.display   = 'none';
    if (el('pageCover'))     el('pageCover').style.display   = 'block';
    if (el('qValidRow'))     el('qValidRow').style.display   = 'none';
    if (el('qPORow'))        el('qPORow').style.display      = 'none';
    if (el('qDueDateRow'))   el('qDueDateRow').style.display = 'none';
    if (el('qProformaNote')) el('qProformaNote').style.display = 'none';
    if (el('qOptionalNote')) el('qOptionalNote').style.display = 'none';
    if (el('coverPageSettings')) el('coverPageSettings').style.display = 'flex';
    if (el('proposalSettings')) el('proposalSettings').style.display = 'none';
    if (el('proposalFrontPages')) el('proposalFrontPages').style.display = 'none';
    if (el('proposalBackPages')) el('proposalBackPages').style.display = 'none';

    // Populate Cover Page specifics
    const finalInput = el('coverFinalAmt')?.value;
    const finalVal   = (finalInput && finalInput.trim() !== '') ? parseFloat(finalInput) : parseFloat((el('calcGT')?.textContent || '0').replace(/[^0-9.]/g, ''));
    
    const advInput   = el('coverAdvAmt')?.value;
    const advVal     = (advInput && advInput.trim() !== '') ? parseFloat(advInput) : Math.round(finalVal * (parseFloat(el('advPct')?.value) || 50) / 100);
    
    const balVal     = finalVal - advVal;

    if (el('cClientName')) el('cClientName').textContent = el('clientName')?.value || 'Client';
    if (el('cClientLoc')) el('cClientLoc').textContent = el('clientLocation')?.value || '';
    if (el('cContactPerson')) el('cContactPerson').textContent = el('contactPerson')?.value || 'Director';
    if (el('cContactNameInline')) el('cContactNameInline').textContent = (el('contactPerson')?.value || 'Client').split('/')[0].trim();
    if (el('cClientGstRow')) {
      if (el('clientGst')?.value) {
        el('cClientGstRow').style.display = '';
        el('cClientGst').textContent = 'GSTIN: ' + el('clientGst')?.value;
      } else {
        el('cClientGstRow').style.display = 'none';
      }
    }

    if (el('cTotalAmt')) el('cTotalAmt').textContent = '₹' + fmt(finalVal);
    if (el('cAdvAmt'))   el('cAdvAmt').textContent   = '-₹' + fmt(advVal);
    if (el('cBalAmt'))   el('cBalAmt').textContent   = '₹' + fmt(balVal);

    if (el('cBankName')) el('cBankName').textContent = 'GenXIoT LLP';
    if (el('cBankAcc'))  el('cBankAcc').textContent  = '0624073000000447';
    if (el('cBankIfsc')) el('cBankIfsc').textContent = 'SIBL0000624';
    
    if (el('modalTitle')) el('modalTitle').textContent = 'GenXIoT · Final Cover Page Preview';
  } else {
    // Restore Quotation Mode
    if (el('qDocTypeLabel')) el('qDocTypeLabel').textContent = 'QUOTATION REF';
    if (el('qDocRef'))       el('qDocRef').textContent       = (el('quoteRef')?.value) || '';
    if (el('quoteTable'))    el('quoteTable').style.display  = 'table';
    if (el('pageQuote'))     el('pageQuote').style.display   = 'block';
    if (el('pageCover'))     el('pageCover').style.display   = 'none';
    if (el('qValidRow'))     el('qValidRow').style.display   = '';
    if (el('qPORow'))        el('qPORow').style.display      = (document.getElementById('poRef')?.value || '').trim() ? '' : 'none';
    if (el('qOptionalNote')) el('qOptionalNote').style.display = '';
    if (el('coverPageSettings')) el('coverPageSettings').style.display = 'none';
    if (el('proposalSettings')) el('proposalSettings').style.display = 'flex';
    
    if (el('modalTitle')) el('modalTitle').textContent = (activeDocMode === 'proposal') ? 'GenXIoT · Executive Techno-Commercial Proposal Preview' : 'GenXIoT · Quick Quotation / BOQ Preview';
  }
  updateProposalBrochure();
}

/**
 * Preview the Cover Page in the modal.
 */
function previewCoverPage() {
  recalc();
  const mb = document.getElementById('modalBg');
  if (mb) {
    mb.classList.add('open');
    mb.scrollTop = 0;
  }
  if (typeof _applyProformaMode === 'function') _applyProformaMode(false);
  if (typeof _applyTaxInvoiceMode === 'function') _applyTaxInvoiceMode(false);
  _applyCoverPageMode(true);
}

/**
 * Open the PDF merger modal.
 */
function openPdfMerger() {
  const mb = document.getElementById('pdfMergeModal');
  if (mb) {
    mb.classList.add('open');
  }
}

/**
 * Merge the Cover Page and the uploaded Invoice PDF using pdf-lib.
 */
async function mergePdfs() {
  const coverInput = document.getElementById('coverPdfFile');
  const tallyInput = document.getElementById('tallyPdfFile');
  
  if (!coverInput || !tallyInput || !coverInput.files[0] || !tallyInput.files[0]) {
    alert("Please select both the Cover Page PDF and the Tally Invoice PDF.");
    return;
  }

  const btn = document.getElementById('mergePdfsBtn');
  const originalText = btn.textContent;
  btn.textContent = "Merging...";
  btn.disabled = true;

  try {
    const coverBytes = await coverInput.files[0].arrayBuffer();
    const tallyBytes = await tallyInput.files[0].arrayBuffer();

    const pdfDoc = await PDFLib.PDFDocument.create();
    
    // Add Cover Page
    const coverPdf = await PDFLib.PDFDocument.load(coverBytes);
    const coverPages = await pdfDoc.copyPages(coverPdf, coverPdf.getPageIndices());
    coverPages.forEach((page) => pdfDoc.addPage(page));

    // Add Tally Invoice
    const tallyPdf = await PDFLib.PDFDocument.load(tallyBytes);
    const tallyPages = await pdfDoc.copyPages(tallyPdf, tallyPdf.getPageIndices());
    tallyPages.forEach((page) => pdfDoc.addPage(page));

    // Save and download
    const mergedPdfBytes = await pdfDoc.save();
    const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Final_Invoice_Package.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    document.getElementById('pdfMergeModal').classList.remove('open');
    coverInput.value = '';
    tallyInput.value = '';
  } catch (err) {
    console.error("PDF Merge Error:", err);
    alert("There was an error merging the PDFs. Ensure both files are valid PDF documents.");
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
}

// ─── FINAL TAX INVOICE & HANDOVER DOSSIER ──────────────────

/**
 * Preview the Final Tax Invoice & Handover Dossier in the modal.
 */
function previewTaxInvoice() {
  activeDocMode = 'tax_invoice';
  recalc();
  const mb = document.getElementById('modalBg');
  if (mb) {
    mb.classList.add('open');
    mb.scrollTop = 0;
  }
  if (typeof _applyCoverPageMode === 'function') _applyCoverPageMode(false);
  if (typeof _applyProformaMode === 'function') _applyProformaMode(false);
  _applyTaxInvoiceMode(true);
}

/**
 * Enter or exit Tax Invoice mode on the printable document.
 */
function _applyTaxInvoiceMode(on) {
  const el = id => document.getElementById(id);
  if (on) {
    activeDocMode = 'tax_invoice';
    document.body.classList.add('mode-tax-invoice');

    const incCover = el('invIncludeCover') ? el('invIncludeCover').checked : true;
    const incAnnex = el('invIncludeAnnexure') ? el('invIncludeAnnexure').checked : true;
    document.body.classList.toggle('include-cover-page', incCover);
    document.body.classList.toggle('include-annexure', incAnnex);

    if (el('pageCover'))           el('pageCover').style.display           = incCover ? 'block' : 'none';
    if (el('pageTaxInvoice'))      el('pageTaxInvoice').style.display      = 'block';
    if (el('pageHandoverCert'))    el('pageHandoverCert').style.display    = 'block';
    if (el('pageInstallAnnexure')) el('pageInstallAnnexure').style.display = incAnnex ? 'block' : 'none';
    if (el('quoteTable'))       el('quoteTable').style.display       = 'none';
    if (el('pageQuote'))        el('pageQuote').style.display        = 'none';
    if (el('pageTerms'))        el('pageTerms').style.display        = 'none';
    if (el('proposalFrontPages')) el('proposalFrontPages').style.display = 'none';
    if (el('proposalBackPages'))  el('proposalBackPages').style.display  = 'none';

    if (el('invoiceSettings'))   el('invoiceSettings').style.display   = 'flex';
    if (el('proposalSettings'))  el('proposalSettings').style.display  = 'none';
    if (el('coverPageSettings')) el('coverPageSettings').style.display = 'none';

    if (el('modalTitle')) el('modalTitle').textContent = 'GenXIoT · Final Tax Invoice & Handover Dossier Preview';
    
    // Auto-initialize inputs if empty
    const now = new Date();
    const todayIso = now.toISOString().split('T')[0];
    if (el('invInputNo') && !el('invInputNo').value) {
      el('invInputNo').value = '1';
    }
    if (el('invInputDate') && !el('invInputDate').value) {
      el('invInputDate').value = todayIso;
    }
    if (el('invInputInstDate') && !el('invInputInstDate').value) {
      el('invInputInstDate').value = todayIso;
    }
    if (el('invInputPo') && !el('invInputPo').value) {
      el('invInputPo').value = (el('poRef')?.value || '').trim();
    }
    if (el('invInputPoDate') && !el('invInputPoDate').value) {
      el('invInputPoDate').value = todayIso;
    }
    if (el('invInputInstRef') && !el('invInputInstRef').value) {
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const cName = (el('clientName')?.value || 'Client').trim().replace(/\s+/g, '-');
      el('invInputInstRef').value = `INS-${mm}${dd}-${cName}`;
    }

    // Synchronize docType select if present
    if (el('docTypeSelect') && el('docTypeSelect').value !== 'tax_invoice') {
      el('docTypeSelect').value = 'tax_invoice';
    }

    updateTaxInvoiceView();
  } else {
    document.body.classList.remove('mode-tax-invoice', 'include-cover-page', 'include-annexure');
    if (el('pageTaxInvoice'))      el('pageTaxInvoice').style.display      = 'none';
    if (el('pageHandoverCert'))    el('pageHandoverCert').style.display    = 'none';
    if (el('pageInstallAnnexure')) el('pageInstallAnnexure').style.display = 'none';
    if (el('pageCover'))           el('pageCover').style.display           = 'none';
    if (el('invoiceSettings'))     el('invoiceSettings').style.display     = 'none';
    if (el('docTypeSelect') && el('docTypeSelect').value === 'tax_invoice') {
      el('docTypeSelect').value = 'commercial';
    }
  }
}

/**
 * Render all dynamic Tax Invoice and Handover Certificate fields.
 */
function updateTaxInvoiceView() {
  const el = id => document.getElementById(id);
  if (!el('pageTaxInvoice')) return;

  const clientName  = (el('clientName')?.value || 'Client Name').trim();
  const clientLoc   = (el('clientLocation')?.value || '').trim();
  const clientGst   = (el('clientGst')?.value || '').trim();
  const clientState = (el('clientState')?.value || 'Kerala').trim();

  // PO & Invoice inputs
  const invNo = (el('invInputNo')?.value || '1').trim();
  const todayIso = new Date().toISOString().split('T')[0];
  const invDateVal = el('invInputDate')?.value || todayIso;
  const instDateVal = el('invInputInstDate')?.value || invDateVal;
  const poNo = (el('invInputPo')?.value || el('poRef')?.value || '—').trim();
  const poDateVal = el('invInputPoDate')?.value;
  const instRef = (el('invInputInstRef')?.value || '—').trim();
  
  // Format date helper
  const fmtDate = (dStr) => {
    if (!dStr) return '—';
    try {
      const parts = dStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      }
      return dStr;
    } catch(e) { return dStr; }
  };

  const invDateFmt  = fmtDate(invDateVal);
  const instDateFmt = fmtDate(instDateVal);
  const poDateFmt   = poDateVal ? fmtDate(poDateVal) : '—';

  // Tax treatment
  const clientStateInput = clientState.toLowerCase();
  const gstStateCode = clientGst.slice(0, 2);
  const isKerala = (clientStateInput === 'kerala' || gstStateCode === '32' || (!clientStateInput && !gstStateCode));
  const isInterState = !isKerala;
  const stateCode = gstStateCode || (isKerala ? '32' : '33');

  // Populate Header & Metadata
  if (el('tiInvNo')) el('tiInvNo').textContent = invNo;
  if (el('tiInvDate')) el('tiInvDate').textContent = invDateFmt;
  if (el('tiPlaceOfSupply')) el('tiPlaceOfSupply').textContent = clientState + ' (Code: ' + stateCode + ')';

  if (el('tiShipName')) el('tiShipName').textContent = clientName;
  if (el('tiShipAddr')) el('tiShipAddr').textContent = clientLoc;
  if (el('tiShipGst'))  el('tiShipGst').textContent  = clientGst || '—';
  if (el('tiShipState')) el('tiShipState').textContent = clientState + ', Code : ' + stateCode;

  if (el('tiBillName')) el('tiBillName').textContent = clientName;
  if (el('tiBillAddr')) el('tiBillAddr').textContent = clientLoc;
  if (el('tiBillGst'))  el('tiBillGst').textContent  = clientGst || '—';
  if (el('tiBillState')) el('tiBillState').textContent = clientState + ', Code : ' + stateCode;

  if (el('tiPoNo')) el('tiPoNo').textContent = poNo;
  if (el('tiPoDate')) el('tiPoDate').textContent = poDateFmt;
  if (el('tiDeliveryDate')) el('tiDeliveryDate').textContent = instDateFmt;
  if (el('tiInstallRef')) el('tiInstallRef').textContent = instRef;

  // Table Column Headers adjustment for IGST vs CGST+SGST
  const thCgst = el('tiColCgst');
  const thSgst = el('tiColSgst');
  if (thCgst && thSgst) {
    if (isInterState) {
      thCgst.textContent = 'IGST (18%)';
      thSgst.style.display = 'none';
    } else {
      thCgst.textContent = 'CGST (9%)';
      thSgst.textContent = 'SGST (9%)';
      thSgst.style.display = '';
    }
  }

  // Populate Table Items (preserve Tally-synced rows if active)
  const tbody = el('tiItemBody');
  if (tbody && window._tiUsingTallyItems && tbody.querySelectorAll('tr').length > 0) {
    recalcTaxInvoiceFromTable();
  } else if (tbody) {
    tbody.innerHTML = '';
    let sr = 1;
    let totQty = 0;
    let totTaxable = 0;
    let totCgst = 0;
    let totSgst = 0;
    let totIgst = 0;
    let totAmount = 0;

    // HSN Lookup Map
    const hsnMap = {
      'ALAMO-CP-R': '85365090',
      'ALAMO-CP-B': '85365090',
      'ALAMO-PL': '85365090',
      'ALAMO-PD-S': '85365090',
      'ALAMO-PD-D': '85365090',
      'ALAMO-CB-ACC': '85365090',
      'ALAMO-DL': '85318000',
      'ALAMO-WCP': '85365090',
      'ALAMO-PCR': '85365090',
      'ALAMO-NS-TV': '85287390',
      'ALAMO-GW': '85176230',
      'ALAMO-RPT': '85176290',
      'ALAMO-MINI': '85318000',
      'ALAMO-CLOUD-SW': '9983',
      'DRIPO-IM': '90189099'
    };

    // Calculate effective global discount percentage from discType & discVal
    const subtotal = bom.reduce((sum, item) => sum + ((item.qty || 0) * (item.rate || 0)), 0);
    const discType = el('discType')?.value || 'none';
    const discVal = Math.max(0, parseFloat(el('discVal')?.value) || 0);
    let effectiveDiscPct = 0;
    if (discType === 'pct') {
      effectiveDiscPct = discVal;
    } else if (discType === 'flat' && subtotal > 0) {
      effectiveDiscPct = (Math.min(discVal, subtotal) / subtotal) * 100;
    }
    const discLabel = effectiveDiscPct > 0
      ? (discType === 'pct' ? `${effectiveDiscPct}%` : `${effectiveDiscPct.toFixed(2)}%`)
      : '—';
    const isDripoOnlyQuote = (typeof isDripoQuoteActive === 'function') && isDripoQuoteActive();

    bom.forEach(item => {
      if (!item.qty || item.qty === 0) return;

      const code = item.code;
      const hsn = hsnMap[code] || '85365090';
      const displayInfo = getItemDisplayInfo(item, isDripoOnlyQuote);
      
      const qty = item.qty;
      const rate = item.rate;
      const grossAmt = qty * rate;
      const lineDisc = Math.round(grossAmt * (effectiveDiscPct / 100) * 100) / 100;
      const lineTaxable = Math.round((grossAmt - lineDisc) * 100) / 100;
      
      let lineCgst = 0, lineSgst = 0, lineIgst = 0;
      if (isInterState) {
        lineIgst = Math.round(lineTaxable * 0.18 * 100) / 100;
      } else {
        lineCgst = Math.round(lineTaxable * 0.09 * 100) / 100;
        lineSgst = Math.round(lineTaxable * 0.09 * 100) / 100;
      }
      const lineTotal = lineTaxable + (isInterState ? lineIgst : (lineCgst + lineSgst));

      totQty += qty;
      totTaxable += lineTaxable;
      totCgst += lineCgst;
      totSgst += lineSgst;
      totIgst += lineIgst;
      totAmount += lineTotal;

      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid #cbd5e1';
      tr.innerHTML = `
        <td style="padding:4px 3px; border:1px solid #cbd5e1; text-align:center; color:#64748b;">${sr++}</td>
        <td style="padding:4px 6px; border:1px solid #cbd5e1;" contenteditable="true" class="editable-field">
          <strong style="color:#1e293b;">${displayInfo.name.replace(/\((?:HSN|SAC):.*?\)/i, '').trim()}</strong>
          <span style="font-size:0.65rem; color:#64748b; font-family:Consolas, monospace;"> [${code}]</span>
        </td>
        <td style="padding:4px 4px; border:1px solid #cbd5e1; text-align:center; font-family:Consolas, monospace;" contenteditable="true" class="editable-field">${hsn}</td>
        <td style="padding:4px 4px; border:1px solid #cbd5e1; text-align:center; font-weight:600;" contenteditable="true" class="editable-field ti-cell-qty" onblur="recalcTaxInvoiceFromTable()">${qty}.00 Nos</td>
        <td style="padding:4px 4px; border:1px solid #cbd5e1; text-align:right;" contenteditable="true" class="editable-field ti-cell-rate" onblur="recalcTaxInvoiceFromTable()">${fmt(rate)}</td>
        <td style="padding:4px 4px; border:1px solid #cbd5e1; text-align:center;" contenteditable="true" class="editable-field ti-cell-disc" onblur="recalcTaxInvoiceFromTable()">${discLabel}</td>
        <td style="padding:4px 6px; border:1px solid #cbd5e1; text-align:right; font-weight:600;" class="ti-cell-taxable">${fmt(lineTaxable)}</td>
        <td style="padding:4px 4px; border:1px solid #cbd5e1; text-align:right;" class="ti-cell-cgst">${fmt(isInterState ? lineIgst : lineCgst)}</td>
        ${!isInterState ? `<td style="padding:4px 4px; border:1px solid #cbd5e1; text-align:right;" class="ti-cell-sgst">${fmt(lineSgst)}</td>` : ''}
        <td style="padding:4px 6px; border:1px solid #cbd5e1; text-align:right; font-weight:700;" class="ti-cell-total">${fmt(lineTotal)}</td>
      `;
      tbody.appendChild(tr);
    });

    // Additional Warranty row if active and billed
    const addDur = (typeof getAddWarrantyDuration === 'function') ? getAddWarrantyDuration() : 'none';
    const addCost = Math.max(0, parseFloat(el('addWarrantyCost')?.value) || 0);
    if (addDur !== 'none' && addCost > 0) {
      const addTaxable = Math.round(addCost * 100) / 100;
      let addCgst = 0, addSgst = 0, addIgst = 0;
      if (isInterState) {
        addIgst = Math.round(addTaxable * 0.18 * 100) / 100;
      } else {
        addCgst = Math.round(addTaxable * 0.09 * 100) / 100;
        addSgst = Math.round(addTaxable * 0.09 * 100) / 100;
      }
      const addTotal = addTaxable + (isInterState ? addIgst : (addCgst + addSgst));

      totQty += 1;
      totTaxable += addTaxable;
      totCgst += addCgst;
      totSgst += addSgst;
      totIgst += addIgst;
      totAmount += addTotal;

      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid #cbd5e1';
      tr.innerHTML = `
        <td style="padding:4px 3px; border:1px solid #cbd5e1; text-align:center; color:#64748b;">${sr++}</td>
        <td style="padding:4px 6px; border:1px solid #cbd5e1;">
          <strong style="color:#1e293b;">ADDITIONAL WARRANTY COVERAGE (${addDur})</strong>
        </td>
        <td style="padding:4px 4px; border:1px solid #cbd5e1; text-align:center; font-family:Consolas, monospace;">998719</td>
        <td style="padding:4px 4px; border:1px solid #cbd5e1; text-align:center; font-weight:600;">1.00 Nos</td>
        <td style="padding:4px 4px; border:1px solid #cbd5e1; text-align:right;">${fmt(addTaxable)}</td>
        <td style="padding:4px 4px; border:1px solid #cbd5e1; text-align:center;">—</td>
        <td style="padding:4px 6px; border:1px solid #cbd5e1; text-align:right; font-weight:600;">${fmt(addTaxable)}</td>
        <td style="padding:4px 4px; border:1px solid #cbd5e1; text-align:right;">${fmt(isInterState ? addIgst : addCgst)}</td>
        ${!isInterState ? `<td style="padding:4px 4px; border:1px solid #cbd5e1; text-align:right;">${fmt(addSgst)}</td>` : ''}
        <td style="padding:4px 6px; border:1px solid #cbd5e1; text-align:right; font-weight:700;">${fmt(addTotal)}</td>
      `;
      tbody.appendChild(tr);
    }

    // CMC (Extended Warranty) row if active
    const extOpt = el('extWarrantyOpt')?.value || 'none';
    const extPct = Math.max(0, parseFloat(el('extWarrantyPct')?.value) || 0);
    const extAmt = Math.round(subtotal * (extPct / 100));
    if (extOpt === 'included' && extAmt > 0) {
      const extDuration = (typeof getExtWarrantyDuration === 'function') ? getExtWarrantyDuration() : '1 Year';
      const cmcTaxable = Math.round(extAmt * 100) / 100;
      let cmcCgst = 0, cmcSgst = 0, cmcIgst = 0;
      if (isInterState) {
        cmcIgst = Math.round(cmcTaxable * 0.18 * 100) / 100;
      } else {
        cmcCgst = Math.round(cmcTaxable * 0.09 * 100) / 100;
        cmcSgst = Math.round(cmcTaxable * 0.09 * 100) / 100;
      }
      const cmcTotal = cmcTaxable + (isInterState ? cmcIgst : (cmcCgst + cmcSgst));

      totQty += 1;
      totTaxable += cmcTaxable;
      totCgst += cmcCgst;
      totSgst += cmcSgst;
      totIgst += cmcIgst;
      totAmount += cmcTotal;

      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid #cbd5e1';
      tr.innerHTML = `
        <td style="padding:4px 3px; border:1px solid #cbd5e1; text-align:center; color:#64748b;">${sr++}</td>
        <td style="padding:4px 6px; border:1px solid #cbd5e1;" contenteditable="true" class="editable-field">
          <strong style="color:#1e293b;">CMC (COMPREHENSIVE EXTENDED WARRANTY) — ${extDuration}</strong>
        </td>
        <td style="padding:4px 4px; border:1px solid #cbd5e1; text-align:center; font-family:Consolas, monospace;" contenteditable="true" class="editable-field">998719</td>
        <td style="padding:4px 4px; border:1px solid #cbd5e1; text-align:center; font-weight:600;" contenteditable="true" class="editable-field ti-cell-qty" onblur="recalcTaxInvoiceFromTable()">1.00 Nos</td>
        <td style="padding:4px 4px; border:1px solid #cbd5e1; text-align:right;" contenteditable="true" class="editable-field ti-cell-rate" onblur="recalcTaxInvoiceFromTable()">${fmt(cmcTaxable)}</td>
        <td style="padding:4px 4px; border:1px solid #cbd5e1; text-align:center;" contenteditable="true" class="editable-field ti-cell-disc" onblur="recalcTaxInvoiceFromTable()">—</td>
        <td style="padding:4px 6px; border:1px solid #cbd5e1; text-align:right; font-weight:600;" class="ti-cell-taxable">${fmt(cmcTaxable)}</td>
        <td style="padding:4px 4px; border:1px solid #cbd5e1; text-align:right;" class="ti-cell-cgst">${fmt(isInterState ? cmcIgst : cmcCgst)}</td>
        ${!isInterState ? `<td style="padding:4px 4px; border:1px solid #cbd5e1; text-align:right;" class="ti-cell-sgst">${fmt(cmcSgst)}</td>` : ''}
        <td style="padding:4px 6px; border:1px solid #cbd5e1; text-align:right; font-weight:700;" class="ti-cell-total">${fmt(cmcTotal)}</td>
      `;
      tbody.appendChild(tr);
    }

    // Shipping / Handling Charge row
    const shipVal = parseFloat(document.getElementById('shipping')?.value) || 0;
    if (shipVal > 0) {
      const shipTaxable = Math.round(shipVal * 100) / 100;
      let shipCgst = 0, shipSgst = 0, shipIgst = 0;
      if (isInterState) {
        shipIgst = Math.round(shipTaxable * 0.18 * 100) / 100;
      } else {
        shipCgst = Math.round(shipTaxable * 0.09 * 100) / 100;
        shipSgst = Math.round(shipTaxable * 0.09 * 100) / 100;
      }
      const shipTotal = shipTaxable + (isInterState ? shipIgst : (shipCgst + shipSgst));

      totQty += 1;
      totTaxable += shipTaxable;
      totCgst += shipCgst;
      totSgst += shipSgst;
      totIgst += shipIgst;
      totAmount += shipTotal;

      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid #cbd5e1';
      tr.innerHTML = `
        <td style="padding:4px 3px; border:1px solid #cbd5e1; text-align:center; color:#64748b;">${sr++}</td>
        <td style="padding:4px 6px; border:1px solid #cbd5e1;" contenteditable="true" class="editable-field">
          <strong style="color:#1e293b;">HANDLING CHARGES / SHIPPING CHARGES</strong>
        </td>
        <td style="padding:4px 4px; border:1px solid #cbd5e1; text-align:center; font-family:Consolas, monospace;" contenteditable="true" class="editable-field">996799</td>
        <td style="padding:4px 4px; border:1px solid #cbd5e1; text-align:center; font-weight:600;" contenteditable="true" class="editable-field ti-cell-qty" onblur="recalcTaxInvoiceFromTable()">1.00 Nos</td>
        <td style="padding:4px 4px; border:1px solid #cbd5e1; text-align:right;" contenteditable="true" class="editable-field ti-cell-rate" onblur="recalcTaxInvoiceFromTable()">${fmt(shipTaxable)}</td>
        <td style="padding:4px 4px; border:1px solid #cbd5e1; text-align:center;" contenteditable="true" class="editable-field ti-cell-disc" onblur="recalcTaxInvoiceFromTable()">—</td>
        <td style="padding:4px 6px; border:1px solid #cbd5e1; text-align:right; font-weight:600;" class="ti-cell-taxable">${fmt(shipTaxable)}</td>
        <td style="padding:4px 4px; border:1px solid #cbd5e1; text-align:right;" class="ti-cell-cgst">${fmt(isInterState ? shipIgst : shipCgst)}</td>
        ${!isInterState ? `<td style="padding:4px 4px; border:1px solid #cbd5e1; text-align:right;" class="ti-cell-sgst">${fmt(shipSgst)}</td>` : ''}
        <td style="padding:4px 6px; border:1px solid #cbd5e1; text-align:right; font-weight:700;" class="ti-cell-total">${fmt(shipTotal)}</td>
      `;
      tbody.appendChild(tr);
    }

    // Footers
    if (el('tiFootQty')) el('tiFootQty').textContent = totQty + '.00 Nos';
    if (el('tiFootTaxable')) el('tiFootTaxable').textContent = '₹' + fmt(totTaxable);
    if (el('tiFootCgst')) el('tiFootCgst').textContent = '₹' + fmt(isInterState ? totIgst : totCgst);
    if (el('tiFootSgst')) {
      el('tiFootSgst').style.display = isInterState ? 'none' : '';
      el('tiFootSgst').textContent = '₹' + fmt(totSgst);
    }
    if (el('tiFootTotal')) el('tiFootTotal').textContent = '₹' + fmt(totAmount);

    // Summary Box
    if (el('tiSummaryTaxable')) el('tiSummaryTaxable').textContent = '₹' + fmt(totTaxable);
    if (el('tiRowCgst')) el('tiRowCgst').style.display = isInterState ? 'none' : '';
    if (el('tiRowSgst')) el('tiRowSgst').style.display = isInterState ? 'none' : '';
    if (el('tiRowIgst')) el('tiRowIgst').style.display = isInterState ? '' : 'none';

    if (el('tiSummaryCgst')) el('tiSummaryCgst').textContent = '₹' + fmt(totCgst);
    if (el('tiSummarySgst')) el('tiSummarySgst').textContent = '₹' + fmt(totSgst);
    if (el('tiSummaryIgst')) el('tiSummaryIgst').textContent = '₹' + fmt(totIgst);
    if (el('tiSummaryTotal')) el('tiSummaryTotal').textContent = '₹' + fmt(totAmount);

    // Advance & Balance Calculation (Cover Page always shows Reconciliation; Tax Invoice toggle is optional)
    const incCover = el('invIncludeCover') ? el('invIncludeCover').checked : true;
    document.body.classList.toggle('include-cover-page', incCover);
    if (el('pageCover')) el('pageCover').style.display = incCover ? 'block' : 'none';

    const showAdv = !!el('invShowAdvance')?.checked;
    if (el('invInputAdv')) el('invInputAdv').style.display = (incCover || showAdv) ? '' : 'none';
    if (el('tiRowAdvance')) el('tiRowAdvance').style.display = showAdv ? '' : 'none';
    if (el('tiRowBalance')) el('tiRowBalance').style.display = showAdv ? '' : 'none';
    if (el('tiWordsBalanceWrap')) el('tiWordsBalanceWrap').style.display = showAdv ? '' : 'none';

    const tiRowTotal = el('tiRowTotal');
    if (tiRowTotal) {
      if (showAdv) {
        tiRowTotal.style.background = '#f8fafc';
        tiRowTotal.style.color = 'var(--brand-navy)';
        tiRowTotal.style.fontSize = '0.73rem';
      } else {
        tiRowTotal.style.background = 'var(--brand-navy)';
        tiRowTotal.style.color = '#fff';
        tiRowTotal.style.fontSize = '0.80rem';
      }
    }

    const rawQuoteAdv = parseFloat(el('advPct')?.value);
    const quoteAdvPct = Math.max(0, Math.min(100, isNaN(rawQuoteAdv) ? 50 : rawQuoteAdv));
    const advInput = el('invInputAdv')?.value;
    const parsedAdvInput = (advInput && advInput.trim() !== '') ? parseFloat(advInput) : NaN;
    const advAmt = !isNaN(parsedAdvInput)
      ? parsedAdvInput
      : Math.round(totAmount * (quoteAdvPct / 100) * 100) / 100;
    const balAmt = Math.round((totAmount - advAmt) * 100) / 100;

    if (el('tiPaymentTermsText')) {
      el('tiPaymentTermsText').textContent = showAdv
        ? `${quoteAdvPct}% Advance / Balance on Install`
        : 'As per Agreed Terms / Cover Letter';
    }

    if (el('tiSummaryAdvance')) el('tiSummaryAdvance').textContent = '-₹' + fmt(advAmt);
    if (el('tiSummaryBalance')) el('tiSummaryBalance').textContent = '₹' + fmt(balAmt);

    // Words
    const totalTaxAmt = isInterState ? totIgst : (totCgst + totSgst);
    if (el('tiWordsTotal')) el('tiWordsTotal').textContent = numberToWordsIndian(totAmount);
    if (el('tiWordsTax'))   el('tiWordsTax').textContent   = numberToWordsIndian(totalTaxAmt);
    if (el('tiWordsBalance')) el('tiWordsBalance').textContent = numberToWordsIndian(balAmt);

    // Tally-style Tax Summary Breakdown
    if (el('tiBreakTaxable'))  el('tiBreakTaxable').textContent  = '₹' + fmt(totTaxable);
    if (el('tiBreakTotalTax')) el('tiBreakTotalTax').textContent = '₹' + fmt(totalTaxAmt);
    if (isInterState) {
      if (el('tiBreakCgstHead'))    el('tiBreakCgstHead').textContent    = 'IGST Rate';
      if (el('tiBreakCgstAmtHead')) el('tiBreakCgstAmtHead').textContent = 'IGST Amount';
      if (el('tiBreakCgstRate'))    el('tiBreakCgstRate').textContent    = '18%';
      if (el('tiBreakCgstAmt'))     el('tiBreakCgstAmt').textContent     = '₹' + fmt(totIgst);
      if (el('tiBreakSgstHead'))    el('tiBreakSgstHead').style.display  = 'none';
      if (el('tiBreakSgstAmtHead')) el('tiBreakSgstAmtHead').style.display = 'none';
      if (el('tiBreakSgstRate'))    el('tiBreakSgstRate').style.display  = 'none';
      if (el('tiBreakSgstAmt'))     el('tiBreakSgstAmt').style.display   = 'none';
    } else {
      if (el('tiBreakCgstHead'))    el('tiBreakCgstHead').textContent    = 'CGST Rate';
      if (el('tiBreakCgstAmtHead')) el('tiBreakCgstAmtHead').textContent = 'CGST Amount';
      if (el('tiBreakCgstRate'))    el('tiBreakCgstRate').textContent    = '9%';
      if (el('tiBreakCgstAmt'))     el('tiBreakCgstAmt').textContent     = '₹' + fmt(totCgst);
      if (el('tiBreakSgstHead'))    el('tiBreakSgstHead').style.display  = '';
      if (el('tiBreakSgstAmtHead')) el('tiBreakSgstAmtHead').style.display = '';
      if (el('tiBreakSgstRate'))    el('tiBreakSgstRate').style.display  = '';
      if (el('tiBreakSgstAmt')) {
        el('tiBreakSgstAmt').style.display = '';
        el('tiBreakSgstAmt').textContent = '₹' + fmt(totSgst);
      }
    }

    // GenXIoT Signatory on Tax Invoice (preserve manual inline edits)
    const sigNameEl = el('tiSigName');
    const sigDesigEl = el('tiSigDesig');
    if (sigNameEl && !sigNameEl.dataset.userEdited) {
      sigNameEl.textContent = el('genxSignatoryName')?.value || 'Authorized Signatory';
      sigNameEl.oninput = () => { sigNameEl.dataset.userEdited = 'true'; };
    }
    if (sigDesigEl && !sigDesigEl.dataset.userEdited) {
      sigDesigEl.textContent = el('genxSignatoryDesig')?.value || 'GENXIOT LLP';
      sigDesigEl.oninput = () => { sigDesigEl.dataset.userEdited = 'true'; };
    }

    // Populate Integrated Cover Page (Page 1 of Dossier)
    if (el('cInvNo')) el('cInvNo').textContent = invNo;
    if (el('cDate')) el('cDate').textContent = invDateFmt;
    if (el('cPoNo')) el('cPoNo').textContent = poNo;
    if (el('cInstRef')) el('cInstRef').textContent = instRef;
    if (el('cInstDate')) el('cInstDate').textContent = instDateFmt;
    if (el('cClientName')) el('cClientName').textContent = clientName;
    if (el('cClientLoc')) el('cClientLoc').textContent = clientLoc;
    if (el('cContactPerson')) el('cContactPerson').textContent = (el('contactPerson')?.value || 'Director').trim();
    if (el('cClientGstRow')) {
      if (clientGst) {
        el('cClientGstRow').style.display = '';
        if (el('cClientGst')) el('cClientGst').textContent = clientGst;
      } else {
        el('cClientGstRow').style.display = 'none';
      }
    }
    if (el('cTotalAmt')) el('cTotalAmt').textContent = '₹' + fmt(totAmount);
    if (el('cAdvAmt'))   el('cAdvAmt').textContent   = '-₹' + fmt(advAmt);
    if (el('cBalAmt'))   el('cBalAmt').textContent   = '₹' + fmt(balAmt);
  }

  // Populate Page 3: Handover Certificate
  if (el('certInvRef')) el('certInvRef').textContent = invNo;
  if (el('certDate')) el('certDate').textContent = invDateFmt;
  if (el('certClientName')) el('certClientName').textContent = clientName;
  if (el('certClientInline')) el('certClientInline').textContent = clientName;
  if (el('certPoRef')) el('certPoRef').textContent = poNo;
  if (el('certPoInline')) el('certPoInline').textContent = poNo;
  if (el('certInstallRef')) el('certInstallRef').textContent = instRef;
  if (el('certCommDate')) el('certCommDate').textContent = instDateFmt;
  if (el('certTrainingDate')) el('certTrainingDate').textContent = instDateFmt;
  if (el('certSigDateGenx')) el('certSigDateGenx').textContent = instDateFmt;
  if (el('certSigClientName')) el('certSigClientName').textContent = clientName;

  // Pre-fill Customer Receiver name from contactPerson if not manually edited
  const custSigPerson = el('certSigClientPerson');
  if (custSigPerson && !custSigPerson.dataset.userEdited) {
    const cp = (el('contactPerson')?.value || '').trim();
    if (cp) custSigPerson.textContent = cp;
    custSigPerson.oninput = () => { custSigPerson.dataset.userEdited = 'true'; };
  }

  // Track Annexure visibility and render Page 4+
  const incAnnex = el('invIncludeAnnexure') ? el('invIncludeAnnexure').checked : true;
  document.body.classList.toggle('include-annexure', incAnnex);
  if (el('pageInstallAnnexure')) el('pageInstallAnnexure').style.display = incAnnex ? 'block' : 'none';
  if (el('annexInvRef'))   el('annexInvRef').textContent   = invNo;
  if (el('annexInstRef'))  el('annexInstRef').textContent  = instRef;
  if (el('annexInstDate')) el('annexInstDate').textContent = instDateFmt;
  renderInstallAnnexure();

  // Warranty / CMC dynamic text (free-text editable from Invoice Controls OR inline on certificate)
  const warrHw = (el('invInputWarrHw')?.value || '').trim();
  const warrTv = (el('invInputWarrTv')?.value || '').trim();
  const cmcOpt = (el('invInputCmc')?.value || '').trim();

  if (el('certHwWarrText') && !el('certHwWarrText').dataset.userEdited) {
    el('certHwWarrText').textContent = warrHw
      ? `${warrHw} from the date of commissioning. Covers eligible manufacturing defects and internal electronic component failures.`
      : 'As per Purchase Order / agreed warranty terms.';
  }

  if (el('certTvWarrText') && !el('certTvWarrText').dataset.userEdited) {
    el('certTvWarrText').textContent = warrTv
      ? `${warrTv} from date of purchase / commissioning.`
      : 'As per manufacturer standard terms.';
  }

  if (el('certCmcText') && !el('certCmcText').dataset.userEdited) {
    el('certCmcText').textContent = cmcOpt || 'Post-warranty Annual Maintenance Contract (AMC / CMC) available upon separate service agreement.';
  }

  window._tiLastTotal = el('tiSummaryTotal')?.textContent ? parseFloat(el('tiSummaryTotal').textContent.replace(/[^0-9.]/g, '')) : 0;
  window._tiIsInterState = isInterState;
  if (window._lastImportedPo) updatePoCrossCheckBanner();
}

function recalcTaxInvoiceFromTable() {
  const el = id => document.getElementById(id);
  const tbody = el('tiItemBody');
  if (!tbody) return;
  const isInterState = !!window._tiIsInterState;

  let totQty = 0, totTaxable = 0, totCgst = 0, totSgst = 0, totIgst = 0, totAmount = 0;
  tbody.querySelectorAll('tr').forEach(tr => {
    const qtyEl = tr.querySelector('.ti-cell-qty');
    const rateEl = tr.querySelector('.ti-cell-rate');
    const discEl = tr.querySelector('.ti-cell-disc');
    if (!qtyEl || !rateEl) return;

    const qty = parseFloat((qtyEl.textContent || '').replace(/[^0-9.]/g, '')) || 0;
    const rate = parseFloat((rateEl.textContent || '').replace(/[^0-9.]/g, '')) || 0;
    const discPct = parseFloat((discEl?.textContent || '').replace(/[^0-9.]/g, '')) || 0;

    const gross = qty * rate;
    const discAmt = Math.round(gross * (discPct / 100) * 100) / 100;
    const taxable = Math.round((gross - discAmt) * 100) / 100;
    const cgst = isInterState ? 0 : Math.round(taxable * 0.09 * 100) / 100;
    const sgst = isInterState ? 0 : Math.round(taxable * 0.09 * 100) / 100;
    const igst = isInterState ? Math.round(taxable * 0.18 * 100) / 100 : 0;
    const total = taxable + cgst + sgst + igst;

    const taxCell = tr.querySelector('.ti-cell-taxable');
    const cgstCell = tr.querySelector('.ti-cell-cgst');
    const sgstCell = tr.querySelector('.ti-cell-sgst');
    const totCell = tr.querySelector('.ti-cell-total');
    if (taxCell) taxCell.textContent = fmt(taxable);
    if (cgstCell) cgstCell.textContent = fmt(isInterState ? igst : cgst);
    if (sgstCell) sgstCell.textContent = fmt(sgst);
    if (totCell) totCell.textContent = fmt(total);

    totQty += qty;
    totTaxable += taxable;
    totCgst += cgst;
    totSgst += sgst;
    totIgst += igst;
    totAmount += total;
  });

  if (el('tiFootQty')) el('tiFootQty').textContent = totQty + '.00 Nos';
  if (el('tiFootTaxable')) el('tiFootTaxable').textContent = '₹' + fmt(totTaxable);
  if (el('tiFootCgst')) el('tiFootCgst').textContent = '₹' + fmt(isInterState ? totIgst : totCgst);
  if (el('tiFootSgst')) el('tiFootSgst').textContent = '₹' + fmt(totSgst);
  if (el('tiFootTotal')) el('tiFootTotal').textContent = '₹' + fmt(totAmount);
  if (el('tiSummaryTaxable')) el('tiSummaryTaxable').textContent = '₹' + fmt(totTaxable);
  if (el('tiSummaryCgst')) el('tiSummaryCgst').textContent = '₹' + fmt(totCgst);
  if (el('tiSummarySgst')) el('tiSummarySgst').textContent = '₹' + fmt(totSgst);
  if (el('tiSummaryIgst')) el('tiSummaryIgst').textContent = '₹' + fmt(totIgst);
  if (el('tiSummaryTotal')) el('tiSummaryTotal').textContent = '₹' + fmt(totAmount);

  const totalTaxAmt = isInterState ? totIgst : (totCgst + totSgst);
  if (el('tiBreakTaxable')) el('tiBreakTaxable').textContent = '₹' + fmt(totTaxable);
  if (el('tiBreakCgstAmt')) el('tiBreakCgstAmt').textContent = '₹' + fmt(isInterState ? totIgst : totCgst);
  if (el('tiBreakSgstAmt')) el('tiBreakSgstAmt').textContent = '₹' + fmt(totSgst);
  if (el('tiBreakTotalTax')) el('tiBreakTotalTax').textContent = '₹' + fmt(totalTaxAmt);

  const rawQuoteAdv = parseFloat(el('advPct')?.value);
  const quoteAdvPct = Math.max(0, Math.min(100, isNaN(rawQuoteAdv) ? 50 : rawQuoteAdv));
  const advInput = el('invInputAdv')?.value;
  const parsedAdvInput = (advInput && advInput.trim() !== '') ? parseFloat(advInput) : NaN;
  const advAmt = !isNaN(parsedAdvInput) ? parsedAdvInput : Math.round(totAmount * (quoteAdvPct / 100) * 100) / 100;
  const balAmt = Math.round((totAmount - advAmt) * 100) / 100;

  if (el('tiSummaryAdvance')) el('tiSummaryAdvance').textContent = '-₹' + fmt(advAmt);
  if (el('tiSummaryBalance')) el('tiSummaryBalance').textContent = '₹' + fmt(balAmt);
  if (el('tiWordsTotal')) el('tiWordsTotal').textContent = numberToWordsIndian(totAmount);
  if (el('tiWordsTax')) el('tiWordsTax').textContent = numberToWordsIndian(totalTaxAmt);
  if (el('tiWordsBalance')) el('tiWordsBalance').textContent = numberToWordsIndian(balAmt);
  if (el('cTotalAmt')) el('cTotalAmt').textContent = '₹' + fmt(totAmount);
  if (el('cAdvAmt')) el('cAdvAmt').textContent = '-₹' + fmt(advAmt);
  if (el('cBalAmt')) el('cBalAmt').textContent = '₹' + fmt(balAmt);

  window._tiLastTotal = totAmount;
  if (window._lastImportedPo) updatePoCrossCheckBanner();
}

// ─── PO & TALLY PDF IMPORT & 3-WAY CROSS-CHECK ───────────────────────────────
window._lastImportedPo = null;
window._lastImportedTally = null;

async function _extractPdfLines(file) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const allLines = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const tc = await page.getTextContent();
    const rowsMap = new Map();
    tc.items.forEach(item => {
      const y = Math.round(item.transform[5] / 3) * 3;
      if (!rowsMap.has(y)) rowsMap.set(y, []);
      rowsMap.get(y).push({ x: item.transform[4], str: item.str });
    });
    Array.from(rowsMap.keys()).sort((a, b) => b - a).forEach(y => {
      const line = rowsMap.get(y).sort((a, b) => a.x - b.x).map(i => i.str.trim()).filter(Boolean).join(' ');
      if (line) allLines.push(line);
    });
  }
  return allLines;
}

async function importPoPdf(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  if (typeof pdfjsLib === 'undefined') {
    alert('PDF parser (pdf.js) is unavailable.');
    return;
  }

  try {
    const allLines = await _extractPdfLines(file);
    const fullText = allLines.join('\n');

    const poNoMatch = fullText.match(/PO\.?\s*No\s*:?\s*([A-Z0-9\/_-]+)/i);
    const poDateMatch = fullText.match(/Date\s*:?\s*(\d{2})\/(\d{2})\/(\d{4})/i);
    const totalMatch = fullText.match(/\bTotal\s+([\d,]+\.\d{2})\b/i);

    // Extract Customer GSTIN (any valid GSTIN other than GenXIoT's 32ABDFG7210J1ZP)
    const gstMatches = fullText.match(/\b\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]\b/g) || [];
    const buyerGst = gstMatches.find(g => g !== '32ABDFG7210J1ZP') || '';

    // Extract Delivery / Hospital Name & Address
    const delivNameMatch = fullText.match(/Delivery Address\s*:\s*([^\n]+)/i);
    let buyerName = delivNameMatch ? delivNameMatch[1].trim() : '';
    let buyerAddr = '';
    for (let i = 0; i < allLines.length; i++) {
      if (/^Delivery Address\s*:/i.test(allLines[i])) {
        const nextL = (allLines[i + 1] || '').trim();
        if (nextL && !/^Ph:|^Fax:|^E-mail/i.test(nextL)) buyerAddr = nextL;
        break;
      }
      if (/^Near\s+|^.*Kerala\s+\d{6}/i.test(allLines[i]) && !buyerAddr) {
        buyerAddr = allLines[i].trim();
      }
    }

    // Extract Approver Name
    const appMatch = fullText.match(/Approved By\s*:\s*([^\n(]+)/i);
    const approverName = appMatch ? appMatch[1].trim() : '';

    const hwWarrMatch = fullText.match(/Bed Call point.*?Warranty[^\n.]*/i);
    const tvWarrMatch = fullText.match(/Smart TV\s+warr[a-z]*y[^\n.]*/i);
    const payMatch = fullText.match(/Payment\s+\d+%[^\n.]*/i);

    window._lastImportedPo = {
      fileName: file.name,
      poNo: poNoMatch ? poNoMatch[1].trim() : '',
      poDateIso: poDateMatch ? `${poDateMatch[3]}-${poDateMatch[2]}-${poDateMatch[1]}` : '',
      poTotal: totalMatch ? parseFloat(totalMatch[1].replace(/,/g, '')) : 0,
      buyerGst,
      buyerName,
      buyerAddr,
      approverName,
      hwWarranty: hwWarrMatch ? hwWarrMatch[0].trim() : '',
      tvWarranty: tvWarrMatch ? tvWarrMatch[0].trim() : '',
      paymentTerms: payMatch ? payMatch[0].trim() : ''
    };

    const el = id => document.getElementById(id);
    if (window._lastImportedPo.poNo && el('invInputPo')) el('invInputPo').value = window._lastImportedPo.poNo;
    if (window._lastImportedPo.poDateIso && el('invInputPoDate')) el('invInputPoDate').value = window._lastImportedPo.poDateIso;
    // Auto-fill missing GSTIN / Location if currently blank
    if (buyerGst && el('clientGst') && !el('clientGst').value.trim()) el('clientGst').value = buyerGst;
    if (buyerAddr && el('clientLocation') && !el('clientLocation').value.trim()) el('clientLocation').value = buyerAddr;

    updateTaxInvoiceView();
    updatePoCrossCheckBanner();

    if (typeof showToast === 'function') {
      showToast(`PO ${window._lastImportedPo.poNo || file.name} imported (${buyerGst ? 'GSTIN: ' + buyerGst : 'no GSTIN'}).`, 'success', 3500);
    }
  } catch (err) {
    console.error('PO PDF import error:', err);
    alert('Could not parse PO PDF: ' + err.message);
  } finally {
    event.target.value = '';
  }
}

async function importTallyPdf(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  if (typeof pdfjsLib === 'undefined') {
    alert('PDF parser (pdf.js) is unavailable.');
    return;
  }

  try {
    const allLines = await _extractPdfLines(file);
    const fullText = allLines.join('\n');

    // Invoice No & Date (e.g. "2" near "Invoice No." and "26-Nov-26")
    let invNo = '';
    for (let i = 0; i < allLines.length; i++) {
      if (/Invoice No\./i.test(allLines[i])) {
        const windowText = allLines.slice(i, i + 4).join(' ');
        const mDateLine = windowText.match(/\b([A-Za-z0-9\/_-]+)\s+\d{1,2}-[A-Za-z]{3}-\d{2,4}\b/);
        if (mDateLine && !/^(Dated|No\.|LLP|Genxiot)$/i.test(mDateLine[1])) {
          invNo = mDateLine[1].trim();
        } else {
          const mAfterLlp = windowText.match(/Genxiot\s+LLP\s+([A-Za-z0-9\/_-]+)/i);
          if (mAfterLlp) invNo = mAfterLlp[1].trim();
        }
        break;
      }
    }
    const dtMatch = fullText.match(/\b(\d{1,2})-([A-Za-z]{3})-(\d{2,4})\b/);
    let invDateIso = '';
    if (dtMatch) {
      const months = { jan:'01', feb:'02', mar:'03', apr:'04', may:'05', jun:'06', jul:'07', aug:'08', sep:'09', oct:'10', nov:'11', dec:'12' };
      const mm = months[dtMatch[2].toLowerCase()] || '01';
      const yr = dtMatch[3].length === 2 ? '20' + dtMatch[3] : dtMatch[3];
      invDateIso = `${yr}-${mm}-${String(dtMatch[1]).padStart(2, '0')}`;
    }

    const gstMatches = fullText.match(/\b\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]\b/g) || [];
    const buyerGst = gstMatches.find(g => g !== '32ABDFG7210J1ZP') || '';

    // Buyer Name & Address under "Buyer (Bill to)"
    let buyerName = '';
    let buyerAddrLines = [];
    for (let i = 0; i < allLines.length; i++) {
      if (/Buyer\s*\(Bill to\)/i.test(allLines[i])) {
        buyerName = (allLines[i + 1] || '').trim();
        for (let k = i + 2; k < Math.min(i + 6, allLines.length); k++) {
          if (/GSTIN|State Name/i.test(allLines[k])) break;
          buyerAddrLines.push(allLines[k].trim());
        }
        break;
      }
    }

    // Grand Total (e.g. "₹ 93,258.94" or max amount near Total / Amount Chargeable)
    const rupeeMatch = fullText.match(/₹\s*([\d,]+\.\d{2})/);
    let tallyTotal = rupeeMatch ? parseFloat(rupeeMatch[1].replace(/,/g, '')) : 0;
    if (!tallyTotal) {
      const totLine = allLines.find(l => /\bTotal\s+[\d.]+\s+Nos\b/i.test(l)) || '';
      const nums = (totLine.match(/[\d,]+\.\d{2}/g) || []).map(s => parseFloat(s.replace(/,/g, ''))).filter(n => !isNaN(n));
      if (nums.length > 0) tallyTotal = Math.max(...nums);
    }

    // Extract Tally Line Items
    const items = [];
    for (let i = 0; i < allLines.length; i++) {
      // Look for lines containing HSN/SAC + Qty Nos + Rate + Nos + ... + LineTotal
      const m = allLines[i].match(/\b(\d{4,8})\s+([\d.]+)\s+Nos\s+([\d,]+\.\d{2})\s+Nos\s+(?:(\d+)\s*%\s+)?([\d,]+\.\d{2}).*?([\d,]+\.\d{2})$/);
      if (m) {
        // Gather description from preceding lines back to Sl No
        let descParts = [];
        for (let b = i - 1; b >= Math.max(0, i - 5); b--) {
          if (/^(Sl|No\.|Terms of Delivery|State Name|Buyer)/i.test(allLines[b])) break;
          const clean = allLines[b].replace(/^\d+\s+/, '').trim();
          descParts.unshift(clean);
          if (/^\d+\s+/.test(allLines[b])) break;
        }
        const prefix = allLines[i].substring(0, allLines[i].indexOf(m[1])).replace(/^\d+\s+/, '').trim();
        if (prefix) descParts.push(prefix);

        items.push({
          desc: descParts.join(' ').trim() || 'Item',
          hsn: m[1],
          qty: parseFloat(m[2]) || 1,
          rate: parseFloat(m[3].replace(/,/g, '')) || 0,
          discPct: parseFloat(m[4]) || 0
        });
      }
    }

    window._lastImportedTally = {
      fileName: file.name,
      invNo,
      invDateIso,
      buyerName,
      buyerAddr: buyerAddrLines.join(', '),
      buyerGst,
      tallyTotal,
      items
    };

    updatePoCrossCheckBanner();
    if (typeof showToast === 'function') {
      showToast(`Tally Invoice #${invNo || '?'} imported (₹${fmt(tallyTotal)}, ${items.length} items).`, 'success', 3500);
    }
  } catch (err) {
    console.error('Tally PDF import error:', err);
    alert('Could not parse Tally PDF: ' + err.message);
  } finally {
    event.target.value = '';
  }
}

function updatePoCrossCheckBanner() {
  const po = window._lastImportedPo;
  const tally = window._lastImportedTally;
  const banner = document.getElementById('poCrossCheckBanner');
  const summary = document.getElementById('poCrossCheckSummary');
  const btnPo = document.getElementById('btnApplyPoSync');
  const btnTally = document.getElementById('btnApplyTallySync');
  if ((!po && !tally) || !banner || !summary) return;

  const invTotal = window._tiLastTotal || 0;
  const appGst = (document.getElementById('clientGst')?.value || '').trim();
  const parts = [];
  let hasMismatch = false;

  if (po) {
    const diff = Math.round((invTotal - po.poTotal) * 100) / 100;
    const ok = po.poTotal > 0 && Math.abs(diff) < 0.05;
    if (!ok) hasMismatch = true;
    parts.push(`<strong>PO (${po.poNo || po.fileName}):</strong> ₹${fmt(po.poTotal)} ${ok ? '✔' : `(⚠ diff ₹${fmt(diff)})`}${po.buyerGst ? ` · GSTIN: ${po.buyerGst}` : ''}`);
  }
  if (tally) {
    const diff = Math.round((invTotal - tally.tallyTotal) * 100) / 100;
    const ok = tally.tallyTotal > 0 && Math.abs(diff) < 0.05;
    if (!ok) hasMismatch = true;
    parts.push(`<strong>Tally (#${tally.invNo || '?'}):</strong> ₹${fmt(tally.tallyTotal)} ${ok ? '✔' : `(⚠ diff ₹${fmt(diff)})`}${tally.buyerGst ? ` · GSTIN: ${tally.buyerGst}` : ''}`);
  }

  const gstMismatch = (po?.buyerGst && po.buyerGst !== appGst) || (tally?.buyerGst && tally.buyerGst !== appGst);
  if (gstMismatch) hasMismatch = true;

  banner.style.display = 'flex';
  banner.style.background = hasMismatch ? '#fef2f2' : '#ecfdf5';
  banner.style.borderTopColor = hasMismatch ? '#fecaca' : '#a7f3d0';
  banner.style.color = hasMismatch ? '#991b1b' : '#065f46';

  if (btnPo) btnPo.style.display = po ? '' : 'none';
  if (btnTally) btnTally.style.display = tally ? '' : 'none';

  summary.innerHTML = `
    <div><strong>App Invoice:</strong> ₹${fmt(invTotal)} ${appGst ? `· GSTIN: ${appGst}` : '· <span style="color:#b91c1c;">GSTIN Missing!</span>'}</div>
    <div style="margin-top:2px;">${parts.join(' &nbsp;|&nbsp; ')}</div>
    ${po && (po.hwWarranty || po.tvWarranty) ? `<div style="font-size:0.69rem; margin-top:2px; opacity:0.9;">PO Warranty: ${[po.hwWarranty, po.tvWarranty].filter(Boolean).join(' | ')}</div>` : ''}
  `;
}

function applyPoOverridesToInvoice() {
  const po = window._lastImportedPo;
  if (!po) return;
  const el = id => document.getElementById(id);

  if (po.buyerGst && el('clientGst')) el('clientGst').value = po.buyerGst;
  if (po.buyerName && el('clientName')) el('clientName').value = po.buyerName;
  if (po.buyerAddr && el('clientLocation')) el('clientLocation').value = po.buyerAddr;
  if (po.approverName && el('certSigClientPerson')) {
    el('certSigClientPerson').textContent = po.approverName;
    el('certSigClientPerson').dataset.userEdited = 'true';
  }
  if (po.hwWarranty) {
    const hwClean = /2\s*\+\s*1/i.test(po.hwWarranty)
      ? '2 Years Replacement Warranty + 1 Year CMC (Total 3 Years)'
      : po.hwWarranty.replace(/\bwarr[a-z]*y\b/gi, 'Warranty');
    if (el('invInputWarrHw')) el('invInputWarrHw').value = hwClean;
    if (el('certHwWarrText')) {
      delete el('certHwWarrText').dataset.userEdited;
      el('certHwWarrText').textContent = `${hwClean} from the date of commissioning. Covers eligible manufacturing defects and internal electronic component failures.`;
    }
  }
  if (po.tvWarranty) {
    const tvClean = /1\s*\+\s*1/i.test(po.tvWarranty)
      ? '1 Year Manufacturer Warranty + 1 Year Extended CMC (Total 2 Years)'
      : po.tvWarranty.replace(/\bwarr[a-z]*y\b/gi, 'Warranty');
    if (el('invInputWarrTv')) el('invInputWarrTv').value = tvClean;
    if (el('certTvWarrText')) {
      delete el('certTvWarrText').dataset.userEdited;
      el('certTvWarrText').textContent = `${tvClean} from date of purchase / commissioning.`;
    }
  }
  if (po.paymentTerms) {
    const pctMatch = po.paymentTerms.match(/(\d+)\s*%/);
    const advPctNum = pctMatch ? parseInt(pctMatch[1], 10) : 50;
    if (el('advPct')) el('advPct').value = advPctNum;
    if (el('tiPaymentTermsText')) {
      el('tiPaymentTermsText').textContent = `${advPctNum}% Advance / Balance Due on Completion (NEFT)`;
      el('tiPaymentTermsText').dataset.userEdited = 'true';
    }
  }
  updateTaxInvoiceView();
  if (typeof showToast === 'function') {
    showToast('Applied PO GSTIN, Address, Approver & Warranty terms to Invoice.', 'success', 3000);
  }
}

function applyTallyOverridesToInvoice() {
  const tally = window._lastImportedTally;
  if (!tally) return;
  const el = id => document.getElementById(id);

  if (tally.invNo && el('invInputNo')) el('invInputNo').value = tally.invNo;
  if (tally.invDateIso && el('invInputDate')) el('invInputDate').value = tally.invDateIso;
  if (tally.buyerName && el('clientName')) el('clientName').value = tally.buyerName;
  if (tally.buyerAddr && el('clientLocation')) el('clientLocation').value = tally.buyerAddr;
  if (tally.buyerGst && el('clientGst')) el('clientGst').value = tally.buyerGst;

  updateTaxInvoiceView();

  // If Tally had extracted line items, populate #tiItemBody with exact Tally rows and recalculate
  if (tally.items && tally.items.length > 0 && el('tiItemBody')) {
    window._tiUsingTallyItems = true;
    const isInterState = !!window._tiIsInterState;
    const tbody = el('tiItemBody');
    tbody.innerHTML = '';
    tally.items.forEach((it, idx) => {
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid #cbd5e1';
      tr.innerHTML = `
        <td style="padding:4px 3px; border:1px solid #cbd5e1; text-align:center; color:#64748b;">${idx + 1}</td>
        <td style="padding:4px 6px; border:1px solid #cbd5e1;" contenteditable="true" class="editable-field"><strong style="color:#1e293b;">${it.desc}</strong></td>
        <td style="padding:4px 4px; border:1px solid #cbd5e1; text-align:center; font-family:Consolas, monospace;" contenteditable="true" class="editable-field">${it.hsn}</td>
        <td style="padding:4px 4px; border:1px solid #cbd5e1; text-align:center; font-weight:600;" contenteditable="true" class="editable-field ti-cell-qty" onblur="recalcTaxInvoiceFromTable()">${it.qty}.00 Nos</td>
        <td style="padding:4px 4px; border:1px solid #cbd5e1; text-align:right;" contenteditable="true" class="editable-field ti-cell-rate" onblur="recalcTaxInvoiceFromTable()">${fmt(it.rate)}</td>
        <td style="padding:4px 4px; border:1px solid #cbd5e1; text-align:center;" contenteditable="true" class="editable-field ti-cell-disc" onblur="recalcTaxInvoiceFromTable()">${it.discPct > 0 ? it.discPct + '%' : '—'}</td>
        <td style="padding:4px 6px; border:1px solid #cbd5e1; text-align:right; font-weight:600;" class="ti-cell-taxable">0.00</td>
        <td style="padding:4px 4px; border:1px solid #cbd5e1; text-align:right;" class="ti-cell-cgst">0.00</td>
        ${!isInterState ? `<td style="padding:4px 4px; border:1px solid #cbd5e1; text-align:right;" class="ti-cell-sgst">0.00</td>` : ''}
        <td style="padding:4px 6px; border:1px solid #cbd5e1; text-align:right; font-weight:700;" class="ti-cell-total">0.00</td>
      `;
      tbody.appendChild(tr);
    });
    recalcTaxInvoiceFromTable();
  }

  if (typeof showToast === 'function') {
    showToast(`Applied Tally Invoice #${tally.invNo || ''} details & line items.`, 'success', 3000);
  }
}

// ─── FINALIZED TAX INVOICE SAVE & RESTORE ────────────────────────────────────
function collectFinalInvoiceState() {
  const el = id => document.getElementById(id);
  const val = id => el(id)?.value ?? '';
  const chk = id => !!el(id)?.checked;
  const txt = id => el(id)?.textContent ?? '';

  // Capture custom/Tally invoice rows if active
  let customRows = null;
  if (window._tiUsingTallyItems && el('tiItemBody')) {
    customRows = Array.from(el('tiItemBody').querySelectorAll('tr')).map(tr => {
      const tds = tr.querySelectorAll('td');
      return {
        desc: tds[1]?.innerText?.trim() || '',
        hsn: tds[2]?.textContent?.trim() || '',
        qty: parseFloat((tds[3]?.textContent || '').replace(/[^0-9.]/g, '')) || 1,
        rate: parseFloat((tds[4]?.textContent || '').replace(/[^0-9.]/g, '')) || 0,
        discPct: parseFloat((tds[5]?.textContent || '').replace(/[^0-9.]/g, '')) || 0
      };
    });
  }

  return {
    invInputNo: val('invInputNo'),
    invInputDate: val('invInputDate'),
    invInputInstDate: val('invInputInstDate'),
    invInputPo: val('invInputPo'),
    invInputPoDate: val('invInputPoDate'),
    invInputInstRef: val('invInputInstRef'),
    invInputWarrHw: val('invInputWarrHw'),
    invInputWarrTv: val('invInputWarrTv'),
    invInputCmc: val('invInputCmc'),
    invIncludeCover: chk('invIncludeCover'),
    invIncludeAnnexure: chk('invIncludeAnnexure'),
    invShowAdvance: chk('invShowAdvance'),
    invInputAdv: val('invInputAdv'),
    tiSigName: txt('tiSigName'),
    tiSigDesig: txt('tiSigDesig'),
    tiDeliveryTerms: txt('tiDeliveryTerms'),
    tiPaymentTermsText: txt('tiPaymentTermsText'),
    tiDeclarationText: txt('tiDeclarationText'),
    certInstalledBy: txt('certInstalledBy'),
    certNetworkMode: txt('certNetworkMode'),
    certTrainerName: txt('certTrainerName'),
    certTrainerDesig: txt('certTrainerDesig'),
    certTraineeName: txt('certTraineeName'),
    certTraineeDesig: txt('certTraineeDesig'),
    certSigGenxName: txt('certSigGenxName'),
    certSigGenxDesig: txt('certSigGenxDesig'),
    certSigClientPerson: txt('certSigClientPerson'),
    certSigClientDesig: txt('certSigClientDesig'),
    certHwWarrText: txt('certHwWarrText'),
    certTvWarrText: txt('certTvWarrText'),
    certCmcText: txt('certCmcText'),
    serialNumbers: window._certSerialNumbers || {},
    manualAnnexureItems: window._manualAnnexureItems || [],
    importedDevices: window._importedDevices || [],
    usingTallyItems: !!window._tiUsingTallyItems,
    customRows
  };
}

function restoreFinalInvoiceState(inv) {
  if (!inv || typeof inv !== 'object') return;
  const el = id => document.getElementById(id);
  const setV = (id, v) => { if (el(id) && v !== undefined && v !== null) el(id).value = v; };
  const setC = (id, v) => { if (el(id) && v !== undefined) el(id).checked = !!v; };
  const setT = (id, v) => {
    if (el(id) && v !== undefined && v !== null && String(v).trim() !== '') {
      el(id).textContent = v;
      el(id).dataset.userEdited = 'true';
    }
  };

  setV('invInputNo', inv.invInputNo);
  setV('invInputDate', inv.invInputDate);
  setV('invInputInstDate', inv.invInputInstDate);
  setV('invInputPo', inv.invInputPo);
  setV('invInputPoDate', inv.invInputPoDate);
  setV('invInputInstRef', inv.invInputInstRef);
  setV('invInputWarrHw', inv.invInputWarrHw);
  setV('invInputWarrTv', inv.invInputWarrTv);
  setV('invInputCmc', inv.invInputCmc);
  setC('invIncludeCover', inv.invIncludeCover !== undefined ? inv.invIncludeCover : true);
  setC('invIncludeAnnexure', inv.invIncludeAnnexure !== undefined ? inv.invIncludeAnnexure : true);
  setC('invShowAdvance', inv.invShowAdvance);
  setV('invInputAdv', inv.invInputAdv);

  setT('tiSigName', inv.tiSigName);
  setT('tiSigDesig', inv.tiSigDesig);
  setT('tiDeliveryTerms', inv.tiDeliveryTerms);
  setT('tiPaymentTermsText', inv.tiPaymentTermsText);
  setT('tiDeclarationText', inv.tiDeclarationText);
  setT('certInstalledBy', inv.certInstalledBy);
  setT('certNetworkMode', inv.certNetworkMode);
  setT('certTrainerName', inv.certTrainerName);
  setT('certTrainerDesig', inv.certTrainerDesig);
  setT('certTraineeName', inv.certTraineeName);
  setT('certTraineeDesig', inv.certTraineeDesig);
  setT('certSigGenxName', inv.certSigGenxName);
  setT('certSigGenxDesig', inv.certSigGenxDesig);
  setT('certSigClientPerson', inv.certSigClientPerson);
  setT('certSigClientDesig', inv.certSigClientDesig);
  setT('certHwWarrText', inv.certHwWarrText);
  setT('certTvWarrText', inv.certTvWarrText);
  setT('certCmcText', inv.certCmcText);

  if (inv.serialNumbers) window._certSerialNumbers = inv.serialNumbers;
  if (Array.isArray(inv.manualAnnexureItems)) window._manualAnnexureItems = inv.manualAnnexureItems;
  if (Array.isArray(inv.importedDevices)) window._importedDevices = inv.importedDevices;

  if (inv.usingTallyItems && Array.isArray(inv.customRows) && inv.customRows.length > 0) {
    window._lastImportedTally = window._lastImportedTally || { invNo: inv.invInputNo, items: inv.customRows };
    window._lastImportedTally.items = inv.customRows;
    window._tiUsingTallyItems = true;
    if (el('tiItemBody')) {
      const isInterState = !!window._tiIsInterState;
      const tbody = el('tiItemBody');
      tbody.innerHTML = '';
      inv.customRows.forEach((it, idx) => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #cbd5e1';
        tr.innerHTML = `
          <td style="padding:4px 3px; border:1px solid #cbd5e1; text-align:center; color:#64748b;">${idx + 1}</td>
          <td style="padding:4px 6px; border:1px solid #cbd5e1;" contenteditable="true" class="editable-field"><strong style="color:#1e293b;">${it.desc}</strong></td>
          <td style="padding:4px 4px; border:1px solid #cbd5e1; text-align:center; font-family:Consolas, monospace;" contenteditable="true" class="editable-field">${it.hsn}</td>
          <td style="padding:4px 4px; border:1px solid #cbd5e1; text-align:center; font-weight:600;" contenteditable="true" class="editable-field ti-cell-qty" onblur="recalcTaxInvoiceFromTable()">${it.qty}.00 Nos</td>
          <td style="padding:4px 4px; border:1px solid #cbd5e1; text-align:right;" contenteditable="true" class="editable-field ti-cell-rate" onblur="recalcTaxInvoiceFromTable()">${fmt(it.rate)}</td>
          <td style="padding:4px 4px; border:1px solid #cbd5e1; text-align:center;" contenteditable="true" class="editable-field ti-cell-disc" onblur="recalcTaxInvoiceFromTable()">${it.discPct > 0 ? it.discPct + '%' : '—'}</td>
          <td style="padding:4px 6px; border:1px solid #cbd5e1; text-align:right; font-weight:600;" class="ti-cell-taxable">0.00</td>
          <td style="padding:4px 4px; border:1px solid #cbd5e1; text-align:right;" class="ti-cell-cgst">0.00</td>
          ${!isInterState ? `<td style="padding:4px 4px; border:1px solid #cbd5e1; text-align:right;" class="ti-cell-sgst">0.00</td>` : ''}
          <td style="padding:4px 6px; border:1px solid #cbd5e1; text-align:right; font-weight:700;" class="ti-cell-total">0.00</td>
        `;
        tbody.appendChild(tr);
      });
    }
  }
}

function saveFinalizedInvoice() {
  const qtn = (document.getElementById('quoteRef')?.value || 'DRAFT').trim();
  const invState = collectFinalInvoiceState();
  try {
    localStorage.setItem('genxiot_final_invoice_' + qtn, JSON.stringify(invState));
  } catch (e) { console.warn('localStorage invoice save skipped:', e); }

  const statusSel = document.getElementById('dealStatus');
  if (statusSel && (statusSel.value === 'Pending' || statusSel.value === 'Active Option')) {
    statusSel.value = 'Closed Won';
  }
  if (typeof saveQuote === 'function') {
    saveQuote();
  }
  if (typeof showToast === 'function') {
    showToast(`Finalized Tax Invoice #${invState.invInputNo || '1'} saved!`, 'success', 3000);
  }
}

// ─── ANNEXURE A: EQUIPMENT RECONCILIATION & PDF DEVICE IMPORT ─────────────────
window._certSerialNumbers = window._certSerialNumbers || {};
window._manualAnnexureItems = window._manualAnnexureItems || [];
window._importedDevices = window._importedDevices || [];

function renderInstallAnnexure() {
  const equipBody = document.getElementById('annexEquipBody');
  const devBody = document.getElementById('annexDeviceBody');
  const isDripoOnly = (typeof isDripoQuoteActive === 'function') && isDripoQuoteActive();

  if (equipBody) {
    equipBody.innerHTML = '';
    let idx = 1;

    // Auto-summarize imported call-point serials if present
    let importedSummary = '';
    if (window._importedDevices.length > 0) {
      const sns = window._importedDevices.map(d => d.serial).filter(Boolean).sort();
      if (sns.length > 1) {
        importedSummary = `${sns.length} units (${sns[0]} to ${sns[sns.length - 1]})`;
      } else if (sns.length === 1) {
        importedSummary = sns[0];
      }
    }

    bom.forEach(item => {
      if (!item.qty || item.qty <= 0) return;
      const dInfo = getItemDisplayInfo(item, isDripoOnly);
      const cleanName = dInfo.name.replace(/\((?:HSN|SAC):.*?\)/i, '').trim();
      let savedSn = window._certSerialNumbers[item.code] || '';
      if (!savedSn && item.code === 'ALAMO-CP-R' && importedSummary) {
        savedSn = importedSummary;
      }

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="padding:3px 4px; text-align:center; color:#64748b;">${idx++}</td>
        <td style="padding:3px 6px; font-weight:600; color:#1e293b;">${cleanName} <span style="font-size:0.62rem; color:#64748b; font-weight:400;">[${item.code}]</span></td>
        <td style="padding:3px 4px; text-align:center; font-weight:600;">${item.qty} Nos</td>
        <td contenteditable="true" class="cert-sn-cell" style="padding:3px 6px; color:#0f172a; outline:none;" oninput="window._certSerialNumbers['${item.code}'] = this.textContent">${savedSn}</td>
        <td class="no-print" style="padding:3px 4px; text-align:center; color:#94a3b8; font-size:0.65rem;">PO</td>
      `;
      equipBody.appendChild(tr);
    });

    // Manual additions (e.g. items missing from Installation Report)
    window._manualAnnexureItems.forEach((mItem, mIdx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="padding:3px 4px; text-align:center; color:#64748b;">${idx++}</td>
        <td contenteditable="true" class="editable-field" style="padding:3px 6px; font-weight:600; color:#1e293b;" oninput="window._manualAnnexureItems[${mIdx}].name = this.textContent">${mItem.name}</td>
        <td contenteditable="true" class="editable-field" style="padding:3px 4px; text-align:center; font-weight:600;" oninput="window._manualAnnexureItems[${mIdx}].qty = this.textContent">${mItem.qty}</td>
        <td contenteditable="true" class="cert-sn-cell" style="padding:3px 6px; color:#0f172a; outline:none;" oninput="window._manualAnnexureItems[${mIdx}].serials = this.textContent">${mItem.serials}</td>
        <td class="no-print" style="padding:3px 4px; text-align:center;">
          <button type="button" onclick="deleteManualAnnexureItem(${mIdx})" style="background:none; border:none; color:#ef4444; cursor:pointer; font-weight:700;" title="Remove">×</button>
        </td>
      `;
      equipBody.appendChild(tr);
    });
  }

  if (devBody) {
    devBody.innerHTML = '';
    if (window._importedDevices.length === 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td colspan="8" style="padding:8px; text-align:center; color:#64748b; font-style:italic;">
          No individual device rows imported yet. Click <strong>"Import Install PDF"</strong> above or <strong>"+ Add Device Row"</strong> to populate serial numbers.
        </td>
      `;
      devBody.appendChild(tr);
    } else {
      window._importedDevices.forEach((dev, dIdx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td style="padding:3px 4px; text-align:center; color:#64748b;">${dIdx + 1}</td>
          <td contenteditable="true" style="padding:3px 5px;" oninput="window._importedDevices[${dIdx}].station = this.textContent">${dev.station || '—'}</td>
          <td contenteditable="true" style="padding:3px 5px; font-family:Consolas, monospace; font-weight:600;" oninput="window._importedDevices[${dIdx}].serial = this.textContent">${dev.serial || ''}</td>
          <td contenteditable="true" style="padding:3px 5px; font-family:Consolas, monospace; font-size:0.62rem;" oninput="window._importedDevices[${dIdx}].buttonId = this.textContent">${dev.buttonId || '—'}</td>
          <td contenteditable="true" style="padding:3px 5px; text-align:center;" oninput="window._importedDevices[${dIdx}].room = this.textContent">${dev.room || '—'}</td>
          <td contenteditable="true" style="padding:3px 5px; text-align:center;" oninput="window._importedDevices[${dIdx}].location = this.textContent">${dev.location || '—'}</td>
          <td contenteditable="true" style="padding:3px 5px; text-align:center;" oninput="window._importedDevices[${dIdx}].bed = this.textContent">${dev.bed || '—'}</td>
          <td class="no-print" style="padding:3px 4px; text-align:center;">
            <button type="button" onclick="deleteDeviceRow(${dIdx})" style="background:none; border:none; color:#ef4444; cursor:pointer; font-weight:700;" title="Remove">×</button>
          </td>
        `;
        devBody.appendChild(tr);
      });
    }
  }
}

function addManualAnnexureItem() {
  window._manualAnnexureItems.push({
    name: 'Additional Installed Item (Click to edit)',
    qty: '1 Nos',
    serials: ''
  });
  renderInstallAnnexure();
}

function deleteManualAnnexureItem(idx) {
  window._manualAnnexureItems.splice(idx, 1);
  renderInstallAnnexure();
}

function addManualDeviceRow() {
  window._importedDevices.push({
    station: 'Nursing Station',
    serial: 'SN-',
    buttonId: '—',
    room: '—',
    location: 'Station',
    bed: '—'
  });
  renderInstallAnnexure();
}

function deleteDeviceRow(idx) {
  window._importedDevices.splice(idx, 1);
  renderInstallAnnexure();
}

async function importInstallationPdf(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  if (typeof pdfjsLib === 'undefined') {
    alert('PDF parser (pdf.js) is still loading or unavailable offline. Please check internet connection or add items manually.');
    return;
  }

  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    const allLines = [];
    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p);
      const tc = await page.getTextContent();
      // Group text items by Y coordinate (tolerance 3px)
      const rowsMap = new Map();
      tc.items.forEach(item => {
        const y = Math.round(item.transform[5] / 3) * 3;
        if (!rowsMap.has(y)) rowsMap.set(y, []);
        rowsMap.get(y).push({ x: item.transform[4], str: item.str });
      });
      const sortedYs = Array.from(rowsMap.keys()).sort((a, b) => b - a);
      sortedYs.forEach(y => {
        const line = rowsMap.get(y)
          .sort((a, b) => a.x - b.x)
          .map(i => i.str.trim())
          .filter(Boolean)
          .join(' ');
        if (line) allLines.push(line);
      });
    }

    const fullText = allLines.join('\n');
    const el = id => document.getElementById(id);

    // 1. Extract Install Ref (e.g. INS-1126-Credence Hospital-)
    const refMatch = fullText.match(/INS-[A-Za-z0-9\s-]+?(?=\s*•|\s*\d{4}-\d{2}-\d{2}|$)/m);
    if (refMatch && el('invInputInstRef')) {
      el('invInputInstRef').value = refMatch[0].trim();
    }

    // 2. Extract Installation Date (YYYY-MM-DD)
    const dateMatch = fullText.match(/Installation Date\s+(\d{4}-\d{2}-\d{2})/i) || fullText.match(/(\d{4}-\d{2}-\d{2})/);
    if (dateMatch && el('invInputInstDate')) {
      el('invInputInstDate').value = dateMatch[1];
    }

    // 3. Extract Installed By
    for (let i = 0; i < allLines.length; i++) {
      if (/Installed By/i.test(allLines[i])) {
        const nextLine = allLines[i + 1] || '';
        const engName = nextLine.replace(/Credence Hospital|Hospital \/ Customer/i, '').trim();
        if (engName && engName.length < 50) {
          if (el('certInstalledBy')) el('certInstalledBy').textContent = engName;
          if (el('certTrainerName')) el('certTrainerName').textContent = engName;
          if (el('certSigGenxName')) el('certSigGenxName').textContent = engName;
        }
        break;
      }
    }

    // 4. Extract Network / Gateway Mode (values sit on the line below labels)
    let instType = '';
    let gwModel = '';
    for (let i = 0; i < allLines.length; i++) {
      if (/Type of Installation/i.test(allLines[i])) {
        const valLine = (allLines[i + 1] || '').replace(/^\d{4}-\d{2}-\d{2}\s*/, '').trim();
        if (valLine) instType = valLine;
      }
      if (/Offline Gateway Model/i.test(allLines[i])) {
        const valLine = (allLines[i + 1] || '').replace(/Not Applicable/i, '').trim();
        if (valLine) gwModel = valLine;
      }
    }
    if (el('certNetworkMode')) {
      const parts = [];
      if (instType) parts.push(instType);
      if (gwModel) parts.push(gwModel + ' Gateway');
      if (parts.length > 0) el('certNetworkMode').textContent = parts.join(' · ');
    }

    // 5. Extract Device Rows by Nursing Station
    const devices = [];
    let currentStation = 'Main';
    allLines.forEach(line => {
      const stMatch = line.match(/Nursing Station:\s*(.+)/i);
      if (stMatch) {
        currentStation = stMatch[1].trim();
        return;
      }
      // Match: <#> <SerialNumber> <ButtonID> <Room> <Location> <Bed>
      const rowMatch = line.match(/^\d+\s+([A-Z0-9-]{6,})\s+([A-Z0-9]{10,})\s+(\S+)\s+(\S+)\s+(.+)$/);
      if (rowMatch) {
        devices.push({
          station: currentStation,
          serial: rowMatch[1],
          buttonId: rowMatch[2],
          room: rowMatch[3],
          location: rowMatch[4],
          bed: rowMatch[5].trim()
        });
      }
    });

    window._importedDevices = devices;
    if (el('invIncludeAnnexure')) el('invIncludeAnnexure').checked = true;
    updateTaxInvoiceView();

    if (typeof showToast === 'function') {
      showToast(`Imported ${devices.length} device serial(s) from ${file.name} (supplier letterhead stripped).`, 'success', 4000);
    }
  } catch (err) {
    console.error('Install PDF import error:', err);
    alert('Could not parse PDF: ' + err.message);
  } finally {
    event.target.value = '';
  }
}





function setDashboardTab(tabName) {
  window.currentDashboardTab = tabName;
  document.querySelectorAll('.filter-tab').forEach(b => {
    if (b.getAttribute('data-tab') === tabName) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });
  filterDashboardQuotes();
}

function filterDashboardQuotes() {
  const query = (document.getElementById('dashSearchInput')?.value || '').toLowerCase().trim();
  const tab   = window.currentDashboardTab || 'active';

  let list = window.enrichedDashboardQuotes || [];

  // Filter according to active tab
  if (tab === 'active') {
    list = list.filter(q => (q.status === 'Pending' || q.status === 'Active Option' || !q.status) && (q.isLatest || q.status === 'Active Option'));
  } else if (tab === 'pending') {
    list = list.filter(q => q.status === 'Pending' || q.status === 'Active Option');
  } else if (tab === 'won') {
    list = list.filter(q => q.status === 'Closed Won');
  } else if (tab === 'lost') {
    list = list.filter(q => q.status === 'Closed Lost');
  } else if (tab === 'revised') {
    list = list.filter(q => q.status === 'Revised');
  }
  // 'all' shows all rows

  // Search filter
  if (query) {
    list = list.filter(q =>
      (q.quoteRef || '').toLowerCase().includes(query) ||
      (q.clientName || '').toLowerCase().includes(query) ||
      (q.location || '').toLowerCase().includes(query) ||
      (q.status || '').toLowerCase().includes(query)
    );
  }

  renderDashboardTable(list);
}

function renderDashboardTable(list) {
  const tbody = document.getElementById('dashTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding: 36px 12px; color: var(--muted); font-size: 0.85rem;">
          <i data-lucide="inbox" size="24" style="margin-bottom: 6px; opacity: 0.6;"></i>
          <div>No quotes match the selected filter.</div>
        </td>
      </tr>
    `;
    if (window.lucide) lucide.createIcons({ root: tbody });
    return;
  }

  list.forEach(q => {
    const val = parseFloat(q.totalAmount) || 0;
    const dateFormatted = q.date ? q.date.split('T')[0] : '';
    const st = q.status || 'Pending';
    const statusClass = st.toLowerCase().replace(/\s+/g, '');

    const isOption = (st === 'Active Option');
    const versionBadge = isOption
      ? `<span class="badge-v-option">V${q.version} (Option)</span>`
      : (q.isLatest
          ? `<span class="badge-v-latest">V${q.version} (Latest)</span>`
          : `<span class="badge-v-rev">V${q.version} (Rev)</span>`);

    const isDripo = (q.productType === 'dripo') ||
                    (q.quoteRef && q.quoteRef.startsWith('GEN-DRP')) ||
                    (q.bomData && Array.isArray(q.bomData) && q.bomData.some(b => b && b.code === 'DRIPO-IM'));

    const prodBadge = isDripo
      ? `<span class="badge-prod-dripo">💧 Dripo</span>`
      : `<span class="badge-prod-alamo">🩺 Alamo</span>`;

    const unitsLabel = isDripo
      ? `${q.totalBeds || q.dripoQty || 0} Units`
      : `${q.totalBeds || 0} Beds`;

    const revisionBtn = q.totalRevisions > 1
      ? `<button type="button" class="btn-view-revisions" onclick="showRevisionHistory('${q.groupKey}')" title="View all ${q.totalRevisions} revisions">
           <i data-lucide="layers" size="12"></i> ${q.totalRevisions} Revs
         </button>`
      : '';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="white-space:nowrap; color:var(--mid); font-family:var(--font-mono, monospace); font-size:0.75rem;">${dateFormatted}</td>
      <td>
        <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
          ${prodBadge}
          <span style="font-weight:600; font-family:monospace; color:var(--brand-navy); font-size:0.8rem;">${q.quoteRef}</span>
          ${versionBadge}
          ${revisionBtn}
        </div>
      </td>
      <td>
        <div style="font-weight:600; color:var(--ink);">${q.clientName}</div>
        ${q.location ? `<div style="font-size:0.72rem; color:var(--muted);">${q.location}</div>` : ''}
      </td>
      <td style="font-weight:700; white-space:nowrap; color:var(--brand-indigo);">
        ₹ ${Math.round(val).toLocaleString('en-IN')}
        <div style="font-size:0.7rem; font-weight:400; color:var(--muted);">${unitsLabel}</div>
      </td>
      <td>
        <select class="status-select status-${statusClass}" onchange="changeQuoteStatus(event, '${q.quoteRef}')">
          <option value="Pending" ${st === 'Pending' ? 'selected' : ''}>⏳ Pending</option>
          <option value="Active Option" ${st === 'Active Option' ? 'selected' : ''}>🔀 Active Option</option>
          <option value="Closed Won" ${st === 'Closed Won' ? 'selected' : ''}>🏆 Closed Won</option>
          <option value="Closed Lost" ${st === 'Closed Lost' ? 'selected' : ''}>❌ Closed Lost</option>
          <option value="Revised" ${st === 'Revised' ? 'selected' : ''}>🔄 Revised</option>
        </select>
      </td>
      <td style="text-align: right; white-space:nowrap;">
        <button class="btn btn-sm btn-ghost" style="padding: 4px 10px; font-size: 0.76rem; color: var(--brand-indigo); font-weight:600;" onclick="loadQuoteFromDashboard(event, '${q.quoteRef}')">
          <i data-lucide="folder-open" size="13"></i> Open
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  if (window.lucide) lucide.createIcons({ root: tbody });
}

function changeQuoteStatus(event, quoteRef) {
  const select = event.target;
  const newStatus = select.value;

  // Immediately update select styling
  const statusClass = newStatus.toLowerCase().replace(/\s+/g, '');
  select.className = `status-select status-${statusClass}`;

  // Persist locally immediately for instant feedback
  setLocalStatusOverride(quoteRef, newStatus);

  // Update in memory models
  let currentItem = null;
  if (window.enrichedDashboardQuotes) {
    currentItem = window.enrichedDashboardQuotes.find(q => q.quoteRef === quoteRef);
    if (currentItem) currentItem.status = newStatus;
  }

  // If ANY version/option is closed as Closed Won, check for competing active options for this client
  let retireOthers = false;
  if (newStatus === 'Closed Won' && currentItem) {
    const otherActive = (currentItem.groupQuotes || []).filter(o =>
      o.quoteRef !== quoteRef && (o.status === 'Pending' || o.status === 'Active Option' || !o.status)
    );
    if (otherActive.length > 0) {
      const clientName = currentItem.clientName || 'this hospital';
      const promptText = `Deal Closed Won! 🎉\n\nThere are ${otherActive.length} other standing version(s)/option(s) for "${clientName}":\n\n` +
        otherActive.map(o => ` • ${o.quoteRef} (₹${Math.round(o.totalAmount).toLocaleString('en-IN')})`).join('\n') +
        `\n\nWould you like to automatically retire/withdraw them as "Revised" so your active pipeline stays clean?`;
      if (confirm(promptText)) {
        retireOthers = true;
        otherActive.forEach(o => {
          setLocalStatusOverride(o.quoteRef, 'Revised');
          o.status = 'Revised';
          fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'updateStatus', quoteRef: o.quoteRef, status: 'Revised' })
          }).catch(e => console.warn('Retiring competing option failed:', e));
        });
      }
    }
  }

  showToast(`Updated "${quoteRef}" to ${newStatus}`, 'success', 2500);

  // Send update to Google Apps Script
  fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify({
      action: 'updateStatus',
      quoteRef: quoteRef,
      status: newStatus,
      retireOtherVersions: retireOthers
    })
  })
  .then(r => r.json())
  .then(res => {
    if (res.status !== 'success') {
      console.warn('Backend updateStatus response:', res);
    }
  })
  .catch(err => {
    console.warn('Remote updateStatus pending sync:', err);
  });

  // Re-calculate dashboard metrics and refresh
  renderDashboard(window.allDashboardQuotes);
}

function showRevisionHistory(groupKey) {
  const modal = document.getElementById('revisionModal');
  const tbody = document.getElementById('revModalTableBody');
  const titleEl = document.getElementById('revModalTitle');
  const subEl = document.getElementById('revModalSubtitle');
  if (!modal || !tbody) return;

  const quotes = (window.enrichedDashboardQuotes || []).filter(q => q.groupKey === groupKey);
  if (quotes.length === 0) return;

  quotes.sort((a, b) => (b.version || 1) - (a.version || 1));

  const clientName = quotes[0].clientName || 'Client';
  if (titleEl) titleEl.innerText = `Revision History: ${clientName}`;
  if (subEl) subEl.innerText = `${quotes.length} versions tracked in timeline`;

  tbody.innerHTML = '';
  quotes.forEach((q, idx) => {
    const isLatest = (idx === 0);
    const val = parseFloat(q.totalAmount) || 0;
    const dateFormatted = q.date ? q.date.split('T')[0] : '';
    const st = q.status || 'Pending';
    const statusClass = st.toLowerCase().replace(/\s+/g, '');

    const isOption = (st === 'Active Option');
    const badge = isOption
      ? `<span class="badge-v-option">V${q.version} (Option)</span>`
      : (isLatest
          ? `<span class="badge-v-latest">V${q.version} (Latest)</span>`
          : `<span class="badge-v-rev">V${q.version} (Rev)</span>`);

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="padding:10px 6px;">${badge}</td>
      <td style="padding:10px 6px; font-family:monospace; font-weight:600; font-size:0.78rem;">${q.quoteRef}</td>
      <td style="padding:10px 6px; font-size:0.76rem; color:var(--mid);">${dateFormatted}</td>
      <td style="padding:10px 6px; font-size:0.76rem;">${q.totalBeds || 0}</td>
      <td style="padding:10px 6px; font-weight:700; color:var(--brand-indigo);">₹ ${Math.round(val).toLocaleString('en-IN')}</td>
      <td style="padding:10px 6px;">
        <span class="status-select status-${statusClass}" style="display:inline-block; font-size:0.7rem; pointer-events:none;">${st}</span>
      </td>
      <td style="padding:10px 6px; text-align:right;">
        <button class="btn btn-sm btn-ghost" style="padding:3px 8px; font-size:0.75rem; color:var(--brand-indigo); font-weight:600;" onclick="closeRevisionModal(); loadQuoteFromDashboard(event, '${q.quoteRef}')">Open</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  modal.classList.add('open');
  if (window.lucide) lucide.createIcons({ root: tbody });
}

function closeRevisionModal() {
  const modal = document.getElementById('revisionModal');
  if (modal) modal.classList.remove('open');
}

function loadQuoteFromDashboard(event, ref) {
  const btn = event.currentTarget;
  const origText = btn.innerText;
  btn.innerText = '...';
  btn.disabled = true;
  
  fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: 'searchQuote', query: ref }) })
    .then(r => r.json())
    .then(data => {
      btn.innerText = origText;
      btn.disabled = false;
      if (data.status === 'success' && data.data) {
        restoreQuote(data.data);
        showCalculator();
      } else {
        alert('Quote not found.');
      }
    })
    .catch(err => {
      btn.innerText = origText;
      btn.disabled = false;
      alert('Error loading quote.');
    });
}
