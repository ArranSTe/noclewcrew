/* ================= IMPORTS ================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ================= CONFIG ================= */
const firebaseConfig = {
  apiKey: "AIzaSyBnF5cXL-cbpBk3i0QusovDfgP9GPvjXt0",
  authDomain: "nocluecrew1.firebaseapp.com",
  projectId: "nocluecrew1",
  storageBucket: "nocluecrew1.firebasestorage.app",
  messagingSenderId: "1086678444189",
  appId: "1:1086678444189:web:ea8bda7a81539ed2c90c74"
};

/* ================= INITIALISE ================= */
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ================= EXPORT ================= */
export {
  db,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot
};