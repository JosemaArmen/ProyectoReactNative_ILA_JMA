import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCZkv4d-fdDe2QRb7WQDa8YwrQmSQ7lOEE",
  authDomain: "prueba-login-fc92f.firebaseapp.com",
  projectId: "prueba-login-fc92f",
  storageBucket: "prueba-login-fc92f.firebasestorage.app",
  messagingSenderId: "1055040483011",
  appId: "1:1055040483011:web:50f406817de64219ad7c76"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);