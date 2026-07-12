const SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL || "https://script.google.com/macros/s/AKfycby-LIVtk1g8bAHusB2HhLtIzUIU4D1RiV_RC58zAIgwyCXOHCvk-9dCTcufS0yv_qPX/exec";
const SECRET = import.meta.env.VITE_APPS_SCRIPT_SECRET || "gm2026secret9x";

async function call(action, extra = {}, firebaseUser) {
  if (!SCRIPT_URL) throw new Error("VITE_APPS_SCRIPT_URL is not configured.");
  const idToken = firebaseUser ? await firebaseUser.getIdToken() : null;
  const payload = { action, secret: SECRET, idToken, ...extra };

  const res = await fetch(SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" }, // avoids CORS preflight on Apps Script
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const sheetsApi = {
  addReport: (data, user) => call("addReport", { data }, user),
  myReports: (range, user) => call("myReports", { range }, user),
  allReports: (filters, user) => call("allReports", { filters }, user),
  updateReport: (reportId, data, user) => call("updateReport", { reportId, data }, user),
  salesSummary: (user) => call("salesSummary", {}, user),
};
