const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Corrigindo problemas de compatibilidade do Expo CLI...');

try {
  console.log('\n1️⃣ Atualizando scripts no package.json para usar npx expo em vez de expo...');
  
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Atualizar scripts para usar npx expo em vez de expo
  const scripts = packageJson.scripts;
  
  // Fazer backup do package.json
  fs.writeFileSync(
    path.join(process.cwd(), 'package.json.cli-backup'), 
    JSON.stringify(packageJson, null, 2)
  );
  console.log('✅ Backup do package.json criado');
  
  Object.entries(scripts).forEach(([key, value]) => {
    if (value.startsWith('expo ')) {
      scripts[key] = value.replace('expo ', 'npx expo ');
    }
  });
  
  // Adicionar script para executar o expo doctor
  scripts['doctor'] = 'npx expo doctor --fix-dependencies';
  
  // Atualizar package.json com os novos scripts
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Scripts atualizados no package.json');
  
  // Criar script bash/batch para execução direta
  const isWindows = process.platform === 'win32';
  const scriptExt = isWindows ? 'bat' : 'sh';
  const scriptContent = isWindows 
    ? '@echo off\necho Iniciando aplicativo...\nnpx expo start --clear\npause'
    : '#!/bin/bash\necho "Iniciando aplicativo..."\nnpx expo start --clear';
  
  const scriptPath = path.join(process.cwd(), `start-app.${scriptExt}`);
  fs.writeFileSync(scriptPath, scriptContent);
  
  if (!isWindows) {
    execSync(`chmod +x ${scriptPath}`);
  }
  
  console.log(`✅ Script de inicialização rápida criado: start-app.${scriptExt}`);
  
  console.log('\n2️⃣ Corrigindo dependências incompatíveis...');
  console.log('⚠️ Existem duas abordagens possíveis:');
  console.log('   - Opção 1: Manter dependências atualizadas e usar npx expo');
  console.log('   - Opção 2: Fazer rollback para versões compatíveis com o SDK atual');
  console.log('\n⚠️ Recomendamos a Opção 1 para projetos em desenvolvimento.');

  // Verificando se o expo.json existe e criando-o se necessário
  const appJsonPath = path.join(process.cwd(), 'app.json');
  if (fs.existsSync(appJsonPath)) {
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    
    // Garantir que o sdkVersion está definido corretamente
    if (packageJson.dependencies.expo.includes('52')) {
      appJson.expo = {
        ...appJson.expo,
        "sdkVersion": "52.0.0"
      };
    }
    
    fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
    console.log('✅ app.json atualizado com a versão do SDK correta');
  }

  console.log('\n✅ Correções aplicadas com sucesso!');
  console.log('\n🚀 Você pode agora executar o aplicativo com:');
  console.log(`   .\\start-app.${scriptExt}`);
  console.log('   ou');
  console.log('   npm run start');
  console.log('\n📋 Se encontrar mais problemas, execute:');
  console.log('   npm run doctor');
  
} catch (error) {
  console.error('❌ Erro durante a correção:', error.message);
  process.exit(1);
}
