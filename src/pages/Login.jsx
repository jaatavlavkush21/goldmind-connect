import React, { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Alert } from "../components/Common.jsx";

export default function Login() {
  const {
    firebaseUser, employee, isAdmin, loading, authError,
    loginWithGoogle, loginManager, loginWithPhone,
  } = useAuth();
  const location = useLocation();
  const [portal, setPortal] = useState("employee"); // employee | manager
  const [mode, setMode] = useState("google"); // google | phone (employee portal only)
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(location.state?.error || "");

  if (!loading && firebaseUser && (employee || isAdmin)) {
    return <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace />;
  }

  function switchPortal(p) {
    setPortal(p);
    setError("");
  }

  async function handleGoogle() {
    setBusy(true); setError("");
    try {
      await loginWithGoogle();
    } catch (e) {
      setError(e.message || "Google sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleManagerLogin(e) {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      await loginManager(email.trim(), password);
    } catch (e) {
      setError(
        e.code === "auth/invalid-credential" || e.code === "auth/wrong-password" || e.code === "auth/user-not-found"
          ? "Incorrect email or password."
          : e.message || "Manager sign-in failed."
      );
    } finally {
      setBusy(false);
    }
  }

  async function sendOtp(e) {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      const conf = await loginWithPhone(phone.startsWith("+") ? phone : `+91${phone}`, "recaptcha-container");
      setConfirmation(conf);
    } catch (e) {
      setError(e.message || "Could not send OTP. Check the number and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyOtp(e) {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      await confirmation.confirm(otp);
    } catch (e) {
      setError("Invalid code. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(212,175,55,0.12), transparent 70%)",
        top: "-10%", left: "-10%", filter: "blur(10px)",
      }} />
      <div className="glass-strong foil-sweep" style={{ width: "100%", maxWidth: 400, padding: 32, position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: 26 }}>
          <div style={{
            width: 56, height: 56, margin: "0 auto 14px", borderRadius: 16,
            background: "linear-gradient(135deg, var(--gold-300), var(--gold-700))",
            display: "grid", placeItems: "center", fontWeight: 800, fontFamily: "var(--font-mono)",
            fontSize: 20, color: "#14100a", boxShadow: "0 8px 24px rgba(212,175,55,0.3)",
          }}>GM</div>
          <h1 className="display" style={{ fontSize: 28 }}>GoldMind Connect</h1>
          <p style={{ color: "var(--text-mid)", fontSize: 13.5, marginTop: 4 }}>Team Management Portal</p>
        </div>

        <div className="glass" style={{ display: "flex", gap: 6, marginBottom: 20, padding: 5 }}>
          <button
            className={`btn btn-sm ${portal === "employee" ? "btn-primary" : "btn-ghost"}`}
            style={{ flex: 1 }}
            onClick={() => switchPortal("employee")}
          >
            Employee
          </button>
          <button
            className={`btn btn-sm ${portal === "manager" ? "btn-primary" : "btn-ghost"}`}
            style={{ flex: 1 }}
            onClick={() => switchPortal("manager")}
          >
            Manager
          </button>
        </div>

        {(authError || error) && <div style={{ marginBottom: 14 }}><Alert type="error">{authError || error}</Alert></div>}

        {portal === "employee" && (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              <button className={`btn btn-sm ${mode === "google" ? "btn-primary" : "btn-ghost"}`} style={{ flex: 1 }} onClick={() => { setMode("google"); setError(""); }}>
                Gmail
              </button>
              <button className={`btn btn-sm ${mode === "phone" ? "btn-primary" : "btn-ghost"}`} style={{ flex: 1 }} onClick={() => { setMode("phone"); setError(""); }}>
                Mobile
              </button>
            </div>

            {mode === "google" && (
              <button className="btn btn-primary btn-block" onClick={handleGoogle} disabled={busy}>
                {busy ? "Signing in…" : "Continue with Gmail"}
              </button>
            )}

            {mode === "phone" && !confirmation && (
              <form onSubmit={sendOtp} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="field">
                  <label>Registered mobile number</label>
                  <input className="input" placeholder="9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>
                <button className="btn btn-primary btn-block" disabled={busy}>{busy ? "Sending…" : "Send OTP"}</button>
              </form>
            )}

            {mode === "phone" && confirmation && (
              <form onSubmit={verifyOtp} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="field">
                  <label>Enter the 6-digit code</label>
                  <input className="input" placeholder="123456" value={otp} onChange={(e) => setOtp(e.target.value)} required />
                </div>
                <button className="btn btn-primary btn-block" disabled={busy}>{busy ? "Verifying…" : "Verify & Sign in"}</button>
              </form>
            )}

            <div id="recaptcha-container" />
          </>
        )}

        {portal === "manager" && (
          <form onSubmit={handleManagerLogin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="field">
              <label>Manager email</label>
              <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@goldmind.com" />
            </div>
            <div className="field">
              <label>Password</label>
              <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button className="btn btn-primary btn-block" disabled={busy}>{busy ? "Signing in…" : "Sign in as Manager"}</button>
          </form>
        )}

        <p style={{ fontSize: 11.5, color: "var(--text-low)", textAlign: "center", marginTop: 22 }}>
          {portal === "manager"
            ? "Manager accounts are created by GoldMind directly in Firebase — contact your admin for credentials."
            : "Access is limited to registered GoldMind employees. Contact your admin if you can't sign in."}
        </p>
      </div>
    </div>
  );
}
