// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDhDZQB50yeXPH10WasPx51roheY1N-ZUM",
  authDomain: "proyectoreactnative-ila-jma.firebaseapp.com",
  databaseURL: "https://proyectoreactnative-ila-jma-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "proyectoreactnative-ila-jma",
  storageBucket: "proyectoreactnative-ila-jma.firebasestorage.app",
  messagingSenderId: "861130410537",
  appId: "1:861130410537:web:ac0838832aeb6bbeccea38"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);