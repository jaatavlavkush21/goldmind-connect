/**
 * GOLDMIND CONNECT — Google Apps Script backend
 * Acts as a secure API in front of a Google Sheet that stores Daily Reports.
 *
 * DEPLOY:
 * 1. Create a Google Sheet. Note its ID (from the URL).
 * 2. Extensions > Apps Script, paste this file in as Code.gs.
 * 3. Project Settings > Script Properties, add:
 *      SHEET_ID          = <your Google Sheet ID>
 *      FIREBASE_WEB_API_KEY = <Firebase Console > Project Settings > Web API Key>
 *      ADMIN_EMAILS      = "admin1@company.com,admin2@company.com"
 *      SHARED_SECRET     = <any long random string, must match VITE_APPS_SCRIPT_SECRET>
 * 4. Deploy > New deployment > type "Web app".
 *      Execute as: Me
 *      Who has access: Anyone
 * 5. Copy the /exec URL into VITE_APPS_SCRIPT_URL in the frontend .env
 *
 * SECURITY MODEL:
 * Every request must include a Firebase Auth ID token (`idToken`). This script
 * verifies it against Google's Identity Toolkit `accounts:lookup` endpoint,
 * which returns the verified email tied to that token — the client cannot
 * spoof this. All "my data" actions are filtered server-side by that verified
 * email, never by a client-supplied name/email. Admin-only actions additionally
 * require the verified email to be present in the ADMIN_EMAILS script property.
 */

const PROPS = PropertiesService.getScriptProperties();
const SHEET_ID = PROPS.getProperty('SHEET_ID');
const FIREBASE_WEB_API_KEY = PROPS.getProperty('FIREBASE_WEB_API_KEY');
const ADMIN_EMAILS = (PROPS.getProperty('ADMIN_EMAILS') || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
const SHARED_SECRET = PROPS.getProperty('SHARED_SECRET');

const REPORTS_SHEET = 'Reports';
const REPORT_HEADERS = [
  'ReportID', 'Date', 'EmployeeName', 'EmployeeID', 'Email', 'Mobile',
  'Calls', 'Interested', 'Deals', 'Package', 'Sales', 'Remarks', 'Timestamp'
];

function doGet(e) {
  return handle(e);
}
function doPost(e) {
  return handle(e);
}

function handle(e) {
  try {
    const params = e.parameter.payload ? JSON.parse(e.parameter.payload) : JSON.parse(e.postData.contents || '{}');
    if (params.secret !== SHARED_SECRET) return json({ ok: false, error: 'Invalid client secret' });

    const verified = verifyIdToken(params.idToken);
    if (!verified) return json({ ok: false, error: 'Invalid or expired session. Please log in again.' });

    const isAdmin = ADMIN_EMAILS.includes(verified.email.toLowerCase());

    switch (params.action) {
      case 'addReport':
        return json(addReport(params.data, verified));
      case 'myReports':
        return json(myReports(verified, params.range || 'today'));
      case 'allReports':
        if (!isAdmin) return json({ ok: false, error: 'Admin access required' });
        return json(allReports(params.filters || {}));
      case 'updateReport':
        if (!isAdmin) return json({ ok: false, error: 'Admin access required' });
        return json(updateReport(params.reportId, params.data));
      case 'salesSummary':
        if (!isAdmin) return json({ ok: false, error: 'Admin access required' });
        return json(salesSummary());
      default:
        return json({ ok: false, error: 'Unknown action' });
    }
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

/** Verifies a Firebase Auth ID token server-side via Identity Toolkit. Returns {email, uid} or null. */
function verifyIdToken(idToken) {
  if (!idToken) return null;
  const url = 'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + FIREBASE_WEB_API_KEY;
  const res = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ idToken }),
    muteHttpExceptions: true
  });
  const body = JSON.parse(res.getContentText());
  if (!body.users || !body.users[0]) return null;
  const u = body.users[0];
  return { email: (u.email || '').toLowerCase(), uid: u.localId };
}

function getSheet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(REPORTS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(REPORTS_SHEET);
    sheet.appendRow(REPORT_HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function addReport(data, verified) {
  const sheet = getSheet();
  const reportId = Utilities.getUuid();
  const timestamp = new Date();
  sheet.appendRow([
    reportId,
    data.date,
    data.employeeName,
    data.employeeId,
    verified.email, // trust the verified token email, not client input
    data.mobile || '',
    Number(data.calls) || 0,
    Number(data.interested) || 0,
    Number(data.deals) || 0,
    data.packageName || '',
    Number(data.sales) || 0,
    data.remarks || '',
    timestamp
  ]);
  return { ok: true, reportId };
}

function sheetToObjects() {
  const sheet = getSheet();
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  return values.slice(1).map((row, i) => {
    const obj = { rowIndex: i + 2 };
    headers.forEach((h, idx) => obj[h] = row[idx]);
    return obj;
  });
}

function myReports(verified, range) {
  const all = sheetToObjects().filter(r => (r.Email || '').toLowerCase() === verified.email);
  return { ok: true, reports: filterByRange(all, range) };
}

function allReports(filters) {
  let all = sheetToObjects();
  if (filters.employeeId) all = all.filter(r => r.EmployeeID === filters.employeeId);
  if (filters.date) all = all.filter(r => formatDate(r.Date) === filters.date);
  if (filters.package) all = all.filter(r => r.Package === filters.package);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    all = all.filter(r => (r.EmployeeName || '').toLowerCase().includes(q) || (r.Email || '').toLowerCase().includes(q));
  }
  return { ok: true, reports: all };
}

function updateReport(reportId, data) {
  const sheet = getSheet();
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const idCol = headers.indexOf('ReportID');
  for (let i = 1; i < values.length; i++) {
    if (values[i][idCol] === reportId) {
      const rowNum = i + 1;
      Object.keys(data).forEach(key => {
        const col = headers.indexOf(key);
        if (col > -1) sheet.getRange(rowNum, col + 1).setValue(data[key]);
      });
      return { ok: true };
    }
  }
  return { ok: false, error: 'Report not found' };
}

function salesSummary() {
  const all = sheetToObjects();
  const today = formatDate(new Date());
  const monthKey = today.slice(0, 7);
  let todayCalls = 0, todayDeals = 0, todaySales = 0, monthlySales = 0, totalRevenue = 0;
  all.forEach(r => {
    const d = formatDate(r.Date);
    totalRevenue += Number(r.Sales) || 0;
    if (d === today) { todayCalls += Number(r.Calls) || 0; todayDeals += Number(r.Deals) || 0; todaySales += Number(r.Sales) || 0; }
    if (d.slice(0, 7) === monthKey) monthlySales += Number(r.Sales) || 0;
  });
  return { ok: true, todayCalls, todayDeals, todaySales, monthlySales, totalRevenue, totalReports: all.length };
}

function filterByRange(rows, range) {
  const now = new Date();
  return rows.filter(r => {
    const d = new Date(r.Date);
    if (range === 'today') return formatDate(d) === formatDate(now);
    if (range === 'week') { const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7); return d >= weekAgo; }
    if (range === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    return true;
  });
}

function formatDate(d) {
  const dt = new Date(d);
  return Utilities.formatDate(dt, 'Asia/Kolkata', 'yyyy-MM-dd');
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
