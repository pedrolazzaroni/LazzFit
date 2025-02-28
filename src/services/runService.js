import { collection, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './firebase';

const RUNS_COLLECTION = 'runs';

// Salvar uma nova corrida
export const saveRun = async (runData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    
    const runToSave = {
      ...runData,
      userId: user.uid,
      userName: user.displayName || 'Usuário',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, RUNS_COLLECTION), runToSave);
    return { id: docRef.id, ...runToSave };
  } catch (error) {
    console.error('Erro ao salvar corrida:', error);
    throw error;
  }
};

// Buscar corridas do usuário
export const getUserRuns = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    
    const runsQuery = query(
      collection(db, RUNS_COLLECTION), 
      where('userId', '==', user.uid)
    );
    
    const querySnapshot = await getDocs(runsQuery);
    const runs = [];
    
    querySnapshot.forEach((doc) => {
      runs.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Ordena as corridas pela data de criação (mais recente primeiro)
    return runs.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error('Erro ao buscar corridas:', error);
    throw error;
  }
};

// Atualizar uma corrida
export const updateRun = async (runId, runData) => {
  try {
    const runRef = doc(db, RUNS_COLLECTION, runId);
    await updateDoc(runRef, {
      ...runData,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Erro ao atualizar corrida:', error);
    throw error;
  }
};

// Excluir uma corrida
export const deleteRun = async (runId) => {
  try {
    const runRef = doc(db, RUNS_COLLECTION, runId);
    await deleteDoc(runRef);
    return true;
  } catch (error) {
    console.error('Erro ao excluir corrida:', error);
    throw error;
  }
};
