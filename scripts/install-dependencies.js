// Script para instalar dependências necessárias
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Instalando dependências do Firebase...');

try {
  // Verifica qual gerenciador de pacotes está disponível
  const useYarn = fs.existsSync(path.join(process.cwd(), 'yarn.lock'));
  
  if (useYarn) {
    execSync('yarn add firebase', { stdio: 'inherit' });
  } else {
    execSync('npm install firebase', { stdio: 'inherit' });
  }
  
  console.log('✅ Pacotes do Firebase instalados com sucesso!');
} catch (error) {
  console.error('❌ Erro ao instalar pacotes:', error.message);
  process.exit(1);
}
