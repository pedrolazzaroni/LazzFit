const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { networkInterfaces } = require('os');

console.log('🚀 Iniciando Expo Go (Modo Corrigido)...');

// Função para obter o endereço IP local da máquina
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
  // Limpar o cache primeiro
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
  console.log('\n📲 INSTRUÇÕES PARA USAR O EXPO GO:');
  console.log('1. Baixe a versão anterior do Expo Go no seu dispositivo:');
  console.log('   - Android: https://apkpure.com/expo-go/host.exp.exponent/versions');
  console.log('   - iOS: Você pode precisar usar o TestFlight para versões anteriores');
  console.log('2. Conecte seu smartphone à MESMA rede WiFi do computador');
  console.log('3. Escaneie o QR code que aparecerá com o app Expo Go');
  console.log('4. Se o QR code não funcionar, insira o URL manualmente no app Expo Go');
  
  // Configurar app.json para desenvolvimento
  console.log('\n2️⃣ Verificando configuração do app.json...');
  const appJsonPath = path.join(process.cwd(), 'app.json');
  let appConfig = {};
  
  if (fs.existsSync(appJsonPath)) {
    appConfig = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  } else {
    appConfig = {
      "expo": {
        "name": "LazzFit",
        "slug": "lazzfit",
        "version": "1.0.0",
        "orientation": "portrait",
        "icon": "./assets/icon.png",
        "userInterfaceStyle": "light",
        "splash": {
          "image": "./assets/splash.png",
          "resizeMode": "contain",
          "backgroundColor": "#2E7D32"
        },
        "assetBundlePatterns": [
          "**/*"
        ],
        "ios": {
          "supportsTablet": true
        },
        "android": {
          "adaptiveIcon": {
            "foregroundImage": "./assets/adaptive-icon.png",
            "backgroundColor": "#2E7D32"
          }
        }
      }
    };
  }
  
  // Garantir configurações de desenvolvimento
  appConfig.expo = {
    ...appConfig.expo,
    "sdkVersion": "49.0.0"  // Garantir que a versão SDK está explícita
  };
  
  fs.writeFileSync(appJsonPath, JSON.stringify(appConfig, null, 2));
  console.log('✅ app.json verificado');
  
  // Assegurar que temos a pasta assets com ícones básicos
  const assetsDir = path.join(process.cwd(), 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
    
    // Criar arquivos de ícone simples (quadrados pretos)
    const iconContent = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAALjSURBVHgB7dQxDQAADMOw+TfdicgKBiRPduuIHQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'base64');
    fs.writeFileSync(path.join(assetsDir, 'icon.png'), iconContent);
    fs.writeFileSync(path.join(assetsDir, 'splash.png'), iconContent);
    fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), iconContent);
  }
  
  console.log('\n3️⃣ Modificando configuração temporária...');
  
  // Criar um arquivo de configuração temporário para Expo
  const tempConfigPath = path.join(process.cwd(), '.expotmp.json');
  const tempConfig = {
    "hostType": "tunnel", // Usar tunnel para melhor compatibilidade
    "lanType": "ip",
    "dev": true,
    "minify": false
  };
  
  fs.writeFileSync(tempConfigPath, JSON.stringify(tempConfig, null, 2));
  console.log('✅ Configuração temporária criada');
  
  console.log('\n4️⃣ Iniciando o servidor Expo...');
  console.log('⏳ Aguarde o QR code aparecer...\n');
  
  // Usando o comando simplificado sem flags não suportadas
  execSync(`expo start --clear --host=${localIp}`, { stdio: 'inherit' });
  
} catch (error) {
  console.error('❌ Erro ao iniciar Expo:', error.message);
  
  console.log('\n🔄 Tentando método mais simples...');
  try {
    execSync('expo start', { stdio: 'inherit' });
  } catch (altError) {
    console.error('❌ Erro no método alternativo:', altError.message);
    
    console.log('\n💡 Tente estas ações manuais:');
    console.log('1. Execute simplesmente: expo start');
    console.log('2. Baixe uma versão anterior do app Expo Go (versão compatível com SDK 49)');
    console.log('3. Ou considere atualizar seu projeto para SDK 52 usando: npm run upgrade-sdk');
    
    process.exit(1);
  }
}
