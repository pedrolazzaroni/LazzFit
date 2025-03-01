import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  getCurrentUser, 
  onAuthChanged
} from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verifica se o usuário está autenticado quando o app inicia
  useEffect(() => {
    // Primeiro, tenta pegar do AsyncStorage
    const getUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };

    // Chama a função
    getUser();

    // Também configura o listener do Firebase para mudanças no estado de auth
    const unsubscribe = onAuthChanged((firebaseUser) => {
      if (firebaseUser) {
        // Se o usuário estiver autenticado no Firebase, atualize o estado
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email
        });
      } else {
        // Se não estiver autenticado, limpe o estado
        setUser(null);
      }
      setLoading(false);
    });

    // Limpa o listener quando o componente for desmontado
    return () => unsubscribe();
  }, []);

  // Registra um novo usuário
  const register = async (email, password) => {
    setLoading(true);
    try {
      const user = await registerUser(email, password);
      setUser({
        uid: user.uid,
        email: user.email
      });
      return user;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Faz login com email e senha
  const login = async (email, password) => {
    setLoading(true);
    try {
      const user = await loginUser(email, password);
      setUser({
        uid: user.uid,
        email: user.email
      });
      return user;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Faz logout
  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setUser(null);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
