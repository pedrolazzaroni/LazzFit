/**
 * Configurações específicas para o Firebase na web
 * Este arquivo contém configurações para garantir que o Firebase
 * funcione corretamente no ambiente web.
 */
import { Platform } from 'react-native';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, browserLocalPersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCYwDrOqkK6f1KuV7QBPs8JpSxZ24DEaAs",
  authDomain: "lazzfit-app.firebaseapp.com",
  projectId: "lazzfit-app",
  storageBucket: "lazzfit-app.appspot.com",
  messagingSenderId: "927518164528",
  appId: "1:927518164528:web:4dec2b809c20460601b820"
};

// Inicializa o Firebase se ainda não foi inicializado
function initializeFirebase() {
  if (getApps().length === 0) {
    const app = initializeApp(firebaseConfig);
    
    // Configura a persistência de autenticação específica para cada plataforma
    if (Platform.OS === 'web') {
      // Para web, usa localStorage do navegador
      initializeAuth(app, {
        persistence: browserLocalPersistence
      });
    } else {
      // Para mobile, usa AsyncStorage
      initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
      });
    }
    
    return app;
  } else {
    return getApp();
  }
}

// Inicializa e exporta a instância do Firebase
const app = initializeFirebase();

export default app;
