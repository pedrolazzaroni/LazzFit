import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, connectAuthEmulator } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Importamos diretamente a configuração do firebase para verificar
import { auth, db } from '../src/services/firebase.js';

console.log('🔍 Verificando problema com Firebase Authentication...');

// Exibe os detalhes da configuração atual (sem mostrar a chave completa por segurança)
console.log('\n📋 Configuração atual:');
console.log(`Projeto ID: ${auth.app.options.projectId}`);
console.log(`Auth Domain: ${auth.app.options.authDomain}`);
console.log(`API Key: ${auth.app.options.apiKey.substring(0, 6)}...`);

console.log('\n🔄 Tentando login anônimo...');

// Função para testar a autenticação anônima
async function testAnonymousAuth() {
  try {
    const userCredential = await signInAnonymously(auth);
    console.log('✅ Autenticação anônima bem-sucedida!');
    console.log(`UID do usuário: ${userCredential.user.uid}`);
    return true;
  } catch (error) {
    console.error(`❌ Erro: ${error.message}`);
    console.error(`Código de erro: ${error.code}`);
    
    if (error.code === 'auth/configuration-not-found') {
      console.error('\n🚨 PROBLEMA IDENTIFICADO: Autenticação anônima não está habilitada.');
      console.error('\n📝 SOLUÇÃO:');
      console.error('1. Acesse https://console.firebase.google.com/');
      console.error(`2. Selecione o projeto: "${auth.app.options.projectId}"`);
      console.error('3. No menu lateral, clique em "Authentication"');
      console.error('4. Vá para a aba "Sign-in method"');
      console.error('5. Encontre e clique em "Anonymous" (Anônimo)');
      console.error('6. Ative o botão "Enable" (Habilitar)');
      console.error('7. Clique em "Save" (Salvar)');
      console.error('8. Volte e execute este script novamente');
    }
    
    return false;
  }
}

await testAnonymousAuth();
