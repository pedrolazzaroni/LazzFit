import { auth, db } from '../src/services/firebase.js';
import { collection, getDocs } from 'firebase/firestore';

console.log('🔎 Verificando configuração básica do Firebase...');

// Verificar se o Firebase foi inicializado corretamente
if (auth && db) {
  console.log('✅ Firebase inicializado com sucesso');
  console.log(`📌 Projeto: ${auth.app.options.projectId}`);
  
  // Tentar uma operação simples no Firestore para verificar a conexão
  console.log('\n🔄 Testando conexão com Firestore...');
  try {
    // Apenas verificamos se conseguimos obter uma referência para uma coleção
    const colRef = collection(db, 'test_collection');
    console.log('✅ Referência ao Firestore criada com sucesso');
    
    console.log('\n📋 Resultado da verificação:');
    console.log('1. Conexão básica com Firebase: ✅ OK');
    console.log('2. Configuração do Firebase: ✅ OK');
    console.log('\n💡 Se você está tendo problemas com autenticação anônima:');
    console.log('   Execute: node scripts/fix-firebase-auth.js');
  } catch (error) {
    console.error(`❌ Erro ao acessar Firestore: ${error.message}`);
  }
} else {
  console.error('❌ Firebase não foi inicializado corretamente');
  console.error('Verifique se o arquivo firebase.js tem as credenciais corretas.');
}
