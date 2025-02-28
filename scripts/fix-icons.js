const fs = require('fs');
const path = require('path');

console.log('🛠️ Criando ícones simples em formato PNG (1x1 pixel)...');

try {
  // Criar a pasta assets se não existir
  const assetsDir = path.join(process.cwd(), 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }
  
  // PNG de 1x1 pixel verde (muito pequeno e simples)
  // Este é um PNG 1x1 verde válido, codificado em base64
  const minimalPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  const pngBuffer = Buffer.from(minimalPngBase64, 'base64');
  
  // Lista de arquivos de ícones necessários
  const iconFiles = ['icon.png', 'splash.png', 'adaptive-icon.png', 'favicon.png'];
  
  // Criar cada arquivo
  iconFiles.forEach(iconFile => {
    const filePath = path.join(assetsDir, iconFile);
    fs.writeFileSync(filePath, pngBuffer);
    console.log(`✅ Criado ${iconFile}`);
  });
  
  console.log('\n✅ Todos os ícones foram criados com sucesso!');
  console.log('\nEstes são ícones mínimos de 1x1 pixel apenas para permitir o build.');
  console.log('Depois você pode substituí-los por ícones reais.');
  
  // Atualizar app.json para garantir que a configuração está correta
  const appJsonPath = path.join(process.cwd(), 'app.json');
  if (fs.existsSync(appJsonPath)) {
    const appConfig = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    
    // Verificar e atualizar as propriedades do adaptiveIcon
    if (appConfig.expo && appConfig.expo.android && appConfig.expo.android.adaptiveIcon) {
      appConfig.expo.android.adaptiveIcon = {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#2E7D32"
      };
    }
    
    fs.writeFileSync(appJsonPath, JSON.stringify(appConfig, null, 2));
    console.log('✅ app.json atualizado');
  }
  
  console.log('\n🚀 Agora tente executar: npx expo run:android');
  
} catch (error) {
  console.error('❌ Erro:', error.message);
  process.exit(1);
}
