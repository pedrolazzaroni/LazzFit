import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  signInAnonymously as firebaseSignInAnonymously
} from 'firebase/auth';
import { auth } from './firebase';

// Registrar um novo usuário
export const registerUser = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Atualizar o perfil do usuário com o displayName
    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }
    
    return userCredential.user;
  } catch (error) {
    console.error('Erro no registro:', error.message);
    throw error;
  }
};

// Login de usuário
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Erro no login:', error.message);
    throw error;
  }
};

// Login anônimo (para testes ou uso temporário)
export const signInAnonymously = async () => {
  try {
    const userCredential = await firebaseSignInAnonymously(auth);
    return userCredential.user;
  } catch (error) {
    if (error.code === 'auth/configuration-not-found') {
      throw new Error(
        'A autenticação anônima não está habilitada no Firebase Console. ' +
        'Acesse o Console > Authentication > Sign-in method > habilite Anonymous.'
      );
    }
    throw error;
  }
};

// Logout
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.error('Erro no logout:', error.message);
    throw error;
  }
};

// Observer para mudanças no estado de autenticação
export const authStateObserver = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Verificar se o usuário está autenticado sem usar autenticação anônima
export const isUserSignedIn = () => {
  return !!auth.currentUser;
};
