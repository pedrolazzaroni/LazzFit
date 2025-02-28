// Importações mais simples para evitar problemas de resolução
import { auth } from '../src/services/firebase.js';
import { signInWithEmailAndPassword } from 'firebase/auth';

async function verifyFirebaseConnection() {
  try {
    console.log('Verificando conexão com o Firebase...');
    
    // Verificar apenas a inicialização
    if (auth) {
      console.log('✅ Firebase inicializado corretamente');
      console.log('✅ Projeto ID: ' + auth.app.options.projectId);
      
      console.log('\nCaso queira testar a autenticação:');
      console.log('1. Execute: node scripts/firebase-diagnosis.js');
      console.log('2. Verifique se a autenticação anônima está habilitada no Firebase Console');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao verificar Firebase:');
    console.error(error.message);
    console.error('\nVerifique se suas configurações no arquivo firebase.js estão corretas.');
    
    return false;
  }
}

verifyFirebaseConnection().then(result => {
  if (!result) {
    process.exit(1);
  }
});

// Execute o comando abaixo para instalar o Firebase
// npm install firebase
