/**
 * ============================================================================
 * GENXIOT LLP — QUOTE CALCULATOR & PIPELINE GOOGLE APPS SCRIPT (v2.0)
 * ============================================================================
 * 
 * Supports:
 * - Status tracking: 'Pending', 'Closed Won', 'Closed Lost', 'Revised'
 * - Version management: V1, V2, V3... with automatic superseding of older revisions
 * - Confusionless pipeline reporting for dashboard & CRM
 * - Backward compatibility with all existing quote rows
 * 
 * INSTRUCTIONS FOR DEPLOYMENT:
 * 1. Open your Google Sheet linked to the calculator.
 * 2. In Google Sheets, click: Extensions > Apps Script.
 * 3. Replace all existing code in Code.gs with this entire script.
 * 4. Click 'Save' (disk icon).
 * 5. Click 'Deploy' > 'Manage deployments' > Edit (pencil icon) > 'New version' > Click 'Deploy'.
 *    (Make sure 'Who has access' is set to 'Anyone').
 * 6. You are done! The URL remains the same (or copy new URL if creating a fresh deployment).
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

    var data = JSON.parse(e.postData.contents);
    var action = data.action;

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = getOrCreateQuotesSheet(ss);

    switch (action) {
      case 'getAllQuotes':
        return handleGetAllQuotes(sheet);

      case 'saveQuote':
        return handleSaveQuote(sheet, data);

      case 'updateStatus':
        return handleUpdateStatus(sheet, data);

      case 'searchQuote':
        return handleSearchQuote(sheet, data.query);

      case 'deleteQuote':
        return handleDeleteQuote(sheet, data.quoteRef);

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
  return jsonResponse({ status: 'success', message: 'GenXIoT Quote API v2.0 is live.' });
}

// ─── SHEET INITIALIZATION & COLUMN MAPPING ──────────────────────────────
function getOrCreateQuotesSheet(ss) {
  var sheet = ss.getSheetByName('Quotes');
  if (!sheet) {
    sheet = ss.getActiveSheet();
    if (!sheet) {
      sheet = ss.insertSheet('Quotes');
    }
  }

  // Ensure header row exists and contains modern columns
  var headers = [
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
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#f0f2fa');
  } else {
    // Check if Status or Version headers exist, add them if missing
    var currentHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    var currentHeaderMap = {};
    for (var i = 0; i < currentHeaders.length; i++) {
      currentHeaderMap[String(currentHeaders[i]).trim().toLowerCase()] = i + 1;
    }

    if (!currentHeaderMap['status']) {
      var nextCol = sheet.getLastColumn() + 1;
      sheet.getRange(1, nextCol).setValue('Status').setFontWeight('bold');
    }
    if (!currentHeaderMap['version']) {
      var nextCol = sheet.getLastColumn() + 1;
      sheet.getRange(1, nextCol).setValue('Version').setFontWeight('bold');
    }
  }

  return sheet;
}

function getHeaderColumnMap(sheet) {
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var map = {};
  for (var i = 0; i < headers.length; i++) {
    var key = String(headers[i]).trim().toLowerCase();
    if (key) map[key] = i; // 0-indexed
  }
  return map;
}

// ─── ACTION HANDLERS ───────────────────────────────────────────────────

/**
 * Returns all quotes with Status and Version for the confusionless dashboard
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
  var cLocation = colMap['location'] !== undefined ? colMap['location'] : 3;
  var cAmount   = colMap['total amount'] !== undefined ? colMap['total amount'] : 4;
  var cBeds     = colMap['total beds'] !== undefined ? colMap['total beds'] : 5;
  var cStatus   = colMap['status'];
  var cVersion  = colMap['version'];
  var cContact  = colMap['contact person'];

  var quotes = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var ref = String(row[cRef] || '').trim();
    if (!ref) continue;

    var status = (cStatus !== undefined && row[cStatus]) ? String(row[cStatus]).trim() : '';
    var version = (cVersion !== undefined && row[cVersion]) ? String(row[cVersion]).trim() : '';

    // If version is missing from column, extract from quoteRef suffix (e.g. ...V2)
    if (!version) {
      var vMatch = ref.match(/V(\d+)$/i);
      version = vMatch ? vMatch[1] : '1';
    }

    quotes.push({
      date: row[cDate],
      quoteRef: ref,
      clientName: row[cClient] || '',
      location: row[cLocation] || '',
      totalAmount: parseFloat(row[cAmount]) || 0,
      totalBeds: parseInt(row[cBeds], 10) || 0,
      status: status || 'Pending',
      quoteVersion: version,
      contactPerson: (cContact !== undefined && row[cContact]) ? String(row[cContact]) : ''
    });
  }

  return jsonResponse({ status: 'success', data: quotes });
}

/**
 * Saves a new quote or updates an existing quote.
 * Automatically marks previous versions of the same client/deal as 'Revised'.
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

  var clientName = String(data.clientName || '').trim();
  var status = String(data.status || 'Pending').trim();
  var version = String(data.quoteVersion || '1').trim();
  var dateStr = data.date || new Date().toISOString();

  // Find if exact quoteRef already exists
  var existingRowIndex = -1;
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][cRef]).trim().toLowerCase() === quoteRef.toLowerCase()) {
      existingRowIndex = i + 1; // 1-based row index in sheet
      break;
    }
  }

  // If this is a revision (version > 1 or contains V2+), mark previous versions as 'Revised'
  var currentVersionNum = parseInt(version, 10) || 1;
  if (currentVersionNum > 1 && clientName) {
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

  // Prepare row values according to sheet columns
  var lastCol = Math.max(sheet.getLastColumn(), 10);
  var rowValues = new Array(lastCol).fill('');

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

  // Store JSON payload in the Payload column or last column
  var cPayload = colMap['payload'] !== undefined ? colMap['payload'] : (lastCol - 1);
  rowValues[cPayload] = payloadJson;

  if (existingRowIndex > 0) {
    // Update existing row
    sheet.getRange(existingRowIndex, 1, 1, rowValues.length).setValues([rowValues]);
  } else {
    // Append new row
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

  if (cStatus === undefined) {
    // Auto-create Status column
    var newCol = sheet.getLastColumn() + 1;
    sheet.getRange(1, newCol).setValue('Status').setFontWeight('bold');
    cStatus = newCol - 1;
  }

  var found = false;
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][cRef]).trim().toLowerCase() === quoteRef.toLowerCase()) {
      var rowNum = i + 1;
      sheet.getRange(rowNum, cStatus + 1).setValue(newStatus);

      // Also update inside JSON payload if payload column exists
      try {
        var rawJson = rows[i][cPayload];
        if (rawJson) {
          var parsed = JSON.parse(rawJson);
          parsed.status = newStatus;
          sheet.getRange(rowNum, cPayload + 1).setValue(JSON.stringify(parsed));
        }
      } catch (e) {}

      found = true;
      break;
    }
  }

  if (found) {
    return jsonResponse({ status: 'success', quoteRef: quoteRef, status: newStatus });
  } else {
    return jsonResponse({ status: 'error', message: 'Quote ref not found: ' + quoteRef });
  }
}

/**
 * Searches quote by reference or client name and returns full BOM / settings data
 */
function handleSearchQuote(sheet, query) {
  if (!query) {
    return jsonResponse({ status: 'error', message: 'query parameter is required' });
  }
  query = String(query).trim().toLowerCase();

  var colMap = getHeaderColumnMap(sheet);
  var rows = sheet.getDataRange().getValues();
  var cRef = colMap['quote ref'] !== undefined ? colMap['quote ref'] : 1;
  var cClient = colMap['client name'] !== undefined ? colMap['client name'] : 2;
  var cPayload = colMap['payload'] !== undefined ? colMap['payload'] : (sheet.getLastColumn() - 1);

  // Try exact ref match first
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][cRef]).trim().toLowerCase() === query) {
      return parsePayloadResponse(rows[i][cPayload], rows[i], colMap);
    }
  }

  // Try client name match
  for (var j = 1; j < rows.length; j++) {
    if (String(rows[j][cClient]).trim().toLowerCase().indexOf(query) !== -1) {
      return parsePayloadResponse(rows[j][cPayload], rows[j], colMap);
    }
  }

  return jsonResponse({ status: 'error', message: 'No quote found matching: ' + query });
}

function parsePayloadResponse(payloadStr, row, colMap) {
  if (payloadStr) {
    try {
      var dataObj = JSON.parse(payloadStr);
      // Ensure top-level status is attached
      if (colMap['status'] !== undefined && row[colMap['status']]) {
        dataObj.status = String(row[colMap['status']]).trim();
      }
      return jsonResponse({ status: 'success', data: dataObj });
    } catch (e) {}
  }

  // Fallback to basic row fields if JSON failed
  var basic = {
    quoteRef: row[colMap['quote ref'] || 1],
    clientName: row[colMap['client name'] || 2],
    location: row[colMap['location'] || 3],
    totalAmount: row[colMap['total amount'] || 4],
    totalBeds: row[colMap['total beds'] || 5],
    status: colMap['status'] !== undefined ? row[colMap['status']] : 'Pending',
    date: row[colMap['date'] || 0]
  };
  return jsonResponse({ status: 'success', data: basic });
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
    if (String(rows[i][cRef]).trim().toLowerCase() === quoteRef) {
      sheet.deleteRow(i + 1);
      return jsonResponse({ status: 'success', message: 'Quote deleted successfully' });
    }
  }

  return jsonResponse({ status: 'error', message: 'Quote not found' });
}

/**
 * Generates next sequential quote ID for new deals
 */
function handleGetNextQuoteId(sheet) {
  var d = new Date();
  var yy = String(d.getFullYear()).slice(-2);
  var mm = String(d.getMonth() + 1).padStart(2, '0');
  var dd = String(d.getDate()).padStart(2, '0');
  var dateStr = yy + mm + dd;

  var count = sheet.getLastRow();
  var seq = String(count).padStart(2, '0');
  var ref = 'GEN-ALA-' + dateStr + '-' + seq + '-V1';

  return jsonResponse({ status: 'success', quoteRef: ref });
}

// ─── HELPER ────────────────────────────────────────────────────────────
function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
