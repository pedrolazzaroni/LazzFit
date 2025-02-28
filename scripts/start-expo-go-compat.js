const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { networkInterfaces } = require('os');

console.log('🚀 Iniciando Expo Go no modo de compatibilidade...');
console.log('(Esta opção permite usar o Expo Go com SDKs mais antigas)');

function getLocalIpAddress() {
  const nets = networkInterfaces();
  const results = [];
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        results.push(net.address);
      }
    }
  }
  
  const preferred = results.find(ip => ip.startsWith('192.168'));
  return preferred || results[0];
}

try {
  // Limpar o cache primeiro para garantir uma experiência sem problemas
  console.log('\n1️⃣ Limpando cache do Expo...');
  
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
  console.log('1. Certifique-se de ter o Expo Go instalado no smartphone');
  console.log('2. Conecte seu smartphone à MESMA rede WiFi do computador');
  console.log('3. Quando o QR code aparecer, escaneie-o com o app Expo Go');
  console.log('4. Se não funcionar, insira manualmente o URL exp://SEU_IP:PORT');
  
  console.log('\n2️⃣ Iniciando o servidor Expo no modo de desenvolvimento clássico...');
  console.log('⏳ Aguarde o QR code aparecer...\n');
  
  // Usando a opção --legacy para permitir a compatibilidade com versões mais antigas do SDK
  execSync(`expo start --clear --host=${localIp} --legacy`, { stdio: 'inherit' });
  
} catch (error) {
  console.error('❌ Erro ao iniciar Expo:', error.message);
  
  // Tentar método alternativo
  console.log('\n🔄 Tentando método alternativo...');
  try {
    execSync('expo start --clear --legacy', { stdio: 'inherit' });
  } catch (altError) {
    console.error('❌ Erro no método alternativo:', altError.message);
    process.exit(1);
  }
}
