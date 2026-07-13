import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDhYiGtcb3SHVQMScJBeOlfb-SzkbGVV2s",
  authDomain: "jurex-ai.firebaseapp.com",
  projectId: "jurex-ai",
  storageBucket: "jurex-ai.appspot.com", // corrigido
  messagingSenderId: "593247199846",
  appId: "1:593247199846:web:1b60f5bc6299728fc6c3a7",
  measurementId: "G-ZGHPMBY6NV"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
