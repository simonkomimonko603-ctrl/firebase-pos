// lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCdSyggAlKW-q_pDMwFvLKV1mKYmANA7U",
  authDomain: "apexpos-ef6a0.firebaseapp.com",
  projectId: "apexpos-ef6a0",
  storageBucket: "apexpos-ef6a0.appspot.com",
  messagingSenderId: "123316014625",
  appId: "1:123316014625:web:edd04e73ba2d1d524f5d60"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
export const auth = getAuth(app);