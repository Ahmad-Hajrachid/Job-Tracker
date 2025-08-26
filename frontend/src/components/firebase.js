// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import {getAuth} from 'firebase/auth'
import {getFirestore} from 'firebase/firestore'
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCijjC3H13XuKycS_Af3GYQ6kZqXZjw7YA",
  authDomain: "job-tracker-afc0e.firebaseapp.com",
  projectId: "job-tracker-afc0e",
  storageBucket: "job-tracker-afc0e.firebasestorage.app",
  messagingSenderId: "492661007290",
  appId: "1:492661007290:web:05afd64acb665934ea3383",
  measurementId: "G-FXGL90889C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

