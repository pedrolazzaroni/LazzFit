import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obter diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

console.log('🔍 Verificando configuração do projeto LazzFit...');

// Verificar se o Firebase está instalado
try {
  import('firebase/app');
  console.log('✅ Pacote Firebase encontrado');
} catch (error) {
  console.error('❌ Pacote Firebase não encontrado. Execute: npm install firebase');
  process.exit(1);
}

// Verificar se o arquivo de configuração do Firebase existe
const firebaseConfigPath = path.join(rootDir, 'src', 'services', 'firebase.js');
if (fs.existsSync(firebaseConfigPath)) {
  console.log('✅ Arquivo de configuração do Firebase encontrado');
} else {
  console.error('❌ Arquivo de configuração do Firebase não encontrado');
  process.exit(1);
}

console.log('✅ Verificação concluída! Projeto configurado corretamente.');
