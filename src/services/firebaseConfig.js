import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import Constants from 'expo-constants';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCYwDrOqkK6f1KuV7QBPs8JpSxZ24DEaAs",
  authDomain: "lazzfit-app.firebaseapp.com",
  projectId: "lazzfit-app",
  storageBucket: "lazzfit-app.appspot.com",
  messagingSenderId: "927518164528",
  appId: "1:927518164528:web:4dec2b809c20460601b820"
};

// Inicializa o app Firebase
const app = initializeApp(firebaseConfig);

// Exporta os serviços
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);

export default app;
