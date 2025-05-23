
// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";

// Your web app's Firebase configuration should be loaded from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  if (firebaseConfig.apiKey && firebaseConfig.projectId) { // Check if essential config values are present
    app = initializeApp(firebaseConfig);
  } else {
    console.warn("Firebase configuration is missing or incomplete. Firebase will not be initialized.");
    // Assign a dummy app or handle as appropriate if you need 'app' to be defined
    // For now, db will be undefined and isFirebaseConfigured will return false.
  }
} else {
  app = getApp();
}

const db: Firestore = app ? getFirestore(app) : (undefined as any); // Allow db to be undefined if app couldn't initialize

export { app, db };

export const isFirebaseConfigured = (): boolean => {
  // Check if essential Firebase config variables are present and not just empty strings
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== "" &&
    firebaseConfig.projectId &&
    firebaseConfig.projectId !== ""
  );
};
