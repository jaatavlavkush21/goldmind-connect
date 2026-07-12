import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from "firebase/auth";
import {
  doc, getDoc, getDocs, collection, query, where, updateDoc, limit,
} from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [employee, setEmployee] = useState(null); // linked Firestore employee doc
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  const loadProfile = useCallback(async (user) => {
    setAuthError("");
    try {
      // 1. Check admin marker
      const adminSnap = await getDoc(doc(db, "admins", user.uid));
      if (adminSnap.exists()) {
        setIsAdmin(true);
        setEmployee(null);
        return;
      }
      setIsAdmin(false);

      // 2. Try to find an employee doc already linked to this uid
      const linkedQ = query(collection(db, "employees"), where("uid", "==", user.uid), limit(1));
      let snap = await getDocs(linkedQ);

      // 3. If not linked yet, find by verified email/phone and self-claim it
      if (snap.empty) {
        const identityField = user.email ? "email" : "mobile";
        const identityValue = user.email ? user.email.toLowerCase() : user.phoneNumber;
        const matchQ = query(collection(db, "employees"), where(identityField, "==", identityValue), limit(1));
        const matchSnap = await getDocs(matchQ);

        if (matchSnap.empty) {
          setEmployee(null);
          setAuthError(
            "This account isn't registered as a GoldMind Connect employee yet. Please contact your admin."
          );
          return;
        }

        const matchDoc = matchSnap.docs[0];
        if (!matchDoc.data().uid) {
          await updateDoc(doc(db, "employees", matchDoc.id), { uid: user.uid });
        }
        snap = await getDocs(query(collection(db, "employees"), where("uid", "==", user.uid), limit(1)));
      }

      if (snap.empty) {
        setEmployee(null);
        setAuthError("We couldn't load your employee profile. Please contact your admin.");
        return;
      }

      const empDoc = snap.docs[0];
      const empData = { id: empDoc.id, ...empDoc.data() };

      if (empData.status === "inactive") {
        setEmployee(null);
        setAuthError("Your account has been deactivated. Please contact your admin.");
        await fbSignOut(auth);
        return;
      }

      setEmployee(empData);
    } catch (err) {
      // Never let an unexpected Firestore error (permission-denied, missing
      // index, offline, etc.) leave the app stuck on the loading spinner.
      console.error("loadProfile failed:", err);
      setEmployee(null);
      setIsAdmin(false);
      setAuthError(
        `Something went wrong loading your account (${err.code || err.message || "unknown error"}). ` +
        `Please try again or contact your admin.`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Catch any error from a Google redirect sign-in (e.g. account issues,
    // unauthorized domain) so it surfaces instead of silently failing.
    getRedirectResult(auth).catch((err) => {
      console.error("Google redirect sign-in failed:", err);
      setAuthError(err.message || "Google sign-in failed. Please try again.");
    });

    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        setLoading(true);
        await loadProfile(user);
      } else {
        setEmployee(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });
    return unsub;
  }, [loadProfile]);

  async function loginWithGoogle() {
    setAuthError("");
    try {
      // Popup is tried first: it doesn't depend on cross-domain redirect
      // state surviving the trip to accounts.google.com and back, which is
      // what makes signInWithRedirect unreliable when the Firebase authDomain
      // (…firebaseapp.com) differs from the app's own domain (…netlify.app)
      // under modern browser storage-partitioning rules.
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      if (err.code === "auth/popup-blocked" || err.code === "auth/cancelled-popup-request") {
        // Browser blocked the popup — fall back to a full-page redirect.
        await signInWithRedirect(auth, googleProvider);
        return;
      }
      throw err;
    }
  }

  async function loginManager(email, password) {
    setAuthError("");
    await signInWithEmailAndPassword(auth, email, password);
  }

  function setupRecaptcha(containerId) {
    if (!window.__recaptchaVerifier) {
      window.__recaptchaVerifier = new RecaptchaVerifier(auth, containerId, { size: "invisible" });
    }
    return window.__recaptchaVerifier;
  }

  async function loginWithPhone(phoneNumber, containerId) {
    setAuthError("");
    const verifier = setupRecaptcha(containerId);
    return signInWithPhoneNumber(auth, phoneNumber, verifier);
  }

  async function logout() {
    await fbSignOut(auth);
  }

  async function refreshProfile() {
    if (firebaseUser) await loadProfile(firebaseUser);
  }

  const value = {
    firebaseUser,
    employee,
    isAdmin,
    loading,
    authError,
    loginWithGoogle,
    loginManager,
    loginWithPhone,
    setupRecaptcha,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
