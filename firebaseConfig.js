import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDhDZQB50yeXPH10WasPx51roheY1N-ZUM",
  authDomain: "proyectoreactnative-ila-jma.firebaseapp.com",
  databaseURL: "https://proyectoreactnative-ila-jma-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "proyectoreactnative-ila-jma",
  storageBucket: "proyectoreactnative-ila-jma.firebasestorage.app",
  messagingSenderId: "861130410537",
  appId: "1:861130410537:web:08e7141e7fadacffccea38"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);