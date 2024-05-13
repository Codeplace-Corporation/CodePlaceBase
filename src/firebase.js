import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getFirestore} from "@firebase/firestore"
import { getAuth } from "firebase/auth";
import { collection } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
 const firestore = getFirestore (app);
// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
const db = getFirestore(app);
const jobsCollection = collection(firestore, "jobs");
export { app, analytics, firestore, auth, db, jobsCollection };

