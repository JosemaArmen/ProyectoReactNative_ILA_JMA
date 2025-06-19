// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDdPwDPNnRkKCMA5tlO8ZRBM4ug_lA5Bhc",
  authDomain: "pruebaloginv2.firebaseapp.com",
  projectId: "pruebaloginv2",
  storageBucket: "pruebaloginv2.firebasestorage.app",
  messagingSenderId: "1033675840949",
  appId: "1:1033675840949:web:5f7156e61d85aa1adc0dfc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);