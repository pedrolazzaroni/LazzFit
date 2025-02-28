import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db, auth } from './firebase';

export const saveWorkout = async (workoutData) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("Usuário não autenticado");
    
    const workoutWithUser = {
      ...workoutData,
      userId,
      createdAt: new Date()
    };
    
    const docRef = await addDoc(collection(db, "workouts"), workoutWithUser);
    return { id: docRef.id, error: null };
  } catch (error) {
    return { id: null, error: error.message };
  }
};

export const getUserWorkouts = async () => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("Usuário não autenticado");
    
    const q = query(
      collection(db, "workouts"), 
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const workouts = [];
    
    querySnapshot.forEach((doc) => {
      workouts.push({ id: doc.id, ...doc.data() });
    });
    
    return { workouts, error: null };
  } catch (error) {
    return { workouts: [], error: error.message };
  }
};

export const deleteWorkout = async (workoutId) => {
  try {
    await deleteDoc(doc(db, "workouts", workoutId));
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};
