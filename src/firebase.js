import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAy3PWlOZMK-GYMQvmLJ6xVKB-m5B7NFco",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "goldmind-connect-a507a.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "goldmind-connect-a507a",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "goldmind-connect-a507a.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "201677782269",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:201677782269:web:fb9243e3357f2b16865294",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });
