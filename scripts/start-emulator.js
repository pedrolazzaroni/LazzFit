const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Caminhos comuns do Android SDK em diferentes sistemas
const getAndroidSdkPath = () => {
  const home = os.homedir();
  
  // Possíveis localizações do Android SDK
  const possiblePaths = [
    path.join(home, 'AppData', 'Local', 'Android', 'Sdk'), // Windows padrão
    path.join(home, 'Android', 'Sdk'), // Windows alternativo
    path.join(home, 'Library', 'Android', 'sdk'), // macOS
    path.join(home, 'Android', 'sdk'), // Linux
    process.env.ANDROID_HOME, // Variável de ambiente
    process.env.ANDROID_SDK_ROOT // Variável de ambiente alternativa
  ].filter(Boolean); // Remove undefined entries

  // Retorna o primeiro caminho que existe
  return possiblePaths.find(p => p && fs.existsSync(p));
};

const sdkPath = getAndroidSdkPath();

if (!sdkPath) {
  console.error('❌ Não foi possível encontrar o Android SDK.');
  console.error('Por favor, instale o Android Studio ou defina a variável de ambiente ANDROID_HOME.');
  process.exit(1);
}

console.log(`✅ Android SDK encontrado em: ${sdkPath}`);

// Lista emuladores disponíveis
console.log('\n🔍 Verificando emuladores disponíveis...');
const emulatorsCommand = path.join(sdkPath, 'emulator', 'emulator') + ' -list-avds';

try {
  const emulators = execSync(emulatorsCommand).toString().trim().split('\n');
  
  if (emulators.length === 0 || (emulators.length === 1 && !emulators[0])) {
    console.error('❌ Nenhum emulador encontrado.');
    console.error('Por favor, crie um emulador no Android Studio primeiro.');
    process.exit(1);
  }
  
  console.log('\n📱 Emuladores disponíveis:');
  emulators.forEach((emu, index) => {
    console.log(`${index + 1}. ${emu}`);
  });
  
  // Inicia o primeiro emulador (ou você pode adicionar uma seleção interativa)
  const selectedEmulator = emulators[0];
  console.log(`\n🚀 Iniciando emulador: ${selectedEmulator}...`);
  
  // Inicia em segundo plano para não bloquear o terminal
  const startCommand = `"${path.join(sdkPath, 'emulator', 'emulator')}" -avd ${selectedEmulator} -no-snapshot-load`;
  
  if (process.platform === 'win32') {
    // No Windows, usamos o comando start para iniciar em uma nova janela
    execSync(`start cmd /c ${startCommand}`, { stdio: 'ignore' });
  } else {
    // No macOS/Linux, usamos & para executar em segundo plano
    execSync(`${startCommand} &`, { stdio: 'ignore' });
  }
  
  console.log('\n⏳ Aguardando o emulador iniciar (isso pode levar alguns minutos)...');
  console.log('\n💡 Quando o emulador estiver pronto, execute:');
  console.log('   npm run android');
  
} catch (error) {
  console.error('❌ Erro ao verificar ou iniciar emuladores:', error.message);
  console.error('Tente iniciar o emulador diretamente pelo Android Studio.');
  process.exit(1);
}
