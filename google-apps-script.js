/**
 * ============================================================================
 * GENXIOT LLP — QUOTE CALCULATOR & PIPELINE GOOGLE APPS SCRIPT (v2.5)
 * ============================================================================
 * 
 * COMPREHENSIVE COMPATIBILITY:
 * - Supports ALL old quote formats (including legacy BOM arrays with __SETTINGS__)
 * - Supports ALL new edits (Extended Warranty with payment, Additional Warranty,
 *   HSN codes, floor-by-floor breakdown, GST 18%, revisions V1/V2/V3...)
 * - Flexible column name matching (handles 'Hospital Name' vs 'Client Name',
 *   'Quote ID' vs 'Quote Ref', 'BOM Data' vs 'Payload', etc.)
 * - Automatic sheet upgrade (adds Status, Version, Payload columns if missing)
 * - Safe numeric parsing (handles '₹ 1,50,000.00', '134 Beds', commas, spaces)
 * - Status tracking & auto-retirement of older revisions ('Revised', 'Closed Won')
 * - Supports both POST and GET endpoints for testing and diagnostics
 * 
 * ─── DEPLOYMENT INSTRUCTIONS ────────────────────────────────────────────────
 * 1. Open your Google Sheet linked to the GenXIoT calculator.
 * 2. In Google Sheets, click: Extensions > Apps Script.
 * 3. Replace all existing code in Code.gs with this entire script.
 * 4. Click 'Save' (floppy disk icon).
 * 5. Click 'Deploy' > 'Manage deployments' > Edit (pencil icon) > Version: 'New version' > Click 'Deploy'.
 *    (Make sure 'Who has access' is set to 'Anyone').
 * 6. Copy the Web App URL if deploying fresh, or keep the existing deployment.
 * ============================================================================
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  // Wait up to 10 seconds for concurrent writes
  try {
    lock.waitLock(10000);
  } catch (err) {
    return jsonResponse({ status: 'error', message: 'Could not obtain lock. Server busy.' });
  }

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ status: 'error', message: 'Empty POST body' });
    }

    var data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return jsonResponse({ status: 'error', message: 'Malformed JSON POST body: ' + parseErr.toString() });
    }

    var action = String(data.action || '').trim();
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = getOrCreateQuotesSheet(ss);

    switch (action) {
      case 'getAllQuotes':
      case 'getQuotes':
        return handleGetAllQuotes(sheet);

      case 'saveQuote':
      case 'createQuote':
      case 'save':
        return handleSaveQuote(sheet, data);

      case 'updateStatus':
        return handleUpdateStatus(sheet, data);

      case 'searchQuote':
      case 'loadQuote':
      case 'getQuote':
        return handleSearchQuote(sheet, data.query || data.quoteRef || data.clientName);

      case 'deleteQuote':
      case 'removeQuote':
        return handleDeleteQuote(sheet, data.quoteRef || data.query);

      case 'getNextQuoteId':
        return handleGetNextQuoteId(sheet);

      default:
        return jsonResponse({ status: 'error', message: 'Unknown action: ' + action });
    }

  } catch (err) {
    return jsonResponse({ status: 'error', message: err.toString(), stack: err.stack });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = getOrCreateQuotesSheet(ss);
    var action = (e && e.parameter && e.parameter.action) ? String(e.parameter.action).trim() : '';

    if (action === 'getAllQuotes' || action === 'getQuotes') {
      return handleGetAllQuotes(sheet);
    } else if (action === 'searchQuote' || action === 'loadQuote' || action === 'getQuote') {
      return handleSearchQuote(sheet, e.parameter.query || e.parameter.quoteRef || e.parameter.clientName);
    } else if (action === 'getNextQuoteId') {
      return handleGetNextQuoteId(sheet);
    }

    return jsonResponse({
      status: 'success',
      message: 'GenXIoT Quote API v2.5 is live and active.',
      timestamp: new Date().toISOString(),
      sheetName: sheet.getName(),
      totalQuotes: Math.max(0, sheet.getLastRow() - 1),
      features: [
        'Full backwards compatibility with legacy quotes',
        'Extended Warranty with payment integration',
        'Additional Warranty special concession integration',
        'Status synchronization (Pending, Closed Won, Closed Lost, Revised)',
        'Automatic revision retirement'
      ]
    });
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}

// ─── SHEET INITIALIZATION & COLUMN MAPPING ──────────────────────────────
function getOrCreateQuotesSheet(ss) {
  // 1. Look for sheet named 'Quotes' (preferred)
  var sheet = ss.getSheetByName('Quotes');
  if (sheet) {
    ensureHeaders(sheet);
    return sheet;
  }

  // 2. Look for any existing sheet that already contains quote columns
  var sheets = ss.getSheets();
  for (var s = 0; s < sheets.length; s++) {
    var cur = sheets[s];
    if (cur.getLastRow() > 0) {
      var topRow = cur.getRange(1, 1, 1, Math.min(cur.getLastColumn(), 15)).getValues()[0];
      var joined = topRow.join(' ').toLowerCase();
      if (joined.indexOf('quote') !== -1 || joined.indexOf('client') !== -1 || joined.indexOf('hospital') !== -1) {
        ensureHeaders(cur);
        return cur;
      }
    }
  }

  // 3. Fallback to active sheet or first sheet
  sheet = ss.getActiveSheet() || sheets[0];
  if (!sheet) {
    sheet = ss.insertSheet('Quotes');
  }
  ensureHeaders(sheet);
  return sheet;
}

function ensureHeaders(sheet) {
  var standardHeaders = [
    'Date',
    'Quote Ref',
    'Client Name',
    'Location',
    'Total Amount',
    'Total Beds',
    'Status',
    'Version',
    'Contact Person',
    'Payload'
  ];

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(standardHeaders);
    sheet.getRange(1, 1, 1, standardHeaders.length).setFontWeight('bold').setBackground('#f0f2fa');
    return;
  }

  // Inspect current headers and add missing modern columns seamlessly
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var currentHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var normMap = {};
  for (var i = 0; i < currentHeaders.length; i++) {
    var n = String(currentHeaders[i] || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (n) normMap[n] = i;
  }

  // Ensure Status column exists
  var hasStatus = normMap['status'] !== undefined || normMap['dealstatus'] !== undefined || normMap['stage'] !== undefined;
  if (!hasStatus) {
    var nextCol = sheet.getLastColumn() + 1;
    sheet.getRange(1, nextCol).setValue('Status').setFontWeight('bold').setBackground('#f0f2fa');
  }

  // Ensure Version column exists
  var hasVersion = normMap['version'] !== undefined || normMap['quoteversion'] !== undefined || normMap['ver'] !== undefined || normMap['rev'] !== undefined;
  if (!hasVersion) {
    var nextCol = sheet.getLastColumn() + 1;
    sheet.getRange(1, nextCol).setValue('Version').setFontWeight('bold').setBackground('#f0f2fa');
  }

  // Ensure Payload column exists
  var hasPayload = normMap['payload'] !== undefined || normMap['bomdata'] !== undefined || normMap['bom'] !== undefined || normMap['data'] !== undefined;
  if (!hasPayload) {
    var nextCol = sheet.getLastColumn() + 1;
    sheet.getRange(1, nextCol).setValue('Payload').setFontWeight('bold').setBackground('#f0f2fa');
  }
}

/**
 * Robust column map resolver supporting old and new header variations
 */
function getHeaderColumnMap(sheet) {
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var rawMap = {};
  var normMap = {};

  for (var i = 0; i < headers.length; i++) {
    var raw = String(headers[i] || '').trim().toLowerCase();
    var norm = raw.replace(/[^a-z0-9]/g, '');
    if (raw && rawMap[raw] === undefined) rawMap[raw] = i;
    if (norm && normMap[norm] === undefined) normMap[norm] = i;
  }

  function findCol(aliases) {
    for (var a = 0; a < aliases.length; a++) {
      var alias = aliases[a];
      var normAlias = alias.replace(/[^a-z0-9]/g, '');
      if (rawMap[alias] !== undefined) return rawMap[alias];
      if (normMap[normAlias] !== undefined) return normMap[normAlias];
    }
    return undefined;
  }

  return {
    'date': findCol(['date', 'timestamp', 'date & time', 'datetime', 'time', 'created at']),
    'quote ref': findCol(['quote ref', 'quotation ref', 'quote id', 'quote no', 'quotation no', 'ref', 'reference', 'quote']),
    'client name': findCol(['client name', 'hospital name', 'client', 'hospital', 'customer name', 'customer', 'name']),
    'location': findCol(['location', 'client location', 'city', 'address', 'place', 'state']),
    'total amount': findCol(['total amount', 'amount', 'grand total', 'total value', 'deal value', 'deal amount', 'total', 'value']),
    'total beds': findCol(['total beds', 'beds', 'bed count', 'bed']),
    'status': findCol(['status', 'deal status', 'quote status', 'stage']),
    'version': findCol(['version', 'quote version', 'revision', 'rev', 'ver']),
    'contact person': findCol(['contact person', 'contact', 'person', 'attn']),
    'payload': findCol(['payload', 'json payload', 'bom data', 'bom', 'data', 'settings', 'json']),
    _rawMap: rawMap,
    _headers: headers
  };
}

/**
 * Safely finds and validates a JSON payload from a spreadsheet row.
 * Checks designated column first; if missing or invalid, scans other row cells.
 */
function findPayloadInRow(row, cPayload) {
  if (cPayload !== undefined && row[cPayload]) {
    var s = String(row[cPayload]).trim();
    if ((s.charAt(0) === '{' && s.charAt(s.length - 1) === '}') ||
        (s.charAt(0) === '[' && s.charAt(s.length - 1) === ']')) {
      try {
        var p = JSON.parse(s);
        if (p && (typeof p === 'object' || Array.isArray(p))) return s;
      } catch (e) {}
    }
  }

  // Scan row cells from right to left (JSON payloads are usually at the end)
  for (var c = row.length - 1; c >= 0; c--) {
    if (c === cPayload) continue;
    var val = row[c];
    if (val && typeof val === 'string') {
      var str = val.trim();
      if ((str.charAt(0) === '{' && str.charAt(str.length - 1) === '}') ||
          (str.charAt(0) === '[' && str.charAt(str.length - 1) === ']')) {
        try {
          var parsed = JSON.parse(str);
          if (parsed && (typeof parsed === 'object' || Array.isArray(parsed))) return str;
        } catch (e) {}
      }
    }
  }

  return '';
}

// ─── ACTION HANDLERS ───────────────────────────────────────────────────

/**
 * Returns all quotes with Status and Version for the confusionless dashboard.
 * Correctly parses legacy amounts with currency symbols and extracts versions.
 */
function handleGetAllQuotes(sheet) {
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return jsonResponse({ status: 'success', data: [] });
  }

  var colMap = getHeaderColumnMap(sheet);
  var cDate     = colMap['date'] !== undefined ? colMap['date'] : 0;
  var cRef      = colMap['quote ref'] !== undefined ? colMap['quote ref'] : 1;
  var cClient   = colMap['client name'] !== undefined ? colMap['client name'] : 2;
  var cLocation = colMap['location'];
  var cAmount   = colMap['total amount'];
  var cBeds     = colMap['total beds'];
  var cStatus   = colMap['status'];
  var cVersion  = colMap['version'];
  var cContact  = colMap['contact person'];
  var cPayload  = colMap['payload'];

  var quotes = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var ref = String(row[cRef] || '').trim();
    if (!ref) continue;

    // Extract status: sheet column > payload JSON > default 'Pending'
    var status = (cStatus !== undefined && row[cStatus]) ? String(row[cStatus]).trim() : '';

    // Extract version: sheet column > ref suffix (e.g. V2) > payload JSON > default '1'
    var version = (cVersion !== undefined && row[cVersion]) ? String(row[cVersion]).trim() : '';
    if (!version) {
      var vMatch = ref.match(/V(\d+)$/i);
      version = vMatch ? vMatch[1] : '';
    }

    // Clean amount (handles '₹ 18,290.00', '1,50,000', raw numbers)
    var rawAmt = (cAmount !== undefined && row[cAmount] !== undefined) ? String(row[cAmount]) : '';
    var totalAmount = parseFloat(rawAmt.replace(/[^0-9.]/g, '')) || 0;

    // Clean beds (handles '134 Beds', numbers)
    var rawBeds = (cBeds !== undefined && row[cBeds] !== undefined) ? String(row[cBeds]) : '';
    var totalBeds = parseInt(rawBeds.replace(/[^0-9]/g, ''), 10) || 0;

    // Clean date
    var rawDate = row[cDate];
    var dateFormatted = '';
    if (rawDate instanceof Date) {
      dateFormatted = Utilities.formatDate(rawDate, Session.getScriptTimeZone() || 'Asia/Kolkata', "yyyy-MM-dd'T'HH:mm:ss'Z'");
    } else {
      dateFormatted = String(rawDate || '');
    }

    // Fallback: If amount, beds, status, or version was missing in sheet columns, recover from JSON payload
    if (totalAmount === 0 || totalBeds === 0 || !status || !version) {
      var rowPayload = findPayloadInRow(row, cPayload);
      if (rowPayload) {
        try {
          var p = JSON.parse(rowPayload);
          if (!Array.isArray(p)) {
            if (totalAmount === 0 && p.totalAmount) totalAmount = parseFloat(String(p.totalAmount).replace(/[^0-9.]/g, '')) || 0;
            if (totalBeds === 0 && p.totalBeds) totalBeds = parseInt(String(p.totalBeds).replace(/[^0-9]/g, ''), 10) || 0;
            if (!status && p.status) status = String(p.status).trim();
            if (!version && p.quoteVersion) version = String(p.quoteVersion).trim();
          }
        } catch (err) {}
      }
    }

    if (!status) status = 'Pending';
    if (!version) version = '1';

    quotes.push({
      date: dateFormatted,
      quoteRef: ref,
      clientName: (cClient !== undefined && row[cClient]) ? String(row[cClient]).trim() : '',
      location: (cLocation !== undefined && row[cLocation]) ? String(row[cLocation]).trim() : '',
      totalAmount: totalAmount,
      totalBeds: totalBeds,
      status: status,
      quoteVersion: version,
      contactPerson: (cContact !== undefined && row[cContact]) ? String(row[cContact]).trim() : ''
    });
  }

  return jsonResponse({ status: 'success', data: quotes });
}

/**
 * Saves a new quote or updates an existing quote.
 * Automatically marks previous versions of the same client/deal as 'Revised'.
 * Preserves custom columns in existing rows.
 */
function handleSaveQuote(sheet, data) {
  var quoteRef = String(data.quoteRef || '').trim();
  if (!quoteRef) {
    return jsonResponse({ status: 'error', message: 'quoteRef is required' });
  }

  var colMap = getHeaderColumnMap(sheet);
  var rows = sheet.getDataRange().getValues();
  var cRef = colMap['quote ref'] !== undefined ? colMap['quote ref'] : 1;
  var cClient = colMap['client name'] !== undefined ? colMap['client name'] : 2;
  var cStatus = colMap['status'];
  var cVersion = colMap['version'];
  var cPayload = colMap['payload'] !== undefined ? colMap['payload'] : (sheet.getLastColumn() - 1);

  var clientName = String(data.clientName || '').trim();
  var status = String(data.status || 'Pending').trim();
  var version = String(data.quoteVersion || '1').trim();
  var dateStr = data.date || new Date().toISOString();

  // Find if exact quoteRef already exists
  var existingRowIndex = -1;
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][cRef] || '').trim().toLowerCase() === quoteRef.toLowerCase()) {
      existingRowIndex = i + 1; // 1-based row index in sheet
      break;
    }
  }

  // If revision and withdraw requested, mark previous versions as 'Revised'
  var currentVersionNum = parseInt(version, 10) || 1;
  var withdrawPrevious = data.withdrawPrevious !== false && data.withdrawPrevious !== 'false';
  if (withdrawPrevious && currentVersionNum > 1 && clientName) {
    var normClient = clientName.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (var r = 1; r < rows.length; r++) {
      var rowClient = String(rows[r][cClient] || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      var rowRef = String(rows[r][cRef] || '').trim();

      if (rowClient === normClient && rowRef.toLowerCase() !== quoteRef.toLowerCase()) {
        // Only mark Revised if not already Closed Won or Closed Lost
        var currentSt = cStatus !== undefined ? String(rows[r][cStatus] || '').trim() : '';
        if (currentSt !== 'Closed Won' && currentSt !== 'Closed Lost') {
          if (cStatus !== undefined) {
            sheet.getRange(r + 1, cStatus + 1).setValue('Revised');
          }
          try {
            var rawJson = rows[r][cPayload];
            if (rawJson) {
              var parsed = JSON.parse(rawJson);
              if (!Array.isArray(parsed)) {
                parsed.status = 'Revised';
                sheet.getRange(r + 1, cPayload + 1).setValue(JSON.stringify(parsed));
              }
            }
          } catch (e) {}
        }
      }
    }
  }

  // Prepare full JSON payload
  var payloadObj = Object.assign({}, data, {
    date: dateStr,
    status: status,
    quoteVersion: version
  });
  var payloadJson = JSON.stringify(payloadObj);

  // Prepare row values according to sheet columns, preserving any extra columns in existing rows
  var lastCol = sheet.getLastColumn();
  var rowValues;
  if (existingRowIndex > 0) {
    rowValues = rows[existingRowIndex - 1].slice();
    while (rowValues.length < lastCol) rowValues.push('');
  } else {
    rowValues = new Array(lastCol).fill('');
  }

  // Map known fields
  if (colMap['date'] !== undefined) rowValues[colMap['date']] = dateStr;
  if (colMap['quote ref'] !== undefined) rowValues[colMap['quote ref']] = quoteRef;
  if (colMap['client name'] !== undefined) rowValues[colMap['client name']] = clientName;
  if (colMap['location'] !== undefined) rowValues[colMap['location']] = data.location || '';
  if (colMap['total amount'] !== undefined) rowValues[colMap['total amount']] = parseFloat(data.totalAmount) || 0;
  if (colMap['total beds'] !== undefined) rowValues[colMap['total beds']] = parseInt(data.totalBeds, 10) || 0;
  if (colMap['status'] !== undefined) rowValues[colMap['status']] = status;
  if (colMap['version'] !== undefined) rowValues[colMap['version']] = version;
  if (colMap['contact person'] !== undefined) rowValues[colMap['contact person']] = data.contactPerson || '';

  // Store JSON payload in the Payload column
  rowValues[cPayload] = payloadJson;

  if (existingRowIndex > 0) {
    sheet.getRange(existingRowIndex, 1, 1, rowValues.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }

  return jsonResponse({
    status: 'success',
    message: 'Quote saved successfully',
    quoteRef: quoteRef,
    statusVal: status,
    version: version
  });
}

/**
 * Fast lightweight endpoint to update quote status directly from Dashboard
 */
function handleUpdateStatus(sheet, data) {
  var quoteRef = String(data.quoteRef || '').trim();
  var newStatus = String(data.status || '').trim();

  if (!quoteRef || !newStatus) {
    return jsonResponse({ status: 'error', message: 'quoteRef and status are required' });
  }

  var colMap = getHeaderColumnMap(sheet);
  var rows = sheet.getDataRange().getValues();
  var cRef = colMap['quote ref'] !== undefined ? colMap['quote ref'] : 1;
  var cStatus = colMap['status'];
  var cPayload = colMap['payload'] !== undefined ? colMap['payload'] : (sheet.getLastColumn() - 1);
  var cClient = colMap['client name'] !== undefined ? colMap['client name'] : 2;

  if (cStatus === undefined) {
    var newCol = sheet.getLastColumn() + 1;
    sheet.getRange(1, newCol).setValue('Status').setFontWeight('bold');
    cStatus = newCol - 1;
  }

  var found = false;
  var targetClient = '';

  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][cRef] || '').trim().toLowerCase() === quoteRef.toLowerCase()) {
      var rowNum = i + 1;
      sheet.getRange(rowNum, cStatus + 1).setValue(newStatus);
      targetClient = String(rows[i][cClient] || '').trim();

      // Also update inside JSON payload if payload column exists
      try {
        var rawJson = findPayloadInRow(rows[i], cPayload);
        if (rawJson) {
          var parsed = JSON.parse(rawJson);
          if (!Array.isArray(parsed)) {
            parsed.status = newStatus;
            sheet.getRange(rowNum, cPayload + 1).setValue(JSON.stringify(parsed));
          }
        }
      } catch (e) {}

      found = true;
      break;
    }
  }

  // If marked as Closed Won and user wants other versions retired:
  if (found && newStatus === 'Closed Won' && data.retireOtherVersions && targetClient) {
    var normClient = targetClient.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (var r = 1; r < rows.length; r++) {
      var rClient = String(rows[r][cClient] || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      var rRef = String(rows[r][cRef] || '').trim();
      if (rClient === normClient && rRef.toLowerCase() !== quoteRef.toLowerCase()) {
        var currSt = cStatus !== undefined ? String(rows[r][cStatus] || '').trim() : '';
        if (currSt !== 'Closed Won' && currSt !== 'Closed Lost') {
          if (cStatus !== undefined) {
            sheet.getRange(r + 1, cStatus + 1).setValue('Revised');
          }
          try {
            var rJson = findPayloadInRow(rows[r], cPayload);
            if (rJson) {
              var p = JSON.parse(rJson);
              if (!Array.isArray(p)) {
                p.status = 'Revised';
                sheet.getRange(r + 1, cPayload + 1).setValue(JSON.stringify(p));
              }
            }
          } catch (e) {}
        }
      }
    }
  }

  if (found) {
    return jsonResponse({ status: 'success', quoteRef: quoteRef, status: newStatus });
  } else {
    return jsonResponse({ status: 'error', message: 'Quote ref not found: ' + quoteRef });
  }
}

/**
 * Searches quote by reference or client name.
 * Robustly checks designated payload column as well as entire row for JSON strings.
 */
function handleSearchQuote(sheet, query) {
  if (!query) {
    return jsonResponse({ status: 'error', message: 'query parameter is required' });
  }
  query = String(query).trim().toLowerCase();
  var normQuery = query.replace(/[^a-z0-9]/g, '');

  var colMap = getHeaderColumnMap(sheet);
  var rows = sheet.getDataRange().getValues();
  var cRef = colMap['quote ref'] !== undefined ? colMap['quote ref'] : 1;
  var cClient = colMap['client name'] !== undefined ? colMap['client name'] : 2;
  var cPayload = colMap['payload'] !== undefined ? colMap['payload'] : (sheet.getLastColumn() - 1);

  // 1. Try exact ref match first
  for (var i = 1; i < rows.length; i++) {
    var ref = String(rows[i][cRef] || '').trim().toLowerCase();
    if (ref === query) {
      var pStr = findPayloadInRow(rows[i], cPayload);
      return parsePayloadResponse(pStr, rows[i], colMap);
    }
  }

  // 2. Try partial ref match (e.g. searching '261026-01' or 'ALA-261026')
  for (var i = 1; i < rows.length; i++) {
    var ref = String(rows[i][cRef] || '').trim().toLowerCase();
    if (ref && ref.indexOf(query) !== -1) {
      var pStr = findPayloadInRow(rows[i], cPayload);
      return parsePayloadResponse(pStr, rows[i], colMap);
    }
  }

  // 3. Try exact / partial client name match
  for (var j = 1; j < rows.length; j++) {
    var client = String(rows[j][cClient] || '').trim().toLowerCase();
    var normClient = client.replace(/[^a-z0-9]/g, '');
    if (normClient && (normClient === normQuery || normClient.indexOf(normQuery) !== -1)) {
      var pStr = findPayloadInRow(rows[j], cPayload);
      return parsePayloadResponse(pStr, rows[j], colMap);
    }
  }

  // 4. Try inside JSON payload (handles shifted columns or old imports)
  for (var k = 1; k < rows.length; k++) {
    var rawJson = findPayloadInRow(rows[k], cPayload);
    if (rawJson) {
      var lowJson = rawJson.toLowerCase();
      if (lowJson.indexOf(query) !== -1) {
        return parsePayloadResponse(rawJson, rows[k], colMap);
      }
    }
  }

  return jsonResponse({ status: 'error', message: 'No quote found matching: ' + query });
}

/**
 * Bridges old array-based BOM payloads, modern object payloads, and fallback rows.
 * Automatically synthesizes floors and bomData if legacy quotes lack them, ensuring
 * that opened quotes never load with zero quantities.
 */
function parsePayloadResponse(payloadStr, row, colMap) {
  var cRef = colMap['quote ref'] !== undefined ? colMap['quote ref'] : 1;
  var cClient = colMap['client name'] !== undefined ? colMap['client name'] : 2;
  var cLocation = colMap['location'];
  var cAmount = colMap['total amount'];
  var cBeds = colMap['total beds'];
  var cStatus = colMap['status'];
  var cVersion = colMap['version'];
  var cContact = colMap['contact person'];
  var cDate = colMap['date'] !== undefined ? colMap['date'] : 0;

  var ref = String(row[cRef] || '').trim();
  var client = (cClient !== undefined && row[cClient]) ? String(row[cClient]).trim() : '';
  var loc = (cLocation !== undefined && row[cLocation]) ? String(row[cLocation]).trim() : '';
  var rawAmt = (cAmount !== undefined && row[cAmount] !== undefined) ? String(row[cAmount]) : '';
  var amt = parseFloat(rawAmt.replace(/[^0-9.]/g, '')) || 0;
  var rawBeds = (cBeds !== undefined && row[cBeds] !== undefined) ? String(row[cBeds]) : '';
  var beds = parseInt(rawBeds.replace(/[^0-9]/g, ''), 10) || 0;
  var rowStatus = (cStatus !== undefined && row[cStatus]) ? String(row[cStatus]).trim() : '';
  var rowVersion = (cVersion !== undefined && row[cVersion]) ? String(row[cVersion]).trim() : '';
  var contact = (cContact !== undefined && row[cContact]) ? String(row[cContact]).trim() : '';
  var dateVal = row[cDate];
  var dateStr = (dateVal instanceof Date)
    ? Utilities.formatDate(dateVal, Session.getScriptTimeZone() || 'Asia/Kolkata', "yyyy-MM-dd'T'HH:mm:ss'Z'")
    : String(dateVal || '');

  if (payloadStr) {
    try {
      var dataObj = JSON.parse(payloadStr);

      // Handle LEGACY FORMAT: payload was stored as a raw BOM Array
      if (Array.isArray(dataObj)) {
        var bomArray = dataObj;
        var embeddedSettings = {};
        if (bomArray.length > 0 && bomArray[0].code === '__SETTINGS__') {
          try {
            embeddedSettings = JSON.parse(bomArray[0].desc || '{}');
          } catch (e) {}
        }
        dataObj = Object.assign({
          quoteRef: ref,
          clientName: client,
          location: loc,
          totalAmount: amt,
          totalBeds: beds,
          contactPerson: contact,
          date: dateStr,
          status: rowStatus || 'Pending',
          quoteVersion: rowVersion || '1',
          bomData: bomArray
        }, embeddedSettings);
      } else if (typeof dataObj === 'object' && dataObj !== null) {
        // Modern format: object with all settings & bomData
        // Synchronize top-level sheet row values if modified externally
        if (rowStatus) dataObj.status = rowStatus;
        if (rowVersion) dataObj.quoteVersion = rowVersion;
        if (!dataObj.quoteRef) dataObj.quoteRef = ref;
        if (!dataObj.clientName) dataObj.clientName = client;
        if (!dataObj.location && loc) dataObj.location = loc;
        if (!dataObj.contactPerson && contact) dataObj.contactPerson = contact;
        if (!dataObj.totalAmount && amt) dataObj.totalAmount = amt;
        if (!dataObj.totalBeds && beds) dataObj.totalBeds = beds;
      }

      // Ensure floors and bomData exist and are populated if beds exist
      var bCount = dataObj.totalBeds || beds || 0;
      if (bCount > 0) {
        if (!dataObj.floors || !Array.isArray(dataObj.floors) || dataObj.floors.length === 0 || !dataObj.floors.some(function(f) { return (parseInt(f.beds, 10) || 0) > 0; })) {
          dataObj.floors = [{
            name: 'Floor 1',
            beds: bCount,
            rooms: Math.ceil(bCount * 0.5),
            baths: Math.ceil(bCount * 0.5),
            ns: Math.max(1, Math.ceil(bCount / 30))
          }];
        }
        if (!dataObj.bomData || !Array.isArray(dataObj.bomData) || dataObj.bomData.length === 0) {
          var rCount = Math.ceil(bCount * 0.5);
          var wCount = Math.ceil(bCount * 0.5);
          var nCount = Math.max(1, Math.ceil(bCount / 30));
          dataObj.bomData = [
            { code: 'ALAMO-CP-R', qty: bCount, rate: 2400, isLocked: true },
            { code: 'ALAMO-PD-S', qty: bCount, rate: 600, isLocked: true },
            { code: 'ALAMO-DL', qty: rCount, rate: 2600, isLocked: true },
            { code: 'ALAMO-CP-B', qty: wCount, rate: 2400, isLocked: true },
            { code: 'ALAMO-PL', qty: wCount, rate: 600, isLocked: true },
            { code: 'ALAMO-MINI', qty: nCount, rate: 12000, isLocked: true },
            { code: 'ALAMO-GW', qty: Math.max(1, nCount), rate: 12000, isLocked: true },
            { code: 'ALAMO-RPT', qty: Math.ceil(rCount / 10) + 1, rate: 4000, isLocked: true }
          ];
        }
      }

      return jsonResponse({ status: 'success', data: dataObj });
    } catch (e) {}
  }

  // Fallback: If no JSON exists or parse failed, synthesize a complete quote object
  var fallbackBeds = beds || 0;
  var fallbackRooms = fallbackBeds > 0 ? Math.ceil(fallbackBeds * 0.5) : 0;
  var fallbackBaths = fallbackBeds > 0 ? Math.ceil(fallbackBeds * 0.5) : 0;
  var fallbackNs = fallbackBeds > 0 ? Math.max(1, Math.ceil(fallbackBeds / 30)) : 0;

  var fallbackObj = {
    quoteRef: ref,
    clientName: client,
    location: loc,
    totalAmount: amt,
    totalBeds: fallbackBeds,
    status: rowStatus || 'Pending',
    quoteVersion: rowVersion || (ref.match(/V(\d+)$/i) ? ref.match(/V(\d+)$/i)[1] : '1'),
    contactPerson: contact,
    date: dateStr,
    discType: 'none',
    discVal: '0',
    shipping: '3500',
    advPct: '50',
    delivery: '25 days from order confirmation & advance receipt',
    warranty: '12 months comprehensive from date of Installation Protocol signoff',
    addWarrantyDuration: 'none',
    addWarrantyCustomDuration: '',
    addWarrantyCost: '0',
    extWarrantyOpt: 'none',
    extWarrantyDuration: '1 Year (12 Months)',
    extWarrantyCustomDuration: '',
    extWarrantyPct: '10',
    extWarrantyTerms: 'Comprehensive replacement or repair of defective units or parts for the specified duration (consumables/wear parts like pull cords and batteries excluded).',
    scopeNotes: 'Wall mounting and electrical work by the hospital. Configuration, calibration & go-live training by GenXIoT.',
    floors: fallbackBeds > 0 ? [{
      name: 'Floor 1',
      beds: fallbackBeds,
      rooms: fallbackRooms,
      baths: fallbackBaths,
      ns: fallbackNs
    }] : [{
      name: 'Floor 1',
      beds: 0,
      rooms: 0,
      baths: 0,
      ns: 0
    }],
    bomData: fallbackBeds > 0 ? [
      { code: 'ALAMO-CP-R', qty: fallbackBeds, rate: 2400, isLocked: true },
      { code: 'ALAMO-PD-S', qty: fallbackBeds, rate: 600, isLocked: true },
      { code: 'ALAMO-DL', qty: fallbackRooms, rate: 2600, isLocked: true },
      { code: 'ALAMO-CP-B', qty: fallbackBaths, rate: 2400, isLocked: true },
      { code: 'ALAMO-PL', qty: fallbackBaths, rate: 600, isLocked: true },
      { code: 'ALAMO-MINI', qty: fallbackNs, rate: 12000, isLocked: true },
      { code: 'ALAMO-GW', qty: Math.max(1, fallbackNs), rate: 12000, isLocked: true },
      { code: 'ALAMO-RPT', qty: Math.ceil(fallbackRooms / 10) + 1, rate: 4000, isLocked: true }
    ] : []
  };

  return jsonResponse({ status: 'success', data: fallbackObj });
}

/**
 * Deletes quote by quoteRef
 */
function handleDeleteQuote(sheet, quoteRef) {
  if (!quoteRef) return jsonResponse({ status: 'error', message: 'quoteRef required' });
  quoteRef = String(quoteRef).trim().toLowerCase();

  var colMap = getHeaderColumnMap(sheet);
  var rows = sheet.getDataRange().getValues();
  var cRef = colMap['quote ref'] !== undefined ? colMap['quote ref'] : 1;

  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][cRef] || '').trim().toLowerCase() === quoteRef) {
      sheet.deleteRow(i + 1);
      return jsonResponse({ status: 'success', message: 'Quote deleted successfully', quoteRef: quoteRef });
    }
  }

  return jsonResponse({ status: 'error', message: 'Quote not found: ' + quoteRef });
}

/**
 * Generates next sequential quote ID for today: GEN-ALA-YYMMDD-XX-V1
 */
function handleGetNextQuoteId(sheet) {
  var d = new Date();
  var yy = String(d.getFullYear()).slice(-2);
  var mm = String(d.getMonth() + 1).padStart(2, '0');
  var dd = String(d.getDate()).padStart(2, '0');
  var datePrefix = 'GEN-ALA-' + yy + mm + dd + '-';

  var colMap = getHeaderColumnMap(sheet);
  var cRef = colMap['quote ref'] !== undefined ? colMap['quote ref'] : 1;
  var rows = sheet.getDataRange().getValues();

  var maxSeq = 0;
  for (var i = 1; i < rows.length; i++) {
    var ref = String(rows[i][cRef] || '').trim().toUpperCase();
    if (ref.indexOf(datePrefix) === 0) {
      // Format: GEN-ALA-YYMMDD-SS-V...
      var rest = ref.substring(datePrefix.length);
      var parts = rest.split('-');
      var num = parseInt(parts[0], 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  }

  var nextSeq = String(maxSeq + 1).padStart(2, '0');
  var ref = datePrefix + nextSeq + '-V1';

  return jsonResponse({ status: 'success', quoteRef: ref });
}

// ─── HELPER ────────────────────────────────────────────────────────────
function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
