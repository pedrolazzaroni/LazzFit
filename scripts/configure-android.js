const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Configurando aplicativo para Android (Método Simplificado)...');

try {
  // Verificar e atualizar app.json
  console.log('\n1️⃣ Configurando app.json...');
  const appJsonPath = path.join(process.cwd(), 'app.json');
  
  if (fs.existsSync(appJsonPath)) {
    const appConfig = {
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
          "supportsTablet": true,
          "bundleIdentifier": "com.lazzfit.app"
        },
        "android": {
          "adaptiveIcon": {
            "foregroundImage": "./assets/adaptive-icon.png",
            "backgroundColor": "#2E7D32"
          },
          "package": "com.lazzfit.app",
          "permissions": [
            "ACCESS_FINE_LOCATION",
            "ACCESS_COARSE_LOCATION",
            "ACCESS_BACKGROUND_LOCATION"
          ]
        },
        "web": {
          "favicon": "./assets/favicon.png"
        },
        "plugins": [
          [
            "expo-location",
            {
              "locationAlwaysAndWhenInUsePermission": "Permitir que o LazzFit acesse sua localização."
            }
          ]
        ],
        "sdkVersion": "52.0.0"
      }
    };
    
    fs.writeFileSync(appJsonPath, JSON.stringify(appConfig, null, 2));
    console.log('✅ app.json configurado corretamente');
  } else {
    console.error('❌ arquivo app.json não encontrado');
    process.exit(1);
  }

  // Verificar se a pasta assets existe
  console.log('\n2️⃣ Verificando pasta assets...');
  const assetsDir = path.join(process.cwd(), 'assets');
  if (!fs.existsSync(assetsDir)) {
    console.log('⚠️ Pasta assets não encontrada!');
    console.log('Execute primeiro: node scripts/create-simple-icons.js');
    process.exit(1);
  }

  // Verificar se existem arquivos de ícones na pasta assets
  const iconFiles = ['icon.png', 'splash.png', 'adaptive-icon.png', 'favicon.png'];
  let missingIcons = [];
  
  iconFiles.forEach(icon => {
    if (!fs.existsSync(path.join(assetsDir, icon))) {
      missingIcons.push(icon);
    }
  });

  if (missingIcons.length > 0) {
    console.log(`⚠️ Os seguintes ícones estão faltando: ${missingIcons.join(', ')}`);
    console.log('Por favor, crie/converta esses arquivos PNG antes de continuar.');
    console.log('Dica: Use um editor de imagem ou https://svgtopng.com/ para criar ícones PNG simples.');
    process.exit(1);
  } else {
    console.log('✅ Todos os ícones necessários estão presentes');
  }

  // Preparar o ambiente para o build Android
  console.log('\n3️⃣ Preparando ambiente para build Android...');
  
  // Verificar se as variáveis de ambiente do Android SDK estão configuradas
  if (!process.env.ANDROID_HOME && !process.env.ANDROID_SDK_ROOT) {
    console.log('⚠️ Variável de ambiente ANDROID_HOME/ANDROID_SDK_ROOT não encontrada');
    console.log('Para configurar corretamente o Android SDK, defina a variável de ambiente:');
    console.log('Windows: set ANDROID_HOME=C:\\Users\\SEU_USUARIO\\AppData\\Local\\Android\\Sdk');
    console.log('ou adicione ao Path do sistema.');
  } else {
    console.log('✅ Variáveis de ambiente do Android SDK configuradas');
  }

  // Executar o comando de prebuild para Android
  console.log('\n4️⃣ Gerando arquivos nativos do Android...');
  console.log('⚠️ Este processo pode levar alguns minutos...');

  try {
    console.log('Executando comando: npx expo prebuild -p android --clean');
    execSync('npx expo prebuild -p android --clean', { stdio: 'inherit' });
    console.log('✅ Arquivos nativos do Android gerados com sucesso');
  } catch (error) {
    console.error('❌ Erro ao gerar arquivos nativos:', error.message);
    console.log('\n🔍 Tentando abordagem alternativa...');
    
    try {
      console.log('Tentando comando alternativo: npx expo run:android');
      execSync('npx expo run:android', { stdio: 'inherit' });
    } catch (runError) {
      console.error('❌ Também falhou ao executar run:android:', runError.message);
      console.log('\n💡 Sugestões para resolver o problema:');
      console.log('1. Instale o Android Studio e configure corretamente o SDK');
      console.log('2. Crie ícones PNG simples na pasta assets manualmente');
      console.log('3. Execute apenas o comando: npx expo run:android');
    }
  }
  
} catch (error) {
  console.error('\n❌ Erro durante a configuração:', error.message);
  process.exit(1);
}
