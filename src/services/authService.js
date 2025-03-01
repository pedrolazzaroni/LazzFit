import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  updateProfile,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from './firebaseConfig';
import { createUserProfile, getUserProfile } from './userService';

export const AUTH_USER_KEY = '@lazzfit_user';

// Registrar usuário com email/senha
export const registerUser = async (email, password, displayName = '') => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Atualizar o perfil com o nome exibido (se fornecido)
    if (displayName) {
      await updateProfile(user, {
        displayName: displayName
      });
    }
    
    // Criar perfil de usuário no Firestore
    await createUserProfile(user.uid, { 
      email, 
      displayName: displayName || email.split('@')[0]
    });
    
    // Salvar no AsyncStorage
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || displayName || email.split('@')[0]
    };
    
    await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
    
    return userData;
  } catch (error) {
    console.error('Error registering user:', error);
    throw mapFirebaseError(error);
  }
};

// Login com email/senha
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Obter informações adicionais do perfil no Firestore
    const userProfile = await getUserProfile(user.uid);
    
    // Dados para armazenar localmente
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || userProfile?.displayName || email.split('@')[0],
      photoURL: user.photoURL || userProfile?.photoURL
    };
    
    // Salvar no AsyncStorage
    await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
    
    return userData;
  } catch (error) {
    console.error('Error logging in:', error);
    throw mapFirebaseError(error);
  }
};

// Recuperação de senha
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error resetting password:', error);
    throw mapFirebaseError(error);
  }
};

// Logout
export const logoutUser = async () => {
  try {
    await signOut(auth);
    await AsyncStorage.removeItem(AUTH_USER_KEY);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Obter usuário atual do AsyncStorage
export const getCurrentUser = async () => {
  try {
    const userJson = await AsyncStorage.getItem(AUTH_USER_KEY);
    if (userJson) {
      return JSON.parse(userJson);
    }
    return null;
  } catch (error) {
    console.error('Error getting current user from storage:', error);
    return null;
  }
};

// Observer para mudanças no estado da autenticação
export const onAuthChanged = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Mapeia códigos de erro do Firebase para mensagens amigáveis
const mapFirebaseError = (error) => {
  const errorCode = error.code;
  
  const errorMessages = {
    'auth/email-already-in-use': 'Este email já está sendo utilizado.',
    'auth/invalid-email': 'O formato do email é inválido.',
    'auth/user-disabled': 'Esta conta foi desativada.',
    'auth/user-not-found': 'Email ou senha incorretos.',
    'auth/wrong-password': 'Email ou senha incorretos.',
    'auth/weak-password': 'Senha muito fraca. Use pelo menos 6 caracteres.',
    'auth/network-request-failed': 'Erro de conexão. Verifique sua internet.',
    'auth/invalid-credential': 'Credenciais inválidas.',
    'auth/operation-not-allowed': 'Operação não permitida.',
    'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.'
  };
  
  return new Error(errorMessages[errorCode] || error.message);
};
