import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBmd6aIFToKWzlkWdfzqaxUXJ6tAC8ogu0",
  authDomain: "studio-2743789597-ea611.firebaseapp.com",
  projectId: "studio-2743789597-ea611",
  storageBucket: "studio-2743789597-ea611.firebasestorage.app",
  messagingSenderId: "1065244788702",
  appId: "1:1065244788702:web:12372a0e9659a9cc0e7f4f",
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
