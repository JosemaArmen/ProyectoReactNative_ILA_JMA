import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDhDZQB50yeXPH10WasPx51roheY1N-ZUM",
  authDomain: "proyectoreactnative-ila-jma.firebaseapp.com",
  databaseURL: "https://proyectoreactnative-ila-jma-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "proyectoreactnative-ila-jma",
  storageBucket: "proyectoreactnative-ila-jma.firebasestorage.app",
  messagingSenderId: "861130410537",
  appId: "1:861130410537:web:08e7141e7fadacffccea38"
};

export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
export const db = getDatabase(app);
export const storage = getStorage(app);