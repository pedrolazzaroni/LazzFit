import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Importar a configuração
import { auth, db } from '../src/services/firebase.js';

async function diagnoseFirebase() {
  console.log('🔍 Iniciando diagnóstico do Firebase...');

  try {
    // Verificar se o Firebase está inicializado
    console.log('1. Verificando inicialização do Firebase...');
    if (!auth || !db) {
      throw new Error('Firebase não inicializado corretamente. Verifique o arquivo de configuração.');
    }
    console.log('✅ Firebase inicializado');

    // Verificar configuração
    console.log('2. Verificando configuração do projeto...');
    console.log('   ID do Projeto: ' + auth.app.options.projectId);
    console.log('   API Key: ' + auth.app.options.apiKey?.substring(0, 5) + '...');
    
    // Tente acessar o Firestore para verificar se a conexão está ok
    console.log('3. Testando conexão com Firestore...');
    try {
      const testCollection = collection(db, '_test_connection_');
      await getDocs(testCollection);
      console.log('✅ Conexão com Firestore bem-sucedida');
    } catch (firestoreError) {
      console.error('❌ Erro ao conectar com Firestore:', firestoreError.message);
      if (firestoreError.code === 'permission-denied') {
        console.log('   Isso pode ser normal se você não tiver permissões para esta coleção');
      } else {
        throw firestoreError;
      }
    }
    
    // Tentar autenticação anônima
    console.log('4. Testando autenticação anônima...');
    try {
      await signInAnonymously(auth);
      console.log('✅ Autenticação anônima bem-sucedida!');
    } catch (authError) {
      console.error('❌ Erro na autenticação anônima:', authError.message);
      
      if (authError.code === 'auth/configuration-not-found') {
        console.error('\n🚨 ERRO IDENTIFICADO: A autenticação anônima não está habilitada.');
        console.error('\n👉 SIGA ESTAS INSTRUÇÕES PARA RESOLVER:');
        console.error('1. Abra o navegador e acesse: https://console.firebase.google.com/');
        console.error(`2. Selecione seu projeto: "${auth.app.options.projectId}"`);
        console.error('3. No menu lateral, clique em "Authentication"');
        console.error('4. Na página de autenticação, clique na aba "Sign-in method"');
        console.error('5. Procure por "Anonymous" (Anônimo) na lista de provedores');
        console.error('6. Clique nele e ative o botão "Enable" (Habilitar)');
        console.error('7. Clique em "Save" (Salvar)');
        console.error('\n8. Após fazer isso, volte e execute este script novamente.');
      }
      
      throw authError;
    }
    
    console.log('\n✅ Diagnóstico concluído com sucesso!');
    return true;
  } catch (error) {
    console.error('\n❌ Diagnóstico falhou:', error.message);
    
    return false;
  }
}

diagnoseFirebase().then(result => {
  if (result) {
    console.log('\n🎉 Seu Firebase está configurado corretamente!');
  } else {
    console.error('\n⚠️ Há problemas com sua configuração do Firebase.');
    console.error('Siga as instruções acima para corrigir os problemas identificados.');
    process.exit(1);
  }
});
