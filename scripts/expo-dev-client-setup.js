const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🛠️ Configurando Expo Dev Client para compatibilidade...');
console.log('Esta é uma alternativa mais robusta que permite usar o aplicativo sem atualizar o SDK.');

try {
  console.log('\n1️⃣ Instalando dependências necessárias...');
  execSync('npm install expo-dev-client@~2.0.0', { stdio: 'inherit' });
  
  console.log('\n2️⃣ Configurando app.json para modo de desenvolvimento...');
  
  // Ler arquivo app.json atual ou criar novo se não existir
  let appConfig = {};
  const appJsonPath = path.join(process.cwd(), 'app.json');
  
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
  
  // Adicionar configuração de desenvolvimento
  appConfig.expo = {
    ...appConfig.expo,
    "developmentClient": {
      "silentLaunch": true
    },
    "runtimeVersion": {
      "policy": "sdkVersion"
    }
  };
  
  // Salvar as alterações em app.json
  fs.writeFileSync(appJsonPath, JSON.stringify(appConfig, null, 2));
  console.log('✅ app.json configurado');
  
  // Criar diretório de assets se não existir
  const assetsDir = path.join(process.cwd(), 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
    console.log('✅ Diretório assets criado');
    
    // Criar arquivos de ícone padrão
    const iconContent = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAALjSURBVHgB7dQxDQAADMOw+TfdicgKBiRPduuIHQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwKj89AJfM7AMXCQAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAAECAIH1U4n9oB7xZgAAAABJRU5ErkJggg==', 'base64');
    fs.writeFileSync(path.join(assetsDir, 'icon.png'), iconContent);
    fs.writeFileSync(path.join(assetsDir, 'splash.png'), iconContent);
    fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), iconContent);
  }
  
  // Modificar o App.js para importar expo-dev-client
  const appJsPath = path.join(process.cwd(), 'App.js');
  if (fs.existsSync(appJsPath)) {
    let appJsContent = fs.readFileSync(appJsPath, 'utf8');
    
    // Adicionar import de expo-dev-client se não existir
    if (!appJsContent.includes('expo-dev-client')) {
      appJsContent = `import 'expo-dev-client';\n${appJsContent}`;
      fs.writeFileSync(appJsPath, appJsContent);
      console.log('✅ App.js atualizado com expo-dev-client');
    }
  }
  
  console.log('\n3️⃣ Limpando cache...');
  const cachePath = path.join(process.cwd(), 'node_modules', '.cache');
  if (fs.existsSync(cachePath)) {
    if (process.platform === 'win32') {
      execSync(`rmdir /s /q "${cachePath}"`, { stdio: 'inherit' });
    } else {
      execSync(`rm -rf "${cachePath}"`, { stdio: 'inherit' });
    }
  }
  
  console.log('\n✅ Configuração concluída!');
  console.log('\n🚀 Execute o app com:');
  console.log('   npm run device-compat');
  
} catch (error) {
  console.error('\n❌ Erro durante a configuração:', error.message);
  process.exit(1);
}
