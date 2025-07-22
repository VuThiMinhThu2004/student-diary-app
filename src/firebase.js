// firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBUwmSg7ISNIy6yUXXE44F4dq2M__z4PI4",
  authDomain: "study-journal-de130.firebaseapp.com",
  projectId: "study-journal-de130",
  storageBucket: "study-journal-de130.appspot.com",
  messagingSenderId: "91822596522",
  appId: "1:91822596522:web:8c1233cbe4571ce6a14bd3",
  measurementId: "G-J4Z75VG3XS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Export the Firebase app instance
export default app;
