import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure Firebase
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // Substitua com suas próprias credenciais
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Inicializa o Firebase App se ainda não estiver inicializado
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Configuração especial do Auth para React Native (usando AsyncStorage para persistência)
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (e) {
  // Fallback para o método padrão se a inicialização especial falhar
  auth = getAuth(app);
}

// Inicializa o Firestore
const db = getFirestore(app);

export { app, auth, db };
