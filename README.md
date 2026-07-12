# GoldMind Connect — Team Management Portal

A black-and-gold, glassmorphic CRM-style portal for GoldMind's sales team, built with
React + Firebase Authentication + Google Sheets (via Apps Script) + Netlify.

This is a real, runnable codebase — not a mockup. It needs three services wired up
before it's fully live: **Firebase** (auth + employee profiles), a **Google Sheet**
(the reports database, via Apps Script), and **Netlify** (hosting). Everything below
is copy-paste-able.

---

## 1. How the pieces fit together

| Layer | Tech | Stores |
|---|---|---|
| Auth & identity | Firebase Authentication (Google + Phone) | who's logged in |
| Employee profiles, roles, notices | Firestore | `employees`, `notifications`, `admins` |
| Daily reports & sales ledger | Google Sheets, via an Apps Script Web App | `Reports` sheet |
| Hosting | Netlify | the built React app |

Employees never talk to the Google Sheet directly — every request goes through
the Apps Script API, which verifies the caller's Firebase ID token server-side
before touching the sheet, and filters "my reports" to that verified identity only.
This is what makes "Employee A can never see Employee B's data" actually true,
not just a UI convention.

---

## 2. Firebase setup

> **Note:** Your Firebase config values are already baked directly into
> `src/firebase.js` as defaults, so `.env` / Netlify environment variables are
> now optional (only needed if you switch to a different Firebase project
> later). This removes a common source of "invalid-api-key" errors caused by
> env vars not being picked up during deploy.

1. Go to the [Firebase Console](https://console.firebase.google.com) → **Add project**.
2. **Build → Authentication → Sign-in method** → enable:
   - **Google**
   - **Phone**
3. **Build → Firestore Database** → Create database (production mode, nearest region).
4. **Project settings → General → Your apps → Web app** → copy the config values
   into `.env` (see step 5 below).
5. **Project settings → General → Web API Key** → copy this too, you'll need it
   for the Apps Script (`FIREBASE_WEB_API_KEY`).
6. Deploy the security rules in `firestore.rules` using the Firebase CLI:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init firestore   # point it at this project, keep the existing firestore.rules
   firebase deploy --only firestore:rules
   ```

### Creating the first Admin

Admin access is intentionally **not** a field employees can set on themselves —
it's a separate `admins/{uid}` collection that only you create manually:

1. Have the admin sign in once with their Gmail (they'll be told "not registered" —
   that's expected).
2. Firebase Console → Authentication → find their user → copy the **User UID**.
3. Firestore → Data → **Start collection** → `admins` → Document ID = that UID →
   add any field, e.g. `createdAt: (timestamp)`.
4. They can now sign in and land on `/admin`.

### Creating the first Manager (Admin) account

Managers sign in with **email + password** (not Gmail) on the "Manager" tab
of the login page. Create their account directly in Firebase:

1. **Authentication → Sign-in method** → make sure **Email/Password** is
   enabled (toggle it on if it's the only one missing).
2. **Authentication → Users → Add user** → enter the manager's email and a
   password → **Add user**.
3. Copy that user's **User UID** from the same Users list.
4. **Firestore → Data → Start collection** → Collection ID: `admins` →
   Document ID: paste that UID → add any field (e.g. `createdAt`, type
   `string`, value `yes`) → **Save**.
5. They can now sign in on the **Manager** tab of the login page with that
   email + password, and land straight on `/admin`.

You can add more managers the same way — repeat steps 2–4 for each one.

### Adding employees

Once you have an admin, log in as them and use **Employees → Add Employee** in
the app itself — no console work needed. Enter the employee's Gmail and/or
mobile number exactly as they'll log in with. The first time that person signs
in, the app automatically links their Firebase Auth account to that profile.

---

## 3. Google Sheet + Apps Script setup

1. Create a new Google Sheet (any name, e.g. "GoldMind Reports").
2. **Extensions → Apps Script**, delete the placeholder code, paste in the
   contents of `apps-script/Code.gs`.
3. **Project Settings (gear icon) → Script properties**, add:
   | Property | Value |
   |---|---|
   | `SHEET_ID` | the Sheet's ID (the long string in its URL) |
   | `FIREBASE_WEB_API_KEY` | from Firebase step 2.5 above |
   | `ADMIN_EMAILS` | comma-separated admin Gmail addresses |
   | `SHARED_SECRET` | any long random string you generate |
4. **Deploy → New deployment → type: Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy the resulting `/exec` URL — that's `VITE_APPS_SCRIPT_URL`.
6. The `SHARED_SECRET` you chose goes in `VITE_APPS_SCRIPT_SECRET` (frontend) —
   it must match exactly. It's a lightweight extra check on top of ID-token
   verification, not the primary security boundary.

The script auto-creates a `Reports` sheet with the correct headers on first use.

---

## 4. Local development

```bash
cd goldmind-connect
cp .env.example .env      # fill in the values from steps 2 & 3
npm install
npm run dev
```

Open the printed local URL. Sign in as an employee or admin you've already
registered per step 2.

---

## 5. Deploying to Netlify

**Option A — CLI**
```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

**Option B — Git-connected site**
1. Push this project to a GitHub repo.
2. Netlify → **Add new site → Import an existing project** → pick the repo.
3. Build command: `npm run build`, publish directory: `dist` (already set in
   `netlify.toml`).
4. **Site settings → Environment variables** → add every `VITE_...` key from
   your `.env`.
5. Deploy.

Also add your Netlify domain to Firebase → Authentication → Settings →
**Authorized domains**, or Google sign-in will be rejected.

---

## 6. Data model reference

**`employees/{employeeId}`** (`employeeId` is an admin-chosen doc ID, e.g. `GM-1001`)
```
name, email, mobile, employeeId, role ("employee"|"admin", label only),
status ("active"|"inactive"), joiningDate, target: { sales }, photoURL, uid (linked on first login)
```

**`notifications/{id}`**
```
type ("notice"|"meeting"|"training"), title, message, meetingTime, createdAt, createdBy
```

**`admins/{uid}`** — existence = real admin access. Client can never write this.

**Google Sheet `Reports` columns**
```
ReportID, Date, EmployeeName, EmployeeID, Email, Mobile,
Calls, Interested, Deals, Package, Sales, Remarks, Timestamp
```

---

## 7. Security model summary

- Firebase Auth identifies the person (Google or phone OTP).
- Firestore rules (`firestore.rules`) hard-enforce that an employee can only
  read/link their own `employees` doc, matched against the **verified** email/
  phone on their auth token — never a client-supplied value.
- The Apps Script backend re-verifies the Firebase ID token on every request
  via Identity Toolkit's `accounts:lookup`, and filters "my reports" queries
  by that verified email. A modified frontend can't ask for someone else's data.
- Admin status lives in its own `admins/{uid}` collection that the client can
  read (only its own doc) but never write.

---

## 8. What to customize next

- Swap the placeholder package prices/blurbs in `src/pages/Packages.jsx` if they change.
- Wire real photo uploads (Firebase Storage) instead of pasting a photo URL in `MyProfile.jsx`.
- Add pagination to `AllReports.jsx` once the sheet grows large — it currently
  loads the full sheet per request, which is fine for a small-to-mid team but
  worth revisiting past a few thousand rows.
