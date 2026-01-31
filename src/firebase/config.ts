import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBk5N_5qQ3h0ABGJKpo6kIktEIv8nq0-kE",
  authDomain: "campus-quest-e6bfe.firebaseapp.com",
  projectId: "campus-quest-e6bfe",
  storageBucket: "campus-quest-e6bfe.firebasestorage.app",
  messagingSenderId: "413506532294",
  appId: "1:413506532294:web:1d77dc018cd7a6aae338c7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
