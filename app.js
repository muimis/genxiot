/* ==========================================================================
   GENXIOT ALAMO BDM QUOTE BUILDER & COMMERCIAL CALCULATOR LOGIC
   ========================================================================== */

// Standard Catalog Master Data (Matching exact Evelabs SAL-QTN-2024-00478)
const CATALOG_MASTER = [
    {
        id: 'EVECPRJ03A0001A',
        name: 'Alamo | Service and Nurse Call | Call Point',
        code: 'EVECPRJ03A0001A',
        desc: 'Patient call point with Call, Service, Cancel and Acknowledge buttons. 2 RJ11 ports + power port. Includes assembly screws.',
        unitRate: 2000,
        category: 'core'
    },
    {
        id: 'EVECPRJ03A0008A',
        name: 'Alamo | Pendant Button',
        code: 'EVECPRJ03A0008A',
        desc: 'Patient side call switch accessories that can be connected to the main call point. Includes product stand and screws for assembly.',
        unitRate: 400,
        category: 'accessory'
    },
    {
        id: 'EVECPRJ03M0035A',
        name: 'Alamo | Pendant Stand',
        code: 'EVECPRJ03M0035A',
        desc: 'Includes screws and fisher plug for assembly.',
        unitRate: 100,
        category: 'accessory'
    },
    {
        id: 'EVECPRJ03A0003A',
        name: 'Alamo | Pullcord',
        code: 'EVECPRJ03A0003A',
        desc: 'Pull Cord accessory that can be connected to a call point for use in washrooms for ease of access. Include screws for assembly.',
        unitRate: 400,
        category: 'washroom'
    },
    {
        id: 'EVECPRJ03A0004B',
        name: 'Alamo|Call light V2',
        code: 'EVECPRJ03A0004B',
        desc: 'Alamo|Call light V2 multi-color LED door indicator light.',
        unitRate: 2300,
        category: 'indicator'
    },
    {
        id: 'EVECPRJ04A0001A',
        name: 'Evegate Lora Gateway',
        code: 'EVECPRJ04A0001A',
        desc: 'Gateway receives messages from call points and shares data to mobile phone, tablets, android TV or cloud server.',
        unitRate: 8500,
        category: 'infrastructure'
    },
    {
        id: 'EVECPRJ03A0011B',
        name: '|REPEATER V2|',
        code: 'EVECPRJ03A0011B',
        desc: 'Includes B type charger, product stand and screws for assembly.',
        unitRate: 2500,
        category: 'infrastructure'
    },
    {
        id: 'EVESE0207',
        name: 'Iffalcon 32 inch / Nursing Station Display',
        code: 'EVESE0207',
        desc: '32 inch Android Smart TV / Monitor for displaying nurse calls in nursing stations.',
        unitRate: 12500,
        category: 'display'
    }
];

// Current State
let bomItems = [];

// Initialize App on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    initDefaultQuote();
    calculateEstimator();
    updateDateFields();
});

// Set Today & Expiry Dates
function updateDateFields() {
    const today = new Date();
    const isoToday = today.toISOString().split('T')[0];
    
    const validityDays = parseInt(document.getElementById('validityDays').value) || 30;
    const expiryDate = new Date(today);
    expiryDate.setDate(expiryDate.getDate() + validityDays);
    const isoExpiry = expiryDate.toISOString().split('T')[0];

    document.getElementById('docDate').textContent = isoToday;
    document.getElementById('docValidUntil').textContent = isoExpiry;
}

// Load Default Quote (Sample Quote SAL-QTN-2024-00478 for Nims Hospital TVM)
function initDefaultQuote() {
    document.getElementById('clientName').value = 'Nims hospital tvm';
    document.getElementById('clientLocation').value = 'Trivandrum, Kerala';
    document.getElementById('contactPerson').value = 'Medical Director / BioMed Team';
    document.getElementById('quoteRef').value = 'SAL-QTN-2024-00478';
    document.getElementById('shippingCharge').value = '3500';

    // Exact BOM from SAL-QTN-2024-00478
    bomItems = [
        { ...CATALOG_MASTER[0], qty: 134 }, // Call Point 134
        { ...CATALOG_MASTER[1], qty: 134 }, // Pendant Button 134
        { ...CATALOG_MASTER[2], qty: 134 }, // Pendant Stand 134
        { ...CATALOG_MASTER[0], id: 'EVECPRJ03A0001A_2', name: 'Alamo | Service and Nurse Call | Call Point (Wards)', qty: 99 }, // Call Point 99
        { ...CATALOG_MASTER[3], qty: 99 },  // Pullcord 99
        { ...CATALOG_MASTER[4], qty: 39 },  // Call light V2 39
        { ...CATALOG_MASTER[5], qty: 8 },   // Gateway 8
        { ...CATALOG_MASTER[7], qty: 8 },   // 32 inch TV 8
        { ...CATALOG_MASTER[6], qty: 12 }   // Repeater 12
    ];

    renderBOMTable();
    recalculateTotals();
}

// Bed-to-BOM Smart Estimator Math
function calculateEstimator() {
    const beds = parseInt(document.getElementById('bedCount').value) || 0;
    const washrooms = parseInt(document.getElementById('washroomCount').value) || 0;
    const wards = parseInt(document.getElementById('wardCount').value) || 1;
    const doorLightRatio = parseFloat(document.getElementById('doorLightOption').value) || 0;

    const callPoints = beds;
    const pendants = beds;
    const pullcords = washrooms;
    const doorLights = Math.ceil(beds * doorLightRatio);
    
    // Gateways: 1 per ~35-40 devices
    const totalDevices = callPoints + pullcords;
    const gateways = Math.max(1, Math.ceil(totalDevices / 35));
    const displays = wards;

    document.getElementById('estCallPoints').textContent = callPoints;
    document.getElementById('estPendants').textContent = pendants;
    document.getElementById('estPullcords').textContent = pullcords;
    document.getElementById('estDoorLights').textContent = doorLights;
    document.getElementById('estGateways').textContent = gateways;
    document.getElementById('estDisplays').textContent = displays;

    return { callPoints, pendants, pullcords, doorLights, gateways, displays, wards };
}

// Apply Estimator Calculations to BOM Table
function applyEstimatorToBOM() {
    const est = calculateEstimator();
    const repeaters = Math.ceil(est.gateways * 1.5);

    bomItems = [
        { ...CATALOG_MASTER[0], qty: est.callPoints }, // Call Point
        { ...CATALOG_MASTER[1], qty: est.pendants },   // Pendant
        { ...CATALOG_MASTER[2], qty: est.pendants },   // Pendant Stand
        { ...CATALOG_MASTER[3], qty: est.pullcords },  // Pullcord
        { ...CATALOG_MASTER[4], qty: est.doorLights }, // Door Light V2
        { ...CATALOG_MASTER[5], qty: est.gateways },   // Gateway
        { ...CATALOG_MASTER[6], qty: repeaters },      // Repeater
        { ...CATALOG_MASTER[7], qty: est.displays }    // 32" Display
    ].filter(item => item.qty > 0);

    renderBOMTable();
    recalculateTotals();
}

// Render BOM Table Rows
function renderBOMTable() {
    const tbody = document.getElementById('bomTbody');
    tbody.innerHTML = '';

    bomItems.forEach((item, index) => {
        const row = document.createElement('tr');
        const lineTotal = item.qty * item.unitRate;

        row.innerHTML = `
            <td>
                <div class="item-info">
                    <strong>${escapeHtml(item.name)}</strong>
                    <small>Item Code: ${escapeHtml(item.code)} • ${escapeHtml(item.desc)}</small>
                </div>
            </td>
            <td>
                <input type="number" class="item-qty-input" value="${item.qty}" min="1" onchange="updateItemQty(${index}, this.value)">
            </td>
            <td>
                <input type="number" class="item-rate-input" value="${item.unitRate}" min="0" onchange="updateItemRate(${index}, this.value)">
            </td>
            <td style="text-align: right;">
                <span class="item-amount">${formatINR(lineTotal)}</span>
            </td>
            <td style="text-align: center;">
                <button class="btn-icon-danger" onclick="removeItem(${index})" title="Remove Item">
                    <i data-lucide="trash-2"></i>
                </button>
            </td>
        `;

        tbody.appendChild(row);
    });

    if (window.lucide) {
        lucide.createIcons();
    }
}

// Update Item Quantity
function updateItemQty(index, newQty) {
    const qty = parseInt(newQty) || 0;
    bomItems[index].qty = qty;
    renderBOMTable();
    recalculateTotals();
}

// Update Item Unit Rate
function updateItemRate(index, newRate) {
    const rate = parseFloat(newRate) || 0;
    bomItems[index].unitRate = rate;
    renderBOMTable();
    recalculateTotals();
}

// Remove Item Row
function removeItem(index) {
    bomItems.splice(index, 1);
    renderBOMTable();
    recalculateTotals();
}

// Add Custom Line Item
function addCustomItem() {
    const name = prompt('Enter Item Name:', 'Custom Installation / Cabling');
    if (!name) return;

    const rateStr = prompt('Enter Unit Rate (₹):', '1500');
    const rate = parseFloat(rateStr) || 0;

    const qtyStr = prompt('Enter Quantity:', '1');
    const qty = parseInt(qtyStr) || 1;

    bomItems.push({
        id: 'CUSTOM_' + Date.now(),
        name: name,
        code: 'GEN-CUST-' + Math.floor(1000 + Math.random() * 9000),
        desc: 'Custom item specified for project scope.',
        unitRate: rate,
        qty: qty,
        category: 'custom'
    });

    renderBOMTable();
    recalculateTotals();
}

// Main Financial Recalculation Function
function recalculateTotals() {
    // 1. Hardware Subtotal
    const subtotal = bomItems.reduce((sum, item) => sum + (item.qty * item.unitRate), 0);
    document.getElementById('calcSubtotal').textContent = formatINR(subtotal);

    // 2. Discount Calculation
    const discountType = document.getElementById('discountType').value;
    const discountValInput = parseFloat(document.getElementById('discountValue').value) || 0;
    
    let discountAmount = 0;
    if (discountType === 'percent') {
        discountAmount = (subtotal * discountValInput) / 100;
    } else if (discountType === 'flat') {
        discountAmount = discountValInput;
    }

    const discountRow = document.getElementById('discountRow');
    if (discountAmount > 0) {
        discountRow.style.display = 'flex';
        document.getElementById('calcDiscountAmount').textContent = '-' + formatINR(discountAmount);
    } else {
        discountRow.style.display = 'none';
    }

    // 3. Shipping Charge
    const shipping = parseFloat(document.getElementById('shippingCharge').value) || 0;

    // 4. Taxable Total
    const taxable = Math.max(0, subtotal - discountAmount + shipping);
    document.getElementById('calcTaxable').textContent = formatINR(taxable);

    // 5. GST (18%: 9% CGST + 9% SGST)
    const cgst = taxable * 0.09;
    const sgst = taxable * 0.09;
    const grandTotal = taxable + cgst + sgst;

    document.getElementById('calcCGST').textContent = formatINR(cgst);
    document.getElementById('calcSGST').textContent = formatINR(sgst);
    document.getElementById('calcGrandTotal').textContent = formatINR(grandTotal);
    document.getElementById('stickyGrandTotal').textContent = formatINR(grandTotal);

    // 6. Payment Terms Calculation
    let advPercent = parseFloat(document.getElementById('advancePercent').value) || 50;
    advPercent = Math.min(100, Math.max(0, advPercent));
    const postPercent = 100 - advPercent;
    
    document.getElementById('advancePercent').value = advPercent;
    document.getElementById('postInstallPercent').value = postPercent;

    const advAmount = (grandTotal * advPercent) / 100;
    const postAmount = grandTotal - advAmount;

    // Store in global calculation object for Modal binding
    window.lastCalc = {
        subtotal,
        discountAmount,
        shipping,
        taxable,
        cgst,
        sgst,
        grandTotal,
        advPercent,
        postPercent,
        advAmount,
        postAmount
    };
}

// BDM Preset Configurations Loader
function loadPreset(presetName) {
    if (presetName === 'small') {
        document.getElementById('clientName').value = 'Jacobs Hospital & Clinic';
        document.getElementById('clientLocation').value = 'Kollam, Kerala';
        document.getElementById('contactPerson').value = 'Dr. Jacob Abraham (MD)';
        document.getElementById('bedCount').value = '25';
        document.getElementById('washroomCount').value = '12';
        document.getElementById('wardCount').value = '1';
        document.getElementById('doorLightOption').value = '1';
        document.getElementById('shippingCharge').value = '2500';
        document.getElementById('discountType').value = 'none';
        document.getElementById('discountValue').value = '0';
        document.getElementById('quoteRef').value = 'GEN-QTN-2026-0105';
        calculateEstimator();
        applyEstimatorToBOM();
    } else if (presetName === 'medium') {
        initDefaultQuote();
    } else if (presetName === 'large') {
        document.getElementById('clientName').value = 'Travancore Medicity Super Specialty Hospital';
        document.getElementById('clientLocation').value = 'Kollam, Kerala';
        document.getElementById('contactPerson').value = 'Er. Rajesh V. (Head of BioMed)';
        document.getElementById('bedCount').value = '250';
        document.getElementById('washroomCount').value = '120';
        document.getElementById('wardCount').value = '8';
        document.getElementById('doorLightOption').value = '1';
        document.getElementById('shippingCharge').value = '8500';
        document.getElementById('discountType').value = 'percent';
        document.getElementById('discountValue').value = '5';
        document.getElementById('quoteRef').value = 'GEN-QTN-2026-0920';
        calculateEstimator();
        applyEstimatorToBOM();
    }
}

// Reset Quote Form
function resetQuote() {
    if (confirm('Reset quotation to default sample quote?')) {
        initDefaultQuote();
    }
}

// Bind Printable Modal Data
function bindModalData() {
    updateDateFields();

    const clientName = document.getElementById('clientName').value || 'Client Hospital';
    const clientLocation = document.getElementById('clientLocation').value || 'Location';
    const contactPerson = document.getElementById('contactPerson').value || 'Concerned Authority';
    const quoteRef = document.getElementById('quoteRef').value || 'SAL-QTN-2024-00478';
    const bdmName = document.getElementById('bdmName').value || 'Genxiot Sales Team';

    document.getElementById('docQuoteRef').textContent = quoteRef;
    document.getElementById('docClientName').textContent = clientName;
    document.getElementById('docClientLocation').textContent = clientLocation;
    document.getElementById('docContactPerson').textContent = contactPerson;
    document.getElementById('docBdmName').textContent = bdmName;
    document.getElementById('docSigClient').textContent = clientName;

    // Facility parameters summary
    const beds = document.getElementById('bedCount').value || 0;
    const washrooms = document.getElementById('washroomCount').value || 0;
    const wards = document.getElementById('wardCount').value || 1;
    document.getElementById('docFacilitySummary').textContent = `${beds} Patient Beds • ${washrooms} Washrooms • ${wards} Wards / Nursing Stations`;

    // Render Modal BOQ Table
    const docTbody = document.getElementById('docBomTbody');
    docTbody.innerHTML = '';

    bomItems.forEach((item, index) => {
        const tr = document.createElement('tr');
        const total = item.qty * item.unitRate;
        tr.innerHTML = `
            <td style="text-align: center;">${index + 1}</td>
            <td>
                <strong>${escapeHtml(item.name)}</strong><br>
                <span style="font-size: 7.5pt; color: #64748B;">Item Code: ${escapeHtml(item.code)} • ${escapeHtml(item.desc)}</span>
            </td>
            <td style="text-align: center;">${item.qty} Nos</td>
            <td style="text-align: right;">${formatINR(item.unitRate)}</td>
            <td style="text-align: right;">${formatINR(total)}</td>
        `;
        docTbody.appendChild(tr);
    });

    // Add Shipping Charge line in table if present
    const calc = window.lastCalc || {};
    if (calc.shipping > 0) {
        const trShip = document.createElement('tr');
        trShip.innerHTML = `
            <td style="text-align: center;">${bomItems.length + 1}</td>
            <td><strong>Shipping Charge</strong><br><span style="font-size: 7.5pt; color: #64748B;">Freight & Logistics handling</span></td>
            <td style="text-align: center;">1 Nos</td>
            <td style="text-align: right;">${formatINR(calc.shipping)}</td>
            <td style="text-align: right;">${formatINR(calc.shipping)}</td>
        `;
        docTbody.appendChild(trShip);
    }

    // Bind Financial Totals
    document.getElementById('docSubtotal').textContent = formatINR(calc.subtotal + (calc.shipping || 0));

    const docDiscountRow = document.getElementById('docDiscountRow');
    if (calc.discountAmount > 0) {
        docDiscountRow.style.display = 'table-row';
        document.getElementById('docDiscount').textContent = '-' + formatINR(calc.discountAmount);
    } else {
        docDiscountRow.style.display = 'none';
    }

    document.getElementById('docCGST').textContent = formatINR(calc.cgst || 0);
    document.getElementById('docSGST').textContent = formatINR(calc.sgst || 0);
    document.getElementById('docGrandTotal').textContent = formatINR(calc.grandTotal || 0);

    // Bind Payment Terms Table
    document.getElementById('docAdvPercentCell').textContent = (calc.advPercent || 50) + '%';
    document.getElementById('docAdvAmountCell').textContent = formatINR(calc.advAmount || 0);
    document.getElementById('docPostPercentCell').textContent = (calc.postPercent || 50) + '%';
    document.getElementById('docPostAmountCell').textContent = formatINR(calc.postAmount || 0);
}

// Modal Toggle Functions
function openOfferModal() {
    recalculateTotals();
    bindModalData();
    document.getElementById('offerModal').classList.add('active');
}

function closeOfferModal() {
    document.getElementById('offerModal').classList.remove('active');
}

// Print / Export PDF Function
function printQuotation() {
    recalculateTotals();
    bindModalData();
    document.getElementById('offerModal').classList.add('active');
    setTimeout(() => {
        window.print();
    }, 250);
}

// Helper Utilities
function formatINR(amount) {
    return '₹ ' + (amount || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function escapeHtml(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
