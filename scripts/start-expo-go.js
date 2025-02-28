const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { networkInterfaces } = require('os');

console.log('🚀 Iniciando Expo para uso com Expo Go em dispositivo físico...');

// Função para obter o endereço IP local da máquina
function getLocalIpAddress() {
  const nets = networkInterfaces();
  const results = [];
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Ignorar interfaces de loopback e não-IPv4
      if (net.family === 'IPv4' && !net.internal) {
        results.push(net.address);
      }
    }
  }
  
  // Preferir endereços que começam com 192.168
  const preferred = results.find(ip => ip.startsWith('192.168'));
  return preferred || results[0];
}

try {
  // Limpar o cache primeiro
  console.log('\n1️⃣ Limpando cache do Expo para garantir funcionamento adequado...');
  
  // Remover pasta .expo se existir
  const expoPath = path.join(process.cwd(), '.expo');
  if (fs.existsSync(expoPath)) {
    if (process.platform === 'win32') {
      execSync(`rmdir /s /q "${expoPath}"`, { stdio: 'inherit' });
    } else {
      execSync(`rm -rf "${expoPath}"`, { stdio: 'inherit' });
    }
    console.log('✅ Cache do Expo removido');
  }
  
  // Obter o IP local
  const localIp = getLocalIpAddress();
  console.log(`\n📱 Seu endereço IP local é: ${localIp}`);
  console.log('\n📲 INSTRUÇÕES PARA DISPOSITIVO FÍSICO:');
  console.log('1. Instale o aplicativo "Expo Go" no seu smartphone (Play Store/App Store)');
  console.log('2. Conecte seu smartphone à MESMA rede WiFi do computador');
  console.log('3. Escaneie o QR code que aparecerá no terminal com o app Expo Go');
  console.log('4. Para iOS: use a câmera do iPhone para escanear');
  console.log('5. Para Android: abra o app Expo Go e use a opção "Scan QR Code"');
  
  // Verificar se o metro.config.js existe e criar se não existir
  const metroConfigPath = path.join(process.cwd(), 'metro.config.js');
  if (!fs.existsSync(metroConfigPath)) {
    const metroConfig = `// Metro config para Expo Go
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configurações adicionais para resolver problemas comuns
config.resolver.sourceExts = ['jsx', 'js', 'ts', 'tsx', 'json'];
config.resolver.assetExts = [...config.resolver.assetExts, 'pem', 'crt'];

module.exports = config;`;
    
    fs.writeFileSync(metroConfigPath, metroConfig);
    console.log('✅ Arquivo metro.config.js criado');
  }
  
  console.log('\n2️⃣ Iniciando o servidor Expo...');
  console.log('⏳ Aguarde o QR code aparecer (pode levar alguns segundos)...\n');
  
  // Iniciar Expo com host especificado (importante para dispositivos físicos)
  execSync(`expo start --clear --host=${localIp}`, { stdio: 'inherit' });
  
} catch (error) {
  console.error('❌ Erro ao iniciar Expo:', error.message);
  
  // Tentar método alternativo se o primeiro falhar
  console.log('\n🔄 Tentando método alternativo...');
  try {
    execSync('expo start --clear', { stdio: 'inherit' });
  } catch (altError) {
    console.error('❌ Erro no método alternativo:', altError.message);
    process.exit(1);
  }
}
