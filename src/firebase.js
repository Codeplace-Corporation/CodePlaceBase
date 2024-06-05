import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection } from "@firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBgGsPtxfQ1UIz1FeC2XqSluWrFNAiESUI",
  authDomain: "codeplace-76019.firebaseapp.com",
  projectId: "codeplace-76019",
  storageBucket: "codeplace-76019.appspot.com",
  messagingSenderId: "809410512113",
  appId: "1:809410512113:web:dca6c4ef8b22dbda9fd550",
  measurementId: "G-QMB191CLVW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const firestore = getFirestore(app);
const auth = getAuth(app);

export { app, analytics, firestore, auth };
