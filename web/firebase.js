// web/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAPS0-pcIAgW_LK5pcF9Ws7sCKbamD6qRM",
  authDomain: "universal-edu-platform.firebaseapp.com",
  projectId: "universal-edu-platform",
  storageBucket: "universal-edu-platform.firebasestorage.app",
  messagingSenderId: "457383130412",
  appId: "1:457383130412:web:7121f8209dfe9c90ee2889",
  measurementId: "G-H9QER93L4B",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);