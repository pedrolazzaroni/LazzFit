import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ATENÇÃO: Substitua estas configurações pelas suas próprias do Firebase
const firebaseConfig = {
  apiKey: "sua-api-key-aqui",
  authDomain: "seu-app.firebaseapp.com",
  projectId: "seu-app-id",
  storageBucket: "seu-app.appspot.com",
  messagingSenderId: "seu-messaging-id",
  appId: "seu-app-id"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar instâncias de auth e firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
