// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// TODO: PASTE YOUR FIREBASE CONFIGURATION HERE
const firebaseConfig = {
  apiKey: "AIzaSyAkU0E0YDkKRqwP5G8ycQm7lpjPL35dcoE",
  authDomain: "eventos-cadastro.firebaseapp.com",
  projectId: "eventos-cadastro",
  storageBucket: "eventos-cadastro.firebasestorage.app",
  messagingSenderId: "652299015829",
  appId: "1:652299015829:web:a2dc73d0006333184bed9c"
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db: Firestore = getFirestore(app);

export { app, db };

// Example of how to check if config is placeholder:
export const isFirebaseConfigured = () => {
    return firebaseConfig.apiKey !== "YOUR_API_KEY";
}
