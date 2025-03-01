import { firestore } from './firebaseConfig';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';

// Coleção de usuários no Firestore
const USERS_COLLECTION = 'users';

// Criar perfil de usuário após registro
export const createUserProfile = async (userId, userData) => {
  try {
    const userRef = doc(firestore, USERS_COLLECTION, userId);
    
    // Dados básicos do usuário
    const userProfile = {
      uid: userId,
      email: userData.email,
      displayName: userData.displayName || userData.email.split('@')[0],
      photoURL: userData.photoURL || null,
      createdAt: new Date(),
      stats: {
        workouts: 0,
        minutes: 0,
        calories: 0
      },
      // Mais campos podem ser adicionados conforme necessário
    };
    
    await setDoc(userRef, userProfile);
    return userProfile;
  } catch (error) {
    console.error("Erro ao criar perfil de usuário:", error);
    throw error;
  }
};

// Obter perfil do usuário
export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(firestore, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() };
    } else {
      console.log("Usuário não encontrado!");
      return null;
    }
  } catch (error) {
    console.error("Erro ao obter perfil de usuário:", error);
    throw error;
  }
};

// Atualizar perfil do usuário
export const updateUserProfile = async (userId, userData) => {
  try {
    const userRef = doc(firestore, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: new Date()
    });
    
    return await getUserProfile(userId);
  } catch (error) {
    console.error("Erro ao atualizar perfil de usuário:", error);
    throw error;
  }
};

// Salvar rota de exercício do usuário
export const saveWorkoutRoute = async (userId, routeData) => {
  try {
    const routesCollection = collection(firestore, USERS_COLLECTION, userId, 'routes');
    const routeDoc = doc(routesCollection);
    
    const routeInfo = {
      userId: userId,
      distance: routeData.distance,
      duration: routeData.duration,
      startTime: routeData.startTime,
      endTime: new Date(),
      coordinates: routeData.coordinates,
      calories: routeData.calories || Math.floor(routeData.distance * 60), // Estimativa simples
      createdAt: new Date()
    };
    
    await setDoc(routeDoc, routeInfo);
    
    // Atualizar estatísticas do usuário
    const userRef = doc(firestore, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      const stats = userData.stats || { workouts: 0, minutes: 0, calories: 0 };
      
      await updateDoc(userRef, {
        stats: {
          workouts: stats.workouts + 1,
          minutes: stats.minutes + Math.floor(routeData.duration / 60),
          calories: stats.calories + (routeData.calories || Math.floor(routeData.distance * 60))
        }
      });
    }
    
    return routeInfo;
  } catch (error) {
    console.error("Erro ao salvar rota:", error);
    throw error;
  }
};

// Obter histórico de rotas do usuário
export const getUserRoutes = async (userId) => {
  try {
    const routesCollection = collection(firestore, USERS_COLLECTION, userId, 'routes');
    const routesSnap = await getDocs(routesCollection);
    
    const routes = [];
    routesSnap.forEach(doc => {
      routes.push({ id: doc.id, ...doc.data() });
    });
    
    // Ordenar do mais recente para o mais antigo
    return routes.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error("Erro ao obter rotas do usuário:", error);
    throw error;
  }
};
